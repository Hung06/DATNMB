import fetch from 'node-fetch';

async function testFixPaymentAPI() {
  try {
    console.log('🧪 Testing fix payment API...');
    
    const response = await fetch('https://backend-kuk0oeeeh-hungs-projects-420012d8.vercel.app/api/fix-payment-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed!');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testFixPaymentAPI();
