const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');

const jsonPath = 'scratch/real_data/19-NOV-2026_INGRESO_RECURSOS_PROPIOS.json';
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const db = new DatabaseSync('caja_institucional.db');

console.log('=== APLICANDO COTEJO Y CARGA DE DATOS REALES (241 REGISTROS) ===\n');

// 1. Mapeos de Carrera, Grupo y Encargado
function mapearCarrera(prog) {
    if (!prog) return 'Sin Asignar (Pendiente)';
    const p = prog.toUpperCase().trim();
    if (p.includes('COMPUTACION')) return 'Computación e Informática';
    if (p.includes('CORTE') || p.includes('ENSAMBL')) return 'Corte y Ensamblaje';
    if (p.includes('PELUQUERIA') || p.includes('BARBERIA')) return 'Peluquería y Barbería';
    if (p.includes('MOTOS')) return 'Mecánica de Motos';
    if (p.includes('AUTOMOTORIZ')) return 'Mecánica Automotriz';
    if (p.includes('ELECTRONICA')) return 'Electricidad y Electrónica';
    if (p.includes('CARPINTERIA')) return 'Carpintería Metálica';
    return 'Sin Asignar (Pendiente)';
}

function mapearGrupo(carrera, turno) {
    const t = (turno || '').toUpperCase().trim();
    let turnoOficial = 'Turno Mañana';
    if (t.includes('TARDE')) turnoOficial = 'Turno Tarde';
    else if (t.includes('NOCHE')) turnoOficial = 'Turno Noche';
    else if (t.includes('VIRTUAL')) turnoOficial = 'Turno Virtual';
    else if (t.includes('SABADO')) turnoOficial = 'Turno Sábado';

    if (carrera === 'Computación e Informática') return `Computación e Informática - ${turnoOficial}`;
    if (carrera === 'Corte y Ensamblaje') return `Corte y Ensamblaje - ${turnoOficial}`;
    if (carrera === 'Peluquería y Barbería') return `Peluquería y Barbería - ${turnoOficial}`;
    if (carrera === 'Mecánica de Motos') return 'Mecánica de Motos - Turno Mañana';
    if (carrera === 'Mecánica Automotriz') return 'Mecánica Automotriz - Turno Tarde';
    if (carrera === 'Electricidad y Electrónica') return 'Electricidad y Electrónica - Turno Tarde';
    if (carrera === 'Carpintería Metálica') return 'Carpintería Metálica - Turno Tarde';
    return 'Sin Asignar (Pendiente)';
}

function obtenerEncargado(carrera) {
    if (carrera === 'Computación e Informática') return 'Magda Chura Coaquipa';
    if (carrera === 'Corte y Ensamblaje') return 'Eloy Valerio Paredes Feliciano';
    if (carrera === 'Peluquería y Barbería') return 'María Azucena Ccolla Villanueva';
    if (carrera === 'Mecánica de Motos') return 'Aníbal Bruno Maquera Gil';
    if (carrera === 'Mecánica Automotriz') return 'Aníbal Bruno Maquera Gil';
    if (carrera === 'Electricidad y Electrónica') return 'Teófilo Larico Canahuire';
    if (carrera === 'Carpintería Metálica') return 'Cesáreo Julio Ccosi Quenaya';
    return 'Eloy Valerio Paredes Feliciano';
}

function formatearNombre(raw) {
    if (!raw) return null;
    let r = raw.trim();
    if (r === 'ANULADO' || r === 'NO EXISTE BOLETA') return r;
    if (r.includes(',')) {
        const parts = r.split(',');
        const apellidos = parts[0].trim();
        const nombres = parts.slice(1).join(' ').trim();
        const cap = s => s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
        return `${cap(nombres)} ${cap(apellidos)}`;
    }
    return r;
}

