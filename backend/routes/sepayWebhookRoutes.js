const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');

// Middleware để xác thực webhook từ SePay
const verifySePayWebhook = (req, res, next) => {
  try {
    // SePay sẽ gửi signature để xác thực
    const signature = req.headers['x-sepay-signature'];
    const payload = JSON.stringify(req.body);
    
    // Tạo signature để so sánh (sử dụng secret key của bạn)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.SEPAY_SECRET_KEY || 'sepaysecretkey')
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    return res.status(400).json({ error: 'Invalid webhook data' });
  }
};

// Chuẩn hóa mô tả/des: chấp nhận cả 'des' hoặc 'description';
// Hỗ trợ 2 dạng:
//  - Dạng mới: des = user_id (ví dụ: 123)
//  - Dạng cũ: des = USER_{userId}_SPOT_{spotId}_LOT_{lotId}
function parseDescriptionToContext(desOrDescription) {
  if (!desOrDescription) return { userId: null, spotId: null, lotId: null };
  const raw = String(desOrDescription);
  // Nếu chỉ là số/user id
  if (/^\d+$/.test(raw) || /^[\w-]+$/.test(raw)) {
    return { userId: raw, spotId: null, lotId: null };
  }
  // Dạng cũ USER_..._SPOT_..._LOT_...
  const parts = raw.split('_');
  if (parts.length >= 6 && parts[0] === 'USER' && parts[2] === 'SPOT' && parts[4] === 'LOT') {
    return { userId: parts[1], spotId: parts[3], lotId: parts[5] };
  }
  return { userId: null, spotId: null, lotId: null };
}

// Webhook endpoint để nhận thông báo thanh toán từ SePay
router.post('/webhook', verifySePayWebhook, async (req, res) => {
  try {
    const {
      transaction_id,
      amount,
      description,
      des,
      status,
      bank_code,
      account_number,
      transaction_time,
      reference_id
    } = req.body;

    console.log('SePay Webhook received:', req.body);

    // Kiểm tra trạng thái thanh toán
    if (status !== 'success') {
      console.log('Payment not successful, status:', status);
      return res.status(200).json({ message: 'Payment not successful' });
    }

    // Trích xuất thông tin từ description/des
    const { userId, spotId, lotId } = parseDescriptionToContext(description || des);
    if (!userId) {
      console.log('Cannot resolve userId from description/des:', description || des);
      return res.status(400).json({ error: 'Missing userId in description/des' });
    }

    // Tìm reservation PENDING mới nhất của user. Nếu có spotId/lotId thì ưu tiên lọc theo.
    let reservations;
    if (spotId && lotId) {
      // Bảng reservations không có parking_lot_id, phải join qua parking_spots.lot_id
      [reservations] = await db.execute(
        `SELECT r.* FROM reservations r
         JOIN parking_spots ps ON r.spot_id = ps.spot_id
         WHERE r.user_id = ? AND r.status = 'pending' AND r.spot_id = ? AND ps.lot_id = ?
         ORDER BY r.reserved_at DESC
         LIMIT 1`,
        [userId, spotId, lotId]
      );
    } else if (spotId) {
      [reservations] = await db.execute(
        `SELECT r.* FROM reservations r
         WHERE r.user_id = ? AND r.status = 'pending' AND r.spot_id = ?
         ORDER BY r.reserved_at DESC
         LIMIT 1`,
        [userId, spotId]
      );
    } else {
      [reservations] = await db.execute(
        `SELECT r.* FROM reservations r
         WHERE r.user_id = ? AND r.status = 'pending'
         ORDER BY r.reserved_at DESC
         LIMIT 1`,
        [userId]
      );
    }

    if (reservations.length === 0) {
      console.log('No pending reservation found for:', { userId, spotId, lotId });
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = reservations[0];

    // Cập nhật trạng thái reservation thành confirmed
    await db.execute(
      `UPDATE reservations 
       SET status = 'confirmed', 
           payment_id = ?, 
           payment_method = 'sepay',
           payment_amount = ?,
           payment_time = NOW(),
           updated_at = NOW()
       WHERE reservation_id = ?`,
      [transaction_id, amount, reservation.reservation_id]
    );

    // Cập nhật trạng thái chỗ đỗ xe (dựa theo reservation.spot_id)
    await db.execute(
      `UPDATE parking_spots 
       SET is_reserved = 1,
           updated_at = NOW()
       WHERE spot_id = ?`,
      [reservation.spot_id]
    );

    // Ghi log thanh toán
    await db.execute(
      `INSERT INTO payment_logs 
       (reservation_id, transaction_id, amount, payment_method, status, bank_code, account_number, transaction_time, created_at)
       VALUES (?, ?, ?, 'sepay', 'success', ?, ?, ?, NOW())`,
      [reservation.reservation_id, transaction_id, amount, bank_code, account_number, transaction_time]
    );

    console.log('Payment processed successfully for reservation:', reservation.reservation_id);

    res.status(200).json({ 
      message: 'Payment processed successfully',
      reservation_id: reservation.reservation_id,
      transaction_id: transaction_id
    });

  } catch (error) {
    console.error('Error processing SePay webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API để kiểm tra trạng thái thanh toán
router.get('/check-payment/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const db = require('../config/database');
    
    const [payments] = await db.execute(
      `SELECT pl.*, r.reservation_id, r.status as reservation_status
       FROM payment_logs pl
       JOIN reservations r ON pl.reservation_id = r.reservation_id
       WHERE pl.transaction_id = ?`,
      [transactionId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[0];
    
    res.json({
      transaction_id: payment.transaction_id,
      amount: payment.amount,
      status: payment.status,
      payment_method: payment.payment_method,
      reservation_status: payment.reservation_status,
      transaction_time: payment.transaction_time
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
