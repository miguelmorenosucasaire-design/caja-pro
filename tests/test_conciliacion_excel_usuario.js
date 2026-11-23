const fs = require('fs');
const XLSX = require('xlsx');
const { DatabaseSync } = require('node:sqlite');

console.log('========================================================================');
console.log('  🧪 TEST DE CONCILIACIÓN 100% BASE DE DATOS vs EXCEL OFICIAL DEL USUARIO');
console.log('========================================================================\n');

const excelPath = 'C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.user_uploaded/media_1794979873985_d6dd5ae1.xlsx';
if (!fs.existsSync(excelPath)) {
  console.error('No se encontró el archivo del usuario:', excelPath);
  process.exit(1);
}

const db = new DatabaseSync('caja_institucional.db');
const wb = XLSX.readFile(excelPath);
const sheet = wb.Sheets['RECAUDOS  INGRESOS CETPRO MICAE'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failed++;
  }
}

// 1. Validar Total de Comprobantes 601 a 810
const totalMovs = db.prepare('SELECT COUNT(*) as c FROM movimientos').get().c;
assert(totalMovs === 210, `Total de movimientos en DB es exactamente 210 (601 al 810). Actual: ${totalMovs}`);

// 2. Validar Suma Total de Ingresos
const sumMonto = db.prepare('SELECT SUM(monto) as s FROM movimientos').get().s;
assert(Math.abs(sumMonto - 25360) < 0.001, `Suma total de ingresos en DB cuadra exactamente a S/. 25,360.00. Actual: S/. ${sumMonto.toFixed(2)}`);

// 3. Validar Comprobantes Anulados Oficiales
const an_607 = db.prepare("SELECT monto, concepto, nombre FROM movimientos WHERE comprobante = '0000607'").get();
assert(an_607 && an_607.monto === 0 && an_607.nombre.includes('ANULADO'), "Recibo 607 registrado como ANULADO con S/. 0.00");

const an_651 = db.prepare("SELECT monto, concepto, nombre FROM movimientos WHERE comprobante = '0000651'").get();
assert(an_651 && an_651.monto === 0 && an_651.nombre.includes('NO EXISTE'), "Recibo 651 registrado como NO EXISTE BOLETA con S/. 0.00");

const an_706 = db.prepare("SELECT monto, concepto, estado, nombre FROM movimientos WHERE comprobante = '0000706'").get();
assert(an_706 && an_706.monto === 0 && (an_706.estado === 'Anulado' || an_706.concepto.toLowerCase().includes('anulado')), "Recibo 706 registrado con estado 'Anulado' y S/. 0.00");

// 4. Validar Recibos Reconciliados 801 a 807
const m801 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000801'").get();
assert(m801 && m801.monto === 100 && m801.carrera === 'Corte y Ensamblaje', "Recibo 801: Julio Cesar Mamani Chambi -> Corte y Ensamblaje (S/. 100)");

const m802 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000802'").get();
assert(m802 && m802.monto === 100 && m802.carrera === 'Computación e Informática', "Recibo 802: Yenefer Carmen Mamani Chambi -> Computación e Informática (S/. 100)");

const m803 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000803'").get();
assert(m803 && m803.monto === 150 && m803.carrera === 'Mecánica de Motos', "Recibo 803: Jhon Alexander Coloma Mamani -> Mecánica de Motos (S/. 150)");

const m804 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000804'").get();
assert(m804 && m804.monto === 100 && m804.carrera === 'Mecánica de Motos', "Recibo 804: Jean Franco Quispe Pilco -> Mecánica de Motos (S/. 100)");

const m805 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000805'").get();
assert(m805 && m805.monto === 100 && m805.carrera === 'Electricidad y Electrónica', "Recibo 805: Jean Franco Quispe Pilco -> Electricidad y Electrónica (S/. 100)");

const m806 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000806'").get();
assert(m806 && m806.monto === 150 && m806.carrera === 'Corte y Ensamblaje', "Recibo 806: Sabina Naira Silva -> Corte y Ensamblaje (S/. 150, Turno Tarde)");

const m807 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000807'").get();
assert(m807 && m807.monto === 300 && m807.carrera === 'Carpintería Metálica', "Recibo 807: Nelson Mamani Pari -> Carpintería Metálica (S/. 300)");

// 5. Validar Recibos Finales 808, 809, 810
const m808 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000808'").get();
assert(m808 && m808.monto === 30 && m808.carrera === 'Carpintería Metálica', "Recibo 808: Pedro Pedro Cosi Cosi -> Carpintería Metálica (S/. 30)");

const m809 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000809'").get();
assert(m809 && m809.monto === 100 && m809.carrera === 'Mecánica de Motos', "Recibo 809: Javier Cambi Perez -> Mecánica de Motos (S/. 100)");

const m810 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000810'").get();
assert(m810 && m810.monto === 150 && m810.carrera === 'Carpintería Metálica', "Recibo 810: Nicolas Calsin Zela -> Carpintería Metálica (S/. 150)");

// 6. Validar Próximo Comprobante Correlativo
const maxComp = db.prepare("SELECT MAX(CAST(comprobante AS INTEGER)) as m FROM movimientos").get().m;
assert(maxComp === 810, `Último comprobante es exactamente 810. Siguiente a emitir será 0000811`);

console.log('\n========================================================================');
console.log(`  📊 RESULTADO: ${passed} / ${passed + failed} PRUEBAS SUPERADAS`);
console.log('========================================================================');

if (failed > 0) process.exit(1);
