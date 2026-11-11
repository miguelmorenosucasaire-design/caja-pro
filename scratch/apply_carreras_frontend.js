const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');
console.log('Original content length:', content.length);

// 1. In section-configuracion: Insert Bloque 4 right before the Save button card
const statusMsgIdx = content.indexOf('id="config-status-msg"');
if (statusMsgIdx === -1) throw new Error('Anchor config-status-msg not found');
const botonGuardarCardIdx = content.lastIndexOf('<div class="flex items-center justify-between pt-2">', statusMsgIdx);
if (botonGuardarCardIdx === -1) throw new Error('Anchor botonGuardarCardIdx not found');

const bloque4HTML = `                        <!-- Bloque 4: Gestión y Edición de Carreras / Especialidades -->
                        <div class="cyber-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
                            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div class="flex items-center space-x-3">
                                    <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                        <i class="fa-solid fa-graduation-cap"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-bold text-slate-800 dark:text-white">Nombres de Carreras y Especialidades</h4>
                                        <p class="text-[11px] text-slate-400">Edición de nombres oficiales, creación de nuevas especialidades y catálogo técnico</p>
                                    </div>
                                </div>
                                <button type="button" onclick="abrirModalNuevaCarrera()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition">
                                    <i class="fa-solid fa-plus-circle"></i>
                                    <span>➕ Nueva Carrera</span>
                                </button>
                            </div>

                            <!-- Tabla / Lista de Carreras -->
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr class="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                                            <th class="py-2.5 px-3 rounded-l-xl">Código</th>
                                            <th class="py-2.5 px-3">Especialidad / Carrera</th>
                                            <th class="py-2.5 px-3 text-center">Alumnos</th>
                                            <th class="py-2.5 px-3 text-center">Docentes</th>
                                            <th class="py-2.5 px-3 text-right">Recaudado</th>
                                            <th class="py-2.5 px-3 rounded-r-xl text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabla-carreras-config-body" class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-slate-400">Cargando catálogo de carreras...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>\n\n`;

content = content.slice(0, botonGuardarCardIdx) + bloque4HTML + content.slice(botonGuardarCardIdx);
console.log('Step 1 applied: Bloque 4 Carreras added to section-configuracion.');

// 2. In section-carreras: Add banner
const gridCarrerasAnchor = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="grid-carreras-reporte"></div>';
const gridCarrerasIdx = content.indexOf(gridCarrerasAnchor);
if (gridCarrerasIdx === -1) throw new Error('Anchor grid-carreras-reporte not found');

const bannerCarrerasHTML = `<!-- Banner Superior Futurista -->
                <div class="cyber-card bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-purple-500/20 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-book-bookmark"></i>
                                <span>Oferta Académica & Especialidades • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-sky-200">
                                Rendimiento y Control por Especialidad / Carrera
                            </h3>
                            <p class="text-xs text-slate-300 mt-1">Supervisa los balances financieros, total de estudiantes matriculados y modifica los nombres oficiales de cada carrera.</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button onclick="abrirModalNuevaCarrera()" class="cyber-btn bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>➕ Nueva Carrera</span>
                        </button>
                        <button onclick="cambiarSeccion('configuracion')" class="cyber-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/30 transition">
                            <i class="fa-solid fa-sliders"></i>
                            <span>⚙️ Configurar Nombres</span>
                        </button>
                    </div>
                </div>\n\n                `;

content = content.slice(0, gridCarrerasIdx) + bannerCarrerasHTML + content.slice(gridCarrerasIdx);
console.log('Step 2 applied: section-carreras banner added.');

// 3. Modals: Add modal-editar-carrera and modal-nueva-carrera right before modal-nuevo-grupo
const modalNuevoGrupoIdx = content.indexOf('<div id="modal-nuevo-grupo"');
if (modalNuevoGrupoIdx === -1) throw new Error('Anchor modal-nuevo-grupo not found');

