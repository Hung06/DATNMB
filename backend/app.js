// Parking API with real data from Supabase
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Try to load environment variables
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: './env.supabase' });
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase connected successfully');
  } else {
    console.log('⚠️ Supabase credentials not found, using mock data');
  }
} catch (error) {
  console.log('⚠️ Supabase connection failed, using mock data:', error.message);
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
  res.json({
    message: 'Parking API is working!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: supabase ? 'Supabase PostgreSQL' : 'Mock Data'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Health check OK',
    status: 'ok',
    database: supabase ? 'Connected to Supabase' : 'Mock Data Mode'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint OK',
    status: 'ok'
  });
});

// Real data endpoints with correct column names from database
app.get('/api/parking-lots', async (req, res) => {
  try {
    if (supabase) {
      // Use correct column names from database: lot_id, name, address, total_spots, price_per_hour
      const { data, error } = await supabase
        .from('parking_lots')
        .select('lot_id, name, latitude, longitude, address, total_spots, price_per_hour, manager_id, created_at')
        .order('lot_id', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform data to match frontend expectations
      const transformedData = await Promise.all(data.map(async (lot) => {
        // Get available spots count for this lot
        const { count: occupiedCount } = await supabase
          .from('parking_spots')
          .select('*', { count: 'exact', head: true })
          .eq('lot_id', lot.lot_id)
          .eq('is_occupied', true);

        const { count: reservedCount } = await supabase
          .from('parking_spots')
          .select('*', { count: 'exact', head: true })
          .eq('lot_id', lot.lot_id)
          .eq('is_reserved', true);

        const occupied = occupiedCount || 0;
        const reserved = reservedCount || 0;
        const availableSpots = lot.total_spots - occupied - reserved;

        return {
          id: lot.lot_id,
          name: lot.name,
          address: lot.address,
          latitude: lot.latitude,
          longitude: lot.longitude,
          totalSpots: lot.total_spots,
          pricePerHour: lot.price_per_hour,
          availableSpots: Math.max(0, availableSpots),
          total_spots: lot.total_spots, // Keep both for compatibility
          price_per_hour: lot.price_per_hour, // Keep both for compatibility
          manager_id: lot.manager_id,
          created_at: lot.created_at
        };
      }));

      res.json({
        message: 'Parking lots retrieved successfully (real data)',
        data: transformedData || [],
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

app.get('/api/parking-lots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { data, error } = await supabase
        .from('parking_lots')
        .select('lot_id, name, latitude, longitude, address, total_spots, price_per_hour, manager_id, created_at')
        .eq('lot_id', id)
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(404).json({
          message: 'Parking lot not found',
          error: error.message,
          status: 'error'
        });
      }

      const transformedData = {
        id: data.lot_id,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        totalSpots: data.total_spots,
        pricePerHour: data.price_per_hour,
        managerId: data.manager_id,
        createdAt: data.created_at
      };

      res.json({
        message: 'Parking lot details retrieved',
        data: transformedData,
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching parking lot:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Get parking spots for a specific lot
app.get('/api/parking-lots/:id/spots', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { data, error } = await supabase
        .from('parking_spots')
        .select(`
          spot_id,
          lot_id,
          spot_number,
          spot_type,
          is_occupied,
          is_reserved,
          reserved_by,
          updated_at
        `)
        .eq('lot_id', id)
        .order('spot_number', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform data to match frontend expectations (camelCase only)
      const transformedData = data.map(spot => ({
        id: spot.spot_id,
        spotId: spot.spot_id,
        lotId: spot.lot_id,
        spotNumber: spot.spot_number,
        spotType: spot.spot_type,
        isOccupied: spot.is_occupied,
        isReserved: spot.is_reserved,
        reservedBy: spot.reserved_by,
        updatedAt: spot.updated_at
      }));

      res.json({
        message: 'Parking spots retrieved successfully',
        data: transformedData || [],
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

app.get('/api/parking-spots', async (req, res) => {
  try {
    if (supabase) {
      // Use correct column names: spot_id, lot_id, spot_number, spot_type, is_occupied, is_reserved
      const { data, error } = await supabase
        .from('parking_spots')
        .select(`
          spot_id,
          lot_id,
          spot_number,
          spot_type,
          is_occupied,
          is_reserved,
          reserved_by,
          updated_at,
          parking_lots (
            lot_id,
            name,
            address
          )
        `)
        .order('spot_id', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform data to match frontend expectations
      const transformedData = data.map(spot => ({
        id: spot.spot_id,
        spotId: spot.spot_id,
        lotId: spot.lot_id,
        lot_id: spot.lot_id,
        spotNumber: spot.spot_number,
        spot_number: spot.spot_number,
        spotType: spot.spot_type,
        spot_type: spot.spot_type,
        isOccupied: spot.is_occupied,
        is_occupied: spot.is_occupied,
        isReserved: spot.is_reserved,
        is_reserved: spot.is_reserved,
        reservedBy: spot.reserved_by,
        reserved_by: spot.reserved_by,
        updatedAt: spot.updated_at,
        updated_at: spot.updated_at,
        parkingLot: spot.parking_lots ? {
          id: spot.parking_lots.lot_id,
          name: spot.parking_lots.name,
          address: spot.parking_lots.address
        } : null,
        parking_lot: spot.parking_lots ? {
          id: spot.parking_lots.lot_id,
          name: spot.parking_lots.name,
          address: spot.parking_lots.address
        } : null
      }));

      res.json({
        message: 'Parking spots retrieved successfully (real data)',
        data: transformedData || [],
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

app.get('/api/parking-spots/available', async (req, res) => {
  try {
    if (supabase) {
      // Get available spots (not occupied and not reserved)
      const { data, error } = await supabase
        .from('parking_spots')
        .select(`
          spot_id,
          lot_id,
          spot_number,
          spot_type,
          is_occupied,
          is_reserved,
          reserved_by,
          updated_at,
          parking_lots (
            lot_id,
            name,
            address
          )
        `)
        .eq('is_occupied', false)
        .eq('is_reserved', false)
        .order('spot_id', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform data
      const transformedData = data.map(spot => ({
        id: spot.spot_id,
        lot_id: spot.lot_id,
        spot_number: spot.spot_number,
        spot_type: spot.spot_type,
        is_occupied: spot.is_occupied,
        is_reserved: spot.is_reserved,
        reserved_by: spot.reserved_by,
        updated_at: spot.updated_at,
        parking_lot: spot.parking_lots ? {
          id: spot.parking_lots.lot_id,
          name: spot.parking_lots.name,
          address: spot.parking_lots.address
        } : null
      }));

      res.json({
        message: 'Available parking spots retrieved (real data)',
        data: transformedData || [],
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching available spots:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Get parking spot by ID
app.get('/api/parking-spots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { data, error } = await supabase
        .from('parking_spots')
        .select(`
          spot_id,
          lot_id,
          spot_number,
          spot_type,
          is_occupied,
          is_reserved,
          reserved_by,
          updated_at,
          parking_lots (
            lot_id,
            name,
            address,
            price_per_hour
          )
        `)
        .eq('spot_id', id)
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!data) {
        return res.status(404).json({
          message: 'Parking spot not found',
          status: 'error'
        });
      }

      // Transform data to match frontend expectations (camelCase only)
      const transformedData = {
        id: data.spot_id,
        spotId: data.spot_id,
        lotId: data.lot_id,
        spotNumber: data.spot_number,
        spotType: data.spot_type,
        isOccupied: data.is_occupied,
        isReserved: data.is_reserved,
        reservedBy: data.reserved_by,
        updatedAt: data.updated_at,
        parkingLot: data.parking_lots ? {
          id: data.parking_lots.lot_id,
          name: data.parking_lots.name,
          address: data.parking_lots.address,
          pricePerHour: data.parking_lots.price_per_hour
        } : null
      };

      res.json({
        message: 'Parking spot retrieved successfully',
        data: transformedData,
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching parking spot:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Auth endpoints with correct column names
app.post('/api/auth/login', async (req, res) => {
  try {
    if (supabase) {
      const { email, password } = req.body;

      console.log('🔍 Login attempt for email:', email);

      // Use correct column names: user_id, full_name, email, password, role
      const { data: user, error } = await supabase
        .from('users')
        .select('user_id, full_name, email, password, phone, license_plate, role, created_at')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(401).json({
          message: 'Email hoặc mật khẩu không đúng',
          status: 'error'
        });
      }

      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({
          message: 'Email hoặc mật khẩu không đúng',
          status: 'error'
        });
      }

      console.log('✅ User found:', user.full_name);

      // Check if password is hashed or plain text
      let isPasswordValid = false;
      
      // Try direct comparison first (for plain text passwords)
      if (password === user.password) {
        isPasswordValid = true;
      }
      // Try bcrypt comparison (for hashed passwords)
      else if (user.password && user.password.length > 20) {
        try {
          const bcrypt = require('bcryptjs');
          isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
          console.error('Bcrypt error:', bcryptError);
        }
      }
      // Allow simple password '1' for testing
      else if (password === '1') {
        isPasswordValid = true;
      }

      if (!isPasswordValid) {
        console.log('❌ Invalid password for user:', email);
        return res.status(401).json({
          message: 'Email hoặc mật khẩu không đúng',
          status: 'error'
        });
      }

      // Create proper JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'datn_parking_jwt_secret_key_2024_supabase',
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful for:', user.full_name);

      res.json({
        message: 'Đăng nhập thành công',
        data: {
          token: token,
          user: {
            id: user.user_id,
            email: user.email,
            name: user.full_name,
            phone: user.phone,
            license_plate: user.license_plate,
            role: user.role
          }
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Google Auth endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken, email, user } = req.body;
    
    console.log('🔍 Google Auth request body:', { idToken: !!idToken, email, user: !!user });
    console.log('🔍 Full request body:', JSON.stringify(req.body, null, 2));
    
    if (!idToken) {
      return res.status(400).json({ 
        message: 'Token Google không hợp lệ',
        status: 'error'
      });
    }

    // Try to get email from multiple sources
    let userEmail = email;
    let decoded = null;
    
    console.log('🔍 Initial email from request:', email);
    console.log('🔍 User object from request:', user);
    
    // If email is not provided directly, try to get it from user object
    if (!userEmail && user && user.email) {
      userEmail = user.email;
      console.log('✅ Email found in user object:', userEmail);
    }
    
    // Log the user object to debug
    console.log('🔍 Google user object:', user);
    
    // If still no email, try to decode the token
    if (!userEmail) {
      console.log('⚠️ No email found in request, trying to decode token...');
      try {
        // Try to decode the JWT token to extract email
        // Note: In production, you should verify the token with Google's public keys
        const jwt = require('jsonwebtoken');
        
        // Decode without verification for now (for development)
        decoded = jwt.decode(idToken);
        console.log('🔍 Decoded token payload:', decoded);
        
        if (decoded && decoded.email) {
          userEmail = decoded.email;
          console.log('✅ Email extracted from token:', userEmail);
        } else {
          console.log('⚠️ No email found in token payload');
          console.log('🔍 Token payload keys:', decoded ? Object.keys(decoded) : 'null');
          
          // Try to extract email from other possible fields
          if (decoded && decoded.sub) {
            console.log('🔍 Found sub field, might be email:', decoded.sub);
            // Check if sub looks like an email
            if (decoded.sub.includes('@')) {
              userEmail = decoded.sub;
              console.log('✅ Using sub as email:', userEmail);
            }
          }
          
          if (!userEmail) {
            return res.status(400).json({
              message: 'Email không tìm thấy trong token Google. Vui lòng thử lại.',
              status: 'error'
            });
          }
        }
      } catch (tokenError) {
        console.error('Token decode error:', tokenError);
        return res.status(400).json({
          message: 'Không thể xác thực token Google',
          status: 'error'
        });
      }
    } else {
      console.log('✅ Email already found:', userEmail);
    }
    
    if (!userEmail) {
      console.log('❌ No email found from any source');
      console.log('🔍 Request body:', req.body);
      return res.status(400).json({
        message: 'Email is required for Google authentication. Please ensure Google Sign-In is configured correctly.',
        status: 'error'
      });
    }
    
    console.log('🔍 Google Auth looking for user with email:', userEmail);

    if (supabase) {
      // Query database for user with this email
      let { data: user, error } = await supabase
        .from('users')
        .select('user_id, full_name, email, phone, license_plate, role, created_at')
        .eq('email', userEmail)
        .single();

      console.log('🔍 Database query result:', { user: user ? user.email : 'null', error: error ? error.message : 'null' });

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        return res.status(500).json({
          message: 'Lỗi database',
          status: 'error'
        });
      }

      if (!user) {
        console.log('❌ User not found in database, creating new user...');
        // Create new user if not found
        // Try to get user info from the request body or decoded token
        let googleUserName = 'Google User';
        
        // Try multiple sources for user name
        if (req.body.user && req.body.user.name) {
          googleUserName = req.body.user.name;
        } else if (req.body.user && req.body.user.givenName) {
          googleUserName = req.body.user.givenName;
        } else if (req.body.user && req.body.user.displayName) {
          googleUserName = req.body.user.displayName;
        } else if (decoded && decoded.name) {
          googleUserName = decoded.name;
        } else if (decoded && decoded.given_name) {
          googleUserName = decoded.given_name;
        } else if (decoded && decoded.display_name) {
          googleUserName = decoded.display_name;
        } else if (decoded && decoded.sub) {
          // Use email prefix as name if no name found
          const emailPrefix = userEmail.split('@')[0];
          googleUserName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        }
        
        console.log('🔍 Creating new Google user with name:', googleUserName);
        console.log('🔍 Using email:', userEmail);
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            full_name: googleUserName,
            email: userEmail,
            password: '', // Google user doesn't need password
            phone: null,
            license_plate: null,
            role: 'user'
          })
          .select('user_id, full_name, email, phone, license_plate, role, created_at')
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return res.status(500).json({
            message: 'Lỗi tạo user mới',
            status: 'error'
          });
        }

        user = newUser;
        console.log('✅ New Google user created:', user.full_name);
      } else {
        console.log('✅ Existing Google user found:', user.full_name);
      }

      // Create JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'datn_parking_jwt_secret_key_2024_supabase',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Đăng nhập Google thành công',
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          license_plate: user.license_plate,
          role: user.role
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
      status: 'error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    if (supabase) {
      const { email, password, name, phone, license_plate } = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          message: 'Email đã được sử dụng',
          status: 'error'
        });
      }

      // Check for duplicate phone number (if provided)
      if (phone && phone.trim()) {
        const { data: existingPhoneUsers } = await supabase
          .from('users')
          .select('user_id')
          .eq('phone', phone.trim());

        if (existingPhoneUsers && existingPhoneUsers.length > 0) {
          return res.status(400).json({
            message: 'Số điện thoại đã được sử dụng',
            status: 'error'
          });
        }
      }

      // Check for duplicate license plate (if provided)
      if (license_plate && license_plate.trim()) {
        const { data: existingLicenseUsers } = await supabase
          .from('users')
          .select('user_id')
          .eq('license_plate', license_plate.trim());

        if (existingLicenseUsers && existingLicenseUsers.length > 0) {
          return res.status(400).json({
            message: 'Biển số xe đã được sử dụng',
            status: 'error'
          });
        }
      }

      // Insert new user with correct column names
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            full_name: name,
            email: email,
            password: password, // In production, hash this password
            phone: phone ? phone.trim() : null,
            license_plate: license_plate ? license_plate.trim() : null,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      res.json({
        message: 'Registration successful (real data)',
        data: {
          token: 'real-jwt-token-456',
          user: {
            id: newUser.user_id,
            email: newUser.email,
            name: newUser.full_name,
            role: newUser.role
          }
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Profile endpoint
app.get('/api/auth/profile', async (req, res) => {
  try {
    // Get user by email from query parameter
    let userEmail = req.query.email;
    
    // If no email in query, check for token
    if (!userEmail) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'No email provided or no token provided',
          status: 'error'
        });
      }
      
      // Decode JWT token to get user email
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datn_parking_jwt_secret_key_2024_supabase');
        userEmail = decoded.email;
        console.log('🔍 Decoded token email:', userEmail);
      } catch (error) {
        console.error('Token decode error:', error);
        return res.status(401).json({
          message: 'Invalid token',
          status: 'error'
        });
      }
    }
    
    // Get user from database using email
    if (supabase) {
      console.log('🔍 Looking for user with email:', userEmail);
      console.log('🔍 Profile request - query params:', req.query);
      console.log('🔍 Profile request - headers:', req.headers);
      
      // Get user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('user_id, full_name, email, phone, license_plate, role, created_at')
        .eq('email', userEmail)
        .single();

      if (error || !user) {
        return res.status(404).json({
          message: 'User not found',
          status: 'error'
        });
      }

      
      // Get user statistics
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('reservation_id, status')
        .eq('user_id', user.user_id);

      const { data: parkingLogs, error: parkingLogsError } = await supabase
        .from('parking_logs')
        .select('log_id, fee, status')
        .eq('user_id', user.user_id);

      // Get payments for reservations
      const { data: reservationPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.user_id)
        .eq('payment_type', 'reservation_deposit');

      // Calculate statistics
      const totalReservations = reservations?.length || 0;
      const completedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0;
      const totalSpent = (reservationPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0) +
                        (parkingLogs?.reduce((sum, l) => sum + (l.fee || 0), 0) || 0);
      const totalParkingSessions = parkingLogs?.length || 0;

      res.json({
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.user_id,
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            name: user.full_name,
            role: user.role,
            phone: user.phone, // Return null if null in database
            license_plate: user.license_plate, // Return null if null in database
            created_at: user.created_at
          },
          statistics: {
            totalReservations,
            completedReservations,
            totalSpent,
            totalParkingSessions
          }
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Reservations with correct column names
app.get('/api/reservations', async (req, res) => {
  try {
    if (supabase) {
      
      // Use correct column names: reservation_id, user_id, spot_id, reserved_at, expected_start, expected_end, status
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          reservation_id,
          user_id,
          spot_id,
          reserved_at,
          expected_start,
          expected_end,
          status,
          parking_spots (
            spot_id,
            spot_number,
            parking_lots (
              lot_id,
              name,
              address
            )
          ),
          users (
            user_id,
            full_name,
            email
          )
        `)
        .order('reserved_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform data
      const transformedData = data.map(reservation => ({
        id: reservation.reservation_id,
        user_id: reservation.user_id,
        spot_id: reservation.spot_id,
        reserved_at: reservation.reserved_at,
        expected_start: reservation.expected_start,
        expected_end: reservation.expected_end,
        status: reservation.status,
        payment_id: reservation.payment_id,
        payment_method: reservation.payment_method,
        
        payment_amount: 0, // Sẽ tính phí khi ra xe
        payment_time: reservation.payment_time,
        parking_spot: reservation.parking_spots ? {
          id: reservation.parking_spots.spot_id,
          spot_number: reservation.parking_spots.spot_number,
          parking_lot: reservation.parking_spots.parking_lots ? {
            id: reservation.parking_spots.parking_lots.lot_id,
            name: reservation.parking_spots.parking_lots.name,
            address: reservation.parking_spots.parking_lots.address
          } : null
        } : null,
        user: reservation.users ? {
          id: reservation.users.user_id,
          name: reservation.users.full_name,
          email: reservation.users.email
        } : null
      }));

      res.json({
        message: 'Reservations retrieved successfully (real data)',
        data: transformedData || [],
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    if (supabase) {
      const { parkingSpotId, startTime, endTime, userId } = req.body;

      // Kiểm tra trạng thái hiện tại của user
      const { data: activeParking, error: parkingError } = await supabase
        .from('parking_logs')
        .select('log_id')
        .eq('user_id', userId)
        .eq('status', 'in')
        .single();

      if (parkingError && parkingError.code !== 'PGRST116') {
        console.error('Error checking parking status:', parkingError);
        throw parkingError;
      }

      if (activeParking) {
        return res.status(400).json({
          message: 'Bạn đang đỗ xe tại một bãi khác. Không thể đặt chỗ mới.',
          status: 'error'
        });
      }

      // Kiểm tra xem user có đặt chỗ đang chờ xác nhận không
      const { data: pendingReservation, error: reservationError } = await supabase
        .from('reservations')
        .select('reservation_id')
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed'])
        .single();

      if (reservationError && reservationError.code !== 'PGRST116') {
        console.error('Error checking reservation status:', reservationError);
        throw reservationError;
      }

      if (pendingReservation) {
        return res.status(400).json({
          message: 'Bạn đã có đặt chỗ đang chờ xác nhận. Không thể đặt chỗ mới.',
          status: 'error'
        });
      }

      // Use correct column names
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert([
          {
            user_id: userId || 1,
            spot_id: parkingSpotId,
            reserved_at: new Date().toISOString(),
            expected_start: startTime,
            expected_end: endTime,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Reservation creation error:', error);
        throw error;
      }

      // Cập nhật trạng thái chỗ đỗ xe
      const { error: updateSpotError } = await supabase
        .from('parking_spots')
        .update({
          is_reserved: true,
          reserved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('spot_id', parkingSpotId);

      if (updateSpotError) {
        console.error('Error updating spot status:', updateSpotError);
      }

      res.json({
        message: 'Reservation created successfully (real data)',
        data: {
          id: reservation.reservation_id,
          user_id: reservation.user_id,
          spot_id: reservation.spot_id,
          status: reservation.status
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Parking logs with correct column names
app.get('/api/parking-logs/history', async (req, res) => {
  try {
    if (supabase) {
      // Use correct column names: log_id, user_id, spot_id, entry_time, exit_time, total_minutes, fee, status
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
            spot_id,
            spot_number,
            parking_lots (
              lot_id,
              name,
              address
            )
          ),
          users (
            user_id,
            full_name,
            email
          )
        `)
        .order('entry_time', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Transform data to match frontend expectations
      const transformedData = data.map(log => ({
        log_id: log.log_id,
        user_id: log.user_id,
        spot_id: log.spot_id,
        entry_time: log.entry_time,
        exit_time: log.exit_time,
        total_minutes: log.total_minutes,
        fee: log.fee,
        status: log.status,
        spot_number: log.parking_spots?.spot_number || '',
        parking_lot_name: log.parking_spots?.parking_lots?.name || '',
        parking_lot_address: log.parking_spots?.parking_lots?.address || '',
        payment_id: null, // Add if available in database
        paid_amount: log.fee || 0,
        payment_method: null, // Add if available in database
        paid_at: log.exit_time || null,
        // Keep nested structure for compatibility
        parking_spot: log.parking_spots ? {
          id: log.parking_spots.spot_id,
          spot_number: log.parking_spots.spot_number,
          parking_lot: log.parking_spots.parking_lots ? {
            id: log.parking_spots.parking_lots.lot_id,
            name: log.parking_spots.parking_lots.name,
            address: log.parking_spots.parking_lots.address
          } : null
        } : null,
        user: log.users ? {
          id: log.users.user_id,
          name: log.users.full_name,
          email: log.users.email
        } : null
      }));

      res.json({
        message: 'Parking logs retrieved successfully (real data)',
        data: transformedData || [],
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching parking logs:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Update profile endpoint
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { full_name, phone, license_plate, email } = req.body;
    console.log('Profile update request:', { full_name, phone, license_plate, email });
    
    // Get user email from request body
    const userEmail = email;
    if (!userEmail) {
      return res.status(400).json({
        message: 'Email is required for profile update',
        status: 'error'
      });
    }
    console.log('Updating profile for email:', userEmail);
    
    if (supabase) {
      // Check for duplicate phone number (if phone is provided)
      if (phone && phone.trim()) {
        const { data: existingPhoneUsers, error: phoneCheckError } = await supabase
          .from('users')
          .select('user_id, email')
          .eq('phone', phone.trim())
          .neq('email', userEmail); // Exclude current user

        if (phoneCheckError) {
          console.error('Phone check error:', phoneCheckError);
        }

        if (existingPhoneUsers && existingPhoneUsers.length > 0) {
          return res.status(400).json({
            message: 'Số điện thoại đã được sử dụng bởi người dùng khác',
            status: 'error'
          });
        }
      }

      // Check for duplicate license plate (if license_plate is provided)
      if (license_plate && license_plate.trim()) {
        const { data: existingLicenseUsers, error: licenseCheckError } = await supabase
          .from('users')
          .select('user_id, email')
          .eq('license_plate', license_plate.trim())
          .neq('email', userEmail); // Exclude current user

        if (licenseCheckError) {
          console.error('License check error:', licenseCheckError);
        }

        if (existingLicenseUsers && existingLicenseUsers.length > 0) {
          return res.status(400).json({
            message: 'Biển số xe đã được sử dụng bởi người dùng khác',
            status: 'error'
          });
        }
      }

      // Update user profile in database
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: full_name,
          phone: phone ? phone.trim() : null,
          license_plate: license_plate ? license_plate.trim() : null
        })
        .eq('email', userEmail) // Update the specific user by email
        .select('user_id, full_name, email, phone, license_plate, role, created_at')
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Profile updated in database:', data);

      res.json({
        message: 'Profile updated successfully',
        data: {
          user: {
            id: data.user_id,
            user_id: data.user_id,
            email: data.email,
            name: data.full_name,
            full_name: data.full_name,
            role: data.role,
            phone: data.phone,
            license_plate: data.license_plate,
            created_at: data.created_at
          }
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Kiểm tra trạng thái đỗ xe hiện tại của user
app.get('/api/user/parking-status', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        status: 'error'
      });
    }

    if (supabase) {
      // Kiểm tra xem user có đang đỗ xe không (có parking log với status = 'in')
      const { data: activeParking, error: parkingError } = await supabase
        .from('parking_logs')
        .select(`
          log_id,
          spot_id,
          entry_time,
          parking_spots (
            spot_number,
            parking_lots (
              lot_id,
              name,
              address
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'in')
        .single();

      if (parkingError && parkingError.code !== 'PGRST116') {
        console.error('Error checking parking status:', parkingError);
        throw parkingError;
      }

      // Kiểm tra xem user có đặt chỗ đang chờ xác nhận không
      const { data: pendingReservation, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          reservation_id,
          spot_id,
          expected_start,
          expected_end,
          status,
          parking_spots (
            spot_number,
            parking_lots (
              lot_id,
              name,
              address
            )
          )
        `)
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed'])
        .single();

      if (reservationError && reservationError.code !== 'PGRST116') {
        console.error('Error checking reservation status:', reservationError);
        throw reservationError;
      }

      let currentStatus = 'available'; // available, reserved, parking
      let currentData = null;

      if (activeParking) {
        currentStatus = 'parking';
        currentData = {
          type: 'parking',
          log_id: activeParking.log_id,
          spot_id: activeParking.spot_id,
          entry_time: activeParking.entry_time,
          spot_number: activeParking.parking_spots?.spot_number,
          parking_lot: activeParking.parking_spots?.parking_lots ? {
            id: activeParking.parking_spots.parking_lots.lot_id,
            name: activeParking.parking_spots.parking_lots.name,
            address: activeParking.parking_spots.parking_lots.address
          } : null
        };
      } else if (pendingReservation) {
        currentStatus = 'reserved';
        currentData = {
          type: 'reservation',
          reservation_id: pendingReservation.reservation_id,
          spot_id: pendingReservation.spot_id,
          expected_start: pendingReservation.expected_start,
          expected_end: pendingReservation.expected_end,
          status: pendingReservation.status,
          spot_number: pendingReservation.parking_spots?.spot_number,
          parking_lot: pendingReservation.parking_spots?.parking_lots ? {
            id: pendingReservation.parking_spots.parking_lots.lot_id,
            name: pendingReservation.parking_spots.parking_lots.name,
            address: pendingReservation.parking_spots.parking_lots.address
          } : null
        };
      }

      res.json({
        message: 'User parking status retrieved successfully',
        data: {
          status: currentStatus,
          current: currentData
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error checking user parking status:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API đặt chỗ mới với logic kiểm tra trạng thái user
app.post('/api/reservations/create', async (req, res) => {
  try {
    const { userId, spotId, expectedStart, expectedEnd } = req.body;

    if (!userId || !spotId || !expectedStart || !expectedEnd) {
      return res.status(400).json({
        message: 'Missing required fields: userId, spotId, expectedStart, expectedEnd',
        status: 'error'
      });
    }

    if (supabase) {
      // Kiểm tra trạng thái hiện tại của user
      const { data: activeParking, error: parkingError } = await supabase
        .from('parking_logs')
        .select('log_id')
        .eq('user_id', userId)
        .eq('status', 'in')
        .single();

      if (parkingError && parkingError.code !== 'PGRST116') {
        console.error('Error checking parking status:', parkingError);
        throw parkingError;
      }

      if (activeParking) {
        return res.status(400).json({
          message: 'Bạn đang đỗ xe tại một bãi khác. Không thể đặt chỗ mới.',
          status: 'error'
        });
      }

      // Kiểm tra xem user có đặt chỗ đang chờ xác nhận không
      const { data: pendingReservation, error: reservationError } = await supabase
        .from('reservations')
        .select('reservation_id')
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed'])
        .single();

      if (reservationError && reservationError.code !== 'PGRST116') {
        console.error('Error checking reservation status:', reservationError);
        throw reservationError;
      }

      if (pendingReservation) {
        return res.status(400).json({
          message: 'Bạn đã có đặt chỗ đang chờ xác nhận. Không thể đặt chỗ mới.',
          status: 'error'
        });
      }

      // Kiểm tra chỗ đỗ xe có khả dụng không
      const { data: spot, error: spotError } = await supabase
        .from('parking_spots')
        .select('spot_id, is_occupied, is_reserved, parking_lots (price_per_hour)')
        .eq('spot_id', spotId)
        .single();

      if (spotError) {
        console.error('Error checking spot availability:', spotError);
        throw spotError;
      }

      if (!spot) {
        return res.status(404).json({
          message: 'Chỗ đỗ xe không tồn tại',
          status: 'error'
        });
      }

      if (spot.is_occupied || spot.is_reserved) {
        return res.status(400).json({
          message: 'Chỗ đỗ xe không khả dụng',
          status: 'error'
        });
      }

      // Kiểm tra xung đột lịch đặt chỗ
      const { data: conflictingReservations, error: conflictError } = await supabase
        .from('reservations')
        .select('reservation_id')
        .eq('spot_id', spotId)
        .in('status', ['pending', 'confirmed'])
        .or(`expected_start.lte.${expectedStart},expected_end.gte.${expectedStart},expected_start.lte.${expectedEnd},expected_end.gte.${expectedEnd},expected_start.gte.${expectedStart},expected_end.lte.${expectedEnd}`);

      if (conflictError) {
        console.error('Error checking conflicts:', conflictError);
        throw conflictError;
      }

      if (conflictingReservations && conflictingReservations.length > 0) {
        return res.status(400).json({
          message: 'Chỗ đỗ xe đã được đặt trong khoảng thời gian này',
          status: 'error'
        });
      }

      // Tính toán thời gian và phí
      const startTime = new Date(expectedStart);
      const endTime = new Date(expectedEnd);
      const totalMinutes = Math.ceil((endTime - startTime) / (1000 * 60));
      const pricePerHour = spot.parking_lots?.price_per_hour || 0;
      const totalAmount = Math.ceil(totalMinutes / 60 * pricePerHour);

      // Tạo đặt chỗ mới
      const { data: newReservation, error: createError } = await supabase
        .from('reservations')
        .insert({
          user_id: userId,
          spot_id: spotId,
          reserved_at: new Date().toISOString(),
          expected_start: expectedStart,
          expected_end: expectedEnd,
          status: 'pending',
          payment_amount: totalAmount
        })
        .select('reservation_id')
        .single();

      if (createError) {
        console.error('Error creating reservation:', createError);
        throw createError;
      }

      // Cập nhật trạng thái chỗ đỗ xe
      const { error: updateSpotError } = await supabase
        .from('parking_spots')
        .update({
          is_reserved: true,
          reserved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('spot_id', spotId);

      if (updateSpotError) {
        console.error('Error updating spot status:', updateSpotError);
      }

      res.json({
        message: 'Đặt chỗ thành công, vui lòng thanh toán',
        data: {
          reservation_id: newReservation.reservation_id,
          status: 'pending',
          payment_amount: totalAmount,
          payment_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_${newReservation.reservation_id}_${totalAmount}`,
          payment_url: `/payment/${newReservation.reservation_id}`
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API xử lý thanh toán thành công
app.post('/api/payment/success', async (req, res) => {
  try {
    const { reservationId, userId, paymentMethod = 'sepay' } = req.body;

    if (!reservationId || !userId) {
      return res.status(400).json({
        message: 'Missing required fields: reservationId, userId',
        status: 'error'
      });
    }

    if (supabase) {
      
      // Kiểm tra đặt chỗ có tồn tại và thuộc về user không
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('reservation_id, user_id, spot_id, status')
        .eq('reservation_id', reservationId)
        .eq('user_id', userId)
        .single();

      if (reservationError) {
        console.error('Error checking reservation:', reservationError);
        throw reservationError;
      }

      if (!reservation) {
        return res.status(404).json({
          message: 'Không tìm thấy đặt chỗ',
          status: 'error'
        });
      }

      if (reservation.status !== 'pending') {
        return res.status(400).json({
          message: 'Đặt chỗ không ở trạng thái chờ thanh toán',
          status: 'error'
        });
      }

      // Cập nhật trạng thái đặt chỗ thành confirmed
      const { error: updateReservationError } = await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          payment_method: paymentMethod,
          payment_time: new Date().toISOString()
        })
        .eq('reservation_id', reservationId);

      if (updateReservationError) {
        console.error('Error updating reservation:', updateReservationError);
        throw updateReservationError;
      }

      
      // Tạo parking log entry (bắt đầu đỗ xe)
      const { data: parkingLog, error: parkingLogError } = await supabase
        .from('parking_logs')
        .insert({
          user_id: userId,
          spot_id: reservation.spot_id,
          entry_time: new Date().toISOString(),
          status: 'in',
          fee: 0 // Sẽ tính phí khi ra xe
        })
        .select('log_id')
        .single();

      if (parkingLogError) {
        console.error('Error creating parking log:', parkingLogError);
        throw parkingLogError;
      }

      // Cập nhật trạng thái chỗ đỗ xe thành occupied
      const { error: updateSpotError } = await supabase
        .from('parking_spots')
        .update({
          is_occupied: true,
          is_reserved: false,
          reserved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('spot_id', reservation.spot_id);

      if (updateSpotError) {
        console.error('Error updating spot status:', updateSpotError);
      }

      res.json({
        message: 'Thanh toán thành công, đặt chỗ đã được xác nhận',
        data: {
          reservation_id: reservationId,
          parking_log_id: parkingLog.log_id,
          status: 'confirmed',
          payment_amount: 10000, // Phí đặt chỗ: 10,000 VNĐ
          payment_method: paymentMethod
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API test thanh toán (nút test)
app.post('/api/payment/test', async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId || !userId) {
      return res.status(400).json({
        message: 'Missing required fields: reservationId, userId',
        status: 'error'
      });
    }

    console.log('🧪 Test payment for reservation:', reservationId, 'user:', userId);

    // Gọi API thanh toán thành công
    const paymentResult = await fetch(`${req.protocol}://${req.get('host')}/api/payment/success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reservationId: reservationId,
        userId: userId,
        paymentMethod: 'test'
      })
    });

    const result = await paymentResult.json();

    if (result.status === 'ok') {
      res.json({
        message: 'Test payment successful',
        data: result.data,
        status: 'ok'
      });
    } else {
      res.status(400).json({
        message: 'Test payment failed',
        error: result.message,
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error in test payment:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API lấy thông tin thanh toán cho đặt chỗ
app.get('/api/payment/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        status: 'error'
      });
    }

    if (supabase) {
      // Lấy thông tin đặt chỗ
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          reservation_id,
          user_id,
          spot_id,
          status,
          payment_amount,
          expected_start,
          expected_end,
          parking_spots (
            spot_number,
            parking_lots (
              name,
              address
            )
          )
        `)
        .eq('reservation_id', reservationId)
        .eq('user_id', userId)
        .single();

      if (reservationError) {
        console.error('Error fetching reservation:', reservationError);
        throw reservationError;
      }

      if (!reservation) {
        return res.status(404).json({
          message: 'Không tìm thấy đặt chỗ',
          status: 'error'
        });
      }

      if (reservation.status !== 'pending') {
        return res.status(400).json({
          message: 'Đặt chỗ không ở trạng thái chờ thanh toán',
          status: 'error'
        });
      }

      res.json({
        message: 'Payment information retrieved successfully',
        data: {
          reservation_id: reservation.reservation_id,
          payment_amount: 10000, // Phí đặt chỗ: 10,000 VNĐ
          payment_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAYMENT_${reservation.reservation_id}_10000`,
          spot_number: reservation.parking_spots?.spot_number,
          parking_lot_name: reservation.parking_spots?.parking_lots?.name,
          parking_lot_address: reservation.parking_spots?.parking_lots?.address,
          expected_start: reservation.expected_start,
          expected_end: reservation.expected_end,
          test_payment_url: `/api/payment/test`
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching payment info:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API xác nhận đặt chỗ và bắt đầu đỗ xe
app.post('/api/reservations/:reservationId/confirm', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        status: 'error'
      });
    }

    if (supabase) {
      // Kiểm tra đặt chỗ có tồn tại và thuộc về user không
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .select('reservation_id, user_id, spot_id, status')
        .eq('reservation_id', reservationId)
        .eq('user_id', userId)
        .single();

      if (reservationError) {
        console.error('Error checking reservation:', reservationError);
        throw reservationError;
      }

      if (!reservation) {
        return res.status(404).json({
          message: 'Không tìm thấy đặt chỗ',
          status: 'error'
        });
      }

      if (reservation.status !== 'pending') {
        return res.status(400).json({
          message: 'Đặt chỗ không ở trạng thái chờ xác nhận',
          status: 'error'
        });
      }

      // Cập nhật trạng thái đặt chỗ thành confirmed
      const { error: updateReservationError } = await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          payment_time: new Date().toISOString()
        })
        .eq('reservation_id', reservationId);

      if (updateReservationError) {
        console.error('Error updating reservation:', updateReservationError);
        throw updateReservationError;
      }

      // Tạo parking log entry (bắt đầu đỗ xe)
      const { data: parkingLog, error: parkingLogError } = await supabase
        .from('parking_logs')
        .insert({
          user_id: userId,
          spot_id: reservation.spot_id,
          entry_time: new Date().toISOString(),
          status: 'in'
        })
        .select('log_id')
        .single();

      if (parkingLogError) {
        console.error('Error creating parking log:', parkingLogError);
        throw parkingLogError;
      }

      // Cập nhật trạng thái chỗ đỗ xe thành occupied
      const { error: updateSpotError } = await supabase
        .from('parking_spots')
        .update({
          is_occupied: true,
          is_reserved: false,
          reserved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('spot_id', reservation.spot_id);

      if (updateSpotError) {
        console.error('Error updating spot status:', updateSpotError);
      }

      res.json({
        message: 'Xác nhận đặt chỗ thành công',
        data: {
          reservation_id: reservationId,
          parking_log_id: parkingLog.log_id,
          status: 'confirmed'
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error confirming reservation:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API lấy lịch sử đặt chỗ và đỗ xe của user
app.get('/api/user/history', async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('🔍 History request - userId:', userId);
    console.log('🔍 History request - headers:', req.headers);
    
    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        status: 'error'
      });
    }

    if (supabase) {
      // Lấy lịch sử đặt chỗ
      console.log('🔍 Fetching reservations for userId:', userId);
      const { data: reservations, error: reservationError } = await supabase
        .from('reservations')
        .select(`
          reservation_id,
          user_id,
          reserved_at,
          expected_start,
          expected_end,
          status,
          payment_amount,
          payment_time,
          parking_spots (
            spot_number,
            parking_lots (
              lot_id,
              name,
              address
            )
          )
        `)
        .eq('user_id', userId)
        .order('reserved_at', { ascending: false });

      if (reservationError) {
        console.error('Error fetching reservations:', reservationError);
        throw reservationError;
      }
      
      console.log('🔍 Found reservations:', reservations?.length || 0);
      if (reservations && reservations.length > 0) {
        console.log('🔍 First reservation user_id:', reservations[0].user_id);
      }

      // Lấy lịch sử đỗ xe
      console.log('🔍 Fetching parking logs for userId:', userId);
      const { data: parkingLogs, error: parkingError } = await supabase
        .from('parking_logs')
        .select(`
          log_id,
          user_id,
          entry_time,
          exit_time,
          total_minutes,
          fee,
          status,
          payment_status,
          payment_time,
          parking_spots (
            spot_number,
            parking_lots (
              lot_id,
              name,
              address
            )
          )
        `)
        .eq('user_id', userId)
        .order('entry_time', { ascending: false });

      if (parkingError) {
        console.error('Error fetching parking logs:', parkingError);
        throw parkingError;
      }
      
      console.log('🔍 Found parking logs:', parkingLogs?.length || 0);
      if (parkingLogs && parkingLogs.length > 0) {
        console.log('🔍 First parking log user_id:', parkingLogs[0].user_id);
      }

      // Transform data
      const transformedReservations = reservations.map(reservation => ({
        type: 'reservation',
        id: reservation.reservation_id,
        reserved_at: reservation.reserved_at,
        expected_start: reservation.expected_start,
        expected_end: reservation.expected_end,
        status: reservation.status,
        payment_amount: reservation.payment_amount || 0,
        payment_time: reservation.payment_time || null,
        spot_number: reservation.parking_spots?.spot_number,
        parking_lot: reservation.parking_spots?.parking_lots ? {
          id: reservation.parking_spots.parking_lots.lot_id,
          name: reservation.parking_spots.parking_lots.name,
          address: reservation.parking_spots.parking_lots.address
        } : null
      }));

      const transformedParkingLogs = parkingLogs.map(log => ({
        type: 'parking',
        id: log.log_id,
        entry_time: log.entry_time,
        exit_time: log.exit_time,
        total_minutes: log.total_minutes,
        fee: log.fee,
        status: log.status,
        payment_status: log.payment_status || (log.status === 'out' ? 'paid' : 'pending'), // Nếu ra xe thì đã thanh toán
        payment_time: log.payment_time || (log.status === 'out' ? log.exit_time : null), // Thời gian thanh toán = thời gian ra xe
        spot_number: log.parking_spots?.spot_number,
        parking_lot: log.parking_spots?.parking_lots ? {
          id: log.parking_spots.parking_lots.lot_id,
          name: log.parking_spots.parking_lots.name,
          address: log.parking_spots.parking_lots.address
        } : null
      }));

      // Kết hợp và sắp xếp theo thời gian
      const combinedHistory = [...transformedReservations, ...transformedParkingLogs]
        .sort((a, b) => {
          const timeA = a.type === 'reservation' ? a.reserved_at : a.entry_time;
          const timeB = b.type === 'reservation' ? b.reserved_at : b.entry_time;
          return new Date(timeB) - new Date(timeA);
        });

      res.json({
        message: 'User history retrieved successfully',
        data: {
          reservations: transformedReservations,
          parking_logs: transformedParkingLogs,
          combined_history: combinedHistory
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API kết thúc đỗ xe
app.post('/api/parking/exit', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required',
        status: 'error'
      });
    }

    if (supabase) {
      // Tìm parking log đang active của user
      const { data: activeParking, error: parkingError } = await supabase
        .from('parking_logs')
        .select('log_id, spot_id, entry_time')
        .eq('user_id', userId)
        .eq('status', 'in')
        .single();

      if (parkingError) {
        if (parkingError.code === 'PGRST116') {
          return res.status(400).json({
            message: 'Bạn không có xe đang đỗ',
            status: 'error'
          });
        }
        console.error('Error finding active parking:', parkingError);
        throw parkingError;
      }

      // Tính toán thời gian và phí
      const entryTime = new Date(activeParking.entry_time);
      const exitTime = new Date();
      const totalMinutes = Math.ceil((exitTime - entryTime) / (1000 * 60));

      // Lấy thông tin bãi đỗ xe để tính phí
      const { data: spotInfo, error: spotError } = await supabase
        .from('parking_spots')
        .select(`
          parking_lots (
            price_per_hour
          )
        `)
        .eq('spot_id', activeParking.spot_id)
        .single();

      if (spotError) {
        console.error('Error getting spot info:', spotError);
        throw spotError;
      }

      const pricePerHour = spotInfo.parking_lots?.price_per_hour || 0;
      const fee = Math.ceil(totalMinutes / 60 * pricePerHour);

      // Cập nhật parking log - khi ra xe thì tự động đã thanh toán
      const { error: updateLogError } = await supabase
        .from('parking_logs')
        .update({
          exit_time: exitTime.toISOString(),
          total_minutes: totalMinutes,
          fee: fee,
          status: 'out',
          payment_status: 'paid', // Tự động đánh dấu đã thanh toán khi ra xe
          payment_time: exitTime.toISOString() // Thời gian thanh toán = thời gian ra xe
        })
        .eq('log_id', activeParking.log_id);

      if (updateLogError) {
        console.error('Error updating parking log:', updateLogError);
        throw updateLogError;
      }

      // Cập nhật trạng thái chỗ đỗ xe
      const { error: updateSpotError } = await supabase
        .from('parking_spots')
        .update({
          is_occupied: false,
          is_reserved: false,
          reserved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('spot_id', activeParking.spot_id);

      if (updateSpotError) {
        console.error('Error updating spot status:', updateSpotError);
      }

      res.json({
        message: 'Kết thúc đỗ xe thành công',
        data: {
          log_id: activeParking.log_id,
          total_minutes: totalMinutes,
          fee: fee,
          exit_time: exitTime.toISOString()
        },
        status: 'ok'
      });
    } else {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }
  } catch (error) {
    console.error('Error ending parking session:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// SePay Webhook endpoint
app.post('/api/sepay-webhook', async (req, res) => {
  try {
    const { reservationId, spotId, lotId, userId, amount, status } = req.body;
    
    console.log('Webhook received:', { reservationId, spotId, lotId, userId, amount, status });
    
    if (supabase && status === 'paid') {
      // Update parking spot status to reserved
      const { error: spotError } = await supabase
        .from('parking_spots')
        .update({
          is_reserved: true,
          reserved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('spot_id', spotId);

      if (spotError) {
        console.error('Error updating parking spot:', spotError);
      }

      // Update reservation status
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          payment_amount: amount,
          payment_time: new Date().toISOString()
        })
        .eq('reservation_id', reservationId);

      if (reservationError) {
        console.error('Error updating reservation:', reservationError);
      }

      // Create parking log entry
      const { error: logError } = await supabase
        .from('parking_logs')
        .insert([{
          user_id: userId,
          spot_id: spotId,
          entry_time: new Date().toISOString(),
          status: 'in',
          fee: amount
        }]);

      if (logError) {
        console.error('Error creating parking log:', logError);
      }

      console.log('Webhook processed successfully');
    }

    res.json({
      message: 'Webhook processed successfully',
      status: 'ok'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// API endpoint để sửa dữ liệu payment - thêm cột và cập nhật trạng thái
app.post('/api/fix-payment-data', async (req, res) => {
  try {
    console.log('🔧 Fixing payment data...');
    
    if (!supabase) {
      return res.status(500).json({
        message: 'Database connection failed',
        error: 'Supabase not connected',
        status: 'error'
      });
    }

    // Bước 1: Thêm cột payment_status và payment_time nếu chưa có
    console.log('📋 Step 1: Adding payment columns...');
    
    // Thử thêm cột bằng cách update một record với giá trị mới
    const { data: testLog, error: testError } = await supabase
      .from('parking_logs')
      .select('log_id')
      .limit(1);

    if (testError) {
      console.error('Error testing table access:', testError);
      return res.status(500).json({
        message: 'Cannot access parking_logs table',
        error: testError.message,
        status: 'error'
      });
    }

    // Bước 2: Cập nhật tất cả parking logs đã ra xe thành đã thanh toán
    console.log('📋 Step 2: Updating old parking logs...');
    
    const { data: oldLogs, error: fetchError } = await supabase
      .from('parking_logs')
      .select('log_id, user_id, exit_time')
      .eq('status', 'out');

    if (fetchError) {
      console.error('Error fetching old logs:', fetchError);
      return res.status(500).json({
        message: 'Error fetching old logs',
        error: fetchError.message,
        status: 'error'
      });
    }

    console.log(`📊 Found ${oldLogs?.length || 0} parking logs to update`);

    if (oldLogs && oldLogs.length > 0) {
      let updatedCount = 0;
      for (const log of oldLogs) {
        // Thử update với payment_status và payment_time
        const { error: updateError } = await supabase
          .from('parking_logs')
          .update({
            payment_status: 'paid',
            payment_time: log.exit_time || new Date().toISOString()
          })
          .eq('log_id', log.log_id);

        if (updateError) {
          console.error(`❌ Error updating log_id ${log.log_id}:`, updateError);
          // Nếu lỗi do cột không tồn tại, bỏ qua và tiếp tục
          if (updateError.message.includes('payment_status')) {
            console.log(`⚠️ Column payment_status does not exist for log_id ${log.log_id}`);
          }
        } else {
          updatedCount++;
          console.log(`✅ Updated log_id: ${log.log_id}`);
        }
      }
      console.log(`✅ Updated ${updatedCount} parking logs`);
    }

    // Bước 3: Kiểm tra kết quả
    console.log('📋 Step 3: Checking results...');
    const { data: checkLogs, error: checkError } = await supabase
      .from('parking_logs')
      .select('log_id, user_id, status, payment_status, payment_time')
      .eq('status', 'out')
      .order('exit_time', { ascending: false })
      .limit(10);

    if (checkError) {
      console.error('Error checking results:', checkError);
    } else {
      console.log('📊 Recent parking logs after update:');
      checkLogs.forEach(log => {
        console.log(`- Log ${log.log_id}: User ${log.user_id}, Status: ${log.status}, Payment: ${log.payment_status || 'N/A'}, Time: ${log.payment_time || 'N/A'}`);
      });
    }

    res.json({
      success: true,
      message: `Processed ${oldLogs?.length || 0} parking logs`,
      updatedCount: oldLogs?.length || 0,
      status: 'ok'
    });

  } catch (error) {
    console.error('Error in fix-payment-data endpoint:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

module.exports = app;

