const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Target string inside grupos handling
const targetGrupos = `            try {
                const stmt = db.prepare(\`
                    INSERT INTO grupos (nombre, carrera, encargado, turno, horario, aula_taller, descripcion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                \`);
                const info = stmt.run(nombre, carrera, encargado, turno, horario, aula, desc);
                sendJSON(res, { success: true, id: Number(info.lastInsertRowid), message: "Grupo y encargado registrados exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al registrar grupo: " + err.message }, 500);
            }
            return;
        }`;

const newGruposEditCode = `            try {
                const stmt = db.prepare(\`
                    INSERT INTO grupos (nombre, carrera, encargado, turno, horario, aula_taller, descripcion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                \`);
                const info = stmt.run(nombre, carrera, encargado, turno, horario, aula, desc);
                sendJSON(res, { success: true, id: Number(info.lastInsertRowid), message: "Grupo y encargado registrados exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al registrar grupo: " + err.message }, 500);
            }
            return;
        }

        // Modificar Sección / Grupo y su Turno
        if (((pathname.match(/^\\/api\\/grupos\\/(\\d+)$/) && (method === 'PUT' || method === 'POST')) ||
             (pathname.match(/^\\/api\\/grupos\\/(\\d+)\\/editar$/) && method === 'POST'))) {
            const grupoId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || '').trim();
            const encargado = (data.encargado || '').trim();
            const turno = (data.turno || 'Mañana').trim();
            const horario = (data.horario || '').trim();
            const aula = (data.aula_taller || '').trim();
            const desc = (data.descripcion || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del grupo o sección es obligatorio" }, 400);
                return;
            }

            try {
                const oldGrupo = db.prepare("SELECT * FROM grupos WHERE id = ?").get(grupoId);
                if (!oldGrupo) {
                    sendJSON(res, { error: "Sección no encontrada" }, 404);
                    return;
                }

                db.prepare(\`
                    UPDATE grupos 
                    SET nombre = ?, carrera = ?, encargado = ?, turno = ?, horario = ?, aula_taller = ?, descripcion = ?
                    WHERE id = ?
                \`).run(nombre, carrera, encargado, turno, horario, aula, desc, grupoId);

                // Si cambió el nombre del grupo, mantener la integridad en estudiantes y movimientos
                if (oldGrupo.nombre !== nombre) {
                    db.prepare("UPDATE estudiantes SET grupo = ? WHERE grupo = ?").run(nombre, oldGrupo.nombre);
                    db.prepare("UPDATE movimientos SET grupo = ? WHERE grupo = ?").run(nombre, oldGrupo.nombre);
                }

                // Si cambió el encargado, actualizar en los movimientos de ese grupo
                if (encargado && oldGrupo.encargado !== encargado) {
                    db.prepare("UPDATE movimientos SET encargado = ? WHERE grupo = ?").run(encargado, nombre);
                }

                sendJSON(res, { success: true, message: "Sección y turno actualizados exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al actualizar sección: " + err.message }, 500);
            }
            return;
        }`;

// Target string for docentes
const targetDocentes = `            sendJSON(res, docentes);
            return;
        }`;

const newDocentesEditCode = `            sendJSON(res, docentes);
            return;
        }

        // Modificar Docente (Nombre, Especialidad, Turno/Carrera, Teléfono)
        if (((pathname.match(/^\\/api\\/docentes\\/(\\d+)$/) && (method === 'PUT' || method === 'POST')) ||
             (pathname.match(/^\\/api\\/docentes\\/(\\d+)\\/editar$/) && method === 'POST'))) {
            const docId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || '').trim();
            const especialidad = (data.especialidad || '').trim();
            const telefono = (data.telefono || '').trim();
            const email = (data.email || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del docente es obligatorio" }, 400);
                return;
            }

            try {
                const oldDoc = db.prepare("SELECT * FROM docentes WHERE id = ?").get(docId);
                if (!oldDoc) {
                    sendJSON(res, { error: "Docente no encontrado" }, 404);
                    return;
                }

                db.prepare(\`
                    UPDATE docentes 
                    SET nombre = ?, carrera = ?, especialidad = ?, telefono = ?, email = ?
                    WHERE id = ?
                \`).run(nombre, carrera, especialidad, telefono, email, docId);

                // Si cambió el nombre del docente, actualizar en grupos asignados
                if (oldDoc.nombre !== nombre) {
                    db.prepare("UPDATE grupos SET encargado = ? WHERE encargado = ?").run(nombre, oldDoc.nombre);
                    db.prepare("UPDATE movimientos SET encargado = ? WHERE encargado = ?").run(nombre, oldDoc.nombre);
                }

                sendJSON(res, { success: true, message: "Docente actualizado exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al actualizar docente: " + err.message }, 500);
            }
            return;
        }

        // Crear Nuevo Docente
        if (pathname === '/api/docentes' && method === 'POST') {
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || '').trim();
            const especialidad = (data.especialidad || '').trim();
            const telefono = (data.telefono || '').trim();
            const email = (data.email || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del docente es obligatorio" }, 400);
                return;
            }

            try {
                const info = db.prepare(\`
                    INSERT INTO docentes (nombre, carrera, especialidad, telefono, email, tipo_contrato)
                    VALUES (?, ?, ?, ?, ?, 'Tiempo Completo')
                \`).run(nombre, carrera, especialidad, telefono, email);
                sendJSON(res, { success: true, id: Number(info.lastInsertRowid), message: "Docente creado exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al registrar docente: " + err.message }, 500);
            }
            return;
        }`;

if (serverCode.includes(targetGrupos)) {
    serverCode = serverCode.replace(targetGrupos, newGruposEditCode);
    console.log('[+] Endpoint para modificar grupos y turnos agregado a server.js');
}

if (serverCode.includes(targetDocentes)) {
    serverCode = serverCode.replace(targetDocentes, newDocentesEditCode);
    console.log('[+] Endpoint para modificar docentes agregado a server.js');
}

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('[OK] server.js guardado exitosamente.');
