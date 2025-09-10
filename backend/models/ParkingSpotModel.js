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
  console.log('Supabase not available for ParkingSpotModel');
}

class ParkingSpot {
  // Lấy tất cả chỗ đỗ xe của một bãi đỗ xe
  static async getByLotId(lotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_spots')
      .select(`
        spot_id,
        spot_number,
        spot_type,
        is_occupied,
        is_reserved,
        parking_lots!inner (
          lot_id,
          price_per_hour
        )
      `)
      .eq('lot_id', lotId)
      .order('spot_number');
    
    if (error) {
      throw error;
    }
    
    return data.map(spot => ({
      spotId: spot.spot_id,
      spotNumber: spot.spot_number,
      spotType: spot.spot_type,
      isOccupied: spot.is_occupied,
      isReserved: spot.is_reserved,
      pricePerHour: spot.parking_lots.price_per_hour
    }));
  }

  // Lấy chỗ đỗ xe theo ID
  static async getById(spotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_spots')
      .select(`
        spot_id,
        spot_number,
        spot_type,
        is_occupied,
        is_reserved,
        lot_id,
        parking_lots!inner (
          price_per_hour
        )
      `)
      .eq('spot_id', spotId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      spotId: data.spot_id,
      spotNumber: data.spot_number,
      spotType: data.spot_type,
      isOccupied: data.is_occupied,
      isReserved: data.is_reserved,
      lotId: data.lot_id,
      pricePerHour: data.parking_lots.price_per_hour
    };
  }

  // Cập nhật trạng thái chỗ đỗ xe
  static async updateStatus(spotId, isOccupied, isReserved, reservedBy = null) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { error } = await supabase
      .from('parking_spots')
      .update({
        is_occupied: isOccupied,
        is_reserved: isReserved,
        reserved_by: reservedBy,
        updated_at: new Date().toISOString()
      })
      .eq('spot_id', spotId);
    
    if (error) {
      throw error;
    }
    
    return true;
  }

  // Đặt chỗ đỗ xe
  static async reserve(spotId, userId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { error } = await supabase
      .from('parking_spots')
      .update({
        is_reserved: true,
        reserved_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('spot_id', spotId)
      .eq('is_occupied', false)
      .eq('is_reserved', false);
    
    if (error) {
      throw error;
    }
    
    return true;
  }

  // Hủy đặt chỗ
  static async cancelReservation(spotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { error } = await supabase
      .from('parking_spots')
      .update({
        is_reserved: false,
        reserved_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('spot_id', spotId);
    
    if (error) {
      throw error;
    }
    
    return true;
  }

  // Lấy số chỗ trống của một bãi đỗ xe
  static async getAvailableCount(lotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { count, error } = await supabase
      .from('parking_spots')
      .select('*', { count: 'exact', head: true })
      .eq('lot_id', lotId)
      .eq('is_occupied', false)
      .eq('is_reserved', false);
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  }

  // Tìm chỗ đỗ xe trống đầu tiên
  static async findAvailableSpot(lotId = 1) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('parking_spots')
      .select(`
        spot_id,
        spot_number,
        spot_type,
        is_occupied,
        is_reserved,
        parking_lots!inner (
          price_per_hour
        )
      `)
      .eq('lot_id', lotId)
      .eq('is_occupied', false)
      .eq('is_reserved', false)
      .order('spot_number')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      spotId: data.spot_id,
      spotNumber: data.spot_number,
      spotType: data.spot_type,
      isOccupied: data.is_occupied,
      isReserved: data.is_reserved,
      pricePerHour: data.parking_lots.price_per_hour
    };
  }

  // Lấy tổng số chỗ đỗ xe của một bãi
  static async getTotalCount(lotId) {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { count, error } = await supabase
      .from('parking_spots')
      .select('*', { count: 'exact', head: true })
      .eq('lot_id', lotId);
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  }
}

module.exports = ParkingSpot;