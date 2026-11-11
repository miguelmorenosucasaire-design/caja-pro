const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// 1. GENERADOR DE RECIBO OFICIAL EN EXCEL
const voucherExcelFunc = `
// =====================================================================
// GENERADOR DE RECIBO OFICIAL EN EXCEL (.xlsx) CON EL FORMATO DEL SISTEMA
// =====================================================================
function generarReciboExcelOficial(m) {
    const wb = XLSX.utils.book_new();

    let diaStr = '08', mesStr = '05', anoStr = '2026';
    if (m.fecha && m.fecha.includes('-')) {
        const p = m.fecha.split('-');
        if (p.length === 3) {
            diaStr = p[2].padStart(2, '0');
            mesStr = p[1].padStart(2, '0');
            anoStr = p[0].length === 2 ? ('20' + p[0]) : p[0];
        }
    }
    const fechaCompleta = diaStr + '/' + mesStr + '/' + anoStr;
    let nroCorrelativo = m.comprobante ? String(m.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(m.id || 1).padStart(7, '0');
    if (!nroCorrelativo || nroCorrelativo === '0000000') nroCorrelativo = String(m.id || 1).padStart(7, '0');

    const montoNum = parseFloat(m.monto || 150) || 150;
    const montoStr = montoNum.toFixed(2);

    const data = [
        ['MINISTERIO DE EDUCACIÓN', '', '', '', '', '', '', 'N° ' + nroCorrelativo],
        ['UNIDAD DE GESTIÓN EDUCATIVA LOCAL SAN ROMÁN', '', '', '', '', '', '', ''],
        ['INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS', '', '', '', '', '', '', ''],
        ['JULIACA - PUNO', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['INGRESOS DE RECURSOS PROPIOS', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Señor (a):', m.nombre || 'Ruth Mamani Hancco', '', '', '', 'DNI:', m.dni || '', ''],
        ['Especialidad:', (m.carrera || 'Corte y Ensamblaje') + (m.turno ? ' - ' + m.turno.toUpperCase() : ''), '', '', '', 'Celular:', m.telefono || '', ''],
        ['', '', '', '', '', '', '', ''],
        ['1.- Aporte por Mantenimiento', '', '', '', '', 'Módulo:', '[ X ] Cuota M-1', 'S/ ' + montoStr],
        ['2.- Expedición de constancia de estudio', '', '', '', '', '', '[   ]', '-'],
        ['3.- FUT', '', '', '', '', '', '[   ]', '-'],
        ['4.- Otros: ' + (m.notas || ''), '', '', '', '', 'TOTAL:', '', 'S/ ' + montoStr],
        ['SON: ' + (m.monto_letras || (montoStr + ' SOLES')), '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Juliaca: ' + fechaCompleta, '', '', 'Sello y Firma del Tesorero', '', '', 'Sello y Firma del Recaudador', ''],
        ['[ DÍA: ' + diaStr + ' | MES: ' + mesStr + ' | AÑO: ' + anoStr.slice(-2) + ' ]', '', '', '______________________________', '', '', '______________________________', ''],
        ['', '', '', 'TESORERÍA CETPRO', '', '', 'DIRECCIÓN / RECAUDACIÓN', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // MINEDU
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // UGEL
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // CETPRO
        { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } }, // JULIACA
        { s: { r: 5, c: 0 }, e: { r: 5, c: 7 } }, // TITULO INGRESOS
        { s: { r: 7, c: 1 }, e: { r: 7, c: 4 } }, // Nombre Alumno
        { s: { r: 7, c: 6 }, e: { r: 7, c: 7 } }, // DNI
        { s: { r: 8, c: 1 }, e: { r: 8, c: 4 } }, // Especialidad
        { s: { r: 8, c: 6 }, e: { r: 8, c: 7 } }, // Celular
        { s: { r: 10, c: 0 }, e: { r: 10, c: 4 } }, // Concepto 1
        { s: { r: 11, c: 0 }, e: { r: 11, c: 4 } }, // Concepto 2
        { s: { r: 12, c: 0 }, e: { r: 12, c: 4 } }, // Concepto 3
        { s: { r: 13, c: 0 }, e: { r: 13, c: 4 } }, // Otros
        { s: { r: 13, c: 5 }, e: { r: 13, c: 6 } }, // TOTAL label
        { s: { r: 14, c: 0 }, e: { r: 14, c: 7 } }, // Son
        { s: { r: 16, c: 0 }, e: { r: 16, c: 2 } }, // Juliaca fecha
        { s: { r: 16, c: 3 }, e: { r: 16, c: 5 } }, // Firma 1
        { s: { r: 16, c: 6 }, e: { r: 16, c: 7 } }, // Firma 2
        { s: { r: 17, c: 0 }, e: { r: 17, c: 2 } }, // Caja fecha
        { s: { r: 17, c: 3 }, e: { r: 17, c: 5 } }, // Linea 1
        { s: { r: 17, c: 6 }, e: { r: 17, c: 7 } }, // Linea 2
        { s: { r: 18, c: 3 }, e: { r: 18, c: 5 } }, // Cargo 1
        { s: { r: 18, c: 6 }, e: { r: 18, c: 7 } }  // Cargo 2
    ];

    ws['!cols'] = [
        { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
        { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 16 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'RECIBO_OFICIAL');
    return wb;
}
`;

