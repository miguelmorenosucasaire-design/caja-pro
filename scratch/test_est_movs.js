const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const estudiantes = db.prepare('SELECT id, nombre, dni, codigo FROM estudiantes LIMIT 10').all();
estudiantes.forEach(est => {
  const movs = db.prepare('SELECT fecha, monto, estado, tipo, comprobante FROM movimientos WHERE LOWER(nombre) = LOWER(?)').all(est.nombre);
  console.log(est.nombre, 'movs:', movs.length, movs.map(m => `${m.fecha}: S/${m.monto} (Boleta ${m.comprobante})`));
});
