const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

function getEstudiantes(estadoFiltro) {
    const estudiantes = db.prepare("SELECT * FROM estudiantes ORDER BY nombre ASC").all();
    const resultados = [];

    for (const est of estudiantes) {
        const movs = db.prepare(`
            SELECT id, fecha, tipo, estado, concepto, monto, monto_total, monto_abonado, 
                   metodo_pago, fecha_vencimiento, comprobante, notas
            FROM movimientos
            WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante'
        `).all(est.nombre);

        let totalComprometido = 0;
        let totalPagado = 0;
        let saldoPendiente = 0;
        let tieneAbonosParciales = false;

        for (const m of movs) {
            if (m.estado === 'Pendiente') {
                totalComprometido += (m.monto_total || m.monto);
                totalPagado += (m.monto_abonado || 0);
                saldoPendiente += m.monto;
                if ((m.monto_abonado || 0) > 0) tieneAbonosParciales = true;
            } else if (m.estado === 'Pagado' && m.tipo === 'Ingreso') {
                totalComprometido += m.monto;
                totalPagado += m.monto;

                if (m.notas) {
                    const nLow = m.notas.toLowerCase();
                    if (nLow.includes('debe') || nLow.includes('a cuenta')) {
                        const matchDebe = m.notas.match(/debe\s+(\d+(?:\.\d+)?)/i);
                        const debeVal = matchDebe ? parseFloat(matchDebe[1]) : 50.0;
                        saldoPendiente += debeVal;
                        totalComprometido += debeVal;
                        tieneAbonosParciales = true;
                    }
                }
            }
        }

        let estadoFinanciero = 'al_dia';
        if (saldoPendiente > 0) {
            estadoFinanciero = tieneAbonosParciales ? 'faltan_completar' : 'deben_todo';
        }

        if (estadoFiltro === 'pendiente') {
            const esSinAsignar = !est.carrera || est.carrera.trim() === '' || est.carrera === 'Sin Asignar' || est.carrera.includes('Pendiente');
            const tieneDeuda = saldoPendiente > 0;
            if (!tieneDeuda && !esSinAsignar && estadoFinanciero === 'al_dia') continue;
        } else if (estadoFiltro === 'anulado') {
            continue;
        } else if (estadoFiltro && estadoFinanciero !== estadoFiltro) {
            continue;
        }

        resultados.push({
            id: est.id,
            nombre: est.nombre,
            carrera: est.carrera,
            estado_financiero: estadoFinanciero,
            saldo_pendiente: saldoPendiente
        });
    }

    if (estadoFiltro === 'anulado') {
        const movsAnulados = db.prepare(`
            SELECT id, comprobante, fecha, nombre, carrera, monto, estado, concepto, notas 
            FROM movimientos 
            WHERE estado = 'Anulado' 
               OR LOWER(nombre) LIKE '%anulado%' 
               OR LOWER(nombre) LIKE '%no existe%' 
               OR LOWER(nombre) LIKE '%sin registro%'
            ORDER BY comprobante ASC
        `).all();

        for (const ma of movsAnulados) {
            resultados.push({
                id: -ma.id,
                comprobante: ma.comprobante,
                nombre: ma.nombre,
                carrera: ma.carrera,
                estado_financiero: 'anulado',
                saldo_pendiente: 0
            });
        }
    }

    return resultados;
}

console.log('--- PENDIENTES ---');
console.table(getEstudiantes('pendiente'));
console.log('--- ANULADOS ---');
console.table(getEstudiantes('anulado'));
console.log('--- TOTAL ESTUDIANTES ---', getEstudiantes('').length);
