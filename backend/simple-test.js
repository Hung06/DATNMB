const https = require('https');

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFixPaymentAPI() {
  try {
    console.log('🧪 Testing fix payment API...');
    
    const result = await makeRequest(
      'https://backend-kuk0oeeeh-hungs-projects-420012d8.vercel.app/api/fix-payment-data',
      'POST'
    );
    
    console.log('📊 Response status:', result.status);
    console.log('📊 Response data:', JSON.stringify(result.data, null, 2));

    if (result.status === 200) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed!');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testFixPaymentAPI();
