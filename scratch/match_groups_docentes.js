const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const students = db.prepare(`SELECT carrera, turno, count(*) as count FROM estudiantes GROUP BY carrera, turno ORDER BY carrera, turno`).all();
const docentes = db.prepare(`SELECT nombre, carrera, turno FROM docentes`).all();

console.log('Students breakdown:');
students.forEach(s => {
    const matchingDocente = docentes.find(d => 
        d.carrera.toLowerCase().includes(s.carrera.toLowerCase()) || 
        s.carrera.toLowerCase().includes(d.carrera.toLowerCase())
    );
    console.log(`Carrera: "${s.carrera}" | Turno: "${s.turno}" | Count: ${s.count} | Docente Sugerido: ${matchingDocente ? matchingDocente.nombre : 'Por Asignar'}`);
});
