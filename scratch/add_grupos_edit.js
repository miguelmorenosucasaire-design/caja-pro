const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const targetStr = `            } catch (err) {
                sendJSON(res, { error: "Ya existe un grupo con este nombre o hubo un error al guardar" }, 400);
            }
            return;
        }`;

const editCode = `            } catch (err) {
                sendJSON(res, { error: "Ya existe un grupo con este nombre o hubo un error al guardar" }, 400);
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

if (serverCode.includes(targetStr)) {
    serverCode = serverCode.replace(targetStr, editCode);
    fs.writeFileSync('server.js', serverCode, 'utf8');
    console.log('[+] Endpoint para modificar grupos y turnos agregado correctamente a server.js');
} else {
    console.log('[-] targetStr no encontrado en server.js');
}