const carreraModalsHTML = `<!-- =================================================================== -->
    <!-- MODAL EDITAR NOMBRE DE CARRERA / ESPECIALIDAD                       -->
    <!-- =================================================================== -->
    <div id="modal-editar-carrera" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 no-print">
        <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            <div class="p-5 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 text-lg">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base">Modificar Nombre de Carrera / Especialidad</h3>
                        <p class="text-[11px] text-purple-200">Actualiza la denominación oficial en todo el sistema</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalEditarCarrera()" class="text-white/70 hover:text-white text-lg"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form onsubmit="guardarEdicionCarrera(event)" class="p-6 space-y-4">
                <input type="hidden" id="editar-carrera-id">
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nombre Actual:</label>
                    <input type="text" id="editar-carrera-nombre-actual" readonly class="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nuevo Nombre Oficial:</label>
                    <input type="text" id="editar-carrera-nombre-nuevo" required placeholder="ej. Soporte Técnico y Operaciones de Cómputo" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-800 dark:text-purple-300 flex items-start space-x-2">
                    <i class="fa-solid fa-arrows-rotate text-sm mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400"></i>
                    <p class="text-[11px]">Al actualizar el nombre, se actualizarán en cascada todos los estudiantes, movimientos y docentes vinculados para mantener la integridad de los datos.</p>
                </div>
                <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onclick="cerrarModalEditarCarrera()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancelar</button>
                    <button type="submit" class="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition flex items-center space-x-2">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Guardar Nuevo Nombre</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- =================================================================== -->
    <!-- MODAL REGISTRAR NUEVA CARRERA / ESPECIALIDAD                       -->
    <!-- =================================================================== -->
    <div id="modal-nueva-carrera" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 no-print">
        <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            <div class="p-5 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 text-lg">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base">Registrar Nueva Carrera / Especialidad</h3>
                        <p class="text-[11px] text-purple-200">Añade una nueva especialidad al catálogo técnico de la institución</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalNuevaCarrera()" class="text-white/70 hover:text-white text-lg"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form onsubmit="guardarNuevaCarrera(event)" class="p-6 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nombre de la Especialidad / Carrera:</label>
                    <input type="text" id="nueva-carrera-nombre" required placeholder="ej. Panadería y Pastelería Comercial" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Código / Abreviatura (Opcional):</label>
                    <input type="text" id="nueva-carrera-codigo" placeholder="ej. ESP-09" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                </div>
                <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onclick="cerrarModalNuevaCarrera()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancelar</button>
                    <button type="submit" class="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition flex items-center space-x-2">
                        <i class="fa-solid fa-plus-circle"></i>
                        <span>Crear Carrera</span>
                    </button>
                </div>
            </form>
        </div>
    </div>\n\n    `;

content = content.slice(0, modalNuevoGrupoIdx) + carreraModalsHTML + content.slice(modalNuevoGrupoIdx);
console.log('Step 3 applied: modal-editar-carrera and modal-nueva-carrera added.');

// 4. Update JavaScript:
// 4a. In cambiarSeccion: call cargarCarreras() when switching to carreras
const switchCfgTarget = "if (seccion === 'configuracion') cargarConfiguracion();";
const switchCfgIdx = content.indexOf(switchCfgTarget);
if (switchCfgIdx === -1) throw new Error('Anchor switchCfgTarget not found');
content = content.slice(0, switchCfgIdx + switchCfgTarget.length) + "\n            if (seccion === 'carreras') cargarCarreras();" + content.slice(switchCfgIdx + switchCfgTarget.length);

// 4b. In cargarTodo: call await cargarCarreras();
const cargarCfgTarget = 'await cargarConfiguracion();';
const cargarCfgIdx = content.indexOf(cargarCfgTarget);
if (cargarCfgIdx === -1) throw new Error('Anchor cargarCfgTarget not found');
content = content.slice(0, cargarCfgIdx + cargarCfgTarget.length) + "\n            await cargarCarreras();" + content.slice(cargarCfgIdx + cargarCfgTarget.length);

// 4c. Replace renderReporteCarreras with full Carreras management JS
const oldRenderReporteStart = content.indexOf('function renderReporteCarreras(carreras) {');
if (oldRenderReporteStart === -1) throw new Error('Anchor function renderReporteCarreras not found');
const oldRenderReporteEnd = content.indexOf('function poblarSelectsGrupos(', oldRenderReporteStart);
if (oldRenderReporteEnd === -1) throw new Error('Anchor poblarSelectsGrupos not found');

