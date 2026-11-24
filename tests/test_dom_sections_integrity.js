const fs = require('fs');

console.log('========================================================================');
console.log('  🧪 TEST ESPECÍFICO: INTEGRIDAD DOM Y ESTRUCTURA DE SECCIONES HTML');
console.log('========================================================================\n');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sections = [
    'section-dashboard',
    'section-resultados',
    'section-caja',
    'section-grupos',
    'section-estudiantes',
    'section-docentes',
    'section-deudores',
    'section-respaldos',
    'section-control-pagos',
    'section-diario',
    'section-factura',
    'section-configuracion'
];

let passed = 0;
let total = 0;

function check(desc, cond) {
    total++;
    if (cond) {
        console.log(`  ✔ [PASS] ${desc}`);
        passed++;
    } else {
        console.log(`  ❌ [FAIL] ${desc}`);
    }
}

// 1. Cada sección existe y tiene apertura/cierre de divs balanceado
for (let i = 0; i < sections.length; i++) {
    const sName = sections[i];
    const idPos = html.indexOf(`id="${sName}"`);
    check(`Sección ${sName} presente`, idPos !== -1);
    
    const sPos = html.lastIndexOf('<div', idPos);
    const nextPos = i < sections.length - 1 ? html.lastIndexOf('<div', html.indexOf(`id="${sections[i+1]}"`)) : html.indexOf('</main>');
    const sHtml = html.substring(sPos, nextPos);
    const o = (sHtml.match(/<div\b/g) || []).length;
    const c = (sHtml.match(/<\/div>/g) || []).length;
    check(`Balance de tags <div> en ${sName} (opens: ${o}, closes: ${c})`, o === c);
}

// 2. Contenedor <main> contiene todas las secciones antes de cerrarse
const mainOpen = html.indexOf('<main');
const mainClose = html.indexOf('</main>');
check('<main> presente y bien delimitado', mainOpen !== -1 && mainClose !== -1 && mainClose > mainOpen);

for (const sName of sections) {
    const sPos = html.indexOf(`id="${sName}"`);
    check(`Sección ${sName} contenida dentro de <main>`, sPos > mainOpen && sPos < mainClose);
}

console.log(`\n========================================================================`);
console.log(`  📊 RESULTADO: ${passed} / ${total} PRUEBAS SUPERADAS`);
console.log(`========================================================================\n`);

if (passed !== total) {
    process.exit(1);
}
