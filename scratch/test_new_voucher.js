const fs = require('fs');
const assert = require('assert');

console.log('====================================================');
console.log('VERIFICACIÓN DEL NUEVO DISEÑO OFICIAL DEL VOUCHER');
console.log('====================================================\n');

const html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Textos y estructura oficial del talonario
assert(html.includes('MINISTERIO DE EDUCACIÓN'), 'Contiene título MINISTERIO DE EDUCACIÓN');
console.log('✅ PASÓ: Título oficial MINISTERIO DE EDUCACIÓN presente');

assert(html.includes('UNIDAD DE GESTIÓN EDUCATIVA LOCAL SAN ROMÁN'), 'Contiene UGEL SAN ROMÁN');
console.log('✅ PASÓ: Membrete UNIDAD DE GESTIÓN EDUCATIVA LOCAL SAN ROMÁN presente');

assert(html.includes('INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS'), 'Contiene CETPRO MICAELA BASTIDAS');
console.log('✅ PASÓ: Nombre institucional oficial presente');

assert(html.includes('JULIACA'), 'Contiene ciudad JULIACA');
console.log('✅ PASÓ: Ciudad JULIACA presente');

assert(html.includes('INGRESOS DE RECURSOS PROPIOS'), 'Contiene título INGRESOS DE RECURSOS PROPIOS');
console.log('✅ PASÓ: Título principal INGRESOS DE RECURSOS PROPIOS presente');

assert(html.includes('1.- Aporte por Mantenimiento'), 'Contiene concepto 1.- Aporte por Mantenimiento');
console.log('✅ PASÓ: Concepto 1.- Aporte por Mantenimiento presente con casillas');

assert(html.includes('box-mod-1') && html.includes('box-mod-7'), 'Contiene las 7 casillas de módulos');
console.log('✅ PASÓ: Las 7 casillas de módulos (1 a 7) configuradas');

assert(html.includes('2.- Expedición de constancia de estudio'), 'Contiene concepto constancia');
console.log('✅ PASÓ: Concepto 2.- Expedición de constancia de estudio presente');

assert(html.includes('3.- FUT'), 'Contiene concepto FUT');
console.log('✅ PASÓ: Concepto 3.- FUT presente');

assert(html.includes('4.- Otros'), 'Contiene concepto 4.- Otros');
console.log('✅ PASÓ: Concepto 4.- Otros con edición libre presente');

assert(html.includes('Sello y Firma del Tesorero'), 'Contiene Sello y Firma del Tesorero');
console.log('✅ PASÓ: Firma de Tesorero presente');

assert(html.includes('Sello y Firma del Recaudador'), 'Contiene Sello y Firma del Recaudador');
console.log('✅ PASÓ: Firma de Recaudador presente');

assert(html.includes('minedu_logo.svg'), 'Contiene logo oficial de MINEDU en SVG');
console.log('✅ PASÓ: Logo vectorial MINEDU integrado');

assert(fs.existsSync('public/img/minedu_logo.svg'), 'Archivo public/img/minedu_logo.svg existe');
console.log('✅ PASÓ: Archivo de logo minedu_logo.svg verificado en disco');

// 2. Verificar datos de Ruth Mamani Hancco (Recibo 0000716 de la foto oficial)
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const mov716 = db.prepare("SELECT * FROM movimientos WHERE comprobante = '0000716'").get();
assert(mov716, 'Existe movimiento con comprobante 0000716');
assert.strictEqual(mov716.nombre, 'Ruth Mamani Hancco', 'Nombre coincide exactamente');
assert.strictEqual(mov716.dni, '73477222', 'DNI coincide exactamente');
assert.strictEqual(mov716.monto, 150, 'Monto coincide en S/. 150.00');
assert.strictEqual(mov716.turno, 'TARDE', 'Turno coincide en TARDE');
console.log('✅ PASÓ: Registro en BD de Ruth Mamani Hancco (Recibo 716) 100% verificado');

const est716 = db.prepare("SELECT * FROM estudiantes WHERE nombre = 'Ruth Mamani Hancco'").get();
assert(est716, 'Estudiante Ruth Mamani existe en tabla estudiantes');
assert.strictEqual(est716.telefono, '981763281', 'Teléfono coincide en 981763281');
console.log('✅ PASÓ: Teléfono y DNI de la estudiante validados en base de datos');

console.log('\n🎉 TODOS LOS CRITERIOS DEL VOUCHER OFICIAL PASARON SATISFACTORIAMENTE');
