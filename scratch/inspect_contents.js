const https = require('https');

const token = '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';

function ghRequest(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'Antigravity-Agent',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d ? JSON.parse(d) : null }));
    }).on('error', reject);
  });
}

async function main() {
  for (const repo of ['caja-pro', 'REGISTRO-DE-CAJA-OFICIAL']) {
    console.log(`\n=== CONTENTS: ${repo} ===`);
    const r = await ghRequest(`/repos/miguelmorenosucasaire-design/${repo}/contents`);
    if (r.status === 200 && Array.isArray(r.data)) {
      r.data.forEach(item => console.log(`  - ${item.name} (${item.type})`));
    } else {
      console.log('Error/Empty:', r.data);
    }
  }
}

main().catch(console.error);