// Insert the voucher Excel function before guardarLibroExcelEnDisco if not already present
if (!serverCode.includes('function generarReciboExcelOficial')) {
    serverCode = serverCode.replace('function guardarLibroExcelEnDisco()', voucherExcelFunc + '\nfunction guardarLibroExcelEnDisco()');
    console.log('1. generarReciboExcelOficial injected');
}

// 2. NEW ROUTES FOR SERVER
const newRoutes = `
        // =============================================================
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
                WHERE tipo = 'INGRESO' AND fecha IS NOT NULL AND fecha != ''
                GROUP BY fecha
                ORDER BY fecha DESC
            \`).all();

            // Para cada día, traer los detalles de los recibos y estudiantes
            const stmtDetalle = db.prepare(\`
                SELECT id, comprobante, nombre, dni, carrera, turno, monto, fecha, categoria, notas
                FROM movimientos
                WHERE tipo = 'INGRESO' AND fecha = ?
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
                    INSERT INTO estudiantes (nombre, dni, codigo, telefono, carrera, turno, grupo, cuota, pagado, saldo, estado, notas)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'ACTIVO', ?)
                \`).run(nombreTrim, dni || '', dni || '', telefono || '', carreraFinal, turnoFinal, grupoFinal, montoNum, montoNum, notasFinal);
                estId = infoEst.lastInsertRowid;
            } else {
                estId = estExistente.id;
                db.prepare(\`
                    UPDATE estudiantes 
                    SET dni = COALESCE(NULLIF(?, ''), dni),
                        telefono = COALESCE(NULLIF(?, ''), telefono),
                        carrera = ?, turno = ?, grupo = ?,
                        cuota = cuota + ?, pagado = pagado + ?,
                        notas = CASE WHEN ? != '' THEN ? ELSE notas END
                    WHERE id = ?
                \`).run(dni || '', telefono || '', carreraFinal, turnoFinal, grupoFinal, montoNum, montoNum, notasFinal, notasFinal, estId);
            }

            // 3. Insertar movimiento de ingreso en 'movimientos'
            const infoMov = db.prepare(\`
                INSERT INTO movimientos (fecha, tipo, categoria, monto, descripcion, comprobante, nombre, dni, carrera, turno, notas)
                VALUES (?, 'INGRESO', 'Recurso Propio', ?, ?, ?, ?, ?, ?, ?, ?)
            \`).run(
                fechaEmision,
                montoNum,
                concepto || 'Aporte por Mantenimiento Módulo 1',
                correlativoStr,
                nombreTrim,
                dni || '',
                carreraFinal,
                turnoFinal,
                notasFinal
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

// Insert the new routes right before 6.1 API: SECCIONES Y CLASES POR GRUPO Y ENCARGADOS
const targetRouteInsertion = `// -------------------------------------------------------------
        // 6.1 API: SECCIONES Y CLASES POR GRUPO Y ENCARGADOS`;

if (!serverCode.includes('/recibo-excel')) {
    if (serverCode.includes(targetRouteInsertion)) {
        serverCode = serverCode.replace(targetRouteInsertion, newRoutes + '\n        ' + targetRouteInsertion);
        console.log('2. New routes added to server.js');
    } else {
        console.error('Target route insertion point not found!');
        process.exit(1);
    }
}

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('server.js written successfully!');
