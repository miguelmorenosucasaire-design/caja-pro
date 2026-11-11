const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all occurrences of <main and </main>
console.log('main open indices:', [...html.matchAll(/<main/g)].map(m => m.index));
console.log('main close indices:', [...html.matchAll(/<\/main>/g)].map(m => m.index));

// Check where each section is located relative to <main> and </main>
const mainOpen = html.indexOf('<main');
const mainClose = html.indexOf('</main>');

const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos'];
for (const s of secciones) {
    const idx = html.indexOf(`id="section-${s}"`);
    console.log(`section-${s} index: ${idx} (inside main: ${idx > mainOpen && idx < mainClose})`);
}
