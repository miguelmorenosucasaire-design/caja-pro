const fs = require('node:fs');
const html = fs.readFileSync('templates/index.html', 'utf-8');

console.log('--- VALIDANDO SCRIPTS DE INDEX.HTML ---');
const scriptMatches = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
console.log(`Encontradas ${scriptMatches.length} etiquetas <script>`);

let idx = 0;
for (const match of scriptMatches) {
    idx++;
    const attrs = match[1];
    const code = match[2];
    if (attrs.includes('src=')) {
        console.log(`Script ${idx} (externo): ${attrs}`);
        continue;
    }
    if (!code.trim()) continue;
    try {
        new Function(code);
        console.log(`Script ${idx} (inline, ${code.length} chars): Sintaxis OK`);
    } catch (err) {
        console.error(`Script ${idx}: ERROR DE SINTAXIS:`, err.message);
    }
}
