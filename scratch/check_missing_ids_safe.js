const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const missingIds = [
  'pdf-preview-actions-bar',
  'diario-metodo-efectivo',
  'diario-metodo-yape',
  'diario-metodo-transf',
  'mini-historial-recibos-lista',
  'form-rol-persona',
  'form-docente',
  'label-ano-resultados',
  'tabla-resultados-dashboard',
  'totales-resultados-dashboard',
  'dashboard-grid-grupos',
  'contenedor-tabs-secciones-dinamicas',
  'chk-modal-constancia',
  'chk-modal-fut',
  'chk-modal-otros'
];

for (const id of missingIds) {
  let idx = 0;
  while ((idx = html.indexOf(id, idx)) !== -1) {
    const start = Math.max(0, idx - 40);
    const end = Math.min(html.length, idx + 100);
    const snippet = html.substring(start, end).replace(/\r?\n/g, ' ');
    console.log(`[${id}]: ...${snippet}...`);
    idx += id.length;
  }
}
