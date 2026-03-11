const https = require('https');

function testKey(key) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });

    req.on('error', (e) => resolve({ error: e }));
    req.end();
  });
}

(async () => {
  const resultFake = await testKey('sk_test_123FaketestKey123123123');
  console.log('Fake Key Result:', resultFake.status, resultFake.data);

  const resultReal = await testKey('sk_test_UdlaSYqQo3MrRr9P12ByER3PqVgglI5Us6xYw10HEG');
  console.log('User Key Result:', resultReal.status, resultReal.data);
})();
