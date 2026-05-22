const http = require('http');

http.get('http://localhost:3000/login', (res) => {
  console.log('Login Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('HTML Length:', data.length);
    console.log('First 200 chars:', data.slice(0, 200));
  });
}).on('error', (err) => {
  console.error('Error connecting to frontend:', err.message);
});
