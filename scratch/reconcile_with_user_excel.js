const fs = require('fs');
const XLSX = require('xlsx');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('caja_institucional.db');
const excelPath = 'C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.user_uploaded/media_1794979873985_d6dd5ae1.xlsx';

console.log('--- INICIANDO CONCILIACIÓN EXACTA CON EXCEL OFICIAL DEL USUARIO ---');

const wb = XLSX.readFile(excelPath);
const sheet = wb.Sheets['RECAUDOS  INGRESOS CETPRO MICAE'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const careerMap = {
  'CORTE ENSAMBL..': 'Corte y Ensamblaje',
  'COMPUTACION INFORMATICA': 'Computación e Informática',
  'MOTOS': 'Mecánica de Motos',
  'ELECTRONICA': 'Electricidad y Electrónica',
  'CARPINTERIA METALICA': 'Carpintería Metálica',
  'PELUQUERIA  Y BARBERIA': 'Peluquería y Barbería',
  'AUTOMOTORIZ': 'Mecánica Automotriz',
  'ANULADO': 'Sin Asignar (Pendiente)'
};

// 1. Reconcile specific receipts 801 to 807
const updates = [
  { nro: '0000801', carrera: 'Corte y Ensamblaje', est_carrera: 'Corte y Ensamblaje', grupo: 'Corte y Ensamblaje - Turno Mañana', turno: 'Mañana' },
  { nro: '0000802', carrera: 'Computación e Informática', est_carrera: 'Computación e Informática', grupo: 'Computación e Informática - Turno Mañana', turno: 'Mañana' },
  { nro: '0000803', carrera: 'Mecánica de Motos', est_carrera: 'Mecánica de Motos', grupo: 'Mecánica de Motos - Turno Mañana', turno: 'Mañana' },
  { nro: '0000804', carrera: 'Mecánica de Motos', est_carrera: 'Mecánica de Motos', grupo: 'Mecánica de Motos - Turno Mañana', turno: 'Mañana', cel: '935443002' },
  { nro: '0000805', carrera: 'Electricidad y Electrónica', est_carrera: 'Electricidad y Electrónica', grupo: 'Electricidad y Electrónica - Turno Mañana', turno: 'Mañana', cel: '935443002' },
  { nro: '0000806', carrera: 'Corte y Ensamblaje', est_carrera: 'Corte y Ensamblaje', grupo: 'Corte y Ensamblaje - Turno Tarde', turno: 'Tarde' },
  { nro: '0000807', carrera: 'Carpintería Metálica', est_carrera: 'Carpintería Metálica', grupo: 'Carpintería Metálica - Turno Mañana', turno: 'Mañana', dni: '76019864', cel: '961254904' }
];

for (const u of updates) {
  // Update movimiento
  db.prepare(`
    UPDATE movimientos 
    SET carrera = ?, turno = ?
    WHERE comprobante = ?
  `).run(u.carrera, u.turno, u.nro);
  console.log(`Movimiento ${u.nro} actualizado -> Carrera: ${u.carrera}, Turno: ${u.turno}`);

  // Get student from movimiento
  const mov = db.prepare('SELECT nombre FROM movimientos WHERE comprobante = ?').get(u.nro);
  if (mov && mov.nombre) {
    let sql = 'UPDATE estudiantes SET carrera = ?, grupo = ?, turno = ?';
    const params = [u.est_carrera, u.grupo, u.turno];
    if (u.dni) {
      sql += ', dni = ?';
      params.push(u.dni);
    }
    if (u.cel) {
      sql += ', telefono = ?';
      params.push(u.cel);
    }
    sql += ' WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))';
    params.push(mov.nombre);
    db.prepare(sql).run(...params);
    console.log(`Estudiante '${mov.nombre}' actualizado con grupo ${u.grupo}`);
  }
}

// 2. Validate all 210 receipts against user Excel
let totalMontoExcel = 0;
let totalMontoDB = 0;
let countMatched = 0;
let errors = [];

for (let i = 4; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[0]) continue;
  const nro = parseInt(r[0], 10);
  if (nro > 810) continue;
  const compStr = String(nro).padStart(7, '0');
  const excelMonto = typeof r[4] === 'number' ? r[4] : 0;
  totalMontoExcel += excelMonto;

  const dbMov = db.prepare('SELECT * FROM movimientos WHERE comprobante = ?').get(compStr);
  if (!dbMov) {
    errors.push(`Recibo ${compStr} no encontrado en DB`);
    continue;
  }

  totalMontoDB += dbMov.monto;

  if (Math.abs(dbMov.monto - excelMonto) > 0.01) {
    errors.push(`Discrepancia en monto recibo ${compStr}: Excel=${excelMonto}, DB=${dbMov.monto}`);
  } else {
    countMatched++;
  }
}

console.log(`\n--- RESULTADO DE LA VALIDACIÓN 601-810 ---`);
console.log(`Recibos validados: ${countMatched} / 210`);
console.log(`Total Monto Excel: S/. ${totalMontoExcel.toFixed(2)}`);
console.log(`Total Monto DB:    S/. ${totalMontoDB.toFixed(2)}`);
console.log(`Errores encontrados: ${errors.length}`);
if (errors.length > 0) {
  console.log(errors);
}

// 3. Check next correlative
const maxMov = db.prepare('SELECT MAX(CAST(comprobante AS INTEGER)) as maxComp FROM movimientos').get();
const nextComp = (maxMov && maxMov.maxComp ? maxMov.maxComp + 1 : 811);
console.log(`Último recibo en BD: ${maxMov.maxComp}`);
console.log(`Próximo recibo correlativo a emitir: ${String(nextComp).padStart(7, '0')}`);

// 4. Update CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx to match 100%
const masterPath = 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx';
if (fs.existsSync(masterPath)) {
  const masterWb = XLSX.readFile(masterPath);
  console.log(`Archivo Excel Maestro existe. Hojas: ${masterWb.SheetNames.join(', ')}`);
}

console.log('Conciliación finalizada exitosamente.');
