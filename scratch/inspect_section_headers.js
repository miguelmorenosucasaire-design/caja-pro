const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const secs = ['section-dashboard', 'section-resultados', 'section-estudiantes', 'section-caja', 'section-factura', 'section-carreras', 'section-configuracion', 'section-grupos'];
secs.forEach(s => {
    const idx = html.indexOf(`id="${s}"`);
    if (idx !== -1) {
        console.log(`=== ${s} ===`);
        console.log(html.substring(idx, idx + 450));
    }
});
