const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const m = html.match(/async\s+function\s+cargarGrupos[^{]*\{/);
console.log('Match async:', m);
const m2 = html.match(/function\s+cargarGrupos[^{]*\{/);
console.log('Match non-async:', m2);
if (m || m2) {
    const idx = (m || m2).index;
    console.log(html.substring(idx, idx + 400));
} else {
    console.log('cargarGrupos function definition not found in html');
}
