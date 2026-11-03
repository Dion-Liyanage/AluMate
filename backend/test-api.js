const http = require('http');

const adminEmail = 'admin@alumate.com';
const adminPassword = 'Admin@123';

function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await post('http://localhost:4000/api/v1/auth/login', {
      email: adminEmail,
      password: adminPassword
    });

    if (!loginRes.data || !loginRes.data.token) {
      console.error('Login failed:', loginRes);
      return;
    }

    const token = loginRes.data.token;
    console.log('Logged in successfully, token received.');

    console.log('Fetching admin orders...');
    const ordersRes = await get('http://localhost:4000/api/v1/admin/orders?limit=10', token);

    console.log('API Response data structure for the first order:');
    if (ordersRes.data && ordersRes.data.length > 0) {
      const order = ordersRes.data.find(o => o.orderId === 'ALU-ORD-2026-6949') || ordersRes.data[0];
      console.log(JSON.stringify(order, null, 2));
    } else {
      console.log('No orders found');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
