const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const tests = [];

function check(desc, cond) {
    if (cond) {
        console.log(`✅ PASÓ: ${desc}`);
        tests.push(true);
    } else {
        console.error(`❌ FALLÓ: ${desc}`);
        tests.push(false);
    }
}

// 1. Badge count in SECCIONES pills
check('Badge count en Todas las Secciones (Secciones)', html.includes('badge-count-sec-todas'));
check('Badge count en Confección Textil (Secciones)', html.includes('badge-count-sec-corte'));
check('Badge count en Computación (Secciones)', html.includes('badge-count-sec-computacion'));
check('Badge count en Cosmetología (Secciones)', html.includes('badge-count-sec-peluqueria'));
check('Badge count en Gastronomía (Secciones)', html.includes('badge-count-sec-gastronomia'));
check('Badge count en Electricidad (Secciones)', html.includes('badge-count-sec-electricidad'));
check('Badge count en Mecánica (Secciones)', html.includes('badge-count-sec-mecanica'));
check('Badge count en Mecánica Motos (Secciones)', html.includes('badge-count-sec-motos'));
check('Badge count en Carpintería (Secciones)', html.includes('badge-count-sec-carpinteria'));

// 2. Badge count in FACTURA pills
check('Badge count en Todas las Secciones (Factura)', html.includes('badge-count-fac-todas'));
check('Badge count en Confección Textil (Factura)', html.includes('badge-count-fac-corte'));
check('Badge count en Computación (Factura)', html.includes('badge-count-fac-computacion'));
check('Badge count en Cosmetología (Factura)', html.includes('badge-count-fac-peluqueria'));
check('Badge count en Gastronomía (Factura)', html.includes('badge-count-fac-gastronomia'));
check('Badge count en Electricidad (Factura)', html.includes('badge-count-fac-electricidad'));
check('Badge count en Mecánica (Factura)', html.includes('badge-count-fac-mecanica'));
check('Badge count en Mecánica Motos (Factura)', html.includes('badge-count-fac-motos'));
check('Badge count en Carpintería (Factura)', html.includes('badge-count-fac-carpinteria'));

// 3. Dynamic metrics in SECCIONES / GRUPOS
check('grupos-total-alumnos actualizado en renderGrupos', html.includes('aluEl.innerText = totalAlumnos'));
check('Badge de alumnos en header de tarjeta de grupo', html.includes('${g.total_alumnos || 0} Alumnos'));

// 4. Selector de grupos en Factura
check('Conteo de alumnos por grupo en opciones de selector factura', html.includes('📂 \' + g.nombre + \' (\' + count + \' alumnos)'));
check('actualizarBadgesConteoSecciones definido', html.includes('function actualizarBadgesConteoSecciones'));

// 5. Panel de notas
check('Conteo de alumnos en badge de notas-resumen-grupo', html.includes('resGrupo.innerText = (est.grupo || \'General\') + (count > 0 ? \' (\' + count + \' alumnos)\' : \'\')'));

console.log(`\nResultados: ${tests.filter(Boolean).length}/${tests.length} pruebas pasadas con éxito.`);
if (tests.every(Boolean)) {
    console.log('🎉 TODOS LOS CRITERIOS DE CONTEO DE ESTUDIANTES POR GRUPO VERIFICADOS AL 100%');
} else {
    process.exit(1);
}
