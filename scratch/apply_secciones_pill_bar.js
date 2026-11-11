const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. UPDATE SECCIONES / GRUPOS QUICK TABS BAR (around line 870)
const targetSecGruposTabs = `                <!-- SELECTOR RÁPIDO DE SECCIONES (PESTAÑAS ESTILO EXCEL) -->
                <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>Sección:</span>
                    </span>

                    <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        Todas las Secciones
                    </button>
                    <button onclick="verPlantillaSeccion(11)" id="tab-grupo-11" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2 h-2 rounded-full bg-pink-500"></span>
                        <span>G01 Confección Textil</span>
                    </button>
                    <button onclick="verPlantillaSeccion(7)" id="tab-grupo-7" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span>G02 Computación</span>
                    </button>
                    <button onclick="verPlantillaSeccion(9)" id="tab-grupo-9" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span>G03 Cosmetología</span>
                    </button>
                    <button onclick="verPlantillaSeccion(10)" id="tab-grupo-10" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>G04 Gastronomía</span>
                    </button>
                    <button onclick="verPlantillaSeccion(8)" id="tab-grupo-8" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>G05 Electricidad</span>
                    </button>
                    <button onclick="verPlantillaSeccion(12)" id="tab-grupo-12" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>G06 Mecánica</span>
                    </button>
                </div>`;

const replacementSecGruposTabs = `                <!-- SELECTOR RÁPIDO DE SECCIONES (PESTAÑAS ESTILO EXCEL) -->
                <div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>SECCIÓN:</span>
                    </span>

                    <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        Todas las Secciones
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Corte y Ensamblaje', this)" id="tab-grupo-corte" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        <span>G01 Confección Textil</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Computación e Informática', this)" id="tab-grupo-computacion" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        <span>G02 Computación</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Peluquería y Barbería', this)" id="tab-grupo-peluqueria" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <span>G03 Cosmetología</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Mecánica de Motos', this)" id="tab-grupo-motos" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>G04 Mecánica Motos</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Electricidad y Electrónica', this)" id="tab-grupo-electricidad" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>G05 Electricidad</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Mecánica Automotriz', this)" id="tab-grupo-mecanica" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span>G06 Mecánica Auto</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Carpintería Metálica', this)" id="tab-grupo-carpinteria" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>G07 Carpintería</span>
                    </button>
                </div>`;

if (!html.includes(targetSecGruposTabs)) {
    throw new Error('targetSecGruposTabs not found');
}
html = html.replace(targetSecGruposTabs, replacementSecGruposTabs);
console.log('1. SECCIONES / GRUPOS tabs bar updated.');

// 2. ADD HORIZONTAL SECCIÓN BAR IN FACTURA (right above the triple selector)
const targetFacturaToolbar = `                <!-- BARRA DE SELECCIÓN TRIPLE: GRUPO / SECCIÓN + ESTUDIANTE + RECIBO / COMPROBANTE -->
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 no-print">`;

const replacementFacturaToolbar = `                <!-- SELECTOR RÁPIDO DE SECCIONES (BARRA DE PESTAÑAS HORIZONTAL ESTILO OFICIAL) -->
                <div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>SECCIÓN:</span>
                    </span>

                    <button type="button" onclick="filtrarFacturaPillSeccion('todas')" id="pill-fac-todas" class="tab-fac-pill-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        Todas las Secciones
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Corte y Ensamblaje')" id="pill-fac-corte" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        <span>G01 Confección Textil</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Computación e Informática')" id="pill-fac-computacion" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        <span>G02 Computación</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Peluquería y Barbería')" id="pill-fac-peluqueria" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <span>G03 Cosmetología</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Mecánica de Motos')" id="pill-fac-motos" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>G04 Mecánica Motos</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Electricidad y Electrónica')" id="pill-fac-electricidad" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>G05 Electricidad</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Mecánica Automotriz')" id="pill-fac-mecanica" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span>G06 Mecánica Auto</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Carpintería Metálica')" id="pill-fac-carpinteria" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>G07 Carpintería</span>
                    </button>
                </div>

                <!-- BARRA DE SELECCIÓN TRIPLE: GRUPO / SECCIÓN + ESTUDIANTE + RECIBO / COMPROBANTE -->
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 no-print">`;

if (!html.includes(targetFacturaToolbar)) {
    throw new Error('targetFacturaToolbar not found');
}
html = html.replace(targetFacturaToolbar, replacementFacturaToolbar);
console.log('2. Horizontal Sección Bar added to FACTURA.');

// 3. JAVASCRIPT: ADD filtrarFacturaPillSeccion and filtrarSeccionesPorCarreraPill
const targetJsFacturaPill = `        let currentFacturaReciboId = null;
        let currentFacturaEstudianteId = null;
        let currentFacturaGrupoFiltro = 'todos';`;

