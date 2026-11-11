const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const targetStr = `            const fileName = \`Resultados_Mensuales_CETPRO_\${yearStr}.csv\`;
            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': \`attachment; filename="\${fileName}"\`
            });
            res.end(csv);
            return;
        }`;

const newEndpoints = `            const fileName = \`Resultados_Mensuales_CETPRO_\${yearStr}.csv\`;
            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': \`attachment; filename="\${fileName}"\`
            });
            res.end(csv);
            return;
        }

        // Descargar libro Excel oficial (.xlsm) completo
        if (pathname === '/api/exportar/excel' && method === 'GET') {
            const excelPath = path.join(__dirname, 'CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm');
            if (fs.existsSync(excelPath)) {
                const stat = fs.statSync(excelPath);
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.ms-excel.sheet.macroEnabled.12',
                    'Content-Length': stat.size,
                    'Content-Disposition': 'attachment; filename="CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm"'
                });
                fs.createReadStream(excelPath).pipe(res);
                return;
            } else {
                sendJSON(res, { error: "Archivo Excel no encontrado en el servidor" }, 404);
                return;
            }
        }

        // Exportar Hoja Específica seleccionada en el área de trabajo (CSV/Excel con diseño y formato)
        if (pathname === '/api/exportar/hoja' && method === 'GET') {
            const sheet = parsedUrl.searchParams.get('sheet') || 'estudiantes';
            let csv = '\\uFEFF';
            let filename = 'Hoja_CETPRO.csv';

            if (sheet === 'estudiantes') {
                filename = 'Hoja_ESTUDIANTES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  ESTUDIANTES\\r\\n";
                csv += "Nómina Oficial y Control de Pagos\\r\\n\\r\\n";
                csv += "ID,DNI,Apellidos y nombres,Teléfono,Grupo / Sección,Docente,Total Pagado (S/.),DEUDA (S/.),Estado,Último pago\\r\\n";
                const rows = db.prepare(\`
                    SELECT e.id, e.codigo, e.nombre, e.telefono, e.grupo,
                           COALESCE((SELECT encargado FROM grupos g WHERE g.nombre = e.grupo), 'Docente Asignado') as docente,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pagado'), 0) as pagado,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pendiente'), 0) as deuda
                    FROM estudiantes e ORDER BY e.id ASC
                \`).all();
                rows.forEach(r => {
                    const estado = r.deuda > 0 ? 'Con Deuda' : 'Al Día';
                    csv += \`"\${r.id}","\${r.codigo}","\${r.nombre}","\${r.telefono || '-'}","\${r.grupo}","\${r.docente}",\${r.pagado.toFixed(2)},\${r.deuda.toFixed(2)},"\${estado}","2026"\\r\\n\`;
                });
            } else if (sheet === 'grupos') {
                filename = 'Hoja_GRUPOS_Y_DOCENTES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  GRUPOS Y DOCENTES\\r\\n";
                csv += "Organización por Especialidad y Encargado de Clase\\r\\n\\r\\n";
                csv += "Código,Grupo / Especialidad,Docente a cargo,Horario,Aula / Taller,Turno,Estudiantes,Cobrado en el año (S/.)\\r\\n";
                const rows = db.prepare(\`
                    SELECT g.id, g.nombre, g.encargado, g.horario, g.aula_taller, g.turno,
                           (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as total_alumnos,
                           (SELECT COALESCE(SUM(monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND tipo = 'Ingreso' AND estado = 'Pagado') as total_ingresos
                    FROM grupos g ORDER BY g.id ASC
                \`).all();
                rows.forEach(r => {
                    csv += \`"G0\${r.id}","\${r.nombre}","\${r.encargado}","\${r.horario || '-'}","\${r.aula_taller || '-'}","\${r.turno}",\${r.total_alumnos},\${r.total_ingresos.toFixed(2)}\\r\\n\`;
                });
            } else if (sheet === 'ingresos') {
                filename = 'Hoja_INGRESOS_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  REGISTRO DE INGRESOS (ENTRADAS)\\r\\n";
                csv += "Libro de Caja - Movimientos de Entrada\\r\\n\\r\\n";
                csv += "N° Recibo,Fecha,Estudiante / Persona,Grupo / Sección,Encargado,Concepto / Nota,Forma de pago,Monto (S/.)\\r\\n";
                const rows = db.prepare("SELECT * FROM movimientos WHERE tipo = 'Ingreso' ORDER BY id ASC").all();
                rows.forEach(r => {
                    csv += \`"REC-\${String(r.id).padStart(5, '0')}","\${r.fecha}","\${r.nombre}","\${r.grupo || '-'}","\${r.encargado || '-'}","\${r.concepto}","\${r.metodo_pago || 'Efectivo'}",\${r.monto.toFixed(2)}\\r\\n\`;
                });
            } else if (sheet === 'deudores') {
                filename = 'Hoja_DEUDORES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  ESTUDIANTES QUE DEBEN\\r\\n";
                csv += "Control de Pagos Pendientes y Vencimientos\\r\\n\\r\\n";
                csv += "ID,Estudiante,Grupo / Especialidad,Docente,Teléfono,Total Pagado (S/.),DEUDA PENDIENTE (S/.)\\r\\n";
                const rows = db.prepare(\`
                    SELECT e.id, e.nombre, e.grupo, e.telefono,
                           COALESCE((SELECT encargado FROM grupos g WHERE g.nombre = e.grupo), 'Docente') as docente,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pagado'), 0) as pagado,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pendiente'), 0) as deuda
                    FROM estudiantes e
                    WHERE (SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pendiente') > 0
                    ORDER BY deuda DESC
                \`).all();
                rows.forEach(r => {
                    csv += \`"\${r.id}","\${r.nombre}","\${r.grupo}","\${r.docente}","\${r.telefono || '-'}","\${r.pagado.toFixed(2)}","\${r.deuda.toFixed(2)}"\\r\\n\`;
                });
            } else if (sheet === 'docentes') {
                filename = 'Hoja_DOCENTES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  DOCENTES\\r\\n";
                csv += "Docentes Encargados y Control Financiero Anual\\r\\n\\r\\n";
                csv += "ID,Apellidos y nombres del docente,Especialidad,Turno,Teléfono,Grupos a cargo,Estudiantes a cargo,Cobrado en el año (S/.)\\r\\n";
                const rows = db.prepare(\`
                    SELECT d.id, d.nombre, d.especialidad, d.turno, d.telefono,
                           COALESCE((SELECT COUNT(*) FROM grupos g WHERE g.encargado = d.nombre), 1) as grupos_count,
                           COALESCE((SELECT COUNT(*) FROM estudiantes e WHERE e.grupo IN (SELECT nombre FROM grupos g WHERE g.encargado = d.nombre)), 0) as total_est,
                           COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE (m.encargado = d.nombre OR m.grupo IN (SELECT nombre FROM grupos g WHERE g.encargado = d.nombre)) AND m.tipo = 'Ingreso' AND m.estado = 'Pagado'), 0) as cobrado
                    FROM docentes d ORDER BY d.id ASC
                \`).all();
                rows.forEach(r => {
                    csv += \`"\${r.id}","\${r.nombre}","\${r.especialidad}","\${r.turno}","\${r.telefono || '-'}","\${r.grupos_count}","\${r.total_est}",\${r.cobrado.toFixed(2)}\\r\\n\`;
                });
            } else {
                // Export genérico de movimientos
                filename = \`Hoja_\${sheet.toUpperCase()}_CETPRO.csv\`;
                csv += "CEPRO MICAELA BASTIDAS  ·  LIBRO GENERAL\\r\\n\\r\\n";
                csv += "N° Recibo,Fecha,Estudiante / Persona,Grupo / Sección,Encargado,Tipo,Concepto,Monto (S/.)\\r\\n";
                const rows = db.prepare("SELECT * FROM movimientos ORDER BY id DESC").all();
                rows.forEach(r => {
                    csv += \`"REC-\${String(r.id).padStart(5, '0')}","\${r.fecha}","\${r.nombre}","\${r.grupo || '-'}","\${r.encargado || '-'}","\${r.tipo}","\${r.concepto}",\${r.monto.toFixed(2)}\\r\\n\`;
                });
            }

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': \`attachment; filename="\${filename}"\`
            });
            res.end(csv);
            return;
        }

        // Endpoint para la hoja DIARIO (ingresos, gastos y notas del día por fecha)
        if (pathname === '/api/diario' && method === 'GET') {
            const hoyStr = new Date().toISOString().split('T')[0];
            const fecha = parsedUrl.searchParams.get('fecha') || hoyStr;

            const ingRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as count FROM movimientos WHERE fecha = ? AND tipo = 'Ingreso' AND estado = 'Pagado'").get(fecha);
            const egrRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as count FROM movimientos WHERE fecha = ? AND tipo = 'Egreso' AND estado = 'Pagado'").get(fecha);

            const movsDelDia = db.prepare("SELECT * FROM movimientos WHERE fecha = ? ORDER BY id DESC").all(fecha);

            sendJSON(res, {
                fecha,
                ingresos: ingRow ? ingRow.total : 0,
                pagos_count: ingRow ? ingRow.count : 0,
                egresos: egrRow ? egrRow.total : 0,
                saldo: (ingRow ? ingRow.total : 0) - (egrRow ? egrRow.total : 0),
                movimientos: movsDelDia
            });
            return;
        }`;

if (!serverCode.includes('/api/exportar/excel') && serverCode.includes(targetStr)) {
    serverCode = serverCode.replace(targetStr, newEndpoints);
    fs.writeFileSync('server.js', serverCode, 'utf8');
    console.log('New endpoints (/api/exportar/excel, /api/exportar/hoja, /api/diario) added successfully to server.js');
} else {
    console.log('Already added or target string not found');
}
