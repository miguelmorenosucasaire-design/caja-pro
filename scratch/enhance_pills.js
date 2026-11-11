const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. UPDATE PILL BAR IN SECCIONES / GRUPOS
const oldPillSecGrupos = `<div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
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

const newPillSecGrupos = `<div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
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
                    <button onclick="filtrarSeccionesPorCarreraPill('Gastronomía y Pastelería', this)" id="tab-grupo-gastronomia" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>G04 Gastronomía</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Electricidad y Electrónica', this)" id="tab-grupo-electricidad" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>G05 Electricidad</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Mecánica Automotriz', this)" id="tab-grupo-mecanica" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span>G06 Mecánica</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Mecánica de Motos', this)" id="tab-grupo-motos" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span>G07 Mecánica Motos</span>
                    </button>
                    <button onclick="filtrarSeccionesPorCarreraPill('Carpintería Metálica', this)" id="tab-grupo-carpinteria" class="tab-grupo-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>G08 Carpintería</span>
                    </button>
                </div>`;

if (!html.includes(oldPillSecGrupos)) {
    console.error('oldPillSecGrupos not matched');
} else {
    html = html.replace(oldPillSecGrupos, newPillSecGrupos);
    console.log('1. SECCIONES / GRUPOS pill bar updated with exact matches.');
}

// 2. UPDATE PILL BAR IN FACTURA / BOLETA
const oldPillFactura = `<div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
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
                </div>`;

const newPillFactura = `<div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>SECCIÓN:</span>
                    </span>

                    <button type="button" onclick="filtrarFacturaPillSeccion('todas')" id="pill-fac-todas" class="tab-fac-pill-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        Todas las Secciones
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Confección Textil')" id="pill-fac-corte" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        <span>G01 Confección Textil</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Computación')" id="pill-fac-computacion" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        <span>G02 Computación</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Cosmetología')" id="pill-fac-peluqueria" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        <span>G03 Cosmetología</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Gastronomía')" id="pill-fac-gastronomia" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>G04 Gastronomía</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Electricidad')" id="pill-fac-electricidad" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span>G05 Electricidad</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Mecánica')" id="pill-fac-mecanica" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span>G06 Mecánica</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Mecánica de Motos')" id="pill-fac-motos" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span>G07 Mecánica Motos</span>
                    </button>
                    <button type="button" onclick="filtrarFacturaPillSeccion('Carpintería Metálica')" id="pill-fac-carpinteria" class="tab-fac-pill-btn px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>G08 Carpintería</span>
                    </button>
                </div>`;

if (!html.includes(oldPillFactura)) {
    console.error('oldPillFactura not matched');
} else {
    html = html.replace(oldPillFactura, newPillFactura);
    console.log('2. FACTURA pill bar updated with exact matches.');
}

// 3. UPDATE JAVASCRIPT FUNCTIONS TO HANDLE SYNONYMS PERFECTLY
const oldJsPillBlock = `        let currentFacturaReciboId = null;
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

