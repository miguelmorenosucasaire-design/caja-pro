const https = require('https');

const token = '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';

https.get({
  hostname: 'api.github.com',
  path: '/repos/miguelmorenosucasaire-design/caja-pro/contents/README.md',
  headers: {
    'User-Agent': 'Antigravity-Agent',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const json = JSON.parse(d);
    if (json.content) {
      console.log(Buffer.from(json.content, 'base64').toString('utf8'));
    } else {
      console.log(json);
    }
  });
});
