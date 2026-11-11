const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Format grupo with student count in Factura notas card
const targetResGrupo1 = `            const resGrupo = document.getElementById('notas-resumen-grupo');
            if (resGrupo) resGrupo.innerText = est.grupo || 'General';`;

const replaceResGrupo1 = `            const resGrupo = document.getElementById('notas-resumen-grupo');
            if (resGrupo) {
                const grpObj = (gruposGlobales || []).find(g => g.nombre === est.grupo);
                const count = grpObj && grpObj.total_alumnos !== undefined ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === est.grupo).length || 0);
                resGrupo.innerText = (est.grupo || 'General') + (count > 0 ? ' (' + count + ' alumnos)' : '');
            }`;

if (html.includes(targetResGrupo1)) {
    html = html.replace(targetResGrupo1, replaceResGrupo1);
    console.log('1. resGrupo in seleccionarEstudianteFactura updated with count');
}

const targetResGrupo2 = `                    const resGrupo = document.getElementById('notas-resumen-grupo');
                    if (resGrupo) resGrupo.innerText = nuevoGrupo;`;

const replaceResGrupo2 = `                    const resGrupo = document.getElementById('notas-resumen-grupo');
                    if (resGrupo) {
                        const grpObj = (gruposGlobales || []).find(g => g.nombre === nuevoGrupo);
                        const count = grpObj && grpObj.total_alumnos !== undefined ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === nuevoGrupo).length || 0);
                        resGrupo.innerText = nuevoGrupo + (count > 0 ? ' (' + count + ' alumnos)' : '');
                    }`;

if (html.includes(targetResGrupo2)) {
    html = html.replace(targetResGrupo2, replaceResGrupo2);
    console.log('2. resGrupo in cambiarGrupoEstudianteNotas updated with count');
}

const targetResGrupo3 = `            if (resGrupo) resGrupo.innerText = m.grupo || est.grupo || 'General';`;
const replaceResGrupo3 = `            if (resGrupo) {
                const grpNombre = m.grupo || est.grupo || 'General';
                const grpObj = (gruposGlobales || []).find(g => g.nombre === grpNombre);
                const count = grpObj && grpObj.total_alumnos !== undefined ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === grpNombre).length || 0);
                resGrupo.innerText = grpNombre + (count > 0 ? ' (' + count + ' alumnos)' : '');
            }`;

if (html.includes(targetResGrupo3)) {
    html = html.replace(targetResGrupo3, replaceResGrupo3);
    console.log('3. resGrupo in seleccionarFacturaRecibo updated with count');
}

// 2. Also ensure that when cargarGrupos or cargarEstudiantes finishes, actualizarBadgesConteoSecciones is called
const targetCargarGruposEnd = `renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);
                poblarSelectsGrupos(gruposGlobales);
                poblarSelectorGruposFactura(gruposGlobales);`;

const replaceCargarGruposEnd = `renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);
                poblarSelectsGrupos(gruposGlobales);
                poblarSelectorGruposFactura(gruposGlobales);
                if (typeof actualizarBadgesConteoSecciones === 'function') {
                    actualizarBadgesConteoSecciones();
                }`;

if (html.includes(targetCargarGruposEnd)) {
    html = html.replace(targetCargarGruposEnd, replaceCargarGruposEnd);
    console.log('4. actualizarBadgesConteoSecciones wired to cargarGrupos');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Done!');
