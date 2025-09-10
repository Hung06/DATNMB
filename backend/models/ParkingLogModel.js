// Try to load Supabase client
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.log('Supabase not available for ParkingLogModel');
}

class ParkingLog {
  // Lấy lịch sử đỗ xe của một user
  static async getByUserId(userId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_logs')
      .select(`
        log_id,
        entry_time,
        exit_time,
        total_minutes,
        fee,
        status,
        parking_spots (
          spot_number,
          parking_lots (
            name,
            address
          )
        )
      `)
      .eq('user_id', userId)
      .order('entry_time', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // Lấy chi tiết một log đỗ xe
  static async getById(logId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_logs')
      .select(`
        log_id,
        user_id,
        spot_id,
        entry_time,
        exit_time,
        total_minutes,
        fee,
        status,
        parking_spots (
          spot_number,
          parking_lots (
            name,
            address
          )
        )
      `)
      .eq('log_id', logId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // Tạo log đỗ xe mới (khi vào bãi)
  static async createEntry(userId, spotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_logs')
      .insert({
        user_id: userId,
        spot_id: spotId,
        entry_time: new Date().toISOString(),
        status: 'in'
      })
      .select('log_id')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data.log_id;
  }

  // Cập nhật log khi ra bãi
  static async updateExit(logId, totalMinutes, fee) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { error } = await supabase
      .from('parking_logs')
      .update({
        exit_time: new Date().toISOString(),
        total_minutes: totalMinutes,
        fee: fee,
        status: 'out'
      })
      .eq('log_id', logId);
    
    if (error) {
      throw error;
    }
    
    return true;
  }

  // Lấy tất cả logs (cho admin/manager)
  static async getAll() {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_logs')
      .select(`
        log_id,
        user_id,
        spot_id,
        entry_time,
        exit_time,
        total_minutes,
        fee,
        status,
        parking_spots (
          spot_number,
          parking_lots (
            name,
            address
          )
        ),
        users (
          full_name,
          license_plate
        )
      `)
      .order('entry_time', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // Lấy logs theo bãi đỗ xe
  static async getByParkingLot(lotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_logs')
      .select(`
        log_id,
        user_id,
        spot_id,
        entry_time,
        exit_time,
        total_minutes,
        fee,
        status,
        parking_spots (
          spot_number,
          parking_lots!inner (
            lot_id,
            name,
            address
          )
        ),
        users (
          full_name,
          license_plate
        )
      `)
      .eq('parking_spots.parking_lots.lot_id', lotId)
      .order('entry_time', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  // Lấy log đang hoạt động của user (chưa ra bãi)
  static async getActiveByUserId(userId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_logs')
      .select(`
        log_id,
        user_id,
        spot_id,
        entry_time,
        exit_time,
        total_minutes,
        fee,
        status,
        parking_spots (
          spot_number,
          parking_lots (
            name,
            address
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'in')
      .order('entry_time', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  // Xác nhận xe đã vào slot
  static async confirmEntry(logId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { error } = await supabase
      .from('parking_logs')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('log_id', logId)
      .eq('status', 'in');
    
    if (error) {
      throw error;
    }
    
    return true;
  }
}

module.exports = ParkingLog;