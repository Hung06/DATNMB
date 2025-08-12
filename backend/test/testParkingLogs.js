const ParkingLog = require('./models/ParkingLogModel');

async function testParkingLogs() {
  try {
    console.log('Testing ParkingLog model...');
    
    // Test lấy tất cả logs
    console.log('\n1. Testing getAll()...');
    const allLogs = await ParkingLog.getAll();
    console.log(`Found ${allLogs.length} parking logs`);
    if (allLogs.length > 0) {
      console.log('Sample log:', allLogs[0]);
    }
    
    // Test lấy logs theo user
    console.log('\n2. Testing getByUserId()...');
    const userLogs = await ParkingLog.getByUserId(1);
    console.log(`Found ${userLogs.length} logs for user 1`);
    if (userLogs.length > 0) {
      console.log('Sample user log:', userLogs[0]);
    }
    
    // Test lấy logs theo bãi đỗ xe
    console.log('\n3. Testing getByParkingLot()...');
    const lotLogs = await ParkingLog.getByParkingLot(1);
    console.log(`Found ${lotLogs.length} logs for parking lot 1`);
    if (lotLogs.length > 0) {
      console.log('Sample lot log:', lotLogs[0]);
    }
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testParkingLogs();
