const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('Does excel-sheet-tabs-bar exist in HTML body?', html.includes('id="excel-sheet-tabs-bar"'));
console.log('Does top-nav-grupos exist in HTML body?', html.includes('id="top-nav-grupos"'));
console.log('Does top-nav-configuracion exist in HTML body?', html.includes('id="top-nav-configuracion"'));

const asideStart = html.indexOf('<aside');
const asideEnd = html.indexOf('</aside>') + 8;
const asideHTML = html.substring(asideStart, asideEnd);

const requiredItems = [
  'INICIO',
  'RESUMEN ANUAL',
  'SECCIONES / GRUPOS',
  'ESTUDIANTES',
  'CONTROL PAGOS (MES A MES)',
  'DEUDORES',
  'INGRESOS (CAJA)',
  'DIARIO & NOTAS',
  'DOCENTES',
  'FACTURA / BOLETA',
  'BACKUP BD',
  'CONFIGURACIÓN'
];

console.log('\n--- VERIFICACIÓN DE LAS 12 HOJAS DE EXCEL EN LA BARRA LATERAL ---');
let allFound = true;
requiredItems.forEach((item, i) => {
  const found = asideHTML.includes(item);
  console.log(`[${i+1}] ${found ? '✅' : '❌'} ${item}`);
  if (!found) allFound = false;
});

if (allFound) {
  console.log('\n🎉 TODAS LAS 12 HOJAS DE EXCEL ESTÁN EN LA BARRA LATERAL ÚNICA');
} else {
  process.exit(1);
}