const newJsPillBlock = `        let currentFacturaReciboId = null;
        let currentFacturaEstudianteId = null;
        let currentFacturaGrupoFiltro = 'todos';
        let currentFacturaCarreraPill = 'todas';

        function matchCarreraPill(carreraStr, pillKey) {
            if (!pillKey || pillKey === 'todas') return true;
            if (!carreraStr) return false;
            const cEst = carreraStr.toLowerCase();
            const cPill = pillKey.toLowerCase();
            if (cEst === cPill) return true;
            if (cPill.includes('confecc') || cPill.includes('corte')) {
                return cEst.includes('confecc') || cEst.includes('corte') || cEst.includes('ensamb');
            }
            if (cPill.includes('computa')) {
                return cEst.includes('computa') || cEst.includes('inform');
            }
            if (cPill.includes('cosmeto') || cPill.includes('peluquer')) {
                return cEst.includes('cosmeto') || cEst.includes('peluquer') || cEst.includes('barber');
            }
            if (cPill.includes('gastro')) {
                return cEst.includes('gastro') || cEst.includes('pasteler');
            }
            if (cPill.includes('electri')) {
                return cEst.includes('electri') || cEst.includes('electr');
            }
            if (cPill.includes('motos')) {
                return cEst.includes('motos');
            }
            if (cPill.includes('mecanic') || cPill.includes('automot')) {
                return !cEst.includes('motos') && (cEst.includes('mecanic') || cEst.includes('automot') || cEst.includes('auto'));
            }
            if (cPill.includes('carpint')) {
                return cEst.includes('carpint');
            }
            return false;
        }

        function filtrarFacturaPillSeccion(carreraKey) {
            currentFacturaCarreraPill = carreraKey;

            // Actualizar estilo visual de las píldoras de sección en Factura
            document.querySelectorAll('.tab-fac-pill-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });

            const pillMap = {
                'todas': 'pill-fac-todas',
                'Confección Textil': 'pill-fac-corte',
                'Corte y Ensamblaje': 'pill-fac-corte',
                'Computación': 'pill-fac-computacion',
                'Computación e Informática': 'pill-fac-computacion',
                'Cosmetología': 'pill-fac-peluqueria',
                'Peluquería y Barbería': 'pill-fac-peluqueria',
                'Gastronomía': 'pill-fac-gastronomia',
                'Gastronomía y Pastelería': 'pill-fac-gastronomia',
                'Electricidad': 'pill-fac-electricidad',
                'Electricidad y Electrónica': 'pill-fac-electricidad',
                'Mecánica': 'pill-fac-mecanica',
                'Mecánica Automotriz': 'pill-fac-mecanica',
                'Mecánica de Motos': 'pill-fac-motos',
                'Carpintería Metálica': 'pill-fac-carpinteria'
            };

            const targetId = pillMap[carreraKey] || 'pill-fac-todas';
            const activePill = document.getElementById(targetId);
            if (activePill) {
                activePill.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                activePill.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }

            // Sincronizar selector de grupo
            const selectGrp = document.getElementById('factura-grupo-select');
            if (carreraKey === 'todas') {
                if (selectGrp) selectGrp.value = 'todos';
                currentFacturaGrupoFiltro = 'todos';
                poblarSelectorEstudiantesOpciones('todos');
            } else {
                const grpsCarrera = (gruposGlobales || []).filter(g => matchCarreraPill(g.carrera, carreraKey));
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

            const lista = (estudiantesGlobales || []).filter(e => matchCarreraPill(e.carrera, carreraKey));
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
            document.querySelectorAll('.tab-fac-pill-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });

            let targetId = 'pill-fac-todas';
            if (carreraKey) {
                const c = carreraKey.toLowerCase();
                if (c.includes('corte') || c.includes('confecc')) targetId = 'pill-fac-corte';
                else if (c.includes('computa')) targetId = 'pill-fac-computacion';
                else if (c.includes('peluquer') || c.includes('cosmeto')) targetId = 'pill-fac-peluqueria';
                else if (c.includes('gastro')) targetId = 'pill-fac-gastronomia';
                else if (c.includes('motos')) targetId = 'pill-fac-motos';
                else if (c.includes('electri')) targetId = 'pill-fac-electricidad';
                else if (c.includes('automot') || (c.includes('mecanic') && !c.includes('motos'))) targetId = 'pill-fac-mecanica';
                else if (c.includes('carpint')) targetId = 'pill-fac-carpinteria';
            }

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

            const filtrados = (gruposGlobales || []).filter(g => matchCarreraPill(g.carrera, carreraKey));
            renderGrupos(filtrados);
        }`;

if (!html.includes(oldJsPillBlock)) {
    console.error('oldJsPillBlock not matched');
} else {
    html = html.replace(oldJsPillBlock, newJsPillBlock);
    console.log('3. JavaScript functions updated with full flexible matching.');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Update complete.');
