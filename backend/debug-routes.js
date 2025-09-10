// Debug script to check routes loading
console.log('🔍 Debugging routes loading...');

try {
  console.log('1. Loading express...');
  const express = require('express');
  console.log('✅ Express loaded');
  
  console.log('2. Loading licensePlateRoutes...');
  const licensePlateRoutes = require('./routes/licensePlateRoutes');
  console.log('✅ License Plate Routes loaded');
  
  console.log('3. Loading LicensePlateController...');
  const LicensePlateController = require('./controllers/LicensePlateController');
  console.log('✅ License Plate Controller loaded');
  
  console.log('4. Checking routes structure...');
  console.log('Routes:', licensePlateRoutes);
  console.log('Controller methods:', Object.getOwnPropertyNames(LicensePlateController));
  
  console.log('5. Testing route registration...');
  const app = express();
  app.use('/api/license-plate', licensePlateRoutes);
  console.log('✅ Routes registered successfully');
  
  console.log('6. Testing basic server...');
  app.get('/test', (req, res) => {
    res.json({ message: 'Debug test working' });
  });
  
  const PORT = 5002;
  app.listen(PORT, () => {
    console.log(`✅ Debug server running on port ${PORT}`);
    console.log(`Test: http://localhost:${PORT}/test`);
    console.log(`License Plate: http://localhost:${PORT}/api/license-plate/system-status`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
