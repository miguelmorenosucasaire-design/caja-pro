const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const sections = ['dashboard', 'resultados', 'grupos', 'estudiantes', 'control-pagos', 'deudores', 'caja', 'diario', 'docentes', 'factura', 'respaldos', 'configuracion', 'carreras'];

sections.forEach(sec => {
    const secId = `id="section-${sec}"`;
    const idx = s.indexOf(secId);
    if (idx !== -1) {
        const snippet = s.slice(idx, idx + 1000);
        const iconMatches = snippet.match(/<i class=\"([^\"]+)\"/g) || [];
        console.log(`Section [${sec}]:`);
        iconMatches.slice(0, 4).forEach(im => console.log('   ', im));
    }
});
