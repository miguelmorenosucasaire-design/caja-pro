const https = require('https');
const { execSync } = require('child_process');

// Get credential from git credential fill
const credOutput = execSync('cmd /c "echo url=https://github.com | git credential fill"', { encoding: 'utf8' });
const lines = credOutput.split('\n');
let token = '';
let user = '';
for (const line of lines) {
  if (line.startsWith('username=')) user = line.split('=')[1].trim();
  if (line.startsWith('password=')) token = line.split('=')[1].trim();
}

console.log('Detected user:', user);

const options = {
  hostname: 'api.github.com',
  path: '/user',
  method: 'GET',
  headers: {
    'User-Agent': 'Antigravity-Agent',
    'Authorization': `token ${token}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('GitHub API /user status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Authenticated as:', json.login, '| Name:', json.name);
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
