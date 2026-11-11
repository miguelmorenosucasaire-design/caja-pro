const fs = require('fs');

let code = fs.readFileSync('scratch/run_full_system_verification.js', 'utf8');

// Update index.html check for factura grupo selector
const targetCheckHtml = `    assert(rHome.body.includes('id="section-configuracion"'), 'index.html contiene id="section-configuracion"');`;
const replacementCheckHtml = `    assert(rHome.body.includes('id="section-configuracion"'), 'index.html contiene id="section-configuracion"');
    assert(rHome.body.includes('id="factura-grupo-select"'), 'index.html contiene selector de grupos en factura (factura-grupo-select)');
    assert(rHome.body.includes('id="factura-estudiante-select"'), 'index.html contiene selector de estudiantes en factura (factura-estudiante-select)');
    assert(rHome.body.includes('id="notas-resumen-grupo"'), 'index.html contiene indicador de grupo del estudiante en panel de notas');`;

code = code.replace(targetCheckHtml, replacementCheckHtml);

// Update section 4 and 5 in verification test
const targetSec4 = `    // 4. Verificar eliminación de grupos (0 grupos en base de datos)
    const rGrupos = await request('/api/grupos');
    assert(rGrupos.status === 200 && Array.isArray(rGrupos.body), 'GET /api/grupos responde 200');
    assert(rGrupos.body.length === 0, \`Grupos eliminados: actualmente hay \${rGrupos.body.length} grupos (añadido manual habilitado)\`);

    // 5. Probar creación manual de un grupo nuevo
    const rNewGrupo = await request('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
            nombre: 'G01 - Computación e Informática Manual A',
            carrera: 'Soporte Técnico y Operaciones de Centros de Cómputo',
            encargado: 'Prof. Carlos Alberto Ramos',
            turno: 'Mañana',
            horario: 'Lunes a Viernes 08:00 - 13:00',
            aula_taller: 'Laboratorio de Cómputo 1',
            descripcion: 'Grupo creado manualmente para pruebas'
        }
    });
    assert(rNewGrupo.status === 200 && rNewGrupo.body.success, 'POST /api/grupos crea exitosamente una sección manual');
    const createdGroupId = rNewGrupo.body.id;

    // Verificar que aparece en GET /api/grupos
    const rGruposAfter = await request('/api/grupos');
    assert(rGruposAfter.body.length === 1, 'Sección manual listada en GET /api/grupos (1 sección)');

    // Verificar detalle de la sección creada
    const rDetalle = await request(\`/api/grupos/\${createdGroupId}/detalle\`);
    assert(rDetalle.status === 200 && rDetalle.body.grupo.nombre.includes('Computación'), 'Detalle de la sección manual recuperado exitosamente');

    // Eliminar la sección de prueba para dejar la base de datos limpia con 0 grupos
    const rDelGrupo = await request(\`/api/grupos/\${createdGroupId}\`, { method: 'DELETE' });
    assert(rDelGrupo.status === 200 && rDelGrupo.body.success, 'DELETE /api/grupos/:id elimina la sección correctamente');

    const rGruposClean = await request('/api/grupos');
    assert(rGruposClean.body.length === 0, 'Base de datos de grupos vuelve a quedar en 0 grupos limpios');`;

const replacementSec4 = `    // 4. Verificar asignación de grupos oficiales a los estudiantes
    const rGrupos = await request('/api/grupos');
    assert(rGrupos.status === 200 && Array.isArray(rGrupos.body), 'GET /api/grupos responde 200');
    assert(rGrupos.body.length >= 15, \`Grupos oficiales activos: actualmente hay \${rGrupos.body.length} grupos configurados\`);

    // Verificar que los estudiantes tienen sus grupos asignados
    const rEsts = await request('/api/estudiantes');
    assert(rEsts.status === 200 && Array.isArray(rEsts.body), 'GET /api/estudiantes responde 200');
    const estsEnGrupos = rEsts.body.filter(e => e.grupo && e.grupo !== 'General');
    assert(estsEnGrupos.length === 176, \`Todos los estudiantes (\${estsEnGrupos.length}/176) están organizados en sus respectivos grupos\`);

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
    const rDetalle = await request(\`/api/grupos/\${createdGroupId}/detalle\`);
    assert(rDetalle.status === 200 && rDetalle.body.grupo.nombre.includes('Especial'), 'Detalle de la sección manual recuperado exitosamente');

    // Eliminar la sección temporal de prueba
    const rDelGrupo = await request(\`/api/grupos/\${createdGroupId}\`, { method: 'DELETE' });
    assert(rDelGrupo.status === 200 && rDelGrupo.body.success, 'DELETE /api/grupos/:id elimina la sección correctamente');`;

code = code.replace(targetSec4, replacementSec4);

fs.writeFileSync('scratch/run_full_system_verification.js', code, 'utf8');
console.log('scratch/run_full_system_verification.js updated successfully!');
