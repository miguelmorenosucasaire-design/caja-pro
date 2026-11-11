const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

function inspectFunc(name) {
    const idx = html.indexOf(`async function ${name}`);
    if (idx === -1) {
        console.log(`Function ${name} not found`);
        return;
    }
    console.log(`\n=== FUNCTION ${name} ===`);
    console.log(html.substring(idx, idx + 1200));
}

inspectFunc('cargarGrupos');
inspectFunc('cargarMovimientos');
inspectFunc('cargarEstudiantes');
inspectFunc('cargarDocentes');
inspectFunc('cargarDeudores');
inspectFunc('cargarRespaldos');
