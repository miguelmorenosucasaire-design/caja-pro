const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m;
let count = 0;
let errors = 0;

while ((m = scriptRegex.exec(html)) !== null) {
  count++;
  const code = m[1];
  if (!code.trim()) continue;
  try {
    new Function(code);
    console.log(`Script #${count} [OK] - Length: ${code.length} chars`);
  } catch (e) {
    errors++;
    console.error(`Script #${count} [ERROR]: ${e.message}`);
    fs.writeFileSync(`scratch/err_script_${count}.js`, code, 'utf8');
  }
}

console.log(`\nResumen: ${count} scripts analizados, ${errors} errores encontrados.`);
if (errors > 0) process.exit(1);
