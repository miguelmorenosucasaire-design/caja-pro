const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// Check if /api/exportar/hoja already has control-pagos
if (!serverCode.includes("sheet === 'control-pagos'")) {
    const target = "if (sheet === 'estudiantes') {";
    const addition = `if (sheet === 'control-pagos') {
                filename = 'Hoja_CONTROL_PAGOS_CETPRO_2026.csv';
                csv += "CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA\\r\\n";
                csv += "CONTROL DE PAGOS POR MES (MATRIZ ENERO A DICIEMBRE 2026)\\r\\n\\r\\n";
                csv += "N°,DNI,Estudiante,Grupo / Sección,Matrícula,Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Set,Oct,Nov,Dic,Total Pagado (S/.),Deuda (S/.)\\r\\n";
                const ests = db.prepare("SELECT * FROM estudiantes ORDER BY id ASC").all();
                ests.forEach((e, idx) => {
                    const pagosEst = db.prepare("SELECT monto, concepto, fecha FROM movimientos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND tipo = 'Ingreso' AND estado = 'Pagado'").all(e.nombre);
                    const totalPag = pagosEst.reduce((acc, p) => acc + (p.monto || 0), 0);
                    const cuotaBase = 150;
                    const deuda = Math.max(0, cuotaBase - totalPag);
                    const tieneMat = pagosEst.some(p => (p.concepto || '').toLowerCase().includes('matr') || (p.concepto || '').toLowerCase().includes('mantenimiento')) ? 'SI' : '-';
                    const mes = (m) => pagosEst.some(p => {
                        const f = p.fecha || '';
                        return f.includes('-' + String(m).padStart(2, '0') + '-');
                    }) ? 'PAGADO' : '-';
                    csv += \`"\${idx + 1}","\${e.dni || e.codigo || '-'}","\${e.nombre}","\${e.grupo || '-'}","\${tieneMat}","\${mes(1)}","\${mes(2)}","\${mes(3)}","\${mes(4)}","\${mes(5)}","\${mes(6)}","\${mes(7)}","\${mes(8)}","\${mes(9)}","\${mes(10)}","\${mes(11)}","\${mes(12)}",\${totalPag.toFixed(2)},\${deuda.toFixed(2)}\\r\\n\`;
                });
            } else if (sheet === 'diario') {
                const fParam = parsedUrl.searchParams.get('fecha') || new Date().toISOString().split('T')[0];
                filename = \`Hoja_DIARIO_Y_NOTAS_\${fParam}_CETPRO.csv\`;
                csv += "CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA\\r\\n";
                csv += \`DIARIO DE CAJA Y BITÁCORA DE CLASE - FECHA: \${fParam}\\r\\n\\r\\n\`;
                csv += "N° Recibo,Estudiante / Persona,Grupo / Especialidad,Encargado de Clase,Concepto / Nota,Monto (S/.),Método\\r\\n";
                const movs = db.prepare("SELECT * FROM movimientos WHERE fecha = ? ORDER BY id DESC").all(fParam);
                movs.forEach(m => {
                    csv += \`"REC-\${String(m.id).padStart(5, '0')}","\${m.nombre}","\${m.grupo || '-'}","\${m.encargado || '-'}","\${m.concepto}",\${m.monto.toFixed(2)},"\${m.metodo_pago || 'Efectivo'}"\\r\\n\`;
                });
                csv += "\\r\\n\\r\\nBITÁCORA OFICIAL DE NOTAS Y ACTIVIDADES PEDAGÓGICAS (HOJA NOTAS)\\r\\n";
                csv += "Código Grupo,Especialidad / Grupo,Docente Encargado(a),Actividad Realizada / Tema Desarrollado,Observaciones Pedagógicas\\r\\n";
                const grupos = db.prepare("SELECT * FROM grupos ORDER BY id ASC").all();
                grupos.forEach((g, idx) => {
                    csv += \`"G\${String(idx + 1).padStart(2, '0')}","\${g.nombre}","\${g.encargado || '-'}","Práctica y avance modular de taller","Asistencia y desarrollo de actividades al día"\\r\\n\`;
                });
            } else ` + target;

    serverCode = serverCode.replace(target, addition);
    fs.writeFileSync('server.js', serverCode, 'utf8');
    console.log('server.js updated with control-pagos and diario export sheets!');
} else {
    console.log('server.js already has control-pagos and diario export sheets.');
}
