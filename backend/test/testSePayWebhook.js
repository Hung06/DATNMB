const https = require('https');
const http = require('http');

// Simple fetch implementation
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test webhook SePay
async function testSePayWebhook() {
  const webhookUrl = 'http://localhost:5000/api/sepay/webhook';
  
  // Dữ liệu mẫu từ SePay
  const mockSePayData = {
    transaction_id: 'TXN_' + Date.now(),
    amount: 10000,
    description: 'USER_1_SPOT_1_LOT_1', // Format: USER_{userId}_SPOT_{spotId}_LOT_{lotId}
    status: 'success',
    bank_code: 'MBBank',
    account_number: 'VQRQADSHI0914',
    transaction_time: new Date().toISOString(),
    reference_id: 'REF_' + Date.now()
  };

  console.log('🧪 Testing SePay webhook...');
  console.log('Webhook URL:', webhookUrl);
  console.log('Test data:', mockSePayData);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sepay-signature': 'test-signature' // Trong thực tế sẽ là signature thật từ SePay
      },
      body: JSON.stringify(mockSePayData)
    });

    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', result);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

// Test API check payment status
async function testCheckPaymentStatus() {
  const transactionId = 'TXN_' + Date.now();
  const checkUrl = `http://localhost:5000/api/sepay/check-payment/${transactionId}`;

  console.log('\n🧪 Testing check payment status...');
  console.log('Check URL:', checkUrl);

  try {
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', result);

  } catch (error) {
    console.error('❌ Error checking payment status:', error.message);
  }
}

// Chạy tests
async function runTests() {
  console.log('🚀 Starting SePay integration tests...\n');
  
  await testSePayWebhook();
  await testCheckPaymentStatus();
  
  console.log('\n🏁 Tests completed!');
}

// Chạy nếu file được gọi trực tiếp
if (require.main === module) {
  runTests();
}

module.exports = { testSePayWebhook, testCheckPaymentStatus };
