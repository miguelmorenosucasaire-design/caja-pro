const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const s1 = html.indexOf('id="contenedor-comprobante-oficial"');
const e1 = html.indexOf('id="separador-corte-talonario"');
const v1 = html.substring(s1, e1);

const s2 = html.indexOf('id="contenedor-comprobante-copia"');
const e2 = html.indexOf('id="contenedor-previsualizador-pdf"');
const v2 = html.substring(s2, e2);

// Normalize IDs and onclicks and classes
const norm = (s) => s.replace(/id="[^"]*"/g, '').replace(/onclick="[^"]*"/g, '').replace(/class="[^"]*"/g, '').replace(/\s+/g, ' ');

const normV1 = norm(v1);
const normV2 = norm(v2);

console.log('Normalized V1 length:', normV1.length);
console.log('Normalized V2 length:', normV2.length);
console.log('Are they identical structures without IDs/onclicks/classes?', normV1 === normV2);

if (normV1 !== normV2) {
  for (let i = 0; i < Math.min(normV1.length, normV2.length); i++) {
    if (normV1[i] !== normV2[i]) {
      console.log('Diff at index', i);
      console.log('V1:', normV1.substring(i - 40, i + 60));
      console.log('V2:', normV2.substring(i - 40, i + 60));
      break;
    }
  }
}
