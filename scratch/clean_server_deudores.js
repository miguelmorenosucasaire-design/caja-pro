const fs = require('fs');
let s = fs.readFileSync('server.js', 'utf8');

const target = `            if (deudores.length === 0) {
                const ests = db.prepare('SELECT id, codigo, nombre, dni, telefono, carrera, grupo FROM estudiantes').all();
                for (const est of ests) {
                    if (carrera && est.carrera !== carrera) continue;
                    if (search && !est.nombre.toLowerCase().includes(search) && !(est.dni && est.dni.toLowerCase().includes(search))) continue;
                    const movs = db.prepare("SELECT monto, comprobante, fecha FROM movimientos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND tipo = 'Ingreso' AND estado = 'Pagado'").all(est.nombre);
                    const totalPagado = movs.reduce((acc, m) => acc + Number(m.monto || 0), 0);
                    const costoTotal = 300;
                    if (totalPagado < costoTotal) {
                        const saldo = costoTotal - totalPagado;
                        const faltaCompletar = totalPagado > 0;
                        const ultimoComprobante = movs.length > 0 ? movs[movs.length - 1].comprobante : '---';
                        deudores.push({
                            id: est.id,
                            deuda_id: est.id,
                            estudiante_id: est.id,
                            nombre: est.nombre,
                            dni: est.dni || 'Sin DNI',
                            telefono: est.telefono || 'Sin Celular',
                            carrera: est.carrera || 'General',
                            grupo: est.grupo || 'General',
                            concepto: faltaCompletar ? 'Cuota II - Saldo pendiente Módulo I' : 'Cuota I y II - Matrícula y Mantenimiento',
                            monto: saldo,
                            monto_total: costoTotal,
                            monto_abonado: totalPagado,
                            monto_pendiente: saldo,
                            falta_completar: faltaCompletar,
                            fecha_vencimiento: '2026-11-30',
                            comprobante: ultimoComprobante,
                            urgencia: saldo > 150 ? 'urgente' : 'a_tiempo',
                            mensaje_urgencia: saldo > 150 ? 'Vence en 12 días (Urgente)' : 'En plazo regular',
                            notas: faltaCompletar ? \`Abonó S/. \${totalPagado.toFixed(2)}, resta S/. \${saldo.toFixed(2)}\` : 'Pendiente de primer abono'
                        });
                    }
                }
            }`;

if (s.includes(target)) {
    s = s.replace(target, '            // Deudores solo aparecen cuando son seleccionados/asignados manualmente por el usuario');
    fs.writeFileSync('server.js', s, 'utf8');
    console.log('server.js actualizado: deudores sólo cuando el usuario los escoja.');
} else {
    console.log('Target no encontrado directamente. Verificando CRLF...');
    const targetCRLF = target.replace(/\n/g, '\r\n');
    if (s.includes(targetCRLF)) {
        s = s.replace(targetCRLF, '            // Deudores solo aparecen cuando son seleccionados/asignados manualmente por el usuario');
        fs.writeFileSync('server.js', s, 'utf8');
        console.log('server.js actualizado (CRLF): deudores sólo cuando el usuario los escoja.');
    } else {
        console.error('No se pudo encontrar target en server.js');
    }
}
