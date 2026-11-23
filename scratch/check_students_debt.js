const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const ests = db.prepare('SELECT id, nombre, carrera, ciclo FROM estudiantes').all();
console.log('Total estudiantes:', ests.length);

// See how many students have paid less than tuition or expected modules
let debiendo = 0;
ests.forEach(e => {
  const pagado = db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE LOWER(nombre) = LOWER(?) AND estado = 'Pagado' AND tipo = 'Ingreso'").get(e.nombre).total;
  const costoTotal = 300; // Asumido o por especialidad
  if (pagado < costoTotal) {
    debiendo++;
  }
});
console.log('Estudiantes con pago menor a 300:', debiendo);
