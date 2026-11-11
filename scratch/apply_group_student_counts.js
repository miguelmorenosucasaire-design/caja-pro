const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. In SECCIONES / GRUPOS pill bar, add badge counters:
const s1_old = `<button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        Todas las Secciones
                    </button>`;
const s1_new = `<button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0 flex items-center space-x-1.5">
                        <span>Todas las Secciones</span>
                        <span id="badge-count-sec-todas" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">176</span>
                    </button>`;

if (html.includes(s1_old)) {
    html = html.replace(s1_old, s1_new);
    console.log('1. SECCIONES: tab-grupo-todas updated with badge');
}

const pillReplacements = [
    {
        oldStr: `<span>G01 Confección Textil</span>\n                    </button>`,
        newStr: `<span>G01 Confección Textil</span>\n                        <span id="badge-count-sec-corte" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">33</span>\n                    </button>`
    },
    {
        oldStr: `<span>G02 Computación</span>\n                    </button>`,
        newStr: `<span>G02 Computación</span>\n                        <span id="badge-count-sec-computacion" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">62</span>\n                    </button>`
    },
    {
        oldStr: `<span>G03 Cosmetología</span>\n                    </button>`,
        newStr: `<span>G03 Cosmetología</span>\n                        <span id="badge-count-sec-peluqueria" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">51</span>\n                    </button>`
    },
    {
        oldStr: `<span>G04 Gastronomía</span>\n                    </button>`,
        newStr: `<span>G04 Gastronomía</span>\n                        <span id="badge-count-sec-gastronomia" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">0</span>\n                    </button>`
    },
    {
        oldStr: `<span>G05 Electricidad</span>\n                    </button>`,
        newStr: `<span>G05 Electricidad</span>\n                        <span id="badge-count-sec-electricidad" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">3</span>\n                    </button>`
    },
    {
        oldStr: `<span>G06 Mecánica</span>\n                    </button>`,
        newStr: `<span>G06 Mecánica</span>\n                        <span id="badge-count-sec-mecanica" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">5</span>\n                    </button>`
    },
    {
        oldStr: `<span>G07 Mecánica Motos</span>\n                    </button>`,
        newStr: `<span>G07 Mecánica Motos</span>\n                        <span id="badge-count-sec-motos" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">17</span>\n                    </button>`
    },
    {
        oldStr: `<span>G08 Carpintería</span>\n                    </button>`,
        newStr: `<span>G08 Carpintería</span>\n                        <span id="badge-count-sec-carpinteria" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">2</span>\n                    </button>`
    }
];

pillReplacements.forEach((item, i) => {
    if (html.includes(item.oldStr)) {
        html = html.replace(item.oldStr, item.newStr);
        console.log(`Pill replacement ${i + 1} applied in SECCIONES.`);
    }
});

// 2. In FACTURA / BOLETA pill bar:
const f1_old = `<button type="button" onclick="filtrarFacturaPillSeccion('todas')" id="pill-fac-todas" class="tab-fac-pill-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        Todas las Secciones
                    </button>`;
const f1_new = `<button type="button" onclick="filtrarFacturaPillSeccion('todas')" id="pill-fac-todas" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0 flex items-center space-x-1.5">
                        <span>Todas las Secciones</span>
                        <span id="badge-count-fac-todas" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">176</span>
                    </button>`;

if (html.includes(f1_old)) {
    html = html.replace(f1_old, f1_new);
    console.log('2. FACTURA: pill-fac-todas updated with badge');
}

// In Factura, the buttons have the same span content, so replace the second occurrence of each
pillReplacements.forEach((item, i) => {
    // Replace the one with fac id
    if (html.includes(item.oldStr)) {
        // Change id in newStr from sec to fac
        const facNewStr = item.newStr.replace('-sec-', '-fac-');
        html = html.replace(item.oldStr, facNewStr);
        console.log(`Pill replacement ${i + 1} applied in FACTURA.`);
    }
});

