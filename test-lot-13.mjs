import fetch from 'node-fetch';

async function testLot13() {
  try {
    console.log('🔍 Testing Parking Lot ID 13...\n');
    
    // Test 1: Get parking lot details
    console.log('1. 📋 Parking Lot Details:');
    const lotResponse = await fetch('https://backend-1igq38tw2-hungs-projects-420012d8.vercel.app/api/parking-lots/13');
    const lotData = await lotResponse.json();
    
    console.log('   Status:', lotResponse.status);
    console.log('   Message:', lotData.message);
    
    if (lotData.data) {
      console.log('   Lot Name:', lotData.data.name);
      console.log('   Total Spots:', lotData.data.totalSpots);
      console.log('   Available Spots:', lotData.data.availableSpots);
      console.log('   Raw Data:', JSON.stringify(lotData.data, null, 2));
    }
    
    // Test 2: Get parking spots for this lot
    console.log('\n2. 🚗 Parking Spots for Lot 13:');
    const spotsResponse = await fetch('https://backend-1igq38tw2-hungs-projects-420012d8.vercel.app/api/parking-lots/13/spots');
    const spotsData = await spotsResponse.json();
    
    console.log('   Status:', spotsResponse.status);
    console.log('   Message:', spotsData.message);
    console.log('   Total Spots Count:', spotsData.data?.length || 0);
    
    if (spotsData.data && spotsData.data.length > 0) {
      let occupiedCount = 0;
      let reservedCount = 0;
      let availableCount = 0;
      
      spotsData.data.forEach((spot, index) => {
        if (spot.is_occupied) occupiedCount++;
        if (spot.is_reserved) reservedCount++;
        if (!spot.is_occupied && !spot.is_reserved) availableCount++;
        
        if (index < 5) { // Show first 5 spots
          console.log(`   Spot ${index + 1}: ID=${spot.spot_id}, Occupied=${spot.is_occupied}, Reserved=${spot.is_reserved}`);
        }
      });
      
      console.log('\n   📊 Summary:');
      console.log(`   - Total Spots: ${spotsData.data.length}`);
      console.log(`   - Occupied: ${occupiedCount}`);
      console.log(`   - Reserved: ${reservedCount}`);
      console.log(`   - Available: ${availableCount}`);
      console.log(`   - Calculated Available: ${spotsData.data.length - occupiedCount - reservedCount}`);
    }
    
    // Test 3: Get all parking lots to see lot 13 in context
    console.log('\n3. 🌐 All Parking Lots (to see lot 13 in context):');
    const allLotsResponse = await fetch('https://backend-1igq38tw2-hungs-projects-420012d8.vercel.app/api/parking-lots');
    const allLotsData = await allLotsResponse.json();
    
    if (allLotsData.data) {
      const lot13 = allLotsData.data.find(lot => lot.id === 13);
      if (lot13) {
        console.log('   Lot 13 in all lots:');
        console.log('   - Name:', lot13.name);
        console.log('   - Total Spots:', lot13.totalSpots);
        console.log('   - Available Spots:', lot13.availableSpots);
        console.log('   - Raw Data:', JSON.stringify(lot13, null, 2));
      } else {
        console.log('   ❌ Lot 13 not found in all lots response');
      }
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLot13();
