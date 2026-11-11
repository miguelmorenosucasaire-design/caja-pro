const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', 'caja_institucional.db');
const db = new DatabaseSync(DB_PATH);

// 1. Cargar recibos reales corregidos
const recibos = JSON.parse(fs.readFileSync(path.join(__dirname, 'recibos_reales.json'), 'utf8'));

// 2. Extraer estudiantes únicos y asociarlos a grupos de forma equilibrada
const gruposInfo = [
    { cod: 'G01', nombre: 'Computación e Informática - Grupo A', carrera: 'Computación e Informática', docente: 'Rosa Elena Quispe Huamán' },
    { cod: 'G02', nombre: 'Electricidad Domiciliaria - Grupo A', carrera: 'Electricidad Domiciliaria', docente: 'Carlos Alberto Mendoza Ríos' },
    { cod: 'G03', nombre: 'Cosmetología - Grupo A', carrera: 'Cosmetología', docente: 'Lucía Fernanda Paredes Soto' },
    { cod: 'G04', nombre: 'Gastronomía y Repostería - Grupo A', carrera: 'Gastronomía y Repostería', docente: 'Marleny Huaylla Condori' },
    { cod: 'G05', nombre: 'Corte y Confección - Grupo A', carrera: 'Corte y Confección', docente: 'Teresa Aguilar Gómez' },
    { cod: 'G06', nombre: 'Mecánica Automotriz - Grupo A', carrera: 'Mecánica Automotriz', docente: 'Miguel Ángel Torres Cárdenas' }
];

const nombresUnicos = [...new Set(recibos.map(r => r.nombre.trim()))];
console.log(`Estudiantes únicos encontrados: ${nombresUnicos.length}`);

const estudiantesMap = {};
nombresUnicos.forEach((nombre, idx) => {
    const codNum = String(idx + 1).padStart(3, '0');
    const codigo = `E${codNum}`;
    const grp = gruposInfo[idx % gruposInfo.length];
    
    // Buscar primer recibo para fecha de matrícula
    const primerRecibo = recibos.find(r => r.nombre.trim() === nombre);
    
    estudiantesMap[nombre] = {
        codigo,
        nombre,
        carrera: grp.carrera,
        grupo: grp.nombre,
        encargado: grp.docente,
        fechaMatricula: primerRecibo ? primerRecibo.fecha : '2026-03-01'
    };
});

// 3. Limpiar tablas en SQLite
console.log('Limpiando tablas antiguas...');
db.exec("DELETE FROM abonos");
db.exec("DELETE FROM movimientos");
db.exec("DELETE FROM estudiantes");
db.exec("DELETE FROM grupos");
db.exec("DELETE FROM docentes");

// 4. Insertar Docentes Oficiales
console.log('Insertando docentes oficiales...');
const insertDoc = db.prepare(`
    INSERT INTO docentes (nombre, carrera, email, telefono, especialidad, tipo_contrato)
    VALUES (?, ?, ?, ?, ?, ?)
`);

const docentesData = [
    ['Rosa Elena Quispe Huamán', 'Computación e Informática', 'rosa.quispe@cetpro.edu.pe', '999-100-001', 'Computación e Informática', 'Tiempo Completo'],
    ['Carlos Alberto Mendoza Ríos', 'Electricidad Domiciliaria', 'carlos.mendoza@cetpro.edu.pe', '999-100-002', 'Electricidad Domiciliaria', 'Tiempo Completo'],
    ['Lucía Fernanda Paredes Soto', 'Cosmetología', 'lucia.paredes@cetpro.edu.pe', '999-100-003', 'Cosmetología y Estética', 'Tiempo Completo'],
    ['Marleny Huaylla Condori', 'Gastronomía y Repostería', 'marleny.huaylla@cetpro.edu.pe', '999-100-004', 'Gastronomía y Repostería', 'Tiempo Completo'],
    ['Teresa Aguilar Gómez', 'Corte y Confección', 'teresa.aguilar@cetpro.edu.pe', '999-100-005', 'Corte, Confección y Patronaje', 'Tiempo Completo'],
    ['Miguel Ángel Torres Cárdenas', 'Mecánica Automotriz', 'miguel.torres@cetpro.edu.pe', '999-100-006', 'Mecánica y Motores', 'Tiempo Completo']
];