const replacementJsFacturaPill = `        let currentFacturaReciboId = null;
        let currentFacturaEstudianteId = null;
        let currentFacturaGrupoFiltro = 'todos';
        let currentFacturaCarreraPill = 'todas';

        function filtrarFacturaPillSeccion(carreraKey) {
            currentFacturaCarreraPill = carreraKey;

            // Actualizar estilo visual de las píldoras de sección en Factura
            document.querySelectorAll('.tab-fac-pill-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });

            const pillMap = {
                'todas': 'pill-fac-todas',
                'Corte y Ensamblaje': 'pill-fac-corte',
                'Computación e Informática': 'pill-fac-computacion',
                'Peluquería y Barbería': 'pill-fac-peluqueria',
                'Mecánica de Motos': 'pill-fac-motos',
                'Electricidad y Electrónica': 'pill-fac-electricidad',
                'Mecánica Automotriz': 'pill-fac-mecanica',
                'Carpintería Metálica': 'pill-fac-carpinteria'
            };

            const targetId = pillMap[carreraKey] || 'pill-fac-todas';
            const activePill = document.getElementById(targetId);
            if (activePill) {
                activePill.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                activePill.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }

            // Filtrar selector de grupos según la sección elegida
            const selectGrp = document.getElementById('factura-grupo-select');
            if (carreraKey === 'todas') {
                if (selectGrp) selectGrp.value = 'todos';
                currentFacturaGrupoFiltro = 'todos';
                poblarSelectorEstudiantesOpciones('todos');
            } else {
                const grpsCarrera = (gruposGlobales || []).filter(g => g.carrera === carreraKey);
                if (grpsCarrera.length > 0 && selectGrp) {
                    selectGrp.value = grpsCarrera[0].nombre;
                    currentFacturaGrupoFiltro = grpsCarrera[0].nombre;
                }
                poblarSelectorEstudiantesPorCarrera(carreraKey);
            }
        }

        function poblarSelectorEstudiantesPorCarrera(carreraKey) {
            const selectEst = document.getElementById('factura-estudiante-select');
            if (!selectEst) return;

            const lista = (estudiantesGlobales || []).filter(e => e.carrera === carreraKey);
            lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

            let html = \`<option value="">-- Seleccionar Estudiante de \${carreraKey} (\${lista.length} alumnos) --</option>\`;
            
            const gruposMap = {};
            lista.forEach(e => {
                const g = e.grupo || e.turno || 'General';
                if (!gruposMap[g]) gruposMap[g] = [];
                gruposMap[g].push(e);
            });

            Object.keys(gruposMap).sort().forEach(grpName => {
                const arr = gruposMap[grpName];
                html += \`<optgroup label="📂 \${grpName} (\${arr.length} alumnos)">\`;
                arr.forEach(e => {
                    const dniStr = e.dni && e.dni !== 'No registrado' ? \` [DNI: \${e.dni}]\` : '';
                    html += \`<option value="\${e.id}">\${e.nombre}\${dniStr}</option>\`;
                });
                html += \`</optgroup>\`;
            });

            selectEst.innerHTML = html;

            const countEl = document.getElementById('factura-est-count');
            if (countEl) countEl.innerText = \`\${lista.length} en esta sección\`;

            if (lista.length > 0) {
                seleccionarEstudianteFactura(lista[0].id, false);
            }
        }

        function sincronizarPillConCarrera(carreraKey) {
            const pillMap = {
                'todas': 'pill-fac-todas',
                'Corte y Ensamblaje': 'pill-fac-corte',
                'Computación e Informática': 'pill-fac-computacion',
                'Peluquería y Barbería': 'pill-fac-peluqueria',
                'Mecánica de Motos': 'pill-fac-motos',
                'Electricidad y Electrónica': 'pill-fac-electricidad',
                'Mecánica Automotriz': 'pill-fac-mecanica',
                'Carpintería Metálica': 'pill-fac-carpinteria'
            };

            const targetId = pillMap[carreraKey] || 'pill-fac-todas';
            document.querySelectorAll('.tab-fac-pill-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });
            const activePill = document.getElementById(targetId);
            if (activePill) {
                activePill.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                activePill.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }
        }

        function filtrarSeccionesPorCarreraPill(carreraKey, btnEl) {
            document.querySelectorAll('.tab-grupo-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });
            if (btnEl) {
                btnEl.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                btnEl.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }

            document.getElementById('vista-todas-secciones')?.classList.remove('hidden');
            document.getElementById('vista-plantilla-seccion')?.classList.add('hidden');

            const filtrados = (gruposGlobales || []).filter(g => g.carrera === carreraKey);
            renderGrupos(filtrados);
        }`;

if (!html.includes(targetJsFacturaPill)) {
    throw new Error('targetJsFacturaPill not found');
}
html = html.replace(targetJsFacturaPill, replacementJsFacturaPill);
console.log('3. Pill functions added to JavaScript.');

// 4. Update seleccionarEstudianteFactura to call sincronizarPillConCarrera
const targetSyncEst = `            // Sincronizar selector de grupo si se solicitó o si el filtro actual es 'todos'
            if (syncGrupo && est.grupo) {
                const selectGrp = document.getElementById('factura-grupo-select');
                if (selectGrp && currentFacturaGrupoFiltro !== 'todos' && selectGrp.value !== est.grupo) {
                    selectGrp.value = est.grupo;
                    currentFacturaGrupoFiltro = est.grupo;
                }
            }`;

const replacementSyncEst = `            // Sincronizar selector de grupo si se solicitó o si el filtro actual es 'todos'
            if (syncGrupo && est.grupo) {
                const selectGrp = document.getElementById('factura-grupo-select');
                if (selectGrp && currentFacturaGrupoFiltro !== 'todos' && selectGrp.value !== est.grupo) {
                    selectGrp.value = est.grupo;
                    currentFacturaGrupoFiltro = est.grupo;
                }
            }

            // Sincronizar la barra de píldoras de sección horizontal
            if (est.carrera) {
                sincronizarPillConCarrera(est.carrera);
            }`;

if (!html.includes(targetSyncEst)) {
    throw new Error('targetSyncEst not found');
}
html = html.replace(targetSyncEst, replacementSyncEst);
console.log('4. seleccionarEstudianteFactura updated with pill synchronization.');

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html updated successfully with Sección Pill Bars!');
