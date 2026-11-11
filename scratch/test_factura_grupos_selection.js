const http = require('http');
const assert = require('assert');

console.log('====================================================');
console.log('TEST: SELECCIÓN DE GRUPOS EN FACTURA Y ASIGNACIÓN');
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

async function run() {
    // 1. Verificar HTML de Factura con selector triple
    const home = await get('/');
    assert.strictEqual(home.status, 200);
    assert(home.body.includes('id="factura-grupo-select"'), 'Selector factura-grupo-select presente en el HTML');
    assert(home.body.includes('id="factura-estudiante-select"'), 'Selector factura-estudiante-select presente en el HTML');
    assert(home.body.includes('id="factura-recibo-select"'), 'Selector factura-recibo-select presente en el HTML');
    assert(home.body.includes('id="notas-resumen-grupo"'), 'Badge de resumen de grupo en panel de notas presente');
    assert(home.body.includes('id="notas-cambiar-grupo-select"'), 'Selector para reasignar grupo en panel de notas presente');
    console.log('✅ PASÓ: Todos los elementos HTML del selector triple y panel de notas verificados.');

    // 2. Verificar API Grupos
    const rGrupos = await get('/api/grupos');
    assert.strictEqual(rGrupos.status, 200);
    const grupos = JSON.parse(rGrupos.body);
    assert(grupos.length >= 15, 'Existen al menos 15 grupos en API');
    console.log(`✅ PASÓ: API /api/grupos devuelve ${grupos.length} grupos oficiales.`);

    // 3. Verificar que cada grupo tiene estudiantes asignados
    const rEsts = await get('/api/estudiantes');
    const ests = JSON.parse(rEsts.body);
    assert.strictEqual(ests.length, 176, 'Existen 176 estudiantes');
    
    const corteTarde = ests.filter(e => e.grupo === 'Corte y Ensamblaje - Turno Tarde');
    assert(corteTarde.length === 15, `Corte y Ensamblaje - Turno Tarde tiene 15 alumnos (obtenido ${corteTarde.length})`);
    
    const ruth = corteTarde.find(e => e.nombre === 'Ruth Mamani Hancco');
    assert(ruth, 'Ruth Mamani Hancco pertenece al grupo Corte y Ensamblaje - Turno Tarde');
    console.log('✅ PASÓ: Ruth Mamani Hancco correctamente asignada a Corte y Ensamblaje - Turno Tarde.');

    const compVirtual = ests.filter(e => e.grupo === 'Computación e Informática - Turno Virtual');
    assert(compVirtual.length === 27, `Computación Virtual tiene 27 alumnos (obtenido ${compVirtual.length})`);
    console.log('✅ PASÓ: Computación e Informática - Turno Virtual tiene exactamente 27 estudiantes.');

    // 4. Verificar que en la tabla movimientos también los movimientos tienen su grupo
    const rMovs = await get('/api/movimientos');
    const movs = JSON.parse(rMovs.body);
    assert.strictEqual(movs.length, 207, 'Existen 207 movimientos');
    const movsSinGrupo = movs.filter(m => !m.grupo || m.grupo === 'General');
    assert.strictEqual(movsSinGrupo.length, 0, 'Todos los movimientos tienen asignado su grupo respectivo');
    console.log('✅ PASÓ: Todos los 207 movimientos tienen asignado su grupo oficial.');

    console.log('\n🎉 TODOS LOS CRITERIOS DE GRUPOS EN FACTURA VERIFICADOS AL 100%');
}

run().catch(err => {
    console.error('❌ Error en test:', err);
    process.exit(1);
});
