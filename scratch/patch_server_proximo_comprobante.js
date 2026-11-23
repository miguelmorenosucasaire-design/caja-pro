const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// 1. Add /api/movimientos/proximo-comprobante
if (!serverCode.includes('/api/movimientos/proximo-comprobante')) {
    const target = "if (pathname === '/api/movimientos' && method === 'GET') {";
    const endpoint = `if (pathname === '/api/movimientos/proximo-comprobante' && method === 'GET') {
            const rowMax = db.prepare("SELECT MAX(CAST(REPLACE(REPLACE(comprobante, 'N°', ''), ' ', '') AS INTEGER)) as max_nro FROM movimientos WHERE comprobante IS NOT NULL").get();
            const nextNro = ((rowMax && rowMax.max_nro) ? rowMax.max_nro : 810) + 1;
            const proximo = String(nextNro).padStart(7, '0');
            sendJSON(res, {
                proximo_comprobante: proximo,
                siguiente_numero: nextNro,
                total_movimientos: db.prepare("SELECT count(*) as c FROM movimientos").get().c
            });
            return;
        }

        ` + target;

    serverCode = serverCode.replace(target, endpoint);
    console.log('1. /api/movimientos/proximo-comprobante endpoint added to server.js');
}

// 2. In POST /api/movimientos: ensure notas are updated in estudiantes and returned in JSON
const targetEstInsert = `const cod = \`EST-\${new Date().getFullYear()}-\${String(nextNro).padStart(3, '0')}\`;
                    db.prepare("INSERT INTO estudiantes (codigo, nombre, carrera, grupo, dni, turno, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)").run(cod, nombre, carrera, grupo, dni, turno, telefono);`;

const newEstInsert = `const cod = \`EST-\${new Date().getFullYear()}-\${String(nextNro).padStart(3, '0')}\`;
                    db.prepare("INSERT INTO estudiantes (codigo, nombre, carrera, grupo, dni, turno, telefono, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(cod, nombre, carrera, grupo, dni, turno, telefono, notas || '');`;

if (serverCode.includes(targetEstInsert)) {
    serverCode = serverCode.replace(targetEstInsert, newEstInsert);
    console.log('2. New student insert updated to persist notas');
}

const targetExistUpdate = `if (telefono && !exist.telefono) {
                        db.prepare("UPDATE estudiantes SET telefono = ? WHERE id = ?").run(telefono, exist.id);
                    }`;

const newExistUpdate = `if (telefono && !exist.telefono) {
                        db.prepare("UPDATE estudiantes SET telefono = ? WHERE id = ?").run(telefono, exist.id);
                    }
                    if (notas) {
                        db.prepare("UPDATE estudiantes SET notas = ? WHERE id = ?").run(notas, exist.id);
                    }`;

if (serverCode.includes(targetExistUpdate)) {
    serverCode = serverCode.replace(targetExistUpdate, newExistUpdate);
    console.log('3. Existing student update updated to persist notas');
}

const targetSendJSON = `sendJSON(res, { success: true, id: newId, message: "Movimiento registrado con éxito y guardado en Excel" });`;
const newSendJSON = `sendJSON(res, { success: true, id: newId, comprobante: comprobante, fecha: fecha, monto: monto, nombre: nombre, message: "Movimiento registrado con éxito y guardado en Excel" });`;

if (serverCode.includes(targetSendJSON)) {
    serverCode = serverCode.replace(targetSendJSON, newSendJSON);
    console.log('4. POST /api/movimientos response updated with comprobante and details');
}

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('server.js modifications complete!');
