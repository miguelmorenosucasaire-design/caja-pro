const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="section-dashboard"');
const nextSec = html.indexOf('id="section-resultados"');

console.log('section-dashboard length:', nextSec - start);

// Let's count open vs close divs inside section-dashboard
const dashHtml = html.substring(start, nextSec);
const openDivs = (dashHtml.match(/<div\b/g) || []).length;
const closeDivs = (dashHtml.match(/<\/div>/g) || []).length;

console.log('open <div> in dashboard:', openDivs);
console.log('close </div> in dashboard:', closeDivs);

// Let's do this for all sections
const sections = [
  'section-dashboard',
  'section-resultados',
  'section-caja',
  'section-grupos',
  'section-estudiantes',
  'section-docentes',
  'section-deudores',
  'section-carreras',
  'section-respaldos',
  'section-control-pagos',
  'section-diario',
  'section-factura',
  'section-configuracion'
];

for (let i = 0; i < sections.length; i++) {
  const sName = sections[i];
  const sPos = html.indexOf(`id="${sName}"`);
  const ePos = i < sections.length - 1 ? html.indexOf(`id="${sections[i+1]}"`) : html.indexOf('</main>');
  const sHtml = html.substring(sPos, ePos);
  const o = (sHtml.match(/<div\b/g) || []).length;
  const c = (sHtml.match(/<\/div>/g) || []).length;
  console.log(`${sName}: opens=${o}, closes=${c}, diff=${o - c}`);
}
