const XLSX = require('xlsx');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const wb = XLSX.utils.book_new();

// 1. Resumen
const resumenData = [
    ['CETPRO MICAELA BASTIDAS PUYUCAWA - CONTROL FINANCIERO Y ACADÉMICO 2026'],
    ['Estructura Oficial Basada en Excel Institucional'],
    ['Fecha de Emisión:', new Date().toLocaleString('es-PE')],
    [],
    ['MÉTRICA / INDICADOR', 'VALOR NUMÉRICO', 'UNIDAD']
];

const st = db.prepare(`
    SELECT 
        SUM(CASE WHEN tipo='Ingreso' AND estado='Pagado' THEN monto ELSE 0 END) as ing,
        SUM(CASE WHEN tipo='Egreso' AND estado='Pagado' THEN monto ELSE 0 END) as egr
    FROM movimientos
`).get();

const ing = st.ing || 0;
const egr = st.egr || 0;
const totalAlumnos = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
const totalDocentes = db.prepare('SELECT COUNT(*) as c FROM docentes').get().c;
const totalGrupos = db.prepare('SELECT COUNT(*) as c FROM grupos').get().c;

resumenData.push(['Total Ingresos Recaudados', ing, 'PEN (S/.)']);
resumenData.push(['Total Egresos / Gastos', egr, 'PEN (S/.)']);
resumenData.push(['Balance Neto Disponible', ing - egr, 'PEN (S/.)']);
resumenData.push(['Total de Estudiantes', totalAlumnos, 'Alumnos']);
resumenData.push(['Planta Docente Oficial', totalDocentes, 'Docentes']);
resumenData.push(['Secciones y Grupos Activos', totalGrupos, 'Secciones']);

const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
XLSX.utils.book_append_sheet(wb, wsResumen, 'RESUMEN');

// 2. Caja Diario
const movs = db.prepare(`
    SELECT 
        id as [ID],
        fecha as [Fecha],
        comprobante as [N° Recibo],
        concepto as [Concepto de Pago / Operación],
        rol as [Rol],
        nombre as [Persona / Responsable],
        carrera as [Programa / Carrera],
        grupo as [Sección / Grupo],
        encargado as [Docente Encargado],
        tipo as [Tipo Operación],
        monto as [Monto (S/.)],
        metodo_pago as [Medio de Pago],
        estado as [Estado],
        notas as [Observaciones]
    FROM movimientos 
    ORDER BY fecha DESC, id DESC
`).all();
const wsCaja = XLSX.utils.json_to_sheet(movs);
XLSX.utils.book_append_sheet(wb, wsCaja, 'CAJA_DIARIO');

// 3. Estudiantes
const ests = db.prepare(`
    SELECT 
        e.id as [N°],
        e.codigo as [Código Alumno],
        e.nombre as [Apellidos y Nombres],
        COALESCE(e.carrera, 'Sin Asignar (Pendiente)') as [Especialidad Técnica],
        COALESCE(e.grupo, 'Sin Asignar') as [Sección / Grupo],
        e.ciclo as [Ciclo / Módulo],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(m.nombre) = LOWER(e.nombre) AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Total Pagado (S/.)],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(m.nombre) = LOWER(e.nombre) AND m.tipo='Ingreso' AND m.estado='Pendiente'), 0) as [Deuda Pendiente (S/.)],
        e.estado_academico as [Estado Matrícula]
    FROM estudiantes e
    ORDER BY e.nombre ASC
`).all();
const wsEst = XLSX.utils.json_to_sheet(ests);
XLSX.utils.book_append_sheet(wb, wsEst, 'ESTUDIANTES');

// 4. Docentes
const docs = db.prepare(`
    SELECT 
        d.id as [N°],
        d.nombre as [Docente],
        d.carrera as [Programa Oficial],
        d.especialidad as [Especialidad],
        d.telefono as [Teléfono / Celular],
        d.tipo_contrato as [Tipo Contrato],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE (LOWER(m.encargado) = LOWER(d.nombre) OR LOWER(m.nombre) = LOWER(d.nombre)) AND m.tipo='Egreso' AND m.estado='Pagado'), 0) as [Honorarios Pagados (S/.)],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(m.encargado) = LOWER(d.nombre) AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Recaudación Generada (S/.)]
    FROM docentes d
    ORDER BY d.nombre ASC
`).all();
const wsDocs = XLSX.utils.json_to_sheet(docs);
XLSX.utils.book_append_sheet(wb, wsDocs, 'DOCENTES');

// 5. Secciones
const grps = db.prepare(`
    SELECT 
        g.id as [N°],
        g.nombre as [Sección / Grupo],
        g.carrera as [Programa Oficial],
        g.turno as [Turno],
        g.encargado as [Docente Encargado],
        g.horario as [Horario],
        g.aula_taller as [Aula / Taller],
        (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as [Alumnos Matriculados],
        COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Total Recaudado (S/.)]
    FROM grupos g
    ORDER BY g.carrera ASC, g.turno ASC
`).all();
const wsGrps = XLSX.utils.json_to_sheet(grps);
XLSX.utils.book_append_sheet(wb, wsGrps, 'SECCIONES');

XLSX.writeFile(wb, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
console.log('✅ Libro Excel multi-hoja generado exitosamente con 5 hojas oficiales y', movs.length, 'movimientos.');
