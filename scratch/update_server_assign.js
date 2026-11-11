const fs = require('fs');
let server = fs.readFileSync('server.js', 'utf8');

const oldBlock = `            // Sincronizar movimientos del estudiante si cambió de carrera o grupo
            if (carrera && carrera !== 'Sin Asignar (Pendiente)') {
                db.prepare("UPDATE movimientos SET carrera = ? WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").run(carrera, prevEst.nombre);
            }
            if (grupo && grupo !== 'Sin Asignar') {
                db.prepare("UPDATE movimientos SET grupo = ? WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").run(grupo, prevEst.nombre);
            }`;

const newBlock = `            // Sincronizar movimientos del estudiante ante cualquier asignación o cambio de carrera / grupo
            if (carrera !== undefined) {
                db.prepare("UPDATE movimientos SET carrera = ? WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").run(carrera, prevEst.nombre);
            }
            if (grupo !== undefined) {
                db.prepare("UPDATE movimientos SET grupo = ? WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").run(grupo, prevEst.nombre);
            }`;

if (!server.includes(oldBlock)) {
    throw new Error('No se encontró oldBlock en server.js');
}

server = server.replace(oldBlock, newBlock);
fs.writeFileSync('server.js', server, 'utf8');
console.log('✅ server.js actualizado con soporte total para modificar y revertir carreras!');
