// =====================================================================
// EDUCAJA PRO - AUDITORÍA DE NAVEGACIÓN Y SECCIONES
// =====================================================================
const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const secciones = [
    'dashboard', 'resultados', 'grupos', 'estudiantes', 
    'control-pagos', 'deudores', 'caja', 'diario', 
    'docentes', 'factura', 'respaldos', 'configuracion', 'carreras'
];

console.log('--- AUDITORÍA DE SECCIONES Y ENLACES DE NAVEGACIÓN ---');

let allGood = true;
secciones.forEach(s => {
    const secId = `section-${s}`;
    const navId = `nav-${s}`;

    const hasSec = html.includes(`id="${secId}"`);
    const hasNav = html.includes(`id="${navId}"`);

    if (hasSec && hasNav) {
        console.log(`✔ [OK] Módulo "${s}": #${secId} presente y #${navId} en barra lateral.`);
    } else {
        console.error(`❌ [FALLO] Módulo "${s}": section=${hasSec}, nav=${hasNav}`);
        allGood = false;
    }
});

if (allGood) {
    console.log('--- TODAS LAS 13 SECCIONES ESTÁN 100% VINCULADAS Y ACCESIBLES ---');
    process.exit(0);
} else {
    process.exit(1);
}
