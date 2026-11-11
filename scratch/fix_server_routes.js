const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Target the routes block to replace
const oldBlockStart = '// =============================================================\r\n        // 6.2 API: RECIBO OFICIAL EN EXCEL (.xlsx)';
const oldBlockStartUnix = '// =============================================================\n        // 6.2 API: RECIBO OFICIAL EN EXCEL (.xlsx)';

let startIdx = serverCode.indexOf(oldBlockStart);
if (startIdx === -1) {
    startIdx = serverCode.indexOf(oldBlockStartUnix);
}

if (startIdx === -1) {
    console.error('Could not find start of old block');
    process.exit(1);
}

const endMarker = `// -------------------------------------------------------------
        // 6.1 API: SECCIONES Y CLASES POR GRUPO Y ENCARGADOS`;

const endIdx = serverCode.indexOf(endMarker, startIdx);
if (endIdx === -1) {
    console.error('Could not find endMarker');
    process.exit(1);
}

const correctedRoutes = `// =============================================================
        // 6.2 API: RECIBO OFICIAL EN EXCEL (.xlsx)
        // =============================================================
        if (pathname.startsWith('/api/movimientos/') && pathname.endsWith('/recibo-excel') && method === 'GET') {
            const movId = parseInt(pathname.split('/')[3], 10);
            let mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Recibo no encontrado" }, 404);
                return;
            }

            // Lookup additional student info if available
            const est = db.prepare("SELECT * FROM estudiantes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").get(mov.nombre);
            if (est) {
                mov.dni = mov.dni || est.dni || est.codigo;
                mov.telefono = mov.telefono || est.telefono;
                mov.carrera = mov.carrera || est.carrera;
                mov.turno = mov.turno || est.turno;
            }

            const wb = generarReciboExcelOficial(mov);
            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
            const nroLimpio = mov.comprobante ? String(mov.comprobante).replace(/\\D/g, '') : String(mov.id);
            const nombreLimpio = (mov.nombre || 'Comprobante').replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = \`Recibo_\${nroLimpio}_\${nombreLimpio}.xlsx\`;

            res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': \`attachment; filename="\${fileName}"\`,
                'Content-Length': buf.length
            });
            res.end(buf);
            return;
        }

        // =============================================================
        // 6.3 API: CALENDARIZACIÓN DE INGRESOS Y NUEVOS ESTUDIANTES POR DÍA
        // =============================================================
        if (pathname === '/api/estudiantes/calendarizacion' && method === 'GET') {
            // Agrupar movimientos de ingreso por fecha
            const resumenPorDia = db.prepare(\`
                SELECT 
                    fecha,
                    COUNT(DISTINCT nombre) as total_estudiantes,
                    COUNT(*) as total_recibos,
                    SUM(monto) as total_monto
                FROM movimientos
                WHERE LOWER(tipo) = 'ingreso' AND fecha IS NOT NULL AND fecha != ''
                GROUP BY fecha
                ORDER BY fecha DESC
            \`).all();

            // Para cada día, traer los detalles de los recibos y estudiantes
            const stmtDetalle = db.prepare(\`
                SELECT id, comprobante, nombre, dni, carrera, turno, monto, fecha, concepto, notas
                FROM movimientos
                WHERE LOWER(tipo) = 'ingreso' AND fecha = ?
                ORDER BY id DESC
            \`);

            const resultado = resumenPorDia.map(r => {
                const detalles = stmtDetalle.all(r.fecha);
                return {
                    fecha: r.fecha,
                    total_estudiantes: r.total_estudiantes,
                    total_recibos: r.total_recibos,
                    total_monto: r.total_monto,
                    recibos: detalles
                };
            });

            sendJSON(res, {
                success: true,
                dias_registrados: resultado.length,
                calendarizacion: resultado
            });
            return;
        }

        // =============================================================
        // 6.4 API: REGISTRAR NUEVO ESTUDIANTE Y EMITIR SU RECIBO HOY CON FECHA
        // =============================================================
        if (pathname === '/api/estudiantes/nuevo-con-recibo' && method === 'POST') {
            const data = await parseBody(req);
            const { nombre, dni, telefono, carrera, turno, grupo, monto, fecha, notas, concepto } = data;

            if (!nombre || !nombre.trim()) {
                sendJSON(res, { error: "El nombre del estudiante es obligatorio" }, 400);
                return;
            }

            const nombreTrim = nombre.trim();
            const fechaEmision = (fecha && fecha.trim()) ? fecha.trim() : new Date().toISOString().split('T')[0];
            const montoNum = parseFloat(monto) || 150;
            const carreraFinal = carrera || 'Corte y Ensamblaje';
            const turnoFinal = turno || 'Tarde';
            const grupoFinal = grupo || (carreraFinal + ' - Turno ' + turnoFinal);
            const notasFinal = (notas || '').trim();

            // 1. Obtener siguiente número correlativo de comprobante
            const rowMax = db.prepare("SELECT MAX(CAST(REPLACE(REPLACE(comprobante, 'N°', ''), ' ', '') AS INTEGER)) as max_nro FROM movimientos WHERE comprobante IS NOT NULL").get();
            const nextNro = ((rowMax && rowMax.max_nro) ? rowMax.max_nro : 807) + 1;
            const correlativoStr = String(nextNro).padStart(7, '0');

            // 2. Insertar o actualizar estudiante en tabla 'estudiantes'
            let estExistente = db.prepare("SELECT * FROM estudiantes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").get(nombreTrim);
            let estId = null;

            if (!estExistente) {
                const infoEst = db.prepare(\`
                    INSERT INTO estudiantes (codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo, dni, turno, notas)
                    VALUES (?, ?, ?, 'I', '', ?, 'ACTIVO', ?, ?, ?, ?)
                \`).run(dni || correlativoStr, nombreTrim, carreraFinal, telefono || '', grupoFinal, dni || '', turnoFinal, notasFinal);
                estId = infoEst.lastInsertRowid;
            } else {
                estId = estExistente.id;
                db.prepare(\`
                    UPDATE estudiantes 
                    SET dni = COALESCE(NULLIF(?, ''), dni),
                        telefono = COALESCE(NULLIF(?, ''), telefono),
                        carrera = ?, turno = ?, grupo = ?,
                        notas = CASE WHEN ? != '' THEN ? ELSE notas END
                    WHERE id = ?
                \`).run(dni || '', telefono || '', carreraFinal, turnoFinal, grupoFinal, notasFinal, notasFinal, estId);
            }

            // 3. Insertar movimiento de ingreso en 'movimientos'
            const infoMov = db.prepare(\`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, comprobante, notas, grupo, dni, turno)
                VALUES (?, 'Ingreso', 'Pagado', 'Estudiante', ?, ?, ?, ?, ?, ?, 'Efectivo', ?, ?, ?, ?, ?)
            \`).run(
                fechaEmision,
                nombreTrim,
                carreraFinal,
                concepto || 'Aporte por Mantenimiento Módulo 1',
                montoNum,
                montoNum,
                montoNum,
                correlativoStr,
                notasFinal,
                grupoFinal,
                dni || '',
                turnoFinal
            );

            const movId = infoMov.lastInsertRowid;

            // 4. Sincronizar Excel y generar respaldo
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Nuevo_Estudiante_' + correlativoStr);

            sendJSON(res, {
                success: true,
                mensaje: \`Estudiante \${nombreTrim} registrado y recibo N° \${correlativoStr} emitido con éxito con fecha \${fechaEmision}.\`,
                estudiante_id: estId,
                movimiento_id: movId,
                comprobante: correlativoStr,
                fecha: fechaEmision
            });
            return;
        }

        // =============================================================
        // 6.5 API: ACTUALIZAR FECHA DE EMISIÓN DE UN RECIBO
        // =============================================================
        if (pathname.startsWith('/api/movimientos/') && pathname.endsWith('/fecha') && (method === 'PUT' || method === 'POST')) {
            const movId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nuevaFecha = (data.fecha || '').trim();

            if (!nuevaFecha) {
                sendJSON(res, { error: "La fecha es requerida (formato YYYY-MM-DD)" }, 400);
                return;
            }

            const mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Recibo no encontrado" }, 404);
                return;
            }

            db.prepare("UPDATE movimientos SET fecha = ? WHERE id = ?").run(nuevaFecha, movId);
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Fecha_Mov_' + (mov.comprobante || movId));

            sendJSON(res, {
                success: true,
                mensaje: \`Fecha del recibo N° \${mov.comprobante} actualizada a \${nuevaFecha}.\`,
                fecha: nuevaFecha
            });
            return;
        }

        `;

serverCode = serverCode.substring(0, startIdx) + correctedRoutes + serverCode.substring(endIdx);
fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('server.js routes successfully replaced!');
