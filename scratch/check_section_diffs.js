const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const secciones = [
    'dashboard',
    'resultados',
    'caja',
    'grupos',
    'estudiantes',
    'docentes',
    'deudores',
    'carreras',
    'respaldos'
];

secciones.forEach((s, idx) => {
    const sStart = html.indexOf(`id="section-${s}"`);
    let sEnd = -1;
    if (idx < secciones.length - 1) {
        sEnd = html.indexOf(`id="section-${secciones[idx + 1]}"`);
    } else {
        sEnd = html.indexOf('</main>');
    }

    const chunk = html.substring(sStart, sEnd);
    const opens = (chunk.match(/<div(?:\s[^>]*)?>/g) || []).length;
    const closes = (chunk.match(/<\/div>/g) || []).length;
    console.log(`section-${s}: opens=${opens}, closes=${closes}, diff=${opens - closes}`);
});