const carrerasFullJS = `// =========================================================================
        // GESTIÓN DINÁMICA DE CARRERAS Y ESPECIALIDADES
        // =========================================================================
        let carrerasGlobales = [];

        async function cargarCarreras() {
            try {
                const res = await fetch('/api/carreras');
                carrerasGlobales = await res.json();
                renderReporteCarreras(carrerasGlobales);
                renderTablaCarrerasConfig(carrerasGlobales);
                poblarSelectsCarreras(carrerasGlobales);
            } catch (err) {
                console.error("Error al cargar carreras:", err);
            }
        }

        function renderReporteCarreras(carreras) {
            const grid = document.getElementById('grid-carreras-reporte');
            if (!grid) return;
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;
            if (!lista || lista.length === 0) {
                grid.innerHTML = '<div class="col-span-3 p-8 text-center text-slate-400">No hay carreras registradas.</div>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            grid.innerHTML = lista.map(c => {
                const nom = c.nombre || c.carrera;
                const ing = c.total_ingreso || 0;
                const egr = c.total_egreso || 0;
                const neto = ing - egr;
                const alumnos = c.total_alumnos || 0;
                const docentes = c.total_docentes || 0;

                return \`
                    <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg border border-purple-200 dark:border-purple-800">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-900 dark:text-white text-sm">\${nom}</h4>
                                    <p class="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">\${c.codigo || 'PROGRAMA OFICIAL'}</p>
                                </div>
                            </div>
                            <button onclick="abrirModalEditarCarrera(\${c.id}, '\${nom.replace(/'/g, "\\\\'")}')" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Modificar nombre de carrera">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <div>👥 Matriculados: <strong class="text-slate-800 dark:text-slate-200">\${alumnos}</strong></div>
                            <div>👨‍🏫 Docentes: <strong class="text-slate-800 dark:text-slate-200">\${docentes}</strong></div>
                        </div>

                        <div class="space-y-1.5 text-xs pt-3">
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Ingresos Totales:</span>
                                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">\${fMoney(ing)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Egresos / Gastos:</span>
                                <span class="font-extrabold text-rose-600 dark:text-rose-400">\${fMoney(egr)}</span>
                            </div>
                            <div class="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span class="text-slate-700 dark:text-slate-300 font-bold">Balance Neto:</span>
                                <span class="font-black \${neto >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}">\${fMoney(neto)}</span>
                            </div>
                        </div>

                        <div class="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button onclick="abrirModalEditarCarrera(\${c.id}, '\${nom.replace(/'/g, "\\\\'")}')" class="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center space-x-1 transition">
                                <i class="fa-solid fa-pen"></i>
                                <span>Editar Nombre</span>
                            </button>
                            <button onclick="cambiarSeccion('configuracion')" class="text-[11px] font-semibold text-slate-400 hover:text-indigo-500 flex items-center space-x-1 transition">
                                <span>Configuración</span>
                                <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function renderTablaCarrerasConfig(carreras) {
            const tbody = document.getElementById('tabla-carreras-config-body');
            if (!tbody) return;
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;

            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">No hay carreras registradas.</td></tr>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            tbody.innerHTML = lista.map(c => \`
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3">
                        <span class="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            \${c.codigo || 'ESP'}
                        </span>
                    </td>
                    <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                        \${c.nombre || c.carrera}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        👥 \${c.total_alumnos || 0}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        👨‍🏫 \${c.total_docentes || 0}
                    </td>
                    <td class="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        \${fMoney(c.total_ingreso || 0)}
                    </td>
                    <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button type="button" onclick="abrirModalEditarCarrera(\${c.id}, '\${(c.nombre || c.carrera).replace(/'/g, "\\\\'")}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-[11px] shadow-sm transition" title="Modificar nombre de la carrera">
                            <i class="fa-solid fa-pen-to-square"></i> <span>Editar Nombre</span>
                        </button>
                        <button type="button" onclick="eliminarCarrera(\${c.id}, '\${(c.nombre || c.carrera).replace(/'/g, "\\\\'")}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[11px] border border-rose-200 transition" title="Eliminar carrera">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            \`).join('');
        }

        function poblarSelectsCarreras(carreras) {
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;
            if (!lista || lista.length === 0) return;

            const filtros = [
                { id: 'filtro-carrera', defaultLabel: 'Todas las Especialidades' },
                { id: 'filtro-estudiantes-carrera', defaultLabel: 'Todas las Especialidades' },
                { id: 'filtro-docentes-carrera', defaultLabel: 'Filtrar por Especialidad (Todas)' },
                { id: 'filtro-deudores-carrera', defaultLabel: 'Todas las Especialidades' }
            ];

            filtros.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                let html = \`<option value="">\${f.defaultLabel}</option>\`;
                if (f.id === 'filtro-estudiantes-carrera') {
                    html += \`<option value="sin_asignar">⚠️ Sin Asignar (Pendientes)</option>\`;
                }
                lista.forEach(c => {
                    const nom = c.nombre || c.carrera;
                    html += \`<option value="\${nom}">\${nom}</option>\`;
                });
                el.innerHTML = html;
                if (currentVal) el.value = currentVal;
            });

            const forms = [
                { id: 'form-carrera', defaultLabel: '-- Seleccionar Especialidad --' },
                { id: 'nuevo-grupo-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'editar-grupo-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'editar-docente-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'asignar-carrera-select', defaultLabel: '-- Seleccionar Especialidad --' }
            ];

            forms.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                let html = \`<option value="">\${f.defaultLabel}</option>\`;
                lista.forEach(c => {
                    const nom = c.nombre || c.carrera;
                    html += \`<option value="\${nom}">\${nom}</option>\`;
                });
                el.innerHTML = html;
                if (currentVal) el.value = currentVal;
            });
        }

        function abrirModalEditarCarrera(id, nombreActual) {
            document.getElementById('editar-carrera-id').value = id;
            document.getElementById('editar-carrera-nombre-actual').value = nombreActual;
            document.getElementById('editar-carrera-nombre-nuevo').value = nombreActual;
            document.getElementById('modal-editar-carrera').classList.remove('hidden');
            setTimeout(() => document.getElementById('editar-carrera-nombre-nuevo')?.focus(), 100);
        }

        function cerrarModalEditarCarrera() {
            document.getElementById('modal-editar-carrera').classList.add('hidden');
        }

        async function guardarEdicionCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();
            const id = document.getElementById('editar-carrera-id').value;
            const nombreNuevo = document.getElementById('editar-carrera-nombre-nuevo').value.trim();

            if (!nombreNuevo) {
                alert("Por favor ingrese el nuevo nombre de la carrera.");
                return;
            }

            try {
                const res = await fetch(\`/api/carreras/\${id}/editar\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nombreNuevo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarCarrera();
                    alert(\`✅ Nombre de la carrera actualizado a "\${nombreNuevo}" exitosamente en todo el sistema.\`);
                    await cargarCarreras();
                    await cargarStats();
                    await cargarEstudiantes();
                    await cargarDocentes();
                    await cargarMovimientos();
                    await cargarGrupos();
                } else {
                    alert("Error al actualizar carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al actualizar carrera.");
            }
        }

        function abrirModalNuevaCarrera() {
            document.getElementById('nueva-carrera-nombre').value = '';
            document.getElementById('nueva-carrera-codigo').value = '';
            document.getElementById('modal-nueva-carrera').classList.remove('hidden');
            setTimeout(() => document.getElementById('nueva-carrera-nombre')?.focus(), 100);
        }

        function cerrarModalNuevaCarrera() {
            document.getElementById('modal-nueva-carrera').classList.add('hidden');
        }

        async function guardarNuevaCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();
            const nombre = document.getElementById('nueva-carrera-nombre').value.trim();
            const codigo = document.getElementById('nueva-carrera-codigo').value.trim();

            if (!nombre) {
                alert("El nombre de la carrera es obligatorio.");
                return;
            }

            try {
                const res = await fetch('/api/carreras', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, codigo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalNuevaCarrera();
                    alert(\`✅ Carrera "\${nombre}" creada exitosamente.\`);
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert("Error al crear carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al crear carrera.");
            }
        }

        async function eliminarCarrera(id, nombre) {
            if (!confirm(\`¿Está seguro de eliminar la carrera "\${nombre}" del catálogo oficial?\\n(Los estudiantes y movimientos permanecerán en el sistema).\`)) {
                return;
            }
            try {
                const res = await fetch(\`/api/carreras/\${id}\`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(\`✅ Carrera eliminada exitosamente.\`);
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert("Error al eliminar carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al eliminar carrera.");
            }
        }

        `;

content = content.slice(0, oldRenderReporteStart) + carrerasFullJS + content.slice(oldRenderReporteEnd);
console.log('Step 4 applied: full carreras JS functions integrated.');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated index.html with Carreras Management! New length:', content.length);
