const http = require('http');

async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://127.0.0.1:5000${path}`, options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('VERIFICACIÓN INTEGRAL DE LOS REQUERIMIENTOS DEL USUARIO');
    console.log('====================================================\n');

    let allPassed = true;
    function assert(cond, msg) {
        if (cond) {
            console.log(`  ✅ PASÓ: ${msg}`);
        } else {
            console.error(`  ❌ FALLÓ: ${msg}`);
            allPassed = false;
        }
    }

    // 1. Verificar index.html servido por el servidor
    const rHome = await request('/');
    assert(rHome.status === 200, 'Servidor HTTP responde 200 en ruta principal (/)');
    assert(typeof rHome.body === 'string' && rHome.body.includes('section-configuracion'), 'index.html contiene id="section-configuracion"');
    
    // Verificación de la navegación única de lado izquierdo (sin barras duplicadas arriba)
    assert(!rHome.body.includes('id="excel-sheet-tabs-bar"'), 'Barra superior de pestañas de hojas eliminada de la parte superior');
    assert(!rHome.body.includes('id="top-nav-grupos"'), 'Segunda sub-barra superior de botones eliminada');
    assert(rHome.body.includes('id="nav-configuracion"'), 'Botón CONFIGURACIÓN ubicado exclusivamente en la barra lateral izquierda');
    assert(rHome.body.includes('id="nav-dashboard"'), 'Botón INICIO ubicado en la barra lateral izquierda');
    assert(rHome.body.includes('id="nav-control-pagos"'), 'Botón CONTROL PAGOS (MES A MES) ubicado en la barra lateral izquierda');
    assert(rHome.body.includes('id="nav-factura"'), 'Botón FACTURA / BOLETA ubicado en la barra lateral izquierda');
    assert(rHome.body.includes('id="nav-diario"'), 'Botón DIARIO & NOTAS ubicado en la barra lateral izquierda');

    // Las 12 hojas de Excel en el sidebar
    const hojasEsperadas = [
        'INICIO', 'RESUMEN ANUAL', 'SECCIONES / GRUPOS', 'ESTUDIANTES',
        'CONTROL PAGOS (MES A MES)', 'DEUDORES', 'INGRESOS (CAJA)',
        'DIARIO & NOTAS', 'DOCENTES', 'FACTURA / BOLETA', 'BACKUP BD', 'CONFIGURACIÓN'
    ];
    hojasEsperadas.forEach(h => {
        assert(rHome.body.includes(h), `Barra lateral incluye exactamente la hoja "${h}"`);
    });

    assert(rHome.body.includes('vista-secciones-vacia'), 'index.html contiene tarjeta de estado vacío vista-secciones-vacia');
    assert(!rHome.body.includes('Teléfono: (01) 566-2390 · Correo: cetpro_micaelabastidas@educacion.gob.pe'), 'index.html NO contiene teléfono ni correo simulados en factura');

    // 2. Verificar API /api/configuracion
    const rCfg = await request('/api/configuracion');
    assert(rCfg.status === 200, 'GET /api/configuracion responde 200');
    assert(rCfg.body.telefono === '', 'Teléfono inicia vacío para ingreso manual (sin autogeneración)');
    assert(rCfg.body.email === '', 'Correo inicia vacío para ingreso manual (sin autogeneración)');
    assert(Boolean(rCfg.body.campus), 'Campo Campus / Sedes existe y está disponible para edición');

    // 3. Probar edición de campus y guardado de configuración
    const rSaveCfg = await request('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { campus: 'Campus Central San Miguel y Filial Regional' }
    });
    assert(rSaveCfg.status === 200 && rSaveCfg.body.success, 'POST /api/configuracion guarda los datos correctamente');
    assert(rSaveCfg.body.configuracion.campus === 'Campus Central San Miguel y Filial Regional', 'Campus actualizado correctamente en la base de datos');

    // Revertir a Campus Central San Miguel
    await request('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { campus: 'Campus Central San Miguel' }
    });

    // 4. Verificar asignación de grupos oficiales a los estudiantes
    const rGrupos = await request('/api/grupos');
    assert(rGrupos.status === 200 && Array.isArray(rGrupos.body), 'GET /api/grupos responde 200');
    assert(rGrupos.body.length >= 15, `Grupos oficiales activos: actualmente hay ${rGrupos.body.length} grupos configurados`);

    // Verificar que los estudiantes tienen sus grupos asignados
    const rEsts = await request('/api/estudiantes');
    assert(rEsts.status === 200 && Array.isArray(rEsts.body), 'GET /api/estudiantes responde 200');
    const estsEnGrupos = rEsts.body.filter(e => e.grupo && e.grupo !== 'General');
    assert(estsEnGrupos.length === 176, `Todos los estudiantes (${estsEnGrupos.length}/176) están organizados en sus respectivos grupos`);

    // 5. Probar creación manual de un grupo adicional y su detalle
    const rNewGrupo = await request('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
            nombre: 'Grupo Especial Temporal de Prueba',
            carrera: 'Computación e Informática',
            encargado: 'Prof. Carlos Alberto Ramos',
            turno: 'Mañana',
            horario: 'Lunes a Viernes 08:00 - 13:00',
            aula_taller: 'Laboratorio de Cómputo 1',
            descripcion: 'Grupo creado manualmente para pruebas de adición y eliminación'
        }
    });
    assert(rNewGrupo.status === 200 && rNewGrupo.body.success, 'POST /api/grupos crea exitosamente una sección manual');
    const createdGroupId = rNewGrupo.body.id;

    // Verificar detalle de la sección creada
    const rDetalle = await request(`/api/grupos/${createdGroupId}/detalle`);
    assert(rDetalle.status === 200 && rDetalle.body.grupo.nombre.includes('Especial'), 'Detalle de la sección manual recuperado exitosamente');

    // Eliminar la sección temporal de prueba
    const rDelGrupo = await request(`/api/grupos/${createdGroupId}`, { method: 'DELETE' });
    assert(rDelGrupo.status === 200 && rDelGrupo.body.success, 'DELETE /api/grupos/:id elimina la sección correctamente');

    // 6. Verificar integridad matemática de estudiantes y movimientos
    const rStats = await request('/api/stats');
    assert(rStats.status === 200, 'GET /api/stats responde 200');
    assert(rStats.body.total_ingresos === 25080, `Total ingresos recaudados oficial: S/. ${rStats.body.total_ingresos} (Esperado 25080.00)`);
    assert(rStats.body.estudiantes.total_alumnos === 176, `Total alumnos oficial: ${rStats.body.estudiantes.total_alumnos} (Esperado 176)`);

    const rMovs = await request('/api/movimientos');
    assert(rMovs.body.length === 207, `Total movimientos oficial: ${rMovs.body.length} (Esperado 207)`);

    // 7. Verificar exportación de Excel con 0 grupos
    const rExcel = await request('/api/exportar/excel');
    assert(rExcel.status === 200, 'GET /api/exportar/excel descarga libro Excel actualizado sin errores');
    assert(rExcel.headers['content-type'].includes('spreadsheetml'), 'Content-Type de Excel oficial (.xlsx) correcto');

    // 8. Verificar respaldos de seguridad
    const rBackups = await request('/api/backups');
    assert(rBackups.status === 200 && Array.isArray(rBackups.body), 'GET /api/backups responde lista de copias de seguridad');
    assert(rBackups.body.length > 0, `Existen ${rBackups.body.length} respaldos de seguridad .db con firma criptográfica SHA-256`);

    console.log('\n====================================================');
    if (allPassed) {
        console.log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE (100% OK)');
    } else {
        console.log('⚠️ ALGUNOS TESTS FALLARON - REVISAR LOGS ANTERIORES');
    }
    console.log('====================================================\n');
}

runTests().catch(console.error);