function normalizar(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

// Iniciar transacción
db.exec('BEGIN TRANSACTION;');

try {
    // 1. Obtener movimientos existentes en DB indexados por comprobante
    const stmtCheck = db.prepare('SELECT id, comprobante FROM movimientos WHERE comprobante = ?');
    const stmtUpdate = db.prepare(`
        UPDATE movimientos SET
            fecha = ?,
            nombre = ?,
            carrera = ?,
            concepto = ?,
            monto = ?,
            monto_total = ?,
            monto_abonado = ?,
            metodo_pago = ?,
            notas = ?,
            grupo = ?,
            encargado = ?,
            dni = ?,
            turno = ?,
            estado = ?
        WHERE id = ?
    `);

    const stmtInsert = db.prepare(`
        INSERT INTO movimientos (
            fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado,
            metodo_pago, fecha_vencimiento, comprobante, notas, created_at, grupo, encargado, dni, turno
        ) VALUES (
            ?, 'Ingreso', ?, 'Estudiante', ?, ?, ?, ?, ?, ?,
            ?, NULL, ?, ?, datetime('now'), ?, ?, ?, ?
        )
    `);

    let actualizados = 0;
    let insertados = 0;
    let fechaNaCount = 0;

    for (const item of json) {
        const compStr = String(item.numero_recibo || '').trim().padStart(7, '0');
        const num = parseInt(compStr, 10);

        // Fecha: Si no tiene fecha, poner 'N/A'
        let fecha = (!item.fecha || String(item.fecha).trim() === '' || item.fecha === 'null') ? 'N/A' : String(item.fecha).trim();
        if (fecha === 'N/A') fechaNaCount++;

        // Nombre y Estado
        let nombre = formatearNombre(item.apellidos_nombres);
        let estado = 'Pagado';
        let monto = Number(item.monto || 0);

        if (!nombre || nombre === 'ANULADO' || nombre === 'NO EXISTE BOLETA' || num === 812) {
            estado = 'Anulado';
            monto = 0;
            if (!nombre) nombre = (num === 812 ? 'Sin Registro (En Blanco)' : 'ANULADO');
        }

        // Carrera, Grupo, Encargado
        const carrera = (estado === 'Anulado') ? 'Sin Asignar (Pendiente)' : mapearCarrera(item.programa_estudio);
        const turno = item.turno ? (item.turno.charAt(0).toUpperCase() + item.turno.slice(1).toLowerCase()) : 'Tarde';
        const grupo = (estado === 'Anulado') ? 'Sin Asignar (Pendiente)' : mapearGrupo(carrera, turno);
        const encargado = obtenerEncargado(carrera);

        // Concepto
        let concepto = 'Módulo I';
        const modRaw = (item.modulo || '').toUpperCase();
        if (modRaw.includes('TITULO') || (item.programa_estudio && item.programa_estudio.toUpperCase().includes('TITULACION'))) {
            concepto = 'Titulación';
        } else if (modRaw.includes('I-II') || modRaw.includes('1-2') || modRaw.includes('I Y II')) {
            concepto = 'Módulo I y Módulo 2';
        } else if (modRaw.includes('II') || modRaw.includes('2')) {
            concepto = 'Módulo II';
        }

        // Método de pago y Notas
        let metodoPago = 'Efectivo';
        const obs = item.observacion ? String(item.observacion).trim() : '';
        if (obs.toUpperCase().includes('YAPE')) metodoPago = 'Yape';
        else if (obs.toUpperCase().includes('TRANSF')) metodoPago = 'Transferencia';

        let notas = obs ? `${concepto} (${carrera}) - ${obs}` : `${concepto} (${carrera})`;
        const dni = item.dni ? String(item.dni).trim() : '';

        // Comprobar si ya existe
        const existing = stmtCheck.get(compStr);
        if (existing) {
            stmtUpdate.run(
                fecha, nombre, carrera, concepto, monto, monto, monto,
                metodoPago, notas, grupo, encargado, dni, turno, estado,
                existing.id
            );
            actualizados++;
        } else {
            stmtInsert.run(
                fecha, estado, nombre, carrera, concepto, monto, monto, monto,
                metodoPago, compStr, notas, grupo, encargado, dni, turno
            );
            insertados++;
        }
    }

    console.log(`✔ Movimientos procesados: ${actualizados} actualizados, ${insertados} nuevos insertados.`);
    console.log(`✔ Movimientos con fecha 'N/A': ${fechaNaCount}`);

    // 2. Sincronización y actualización del padrón de estudiantes
    const dbEsts = db.prepare('SELECT id, nombre, dni, carrera, grupo FROM estudiantes').all();
    const estMap = new Map();
    dbEsts.forEach(e => {
        estMap.set(normalizar(e.nombre), e);
        if (e.dni && e.dni.trim() !== '') estMap.set('dni_' + e.dni.trim(), e);
    });

    const stmtInsertEst = db.prepare(`
        INSERT INTO estudiantes (
            codigo, nombre, dni, carrera, grupo, turno, ciclo, telefono, email, estado_academico, notas
        ) VALUES (
            ?, ?, ?, ?, ?, ?, 'Ciclo I', ?, '', 'Matriculado', ''
        )
    `);

    const stmtUpdateEstContact = db.prepare(`
        UPDATE estudiantes SET
            dni = CASE WHEN (dni IS NULL OR dni = '') AND ? != '' THEN ? ELSE dni END,
            telefono = CASE WHEN (telefono IS NULL OR telefono = '') AND ? != '' THEN ? ELSE telefono END,
            carrera = CASE WHEN (carrera IS NULL OR carrera = '' OR carrera = 'Sin Asignar (Pendiente)') AND ? != 'Sin Asignar (Pendiente)' THEN ? ELSE carrera END,
            grupo = CASE WHEN (grupo IS NULL OR grupo = '' OR grupo = 'Sin Asignar (Pendiente)') AND ? != 'Sin Asignar (Pendiente)' THEN ? ELSE grupo END
        WHERE id = ?
    `);

    let maxEstNum = 0;
    db.prepare('SELECT codigo FROM estudiantes').all().forEach(r => {
        const m = (r.codigo || '').match(/EST-(\d+)/);
        if (m) {
            const num = parseInt(m[1], 10);
            if (num > maxEstNum) maxEstNum = num;
        }
    });

    let nuevosEstudiantes = 0;
    for (const item of json) {
        if (!item.apellidos_nombres || item.apellidos_nombres === 'ANULADO' || item.apellidos_nombres === 'NO EXISTE BOLETA') continue;
        const nombreFormateado = formatearNombre(item.apellidos_nombres);
        const normName = normalizar(item.apellidos_nombres);
        const normConv = normalizar(nombreFormateado);
        const dniVal = item.dni ? String(item.dni).trim() : '';
        const telVal = item.celular ? String(item.celular).trim() : '';
        const dniKey = dniVal ? 'dni_' + dniVal : null;

        let est = estMap.get(normName) || estMap.get(normConv);
        if (!est && dniKey) est = estMap.get(dniKey);

        const carVal = mapearCarrera(item.programa_estudio);
        const turnoVal = item.turno ? (item.turno.charAt(0).toUpperCase() + item.turno.slice(1).toLowerCase()) : 'Tarde';
        const grpVal = mapearGrupo(carVal, turnoVal);

        if (est) {
            // Actualizar datos de contacto si faltaban
            stmtUpdateEstContact.run(dniVal, dniVal, telVal, telVal, carVal, carVal, grpVal, grpVal, est.id);
        } else {
            maxEstNum++;
            const cod = `EST-${String(maxEstNum).padStart(3, '0')}`;
            const res = stmtInsertEst.run(cod, nombreFormateado, dniVal, carVal, grpVal, turnoVal, telVal);
            const nuevoObj = { id: res.lastInsertRowid, nombre: nombreFormateado, dni: dniVal, carrera: carVal, grupo: grpVal };
            estMap.set(normConv, nuevoObj);
            if (dniVal) estMap.set('dni_' + dniVal, nuevoObj);
            nuevosEstudiantes++;
        }
    }

    console.log(`✔ Estudiantes: ${nuevosEstudiantes} nuevos estudiantes agregados al padrón.`);

    db.exec('COMMIT;');
    console.log('✔ Transacción completada con éxito.');

} catch (err) {
    db.exec('ROLLBACK;');
    console.error('❌ Error en transacción, rollback ejecutado:', err);
    throw err;
} finally {
    db.close();
}
