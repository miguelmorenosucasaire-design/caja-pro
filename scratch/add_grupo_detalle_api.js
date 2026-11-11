const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const targetStr = `            sendJSON(res, grupos);
            return;
        }`;

const detailEndpoint = `            sendJSON(res, grupos);
            return;
        }

        // Obtener Plantilla Detallada de una Sección / Grupo (Alumnos, Pagos y Recibos)
        if (pathname.match(/^\\/api\\/grupos\\/(\\d+)\\/detalle$/) && method === 'GET') {
            const grupoId = parseInt(pathname.split('/')[3], 10);
            const grupo = db.prepare(\`
                SELECT 
                    g.id, g.nombre, g.carrera, g.encargado, g.turno, g.horario, g.aula_taller, g.descripcion,
                    (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as total_alumnos,
                    (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Ingreso' AND m.estado = 'Pagado') as total_ingresos,
                    (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Egreso' AND m.estado = 'Pagado') as total_egresos,
                    (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Ingreso' AND m.estado = 'Pendiente') as total_deudas
                FROM grupos g
                WHERE g.id = ?
            \`).get(grupoId);

            if (!grupo) {
                sendJSON(res, { error: "Sección o grupo no encontrado" }, 404);
                return;
            }

            // Estudiantes de la sección con sus totales individuales de pago y deuda
            const estudiantes = db.prepare(\`
                SELECT 
                    e.id, e.codigo, e.nombre, e.carrera, e.grupo, e.email, e.telefono, e.ciclo, e.estado_academico,
                    COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND m.tipo = 'Ingreso' AND m.estado = 'Pagado'), 0) as total_pagado,
                    COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND m.tipo = 'Ingreso' AND m.estado = 'Pendiente'), 0) as total_deuda
                FROM estudiantes e
                WHERE e.grupo = ?
                ORDER BY e.codigo ASC
            \`).all(grupo.nombre);

            // Movimientos y recibos registrados en esta sección
            const movimientos = db.prepare(\`
                SELECT * FROM movimientos
                WHERE grupo = ?
                ORDER BY fecha DESC, id DESC
            \`).all(grupo.nombre);

            sendJSON(res, {
                grupo: {
                    ...grupo,
                    total_ingresos: Math.round(grupo.total_ingresos * 100) / 100,
                    total_egresos: Math.round(grupo.total_egresos * 100) / 100,
                    balance_neto: Math.round((grupo.total_ingresos - grupo.total_egresos) * 100) / 100
                },
                estudiantes,
                movimientos
            });
            return;
        }`;

if (!serverCode.includes('/detalle') && serverCode.includes(targetStr)) {
    serverCode = serverCode.replace(targetStr, detailEndpoint);
    fs.writeFileSync('server.js', serverCode, 'utf8');
    console.log('Endpoint /api/grupos/:id/detalle added successfully to server.js');
} else {
    console.log('Already added or target string not found');
}