for (const d of docentesData) {
    insertDoc.run(...d);
}

// 5. Insertar Grupos Oficiales
console.log('Insertando grupos oficiales...');
const insertGrp = db.prepare(`
    INSERT INTO grupos (nombre, carrera, encargado, turno, horario, aula_taller, descripcion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const gruposData = [
    ['Computación e Informática - Grupo A', 'Computación e Informática', 'Rosa Elena Quispe Huamán', 'Mañana', 'Lun-Mié-Vie 8:00-10:00', 'Laboratorio 1', 'Módulo: Operación de Computadoras y Redes'],
    ['Electricidad Domiciliaria - Grupo A', 'Electricidad Domiciliaria', 'Carlos Alberto Mendoza Ríos', 'Tarde', 'Mar-Jue 15:00-18:00', 'Taller 1', 'Módulo: Instalaciones Eléctricas Domiciliarias'],
    ['Cosmetología - Grupo A', 'Cosmetología', 'Lucía Fernanda Paredes Soto', 'Mañana', 'Lun-Mié-Vie 9:00-12:00', 'Aula 3', 'Módulo: Tratamiento Capilar y Tinturación'],
    ['Gastronomía y Repostería - Grupo A', 'Gastronomía y Repostería', 'Marleny Huaylla Condori', 'Tarde', 'Mar-Jue 14:00-17:00', 'Cocina', 'Módulo: Elaboración de Menús y Pastelería'],
    ['Corte y Confección - Grupo A', 'Corte y Confección', 'Teresa Aguilar Gómez', 'Tarde', 'Lun-Mié-Vie 14:00-17:00', 'Aula 2', 'Módulo: Confección de Prendas de Vestir'],
    ['Mecánica Automotriz - Grupo A', 'Mecánica Automotriz', 'Miguel Ángel Torres Cárdenas', 'Mañana', 'Sáb 8:00-13:00', 'Taller 2', 'Módulo: Mantenimiento y Diagnóstico Automotriz']
];

for (const g of gruposData) {
    insertGrp.run(...g);
}

// 6. Insertar Estudiantes Reales
console.log('Insertando estudiantes reales...');
const insertEst = db.prepare(`
    INSERT INTO estudiantes (codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo)
    VALUES (?, ?, ?, 'Ciclo I', ?, ?, 'Activo', ?)
`);

for (const nombre of nombresUnicos) {
    const est = estudiantesMap[nombre];
    const email = `${est.codigo.toLowerCase()}@cetpro.edu.pe`;
    const tel = `9${Math.floor(10000000 + Math.random() * 89999999)}`;
    insertEst.run(est.codigo, est.nombre, est.carrera, email, tel, est.grupo);
}

// 7. Insertar Movimientos Reales (Ingresos)
console.log('Insertando movimientos reales...');
const insertMov = db.prepare(`
    INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, comprobante, notas, grupo, encargado)
    VALUES (?, 'Ingreso', 'Pagado', 'Estudiante', ?, ?, ?, ?, ?, ?, 'Efectivo', ?, ?, ?, ?)
`);

let totalSuma = 0;
for (const r of recibos) {
    const nombre = r.nombre.trim();
    const est = estudiantesMap[nombre];
    const nota = `Recibo Oficial de Caja N° ${r.num} - Mes de ${r.mes} 2026`;
    
    insertMov.run(
        r.fecha,
        est.nombre,
        est.carrera,
        r.concepto,
        r.monto,
        r.monto,
        r.monto,
        r.num,
        nota,
        est.grupo,
        est.encargado
    );
    totalSuma += r.monto;
}

console.log(`Inserción completada exitosamente.`);
console.log(`Total Movimientos insertados: ${recibos.length}`);
console.log(`Monto total ingresado: S/. ${totalSuma.toFixed(2)}`);

// Guardar mapeo de estudiantes para sincronización con Excel
fs.writeFileSync(path.join(__dirname, 'estudiantes_map.json'), JSON.stringify(estudiantesMap, null, 2));
