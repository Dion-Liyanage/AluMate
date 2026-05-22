const http = require('http');

http.get('http://localhost:3000/dashboard/catalogue', (res) => {
  console.log('Frontend Status Code:', res.statusCode);
  res.resume();
}).on('error', (err) => {
  console.error('Error connecting to frontend:', err.message);
});
