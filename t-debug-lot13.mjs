warning: in the working copy of 'backend/app.js', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/backend/app.js b/backend/app.js[m
[1mindex b2ad937..a313939 100644[m
[1m--- a/backend/app.js[m
[1m+++ b/backend/app.js[m
[36m@@ -5,6 +5,18 @@[m [mconst jwt = require('jsonwebtoken');[m
 [m
 const app = express();[m
 [m
[32m+[m[32m// Utility function để tạo thời gian chính xác cho database[m
[32m+[m[32mfunction getCurrentTimeForDB() {[m
[32m+[m[32m  const now = new Date();[m
[32m+[m[32m  // Format: YYYY-MM-DD HH:MM:SS (PostgreSQL compatible)[m
[32m+[m[32m  return now.toISOString().slice(0, 19).replace('T', ' ');[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// Utility function để tạo timestamp ISO cho API responses[m
[32m+[m[32mfunction getCurrentTimestamp() {[m
[32m+[m[32m  return new Date().toISOString();[m
[32m+[m[32m}[m
[32m+[m
 // Try to load environment variables[m
 let supabase = null;[m
 try {[m
[36m@@ -33,7 +45,7 @@[m [mapp.get('/', (req, res) => {[m
   res.json({[m
     message: 'Parking API is working!',[m
     status: 'ok',[m
[31m-    timestamp: new Date().toISOString(),[m
[32m+[m[32m    timestamp: getCurrentTimestamp(),[m
     database: supabase ? 'Supabase PostgreSQL' : 'Mock Data'[m
   });[m
 });[m
[36m@@ -86,6 +98,9 @@[m [mapp.get('/api/parking-lots', async (req, res) => {[m
         const occupied = occupiedCount || 0;[m
         const reserved = reservedCount || 0;[m
         const availableSpots = lot.total_spots - occupied - reserved;[m
[32m+[m[41m        [m
[32m+[m[32m        // Debug logging[m
[32m+[m[32m        console.log(`🔍 Lot ${lot.lot_id} calculation: total=${lot.total_spots}, occupied=${occupied}, reserved=${reserved}, available=${availableSpots}`);[m
 [m
         return {[m
           id: lot.lot_id,[m
[36m@@ -144,6 +159,26 @@[m [mapp.get('/api/parking-lots/:id', async (req, res) => {[m
         });[m
       }[m
 [m
[32m+[m[32m      // Get available spots count for this lot[m
[32m+[m[32m      const { count: occupiedCount } = await supabase[m
[32m+[m[32m        .from('parking_spots')[m
[32m+[m[32m        .select('*', { count: 'exact', head: true })[m
[32m+[m[32m        .eq('lot_id', data.lot_id)[m
[32m+[m[32m        .eq('is_occupied', true);[m
[32m+[m
[32m+[m[32m      const { count: reservedCount } = await supabase[m
[32m+[m[32m        .from('parking_spots')[m
[32m+[m[32m        .select('*', { count: 'exact', head: true })[m
[32m+[m[32m        .eq('lot_id', data.lot_id)[m
[32m+[m[32m        .eq('is_reserved', true);[m
[32m+[m
[32m+[m[32m      const occupied = occupiedCount || 0;[m
[32m+[m[32m      const reserved = reservedCount || 0;[m
[32m+[m[32m      const availableSpots = data.total_spots - occupied - reserved;[m
[32m+[m[41m      [m
[32m+[m[32m      // Debug logging[m
[32m+[m[32m      console.log(`🔍 Lot ${data.lot_id} calculation: total=${data.total_spots}, occupied=${occupied}, reserved=${reserved}, available=${availableSpots}`);[m
[32m+[m
       const transformedData = {[m
         id: data.lot_id,[m
         name: data.name,[m
[36m@@ -152,12 +187,15 @@[m [mapp.get('/api/parking-lots/:id', async (req, res) => {[m
         longitude: data.longitude,[m
         totalSpots: data.total_spots,[m
         pricePerHour: data.price_per_hour,[m
[31m-        managerId: data.manager_id,[m
[31m-        createdAt: data.created_at[m
[32m+[m[32m        availableSpots: Math.max(0, availableSpots),[m
[32m+[m[32m        total_spots: data.total_spots, // Keep both for compatibility[m
[32m+[m[32m        price_per_hour: data.price_per_hour, // Keep both for compatibility[m
[32m+[m[32m        manager_id: data.manager_id,[m
[32m+[m[32m        created_at: data.created_at[m
       };[m
 [m
       res.json({[m
[31m-        message: 'Parking lot details retrieved',[m
[32m+[m[32m        message: 'Parking lot details retrieved successfully (real data)',[m
         data: transformedData,[m
         status: 'ok'[m
       });[m
[36m@@ -203,8 +241,19 @@[m [mapp.get('/api/parking-lots/:id/spots', async (req, res) => {[m
         throw error;[m
       }[m
 [m
[31m-      // Transform data to match frontend expectations (camelCase only)[m
[32m+[m[32m      // Transform data to match frontend expectations (keep both snake_case and camelCase for compatibility)[m
       const transformedData = data.map(spot => ({[m
[32m+[m[32m        // Keep original snake_case fields for compatibility[m
[32m+[m[32m        spot_id: spot.spot_id,[m
[32m+[m[32m        lot_id: spot.lot_id,[m
[32m+[m[32m        spot_number: spot.spot_number,[m
[32m+[m[32m        spot_type: spot.spot_type,[m
[32m+[m[32m        is_occupied: spot.is_occupied,[m
[32m+[m[32m        is_reserved: spot.is_reserved,[m
[32m+[m[32m        reserved_by: spot.reserved_by,[m
[32m+[m[32m        updated_at: spot.updated_at,[m
[32m+[m[41m        [m
[32m+[m[32m        // Add camelCase fields for new frontend[m
         id: spot.spot_id,[m
         spotId: spot.spot_id,[m
         lotId: spot.lot_id,[m
[36m@@ -1127,7 +1176,7 @@[m [mapp.post('/api/reservations', async (req, res) => {[m
           {[m
             user_id: userId || 1,[m
             spot_id: parkingSpotId,[m
[31m-            reserved_at: new Date().toISOString(),[m
[32m+[m[32m            reserved_at: getCurrentTimeForDB(),[m
             expected_start: startTime,[m
             expected_end: endTime,[m
             status: 'pending'[m
[36m@@ -1147,7 +1196,7 @@[m [mapp.post('/api/reservations', async (req, res) => {[m
         .update({[m
           is_reserved: true,[m
           reserved_by: userId,[m
[31m-          updated_at: new Date().toISOString()[m
[32m+[m[32m          updated_at: getCurrentTimeForDB()[m
         })[m
         .eq('spot_id', parkingSpotId);[m
 [m
[36m@@ -1623,7 +1672,7 @@[m [mapp.post('/api/reservations/create', async (req, res) => {[m
         .insert({[m
           user_id: userId,[m
           spot_id: spotId,[m
[31m-          reserved_at: new Date().toISOString(),[m
[32m+[m[32m          reserved_at: getCurrentTimeForDB(),[m
           expected_start: expectedStart,[m
           expected_end: expectedEnd,[m
           status: 'pending',[m
[36m@@ -1643,7 +1692,7 @@[m [mapp.post('/api/reservations/create', async (req, res) => {[m
         .update({[m
           is_reserved: true,[m
           reserved_by: userId,[m
[31m-          updated_at: new Date().toISOString()[m
[32m+[m[32m          updated_at: getCurrentTimeForDB()[m
         })[m
         .eq('spot_id', spotId);[m
 [m
[36m@@ -1693,10 +1742,21 @@[m [mapp.post('/api/payment/success', async (req, res) => {[m
 [m
     if (supabase) {[m
       [m
[31m-      // Kiểm tra đặt chỗ có tồn tại và thuộc về user không[m
[32m+[m[32m      // Kiểm tra đặt chỗ có tồn tại và thuộc về user không, lấy luôn thông tin giá[m
       const { data: reservation, error: reservationError } = await supabase[m
         .from('reservations')[m
[31m-        .select('reservation_id, user_id, spot_id, status')[m
[32m+[m[32m        .select(`[m
[32m+[m[32m          reservation_id,[m[41m [m
[32m+[m[32m          user_id,[m[41m [m
[32m+[m[32m          spot_id,[m[41m [m
[32m+[m[32m          status,[m
[32m+[m[32m          parking_spots ([m
[32m+[m[32m            spot_id,[m
[32m+[m[32m            parking_lots ([m
[32m+[m[32m              price_per_hour[m
[32m+[m[32m            )[m
[32m+[m[32m          )[m
[32m+[m[32m        `)[m
         .eq('reservation_id', reservationId)[m
         .eq('user_id', userId)[m
         .single();[m
[36m@@ -1720,13 +1780,44 @@[m [mapp.post('/api/payment/success', async (req, res) => {[m
         });[m
       }[m
 [m
[32m+[m[32m      // Lấy thông tin spot để lấy lot_id[m
[32m+[m[32m      const { data: spotData, error: spotError } = await supabase[m
[32m+[m[32m        .from('parking_spots')[m
[32m+[m[32m        .select('spot_id, lot_id')[m
[32m+[m[32m        .eq('spot_id', reservation.spot_id)[m
[32m+[m[32m        .single();[m
[32m+[m
[32m+[m[32m      if (spotError) {[m
[32m+[m[32m        console.error('Error fetching spot data:', spotError);[m
[32m+[m[32m        // Dùng default price[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      let pricePerHour = 8000; // Default[m
[32m+[m
[32m+[m[32m      if (spotData?.lot_id) {[m
[32m+[m[32m        // Query trực tiếp từ parking_lots[m
[32m+[m[32m        const { data: lotData, error: lotError } = await supabase[m
[32m+[m[32m          .from('parking_lots')[m
[32m+[m[32m          .select('price_per_hour')[m
[32m+[m[32m          .eq('lot_id', spotData.lot_id)[m
[32m+[m[32m          .single();[m
[32m+[m
[32m+[m[32m        if (!lotError && lotData?.price_per_hour) {[m
[32m+[m[32m          pricePerHour = lotData.price_per_hour;[m
[32m+[m[32m          console.log('✅ Found price for lot', spotData.lot_id, ':', pricePerHour, 'VNĐ');[m
[32m+[m[32m        } else {[m
[32m+[m[32m          console.error('Error fetching lot pricing:', lotError);[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m
       // Cập nhật trạng thái đặt chỗ thành confirmed[m
       const { error: updateReservationError } = await supabase[m
         .from('reservations')[m
         .update({[m
           status: 'confirmed',[m
           payment_method: paymentMethod,[m
[31m-          payment_time: new Date().toISOString()[m
[32m+[m[32m          payment_time: getCurrentTimeForDB(),[m
[32m+[m[32m          payment_amount: pricePerHour // Phí đặt chỗ = giá 1 giờ đỗ xe[m
         })[m
         .eq('reservation_id', reservationId);[m
 [m
[36m@@ -1742,7 +1833,7 @@[m [mapp.post('/api/payment/success', async (req, res) => {[m
         .insert({[m
           user_id: userId,[m
           spot_id: reservation.spot_id,[m
[31m-          entry_time: new Date().toISOString(),[m
[32m+[m[32m          entry_time: getCurrentTimeForDB(),[m
           status: 'in',[m
           fee: 0 // Sẽ tính phí khi ra xe[m
         })[m
[36m@@ -1761,7 +1852,7 @@[m [mapp.post('/api/payment/success', async (req, res) => {[m
           is_occupied: true,[m
           is_reserved: false,[m
           reserved_by: null,[m
[31m-          updated_at: new Date().toISOString()[m
[32m+[m[32m          updated_at: getCurrentTimeForDB()[m
         })[m
         .eq('spot_id', reservation.spot_id);[m
 [m
[36m@@ -1775,7 +1866,7 @@[m [mapp.post('/api/payment/success', async (req, res) => {[m
           reservation_id: reservationId,[m
           parking_log_id: parkingLog.log_id,[m
           status: 'confirmed',[m
[31m-          payment_amount: 10000, // Phí đặt chỗ: 10,000 VNĐ[m
[32m+[m[32m          payment_amount: pricePerHour, // Phí đặt chỗ = giá 1 giờ đỗ xe[m
           payment_method: paymentMethod[m
         },[m
         status: 'ok'[m
[36m@@ -1863,7 +1954,7 @@[m [mapp.get('/api/payment/:reservationId', async (req, res) => {[m
     }[m
 [m
     if (supabase) {[m
[31m-      // Lấy thông tin đặt chỗ[m
[32m+[m[32m      // Lấy thông tin đặt chỗ và giá bãi đỗ xe[m
       const { data: reservation, error: reservationError } = await supabase[m
         .from('reservations')[m
         .select(`[m
[36m@@ -1878,7 +1969,8 @@[m [mapp.get('/api/payment/:reservationId', async (req, res) => {[m
             spot_number,[m
             parking_lots ([m
               name,[m
[31m-              address[m
[32m+[m[32m              address,[m
[32m+[m[32m              price_per_hour[m
             )[m
           )[m
         `)[m
[36m@@ -1905,15 +1997,43 @@[m [mapp.get('/api/payment/:reservationId', async (req, res) => {[m
         });[m
       }[m
 [m
[32m+[m[32m      // Lấy thông tin spot và parking lot[m
[32m+[m[32m      const { data: spotData, error: spotError } = await supabase[m
[32m+[m[32m        .from('parking_spots')[m
[32m+[m[32m        .select('spot_id, spot_number, lot_id')[m
[32m+[m[32m        .eq('spot_id', reservation.spot_id)[m
[32m+[m[32m        .single();[m
[32m+[m
[32m+[m[32m      if (spotError) {[m
[32m+[m[32m        console.error('Error fetching spot data:', spotError);[m
[32m+[m[32m        throw spotError;[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      // Query parking lot để lấy giá và thông tin[m
[32m+[m[32m      const { data: lotData, error: lotError } = await supabase[m
[32m+[m[32m        .from('parking_lots')[m
[32m+[m[32m        .select('lot_id, name, address, price_per_hour')[m
[32m+[m[32m        .eq('lot_id', spotData.lot_id)[m
[32m+[m[32m        .single();[m
[32m+[m
[32m+[m[32m      if (lotError) {[m
[32m+[m[32m        console.error('Error fetching lot data:', lotError);[m
[32m+[m[32m        throw lotError;[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      // Lấy giá 1 giờ đỗ xe từ bãi đỗ xe[m
[32m+[m[32m      const pricePerHour = lotData.price_per_hour || 8000; // Default 8000 nếu không có[m
[32m+[m
       res.json({[m
         message: 'Payment information retrieved successfully',[m
         data: {[m
           reservation_id: reservation.reservation_id,[m
[31m-          payment_amount: 10000, // Phí đặt chỗ: 10,000 VNĐ[m
[31m-          payment_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAYMENT_${reservation.reservation_id}_10000`,[m
[31m-          spot_number: reservation.parking_spots?.spot_number,[m
[31m-          parking_lot_name: reservation.parking_spots?.parking_lots?.name,[m
[31m-          parking_lot_address: reservation.parking_spots?.parking_lots?.address,[m
[32m+[m[32m          payment_amount: pricePerHour, // Phí đặt chỗ = giá 1 giờ đỗ xe[m
[32m+[m[32m          payment_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAYMENT_${reservation.reservation_id}_${pricePerHour}`,[m
[32m+[m[32m          spot_number: spotData.spot_number,[m
[32m+[m[32m          parking_lot_name: lotData.name,[m
[32m+[m[32m          parking_lot_address: lotData.address,[m
[32m+[m[32m          price_per_hour: pricePerHour, // Thêm thông tin giá để frontend sử dụng[m
           expected_start: reservation.expected_start,[m
           expected_end: reservation.expected_end,[m
           test_payment_url: `/api/payment/test`[m
[36m@@ -1983,7 +2103,7 @@[m [mapp.post('/api/reservations/:reservationId/confirm', async (req, res) => {[m
         .from('reservations')[m
         .update({[m
           status: 'confirmed',[m
[31m-          payment_time: new Date().toISOString()[m
[32m+[m[32m          payment_time: getCurrentTimeForDB()[m
         })[m
         .eq('reservation_id', reservationId);[m
 [m
[36m@@ -1998,7 +2118,7 @@[m [mapp.post('/api/reservations/:reservationId/confirm', async (req, res) => {[m
         .insert({[m
           user_id: userId,[m
           spot_id: reservation.spot_id,[m
[31m-          entry_time: new Date().toISOString(),[m
[32m+[m[32m          entry_time: getCurrentTimeForDB(),[m
           status: 'in'[m
         })[m
         .select('log_id')[m
[36m@@ -2016,7 +2136,7 @@[m [mapp.post('/api/reservations/:reservationId/confirm', async (req, res) => {[m
           is_occupied: true,[m
           is_reserved: false,[m
           reserved_by: null,[m
[31m-          updated_at: new Date().toISOString()[m
[32m+[m[32m          updated_at: getCurrentTimeForDB()[m
         })[m
         .eq('spot_id', reservation.spot_id);[m
 [m
[36m@@ -2207,6 +2327,109 @@[m [mapp.get('/api/user/history', async (req, res) => {[m
   }[m
 });[m
 [m
[32m+[m[32m// API sửa dữ liệu reservation (tạm thời)[m
[32m+[m[32mapp.post('/api/fix-reservation/:reservationId', async (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { reservationId } = req.params;[m
[32m+[m[32m    const { userId } = req.body;[m
[32m+[m
[32m+