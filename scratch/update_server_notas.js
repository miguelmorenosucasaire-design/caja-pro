const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

// 1. Target around line 1300 (DELETE movimientos)
const targetMov = `        if (pathname.startsWith('/api/movimientos/') && method === 'DELETE') {
            const movId = parseInt(pathname.split('/')[3], 10);
            db.prepare("DELETE FROM movimientos WHERE id = ?").run(movId);
            db.prepare("DELETE FROM abonos WHERE movimiento_id = ?").run(movId);
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Movimiento eliminado y Excel actualizado" });
            return;
        }`;

const replacementMov = `        if (pathname.startsWith('/api/movimientos/') && method === 'DELETE') {
            const movId = parseInt(pathname.split('/')[3], 10);
            db.prepare("DELETE FROM movimientos WHERE id = ?").run(movId);
            db.prepare("DELETE FROM abonos WHERE movimiento_id = ?").run(movId);
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Movimiento eliminado y Excel actualizado" });
            return;
        }

        // -------------------------------------------------------------
        // ACTUALIZAR NOTAS DE UN MOVIMIENTO/RECIBO DIRECTAMENTE DESDE FACTURA
        // -------------------------------------------------------------
        if (pathname.startsWith('/api/movimientos/') && pathname.endsWith('/notas') && (method === 'POST' || method === 'PUT')) {
            const movId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const notas = (data.notas !== undefined ? data.notas : '').trim();

            const mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { success: false, error: "Comprobante / Movimiento no encontrado" }, 404);
                return;
            }

            db.prepare("UPDATE movimientos SET notas = ? WHERE id = ?").run(notas, movId);
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Nota_Mov_' + movId);
            sendJSON(res, { success: true, message: "Notas guardadas exitosamente y sincronizadas en Excel", id: movId, notas });
            return;
        }

        // -------------------------------------------------------------
        // ACTUALIZAR NOTAS DE UN ESTUDIANTE DIRECTAMENTE DESDE FACTURA
        // -------------------------------------------------------------
        if (pathname.startsWith('/api/estudiantes/') && pathname.endsWith('/notas') && (method === 'POST' || method === 'PUT')) {
            const estId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const notas = (data.notas !== undefined ? data.notas : '').trim();

            const est = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(estId);
            if (!est) {
                sendJSON(res, { success: false, error: "Estudiante no encontrado" }, 404);
                return;
            }

            db.prepare("UPDATE estudiantes SET notas = ? WHERE id = ?").run(notas, estId);
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Notas de estudiante guardadas", id: estId, notas });
            return;
        }`;

if (!server.includes(targetMov)) {
    throw new Error("targetMov not found in server.js");
}
server = server.replace(targetMov, replacementMov);
console.log("Endpoint /notas added successfully to server.js.");

// 2. Add notas to GET /api/estudiantes response
const targetEst = `                    turno: est.turno || 'Mañana',
                    total_comprometido: Math.round(totalComprometido * 100) / 100,`;

const replacementEst = `                    turno: est.turno || 'Mañana',
                    notas: est.notas || '',
                    total_comprometido: Math.round(totalComprometido * 100) / 100,`;

if (!server.includes(targetEst)) {
    throw new Error("targetEst not found in server.js");
}
server = server.replace(targetEst, replacementEst);
console.log("Field 'notas' added to GET /api/estudiantes response.");

fs.writeFileSync('server.js', server, 'utf8');
console.log("server.js updated successfully!");
