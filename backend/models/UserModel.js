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
  console.log('Supabase not available for UserModel');
}

const UserModel = {
  findByEmail: async (email) => {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  },
  
  findByLicensePlate: async (license_plate) => {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('license_plate', license_plate)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  },
  
  createUser: async ({ full_name, email, password, phone, license_plate }) => {
    if (!supabase) {
      throw new Error('Supabase not connected');
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password,
        phone: phone || null,
        license_plate: license_plate || null,
        role: 'user'
      })
      .select('user_id')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data.user_id;
  }
};

module.exports = UserModel;
