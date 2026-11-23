const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

// 1. Add desglose to /api/diario
if (!serverCode.includes('desglose_metodos')) {
    const targetDiario = `const movsDelDia = db.prepare("SELECT * FROM movimientos WHERE fecha = ? ORDER BY id DESC").all(fecha);

            sendJSON(res, {
                fecha,
                ingresos: ingRow ? ingRow.total : 0,
                pagos_count: ingRow ? ingRow.count : 0,
                egresos: egrRow ? egrRow.total : 0,
                saldo: (ingRow ? ingRow.total : 0) - (egrRow ? egrRow.total : 0),
                movimientos: movsDelDia
            });`;

    const replacementDiario = `const movsDelDia = db.prepare("SELECT * FROM movimientos WHERE fecha = ? ORDER BY id DESC").all(fecha);

            const metodos = db.prepare(\`
                SELECT COALESCE(metodo_pago, 'Efectivo') as metodo, COALESCE(SUM(monto), 0) as total, COUNT(*) as count 
                FROM movimientos 
                WHERE fecha = ? AND tipo = 'Ingreso' AND estado = 'Pagado'
                GROUP BY metodo_pago
            \`).all(fecha);

            let totalEfectivo = 0, totalYape = 0, totalTransf = 0;
            metodos.forEach(m => {
                const met = (m.metodo || '').toLowerCase();
                if (met.includes('yape') || met.includes('plin') || met.includes('digital')) totalYape += m.total;
                else if (met.includes('transf') || met.includes('banc') || met.includes('depósito')) totalTransf += m.total;
                else totalEfectivo += m.total;
            });

            sendJSON(res, {
                fecha,
                ingresos: ingRow ? ingRow.total : 0,
                pagos_count: ingRow ? ingRow.count : 0,
                egresos: egrRow ? egrRow.total : 0,
                saldo: (ingRow ? ingRow.total : 0) - (egrRow ? egrRow.total : 0),
                movimientos: movsDelDia,
                desglose_metodos: {
                    efectivo: totalEfectivo,
                    yape: totalYape,
                    transferencia: totalTransf
                }
            });`;

    if (serverCode.includes(targetDiario)) {
        serverCode = serverCode.replace(targetDiario, replacementDiario);
        console.log('1. /api/diario updated with payment method breakdown');
    }
}

// 2. Add /api/sistema/diagnostico-completo
if (!serverCode.includes('/api/sistema/diagnostico-completo')) {
    const targetEndpoint = `if (pathname === '/api/sistema/salud-integridad' && method === 'GET') {`;
    const newEndpoint = `if (pathname === '/api/sistema/diagnostico-completo' && method === 'GET') {
            try {
                const pragma = db.prepare('PRAGMA integrity_check').get();
                const totalMovs = db.prepare('SELECT count(*) as c, COALESCE(SUM(monto), 0) as sum FROM movimientos WHERE tipo = "Ingreso" AND estado = "Pagado"').get();
                const totalEst = db.prepare('SELECT count(*) as c FROM estudiantes').get().c;
                const totalDoc = db.prepare('SELECT count(*) as c FROM docentes').get().c;
                const totalGrp = db.prepare('SELECT count(*) as c FROM grupos').get().c;
                const totalCarr = db.prepare('SELECT count(*) as c FROM carreras').get().c;

                const excelPath = path.join(__dirname, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
                const excelExists = fs.existsSync(excelPath);
                let excelStats = { existe: excelExists, hojas: [] };
                if (excelExists) {
                    const wb = XLSX.readFile(excelPath);
                    excelStats.hojas = wb.SheetNames;
                    excelStats.estudiantesCount = wb.Sheets['ESTUDIANTES'] ? XLSX.utils.sheet_to_json(wb.Sheets['ESTUDIANTES']).length : 0;
                }

                const backupsDir = path.join(__dirname, 'backups');
                let backupCount = 0;
                if (fs.existsSync(backupsDir)) {
                    backupCount = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db')).length;
                }

                sendJSON(res, {
                    orquestacion: 'EXITOSA',
                    estado: 'OPTIMO',
                    timestamp: new Date().toISOString(),
                    base_de_datos: {
                        integridad: pragma.integrity_check || 'ok',
                        movimientos: totalMovs.c,
                        total_recaudado: totalMovs.sum,
                        estudiantes: totalEst,
                        docentes: totalDoc,
                        grupos: totalGrp,
                        carreras: totalCarr
                    },
                    excel_oficial: excelStats,
                    respaldos: {
                        total_archivos: backupCount,
                        directorio: backupsDir
                    },
                    servidor: {
                        uptime_segundos: Math.floor(process.uptime()),
                        memoria_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
                        node_version: process.version
                    }
                });
            } catch (err) {
                sendJSON(res, { estado: 'ERROR', error: err.message }, 500);
            }
            return;
        }

        ` + targetEndpoint;

    serverCode = serverCode.replace(targetEndpoint, newEndpoint);
    console.log('2. /api/sistema/diagnostico-completo endpoint added');
}

fs.writeFileSync('server.js', serverCode, 'utf8');
console.log('server.js updated successfully!');
