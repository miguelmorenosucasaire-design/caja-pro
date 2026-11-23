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
    console.log(`\n=== REPO: ${repo} ===`);
    const r = await ghRequest(`/repos/miguelmorenosucasaire-design/${repo}`);
    console.log(`Description: ${r.data.description} | Default Branch: ${r.data.default_branch} | Updated: ${r.data.updated_at}`);
    const commits = await ghRequest(`/repos/miguelmorenosucasaire-design/${repo}/commits?per_page=3`);
    if (commits.status === 200 && Array.isArray(commits.data)) {
      console.log('Latest commits:');
      commits.data.forEach(c => console.log(`  - ${c.sha.substring(0, 7)}: ${c.commit.message.split('\n')[0]} (${c.commit.author.date})`));
    }
  }
}

main().catch(console.error);
