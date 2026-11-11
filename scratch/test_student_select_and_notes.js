const http = require('http');
const assert = require('assert');
const { DatabaseSync } = require('node:sqlite');

console.log('====================================================');
console.log('TEST: SELECTOR DE ESTUDIANTES Y EDICIÓN DE NOTAS EN FACTURA');
console.log('====================================================\n');

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:5000${path}`, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

function post(path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request(`http://127.0.0.1:5000${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runTests() {
    // 1. Verificar HTML de la página principal
    const home = await get('/');
    assert.strictEqual(home.status, 200, 'Home responde 200');
    assert(home.body.includes('id="factura-estudiante-select"'), 'Existe selector de estudiantes en factura');
    console.log('✅ PASÓ: Selector de estudiantes (factura-estudiante-select) presente');

    assert(home.body.includes('id="factura-recibo-select"'), 'Existe selector de recibos');
    console.log('✅ PASÓ: Selector de recibos presente');

    assert(home.body.includes('id="factura-notas-input"'), 'Existe campo de notas integrado (factura-notas-input)');
    console.log('✅ PASÓ: Área de edición de notas ahí mismo presente');

    assert(home.body.includes('id="btn-guardar-notas"'), 'Existe botón guardar notas');
    console.log('✅ PASÓ: Botón Guardar Notas en Factura presente');

    assert(home.body.includes('insertarNotaRapida'), 'Existen botones de inserción rápida');
    console.log('✅ PASÓ: Botones de inserción rápida de notas presentes');

    assert(home.body.includes('id="lista-recibos-estudiante-mini"'), 'Existe lista de recibos del estudiante');
    console.log('✅ PASÓ: Panel de historial de recibos del estudiante presente');

    // 2. Probar endpoint de guardar notas para un movimiento
    const testNotaMov = 'Módulo I (Corte y Ensamblaje) - Verificado en Secretaría';
    const resMov = await post('/api/movimientos/621/notas', { notas: testNotaMov });
    assert.strictEqual(resMov.status, 200, 'Endpoint /api/movimientos/621/notas responde 200');
    assert.strictEqual(resMov.body.success, true, 'success es true');
    console.log('✅ PASÓ: Endpoint POST /api/movimientos/621/notas ejecutado exitosamente');

    // Verificar en SQLite
    const db = new DatabaseSync('caja_institucional.db');
    const movRow = db.prepare('SELECT notas FROM movimientos WHERE id = 621').get();
    assert.strictEqual(movRow.notas, testNotaMov, 'Nota persistida en BD movimientos');
    console.log('✅ PASÓ: Nota guardada y verificada en tabla movimientos');

    // 3. Probar endpoint de guardar notas para un estudiante
    const testNotaEst = 'Estudiante regular activo en ciclo I';
    const resEst = await post('/api/estudiantes/439/notas', { notas: testNotaEst });
    assert.strictEqual(resEst.status, 200, 'Endpoint /api/estudiantes/439/notas responde 200');
    assert.strictEqual(resEst.body.success, true, 'success es true');
    console.log('✅ PASÓ: Endpoint POST /api/estudiantes/439/notas ejecutado exitosamente');

    const estRow = db.prepare('SELECT notas FROM estudiantes WHERE id = 439').get();
    assert.strictEqual(estRow.notas, testNotaEst, 'Nota persistida en BD estudiantes');
    console.log('✅ PASÓ: Nota guardada y verificada en tabla estudiantes');

    // 4. Verificar que GET /api/estudiantes devuelve el campo notas
    const rEstudiantes = await get('/api/estudiantes');
    const listEst = JSON.parse(rEstudiantes.body);
    const ruth = listEst.find(e => e.nombre === 'Ruth Mamani Hancco');
    assert(ruth, 'Ruth Mamani encontrada en GET /api/estudiantes');
    assert.strictEqual(ruth.notas, testNotaEst, 'GET /api/estudiantes incluye campo notas');
    console.log('✅ PASÓ: GET /api/estudiantes incluye campo notas correctamente');

    console.log('\n🎉 TODOS LOS TESTS DE SELECCIÓN DE ESTUDIANTES Y EDICIÓN DE NOTAS PASARON 100% OK');
}

runTests().catch(err => {
    console.error('❌ Error en test:', err);
    process.exit(1);
});