// 3. Update poblarSelectorGruposFactura
const oldPoblarGrupos = `        function poblarSelectorGruposFactura(grupos) {
            const selectGrp = document.getElementById('factura-grupo-select');
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            if (!selectGrp && !selectCambiar) return;

            const totalEst = estudiantesGlobales ? estudiantesGlobales.length : 176;

            let htmlOptions = \`<option value="todos">⚡ Todos los Grupos (\${totalEst} Estudiantes)</option>\`;
            let htmlCambiar = \`<option value="">-- Asignar a un Grupo Oficial --</option>\`;

            (grupos || []).forEach(g => {
                const count = (estudiantesGlobales || []).filter(e => e.grupo === g.nombre).length;
                htmlOptions += \`<option value="\${g.nombre}">\${g.nombre} (\${count} alumnos)</option>\`;
                htmlCambiar += \`<option value="\${g.nombre}">\${g.nombre} (\${g.encargado})</option>\`;
            });

            if (selectGrp) {
                selectGrp.innerHTML = htmlOptions;
                selectGrp.value = currentFacturaGrupoFiltro || 'todos';
            }
            if (selectCambiar) {
                selectCambiar.innerHTML = htmlCambiar;
            }

            const countBadge = document.getElementById('factura-grupo-count');
            if (countBadge) countBadge.innerText = \`\${(grupos || []).length} grupos\`;
        }`;

const newPoblarGrupos = `        function poblarSelectorGruposFactura(grupos) {
            const selectGrp = document.getElementById('factura-grupo-select');
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            if (!selectGrp && !selectCambiar) return;

            const totalEst = (estudiantesGlobales && estudiantesGlobales.length > 0) ? estudiantesGlobales.length : 176;

            let htmlOptions = '<option value="todos">⚡ Todos los Grupos (' + totalEst + ' Estudiantes)</option>';
            let htmlCambiar = '<option value="">-- Asignar a un Grupo Oficial --</option>';

            (grupos || []).forEach(g => {
                const count = (g.total_alumnos !== undefined && g.total_alumnos !== null) 
                    ? g.total_alumnos 
                    : (estudiantesGlobales || []).filter(e => e.grupo === g.nombre).length;
                htmlOptions += '<option value="' + g.nombre + '">📂 ' + g.nombre + ' (' + count + ' alumnos)</option>';
                htmlCambiar += '<option value="' + g.nombre + '">' + g.nombre + ' (' + count + ' alumnos - ' + g.encargado + ')</option>';
            });

            if (selectGrp) {
                selectGrp.innerHTML = htmlOptions;
                selectGrp.value = currentFacturaGrupoFiltro || 'todos';
            }
            if (selectCambiar) {
                selectCambiar.innerHTML = htmlCambiar;
            }

            const countBadge = document.getElementById('factura-grupo-count');
            if (countBadge) countBadge.innerText = (grupos || []).length + ' grupos • ' + totalEst + ' alumnos';

            actualizarBadgesConteoSecciones();
        }

        function actualizarBadgesConteoSecciones() {
            const estudiantes = estudiantesGlobales || [];
            const totalEst = estudiantes.length > 0 ? estudiantes.length : 176;

            const countMap = {
                'todas': totalEst,
                'corte': 0,
                'computacion': 0,
                'peluqueria': 0,
                'gastronomia': 0,
                'electricidad': 0,
                'mecanica': 0,
                'motos': 0,
                'carpinteria': 0
            };

            if (estudiantes.length > 0) {
                estudiantes.forEach(e => {
                    const c = (e.carrera || '').toLowerCase();
                    if (c.includes('corte') || c.includes('confecc')) countMap['corte']++;
                    else if (c.includes('computa')) countMap['computacion']++;
                    else if (c.includes('peluquer') || c.includes('cosmeto')) countMap['peluqueria']++;
                    else if (c.includes('gastro')) countMap['gastronomia']++;
                    else if (c.includes('electri')) countMap['electricidad']++;
                    else if (c.includes('motos')) countMap['motos']++;
                    else if (c.includes('automot') || c.includes('mecanic')) countMap['mecanica']++;
                    else if (c.includes('carpint')) countMap['carpinteria']++;
                });
            } else {
                countMap['corte'] = 33;
                countMap['computacion'] = 62;
                countMap['peluqueria'] = 51;
                countMap['gastronomia'] = 0;
                countMap['electricidad'] = 3;
                countMap['mecanica'] = 5;
                countMap['motos'] = 17;
                countMap['carpinteria'] = 2;
            }

            const setBadge = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            setBadge('badge-count-sec-todas', countMap['todas']);
            setBadge('badge-count-sec-corte', countMap['corte']);
            setBadge('badge-count-sec-computacion', countMap['computacion']);
            setBadge('badge-count-sec-peluqueria', countMap['peluqueria']);
            setBadge('badge-count-sec-gastronomia', countMap['gastronomia']);
            setBadge('badge-count-sec-electricidad', countMap['electricidad']);
            setBadge('badge-count-sec-mecanica', countMap['mecanica']);
            setBadge('badge-count-sec-motos', countMap['motos']);
            setBadge('badge-count-sec-carpinteria', countMap['carpinteria']);

            setBadge('badge-count-fac-todas', countMap['todas']);
            setBadge('badge-count-fac-corte', countMap['corte']);
            setBadge('badge-count-fac-computacion', countMap['computacion']);
            setBadge('badge-count-fac-peluqueria', countMap['peluqueria']);
            setBadge('badge-count-fac-gastronomia', countMap['gastronomia']);
            setBadge('badge-count-fac-electricidad', countMap['electricidad']);
            setBadge('badge-count-fac-mecanica', countMap['mecanica']);
            setBadge('badge-count-fac-motos', countMap['motos']);
            setBadge('badge-count-fac-carpinteria', countMap['carpinteria']);
        }`;

