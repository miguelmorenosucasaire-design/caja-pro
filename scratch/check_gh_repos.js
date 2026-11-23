const https = require('https');

const token = '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';

function ghRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'Antigravity-Agent',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const userRes = await ghRequest('/user');
  console.log('User status:', userRes.status);
  if (userRes.status === 200) {
    console.log('Logged in as:', userRes.data.login, '| Name:', userRes.data.name);
    
    // Check repositories
    const reposRes = await ghRequest('/user/repos?per_page=100&affiliation=owner');
    console.log('Repos count:', reposRes.data.length);
    const repos = reposRes.data.map(r => ({ name: r.name, private: r.private, url: r.clone_url }));
    console.log('Repositories:');
    repos.forEach(r => console.log(`  - ${r.name} (${r.private ? 'private' : 'public'}) -> ${r.url}`));
  } else {
    console.log('Error user:', userRes.data);
  }
}

main().catch(console.error);
