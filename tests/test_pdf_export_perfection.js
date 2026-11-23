const fs = require('fs');
const assert = require('assert');

console.log('========================================================================');
console.log('  🧪 TEST ESPECÍFICO: EXPORTACIÓN PDF SIN DESCUADRE NI PÉRDIDA DE LOGO   ');
console.log('========================================================================\n');

const html = fs.readFileSync('templates/index.html', 'utf8');

let passed = 0;
let total = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    console.log(`  ✔ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
  }
}

// 1. Logos en Base64 integrados en HTML
check('Logo Minedu Oficial en Factura Principal tiene data URI Base64', html.includes('id="img-minedu-oficial" src="data:image/png;base64,'));
check('Logo Minedu Copia en Factura Principal tiene data URI Base64', html.includes('id="img-minedu-copia" src="data:image/png;base64,'));
check('Logo Minedu Oficial en Modal Emisor tiene data URI Base64', html.includes('id="img-modal-minedu-oficial" src="data:image/png;base64,'));
check('Logo Minedu Copia en Modal Emisor tiene data URI Base64', html.includes('id="img-modal-minedu-copia" src="data:image/png;base64,'));

// 2. Erradicación del wrapper defectuoso que causaba desplazamiento a la izquierda
check('Eliminado wrapper ficticio staging-boleta-pdf-wrapper', !html.includes('staging-boleta-pdf-wrapper'));
check('Eliminado parámetro x: 0 que recortaba el margen izquierdo en html2canvas', !html.includes('x: 0,\n                        y: 0,') && !html.includes('x: 0, y: 0'));
check('Eliminado windowWidth restrictivo en html2canvas', !html.includes('windowWidth: 800'));

// 3. Estilos de alta precisión para PDF de 1 hoja carta
check('Clase .generando-pdf-talonario configurada para el talonario modal', html.includes('.generando-pdf-talonario'));
check('Ancho de impresión calibrado a 8.10in para márgenes Letter exactos', html.includes('width: 8.10in !important;'));
check('Cabecera recibo__cab configurada con Grid de 3 columnas para Minedu, Título y Escudo', html.includes('grid-template-columns: 1.50in 1fr 1.20in !important;'));

// 4. Implementación limpia de descargarBoletaModalDirecta
check('descargarBoletaModalDirecta añade clase generando-pdf-talonario al contenedor real', html.includes("cont.classList.add('generando-pdf-talonario')"));
check('descargarBoletaModalDirecta remueve la clase en el bloque finally', html.includes("cont.classList.remove('generando-pdf-talonario')"));
check('html2pdf invocado directamente desde cont (.from(cont))', html.includes('.from(cont)'));

console.log(`\n========================================================================`);
console.log(`  📊 RESULTADO: ${passed} / ${total} PRUEBAS SUPERADAS`);
console.log(`========================================================================\n`);

if (passed !== total) {
  process.exit(1);
}
