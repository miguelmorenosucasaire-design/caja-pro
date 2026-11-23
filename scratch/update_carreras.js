const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Ensure Mantenimiento de Sistemas Eléctricos exists
const hasElec = db.prepare("SELECT id FROM carreras WHERE nombre = 'Mantenimiento de Sistemas Eléctricos'").get();
if (!hasElec) {
    db.prepare("INSERT INTO carreras (nombre, codigo, descripcion) VALUES (?, ?, ?)").run('Mantenimiento de Sistemas Eléctricos', 'ESP-07', 'Programa de Estudios Mantenimiento de Sistemas Eléctricos');
}

// Fix typo Vehículo -> Vehículos
db.prepare("UPDATE carreras SET nombre = 'Mecánica de Motos y Vehículos Afines' WHERE nombre = 'Mecánica de Motos y Vehículo Afines'").run();

console.table(db.prepare('SELECT id, nombre, codigo FROM carreras').all());
