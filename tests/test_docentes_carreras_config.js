const fs = require('fs');
const assert = require('assert');
const http = require('http');

console.log("--- TEST DE VALIDACIÓN: GESTIÓN DE DOCENTES, CARRERAS Y CONFIGURACIÓN ---");

const html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Verificar que DOCENTES está oculto del menú lateral de navegación
assert(html.includes('id="nav-docentes"') && (html.includes('style="display:none !important;"') || html.includes('hidden')), 
    "Botón 'DOCENTES' ocultado del menú lateral de navegación");
console.log("✔ [PASS] 1. Menú lateral: Sección Docentes ocultada de la vista del usuario");

// 2. Barrita de Docentes para registrar nuevo estudiante
assert(html.includes('id="modal-nef-docente"'), "Barrita selector 'modal-nef-docente' presente en modal nuevo estudiante");
assert(html.includes('function poblarSelectDocentesNuevoEstudiante'), "Función 'poblarSelectDocentesNuevoEstudiante' presente");
assert(html.includes('function actualizarDocenteSugeridoNuevoEstudiante'), "Función 'actualizarDocenteSugeridoNuevoEstudiante' presente");
assert(html.includes('+ Registrar Nuevo Estudiante'), "Botón '+ Registrar Nuevo Estudiante' presente en nómina de estudiantes");
console.log("✔ [PASS] 2. Barrita de Docente integrada para nuevo estudiante y botón visible en nómina");

// 3. Nombres de los Docentes en las Carreras Técnicas
assert(html.includes('c.docentes_nombres || c.grupos_encargados'), "Docentes asignados vinculados a cada tarjeta de carrera");
assert(html.includes('Docentes / Responsables de la Especialidad'), "Insignia de docentes visible en tarjetas de carreras");
console.log("✔ [PASS] 3. Nombres de los docentes visibles en las tarjetas de carreras técnicas");

// 4. Configuración para modificar el nombre de los docentes encargados de los grupos
assert(html.includes('id="tabla-docentes-grupos-config-body"'), "Tabla de docentes por grupo presente en Configuración");
assert(html.includes('id="modal-editar-docente-grupo"'), "Modal para modificar docente encargado de grupo presente");
assert(html.includes('function abrirModalModificarDocenteGrupo'), "Función para abrir edición de docente de grupo presente");
assert(html.includes('function guardarModificacionDocenteGrupo'), "Función para guardar modificación de docente presente");
console.log("✔ [PASS] 4. Bloque de configuración para modificar docentes encargados de grupos implementado");

// 5. Test de Endpoint en vivo /api/grupos/:id/encargado
function httpReq(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://127.0.0.1:5000${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

(async () => {
    // Verificar que /api/carreras retorna docentes_nombres
    const rCarr = await httpReq('/api/carreras');
    assert(rCarr.status === 200 && Array.isArray(rCarr.data), "GET /api/carreras responde 200 OK");
    const carrsConDocentes = rCarr.data.filter(c => c.docentes_nombres || c.grupos_encargados);
    assert(carrsConDocentes.length > 0, "Al menos una carrera tiene docentes asignados");
    console.log(`✔ [PASS] 5. API /api/carreras devuelve docentes encargados (${carrsConDocentes.length} especialidades con docentes)`);

    // Modificar docente encargado de un grupo mediante API
    const rGrupos = await httpReq('/api/grupos');
    assert(rGrupos.status === 200 && rGrupos.data.length > 0, "GET /api/grupos responde 200 OK");
    const grupoPrueba = rGrupos.data[0];
    const encargadoOriginal = grupoPrueba.encargado;

    // Actualizar con nuevo encargado
    const rMod = await httpReq(`/api/grupos/${grupoPrueba.id}/encargado`, 'POST', {
        encargado: 'Lic. Docente Prueba Actualizado'
    });
    assert(rMod.status === 200 && rMod.data.success === true, "POST /api/grupos/:id/encargado actualiza docente");

    // Verificar en BD que se actualizó
    const rVerif = await httpReq('/api/grupos');
    const gActualizado = rVerif.data.find(g => g.id === grupoPrueba.id);
    assert(gActualizado.encargado === 'Lic. Docente Prueba Actualizado', "Docente actualizado verificado en BD");

    // Restaurar el encargado original
    await httpReq(`/api/grupos/${grupoPrueba.id}/encargado`, 'POST', {
        encargado: encargadoOriginal
    });
    console.log("✔ [PASS] 6. Modificación y persistencia de docente encargado de grupo probada y validada en vivo");

    console.log("\n🎉 TODOS LOS REQUERIMIENTOS SOLICITADOS FUERON VERIFICADOS Y PASARON AL 100%.");
})().catch(err => {
    console.error("Error en test:", err);
    process.exit(1);
});
