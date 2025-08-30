import fetch from 'node-fetch';

async function testParkingData() {
  try {
    console.log('🔍 Testing Parking Lots API...');
    
    const response = await fetch('https://backend-1igq38tw2-hungs-projects-420012d8.vercel.app/api/parking-lots');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Message:', data.message);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📊 First 3 parking lots:');
      data.data.slice(0, 3).forEach((lot, index) => {
        console.log(`\n${index + 1}. ${lot.name}`);
        console.log(`   Address: ${lot.address}`);
        console.log(`   Total spots: ${lot.totalSpots}`);
        console.log(`   Available spots: ${lot.availableSpots}`);
        console.log(`   Price per hour: ${lot.pricePerHour}`);
        console.log(`   Raw data:`, JSON.stringify(lot, null, 2));
      });
    }
    
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testParkingData();
