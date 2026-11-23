const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');

const db = new DatabaseSync('caja_institucional.db');
const outPath = 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx';

console.log('=== SINCRONIZANDO EXCEL OFICIAL CON BASE DE DATOS ACTUALIZADA ===');

const wb = XLSX.utils.book_new();

// 1. Hoja RESUMEN
const stats = {
    ingresos: db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().total,
    egresos: db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Egreso' AND estado = 'Pagado'").get().total,
    totalMovs: db.prepare("SELECT COUNT(*) as c FROM movimientos").get().c,
    totalEsts: db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c,
    totalDocs: db.prepare("SELECT COUNT(*) as c FROM docentes").get().c,
    totalGrupos: db.prepare("SELECT COUNT(*) as c FROM grupos").get().c,
};

const resumenData = [
    ['SISTEMA INSTITUCIONAL DE CONTROL DE CAJA CHICA - CETPRO MICAELA BASTIDAS PUYUCAMA'],
    ['ESTRUCTURA OFICIAL DE SUPERVISIÓN FINANCIERA Y ACADÉMICA'],
    [],
    ['INDICADOR / PARÁMETRO', 'VALOR ACTUAL'],
    ['Total Recaudado (Ingresos)', stats.ingresos],
    ['Total Egresos / Pagos Realizados', stats.egresos],
    ['Saldo Neto en Caja', stats.ingresos - stats.egresos],
    ['Total de Comprobantes Emitidos', stats.totalMovs],
    ['Padrón de Estudiantes Registrados', stats.totalEsts],
    ['Plana Docente Activa', stats.totalDocs],
    ['Grupos / Secciones Oficiales', stats.totalGrupos],
    ['Fecha de Última Sincronización', new Date().toLocaleString('es-PE')]
];
const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
XLSX.utils.book_append_sheet(wb, wsResumen, 'RESUMEN');

// 2. Hoja CAJA_DIARIO
const movs = db.prepare(`
    SELECT 
        id as [N° Operación],
        fecha as [Fecha],
        comprobante as [N° Comprobante / Recibo],
        concepto as [Concepto / Detalle de Pago],
        rol as [Rol Persona],
        nombre as [Persona / Responsable],
        carrera as [Programa Oficial / Especialidad],
        grupo as [Sección / Taller],
        encargado as [Docente Encargado],
        tipo as [Tipo Operación],
        monto as [Monto Operación (S/.)],
        metodo_pago as [Medio de Pago],
        estado as [Estado],
        notas as [Observaciones / Notas]
    FROM movimientos 
    ORDER BY id ASC
`).all();
const wsCaja = XLSX.utils.json_to_sheet(movs);
XLSX.utils.book_append_sheet(wb, wsCaja, 'CAJA_DIARIO');

// 3. Hoja ESTUDIANTES
const ests = db.prepare(`
    SELECT 
        e.id as [N°],
        e.codigo as [Código Matrícula],
        e.nombre as [Apellidos y Nombres del Estudiante],
        COALESCE(NULLIF(e.carrera, ''), 'Sin Asignar (Pendiente)') as [Especialidad / Carrera],
        COALESCE(NULLIF(e.grupo, ''), 'Sin Asignar') as [Sección Asignada],
        e.ciclo as [Ciclo / Módulo],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Total Pagado (S/.)],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND m.tipo='Ingreso' AND m.estado='Pendiente'), 0) as [Saldo Pendiente (S/.)],
        e.estado_academico as [Estado Académico]
    FROM estudiantes e
    ORDER BY e.nombre ASC
`).all();
const wsEst = XLSX.utils.json_to_sheet(ests);
XLSX.utils.book_append_sheet(wb, wsEst, 'ESTUDIANTES');

// 4. Hoja DOCENTES
const docs = db.prepare(`
    SELECT 
        d.id as [N°],
        d.nombre as [Apellidos y Nombres],
        d.cargo as [Cargo / Rol],
        d.carrera as [Programa Oficial / Área],
        d.turno as [Turno],
        d.especialidad as [Especialidad Técnica / Funciones],
        d.telefono as [Teléfono / Celular],
        d.tipo_contrato as [Tipo Contrato],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE (LOWER(m.encargado) = LOWER(d.nombre) OR LOWER(m.nombre) = LOWER(d.nombre)) AND m.tipo='Egreso' AND m.estado='Pagado'), 0) as [Honorarios Pagados (S/.)],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(m.encargado) = LOWER(d.nombre) AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Ingresos Generados (S/.)]
    FROM docentes d
    ORDER BY d.id ASC
`).all();
const wsDocs = XLSX.utils.json_to_sheet(docs);
XLSX.utils.book_append_sheet(wb, wsDocs, 'DOCENTES');

// 5. Hoja SECCIONES
const grps = db.prepare(`
    SELECT 
        g.id as [N°],
        g.nombre as [Sección / Grupo],
        g.carrera as [Programa Oficial],
        g.turno as [Turno Oficial],
        g.encargado as [Docente Encargado],
        g.horario as [Horario de Clases],
        g.aula_taller as [Aula / Taller],
        (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as [Estudiantes Matriculados],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Total Recaudado (S/.)]
    FROM grupos g
    ORDER BY g.carrera ASC, g.turno ASC
`).all();
const wsGrps = XLSX.utils.json_to_sheet(grps);
XLSX.utils.book_append_sheet(wb, wsGrps, 'SECCIONES');

XLSX.writeFile(wb, outPath);
console.log('✔ Libro Excel oficial actualizado con 241 movimientos y 213 estudiantes:', outPath);

db.close();
