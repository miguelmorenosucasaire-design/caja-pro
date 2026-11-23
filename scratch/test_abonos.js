const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const est = db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE ?").get('%Ada Merced%');
const abonosDirectos = db.prepare("SELECT a.id, a.fecha, a.monto, a.metodo_pago, a.comprobante, a.notas, m.concepto as concepto_original, a.movimiento_id FROM abonos a JOIN movimientos m ON a.movimiento_id = m.id WHERE LOWER(m.nombre) = LOWER(?) ORDER BY a.fecha DESC").all(est.nombre);
const pagosCompletos = db.prepare("SELECT id as movimiento_id, id, fecha, monto, metodo_pago, comprobante, notas, concepto as concepto_original FROM movimientos WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante' AND estado = 'Pagado' AND tipo = 'Ingreso' ORDER BY fecha DESC, id DESC").all(est.nombre);
const abonos = [...abonosDirectos];
for (const p of pagosCompletos) {
    if (!abonos.some(a => a.movimiento_id == p.movimiento_id && a.comprobante == p.comprobante)) {
        abonos.push(p);
    }
}
abonos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
console.log('Abonos resultado para Ada Merced:', abonos);
