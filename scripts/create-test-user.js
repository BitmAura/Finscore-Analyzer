const http = require('http');

function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const { hostname, port, pathname, protocol } = new URL(url);
    const payload = Buffer.from(JSON.stringify(data));
    const opts = {
      hostname,
      port: port || (protocol === 'https:' ? 443 : 80),
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
    };
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  const email = process.env.TEST_EMAIL || 'pradeepsandhya4@gmail.com';
  const password = process.env.TEST_PASSWORD || '0987654321';
  const url = process.env.CREATE_URL || 'http://localhost:3000/api/test/create-user';
  try {
    const res = await postJSON(url, { email, password });
    console.log('Create user response:', res);
    process.exit(res.status === 200 || res.status === 201 ? 0 : 1);
  } catch (e) {
    console.error('Create user failed:', e);
    process.exit(1);
  }
})();
