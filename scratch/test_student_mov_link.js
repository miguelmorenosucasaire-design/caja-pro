const Database = require('better-sqlite3');
const db = new Database('database.db');

const students = db.prepare('SELECT id, codigo, nombre, dni, carrera, telefono, turno FROM estudiantes LIMIT 10').all();

console.log('Testing student to movement linking:');
students.forEach(st => {
  // Method 1: by estudiante_id
  let mov = db.prepare('SELECT id, nro_comprobante, monto, concepto, notas, fecha FROM movimientos WHERE estudiante_id = ?').get(st.id);
  // Method 2: by dni
  if (!mov && st.dni) {
    mov = db.prepare('SELECT id, nro_comprobante, monto, concepto, notas, fecha FROM movimientos WHERE dni = ?').get(st.dni);
  }
  // Method 3: by nombre
  if (!mov && st.nombre) {
    mov = db.prepare('SELECT id, nro_comprobante, monto, concepto, notas, fecha FROM movimientos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))').get(st.nombre);
  }

  console.log(`Student ${st.id} (${st.nombre}):`, mov ? `Found Mov ${mov.id} - Comp: ${mov.nro_comprobante} - S/. ${mov.monto} - ${mov.concepto}` : 'NO MOV');
});