if (html.includes(oldPoblarGrupos)) {
    html = html.replace(oldPoblarGrupos, newPoblarGrupos);
    console.log('3. poblarSelectorGruposFactura updated.');
} else {
    console.error('oldPoblarGrupos not found');
}

// 4. Update renderGrupos top metrics and card header badge
const oldMetricsLogic = `        function renderGrupos(lista) {
            const grid = document.getElementById('grid-grupos');
            if (!grid) return;

            if (lista.length === 0) {`;

const newMetricsLogic = `        function renderGrupos(lista) {
            const grid = document.getElementById('grid-grupos');
            if (!grid) return;

            // Actualizar tarjetas de métricas superiores con la cantidad exacta de estudiantes
            const totalAlumnos = (lista || []).reduce((acc, g) => acc + (g.total_alumnos || 0), 0);
            const totalIng = (lista || []).reduce((acc, g) => acc + (g.total_ingresos || 0), 0);
            const totalEgr = (lista || []).reduce((acc, g) => acc + (g.total_egresos || 0), 0);

            const fMoneyCalc = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const countEl = document.getElementById('grupos-total-count');
            if (countEl) countEl.innerText = (lista || []).length + ' Activos';
            const aluEl = document.getElementById('grupos-total-alumnos');
            if (aluEl) aluEl.innerText = totalAlumnos + ' Alumnos';
            const ingEl = document.getElementById('grupos-total-ingresos');
            if (ingEl) ingEl.innerText = 'S/. ' + fMoneyCalc(totalIng);
            const egrEl = document.getElementById('grupos-total-egresos');
            if (egrEl) egrEl.innerText = 'S/. ' + fMoneyCalc(totalEgr);

            if (lista.length === 0) {`;

if (html.includes(oldMetricsLogic)) {
    html = html.replace(oldMetricsLogic, newMetricsLogic);
    console.log('4. renderGrupos top metrics updated.');
} else {
    console.error('oldMetricsLogic not found');
}

// In renderGrupos card header, add student count badge next to turno:
const oldCardTurno = `<span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border \${badgeTurnoColor} flex-shrink-0">
                                    <i class="fa-regular fa-clock mr-1"></i>\${g.turno}
                                </span>`;

const newCardTurno = `<div class="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border \${badgeTurnoColor}">
                                        <i class="fa-regular fa-clock mr-1"></i>\${g.turno}
                                    </span>
                                    <span class="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm flex items-center">
                                        <i class="fa-solid fa-users mr-1.5 text-indigo-500"></i>\${g.total_alumnos || 0} Alumnos
                                    </span>
                                </div>`;

if (html.includes(oldCardTurno)) {
    html = html.replace(oldCardTurno, newCardTurno);
    console.log('5. renderGrupos card header student count badge added.');
} else {
    console.error('oldCardTurno not found');
}

// 6. Update notas-resumen-grupo to show count
const oldNotasResumenGrupo = `            const grupoBadge = document.getElementById('notas-resumen-grupo');
            if (grupoBadge) {
                grupoBadge.innerText = est.grupo || 'General';
            }`;

const newNotasResumenGrupo = `            const grupoBadge = document.getElementById('notas-resumen-grupo');
            if (grupoBadge) {
                const grpObj = (gruposGlobales || []).find(g => g.nombre === est.grupo);
                const grpCount = grpObj ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === est.grupo).length || 0);
                grupoBadge.innerHTML = '<i class="fa-solid fa-layer-group mr-1"></i>' + (est.grupo || 'General') + ' <span class="ml-1 opacity-80 font-normal">(' + grpCount + ' alumnos)</span>';
            }`;

if (html.includes(oldNotasResumenGrupo)) {
    html = html.replace(oldNotasResumenGrupo, newNotasResumenGrupo);
    console.log('6. notas-resumen-grupo updated with count.');
} else {
    console.error('oldNotasResumenGrupo not found');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html updated successfully with student counts per group!');
