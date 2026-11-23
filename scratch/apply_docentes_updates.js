const fs = require('fs');

let raw = fs.readFileSync('templates/index.html', 'utf8');
const isCRLF = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

function doReplace(target, replacement, desc) {
    const t = target.replace(/\r\n/g, '\n');
    const r = replacement.replace(/\r\n/g, '\n');
    if (html.includes(t)) {
        html = html.replace(t, r);
        console.log(`✔ ${desc}`);
        return true;
    } else {
        console.warn(`⚠ ${desc} - NO ENCONTRADO`);
        return false;
    }
}

// 1. Ocultar nav-docentes de la barra lateral de navegación
const targetNavDocentes = `            <!-- 9. DOCENTES -->
            <button onclick="cambiarSeccion('docentes')" id="nav-docentes" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-chalkboard-user w-4 text-center text-purple-400 text-xs"></i>
                <span class="truncate">DOCENTES</span>
            </button>`;

const repNavDocentes = `            <!-- 9. DOCENTES (Oculto del menú lateral a solicitud oficial) -->
            <button onclick="cambiarSeccion('docentes')" id="nav-docentes" style="display:none !important;" class="nav-item hidden w-full items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-chalkboard-user w-4 text-center text-purple-400 text-xs"></i>
                <span class="truncate">DOCENTES</span>
            </button>`;
doReplace(targetNavDocentes, repNavDocentes, 'Nav Docentes ocultado del menú lateral');

// 2. Botón + Registrar Nuevo Estudiante en section-estudiantes
const targetBtnEst = `                    <div class="flex items-center space-x-3">
                        <button onclick="abrirModalNuevoMovimiento('Estudiante')" class="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>Asignar Nueva Cuota</span>
                        </button>
                    </div>`;

const repBtnEst = `                    <div class="flex items-center space-x-3">
                        <button onclick="abrirModalNuevoEstudianteRecibo()" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition">
                            <i class="fa-solid fa-user-plus"></i>
                            <span>+ Registrar Nuevo Estudiante</span>
                        </button>
                        <button onclick="abrirModalNuevoMovimiento('Estudiante')" class="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>Asignar Nueva Cuota</span>
                        </button>
                    </div>`;
doReplace(targetBtnEst, repBtnEst, 'Botón + Registrar Nuevo Estudiante en Estudiantes');

// 3. Barrita de selección de Docentes en modal-nuevo-estudiante-factura
const targetModalNef = `                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad / Carrera (*):</label>
                        <select id="modal-nef-carrera" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="Corte y Ensamblaje">Corte y Ensamblaje (Confección Textil)</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Peluquería y Barbería">Peluquería y Barbería (Cosmetología)</option>
                            <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                            <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                            <option value="Mecánica de Motos">Mecánica de Motos</option>
                            <option value="Carpintería Metálica">Carpintería Metálica</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Turno (*):</label>
                        <select id="modal-nef-turno" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="Tarde">Turno Tarde</option>
                            <option value="Mañana">Turno Mañana</option>
                            <option value="Noche">Turno Noche</option>
                            <option value="Sábado">Turno Sábado</option>
                        </select>
                    </div>
                </div>`;

const repModalNef = `                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad / Carrera (*):</label>
                        <select id="modal-nef-carrera" required onchange="actualizarDocenteSugeridoNuevoEstudiante()" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="Corte y Ensamblaje">Corte y Ensamblaje (Confección Textil)</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Peluquería y Barbería">Peluquería y Barbería (Cosmetología)</option>
                            <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                            <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                            <option value="Mecánica de Motos">Mecánica de Motos</option>
                            <option value="Carpintería Metálica">Carpintería Metálica</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Turno (*):</label>
                        <select id="modal-nef-turno" required onchange="actualizarDocenteSugeridoNuevoEstudiante()" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="Tarde">Turno Tarde</option>
                            <option value="Mañana">Turno Mañana</option>
                            <option value="Noche">Turno Noche</option>
                            <option value="Sábado">Turno Sábado</option>
                        </select>
                    </div>
                </div>

                <!-- BARRITA DE SELECCIÓN DE DOCENTE ENCARGADO -->
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span class="flex items-center space-x-1.5">
                            <i class="fa-solid fa-chalkboard-user text-indigo-500"></i>
                            <span>Docente / Profesor Encargado (*):</span>
                        </span>
                        <span class="text-[10px] text-slate-400 font-normal">Asignación automática o selección manual</span>
                    </label>
                    <div class="relative">
                        <select id="modal-nef-docente" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                            <option value="">-- Seleccionar Docente Encargado --</option>
                        </select>
                    </div>
                </div>`;
doReplace(targetModalNef, repModalNef, 'Barrita de Docentes añadida al Modal de Nuevo Estudiante');

// 4. Bloque 5 en section-configuracion (Docentes encargados de grupos y carreras)
const targetBloque4End = `                                    <tbody id="tabla-carreras-config-body" class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-slate-400">Cargando catálogo de carreras...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

<div class="flex items-center justify-between pt-2">`;

const repBloque5 = `                                    <tbody id="tabla-carreras-config-body" class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-slate-400">Cargando catálogo de carreras...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Bloque 5: Docentes Encargados de Grupos y Carreras Técnicas -->
                        <div class="cyber-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
                            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div class="flex items-center space-x-3">
                                    <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                        <i class="fa-solid fa-chalkboard-user"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-bold text-slate-800 dark:text-white">Docentes Encargados de Grupos y Carreras Técnicas</h4>
                                        <p class="text-[11px] text-slate-400">Modifica el profesor o docente responsable asignado a cada sección y especialidad</p>
                                    </div>
                                </div>
                                <span class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-200 dark:border-indigo-800">
                                    <i class="fa-solid fa-user-shield mr-1"></i> Control de Responsables
                                </span>
                            </div>

                            <!-- Tabla de Docentes por Grupo / Especialidad -->
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr class="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                                            <th class="py-2.5 px-3 rounded-l-xl">Grupo / Sección</th>
                                            <th class="py-2.5 px-3">Carrera Técnica</th>
                                            <th class="py-2.5 px-3 text-center">Turno</th>
                                            <th class="py-2.5 px-3">Docente Encargado Actual</th>
                                            <th class="py-2.5 px-3 text-center">Alumnos</th>
                                            <th class="py-2.5 px-3 rounded-r-xl text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabla-docentes-grupos-config-body" class="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-slate-400">Cargando docentes por grupo y carrera...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

<div class="flex items-center justify-between pt-2">`;
doReplace(targetBloque4End, repBloque5, 'Bloque 5 agregado a Configuración');

// 5. Agregar Modal modal-editar-docente-grupo
const targetModalGrupo = `<div id="modal-editar-grupo" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 no-print">`;

const modalEditarDocenteGrupoHTML = `    <!-- Modal Modificar Docente Encargado de Grupo / Carrera Técnica -->
    <div id="modal-editar-docente-grupo" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 no-print">
        <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            <div class="p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <div class="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-lg">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base">Modificar Docente Encargado</h3>
                        <p class="text-[11px] text-indigo-100">Asigna o cambia el profesor responsable de la carrera técnica</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalModificarDocenteGrupo()" class="text-white/80 hover:text-white text-lg p-1">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form id="form-editar-docente-grupo" onsubmit="guardarModificacionDocenteGrupo(event)" class="p-6 space-y-4 text-xs">
                <input type="hidden" id="cfg-editar-grupo-id">

                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grupo / Sección:</label>
                    <input type="text" id="cfg-editar-grupo-nombre" readonly class="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 text-xs cursor-not-allowed">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Carrera Técnica:</label>
                    <input type="text" id="cfg-editar-grupo-carrera" readonly class="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-300 text-xs cursor-not-allowed">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Docente Encargado(a) (*):</label>
                    <input type="text" id="cfg-editar-grupo-encargado" list="lista-sugerencias-docentes-cfg" required placeholder="Ej: Lic. Juan Pérez Mamani" class="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-700 rounded-xl font-bold text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <datalist id="lista-sugerencias-docentes-cfg"></datalist>
                    <p class="text-[10px] text-slate-400 mt-1">Escribe el nombre del docente o selecciona uno sugerido de la lista institucional.</p>
                </div>

                <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onclick="cerrarModalModificarDocenteGrupo()" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        Cancelar
                    </button>
                    <button type="submit" id="btn-guardar-docente-grupo-cfg" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Guardar Docente</span>
                    </button>
                </div>
            </form>
        </div>
    </div>\n\n`;
doReplace(targetModalGrupo, modalEditarDocenteGrupoHTML + targetModalGrupo, 'Modal modal-editar-docente-grupo agregado');

// 6. En guardarNuevoEstudianteConRecibo: incluir docente en payload
const targetGuardarNef = `            const payload = {
                dni: document.getElementById('modal-nef-dni').value.trim(),
                nombre: document.getElementById('modal-nef-nombre').value.trim(),
                telefono: document.getElementById('modal-nef-telefono').value.trim(),
                carrera: document.getElementById('modal-nef-carrera').value,
                turno: document.getElementById('modal-nef-turno').value,
                fecha: document.getElementById('modal-nef-fecha').value,
                monto: parseFloat(document.getElementById('modal-nef-monto').value) || 150,
                concepto: document.getElementById('modal-nef-concepto').value.trim(),
                notas: document.getElementById('modal-nef-notas').value.trim()
            };`;

const repGuardarNef = `            const payload = {
                dni: document.getElementById('modal-nef-dni').value.trim(),
                nombre: document.getElementById('modal-nef-nombre').value.trim(),
                telefono: document.getElementById('modal-nef-telefono').value.trim(),
                carrera: document.getElementById('modal-nef-carrera').value,
                turno: document.getElementById('modal-nef-turno').value,
                docente: (document.getElementById('modal-nef-docente')?.value || '').trim(),
                fecha: document.getElementById('modal-nef-fecha').value,
                monto: parseFloat(document.getElementById('modal-nef-monto').value) || 150,
                concepto: document.getElementById('modal-nef-concepto').value.trim(),
                notas: document.getElementById('modal-nef-notas').value.trim()
            };`;
doReplace(targetGuardarNef, repGuardarNef, 'Docente incluido en payload de nuevo estudiante');

// 7. En abrirModalNuevoEstudianteRecibo: invocar sincronización de docentes
const targetAbrirNef = `        function abrirModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (!modal) return;
            const hoy = new Date().toISOString().split('T')[0];
            const inpFecha = document.getElementById('modal-nef-fecha');
            if (inpFecha) inpFecha.value = hoy;
            modal.classList.remove('hidden');
        }`;

const repAbrirNef = `        function abrirModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (!modal) return;
            const hoy = new Date().toISOString().split('T')[0];
            const inpFecha = document.getElementById('modal-nef-fecha');
            if (inpFecha) inpFecha.value = hoy;

            // Poblar y sincronizar barrita de docentes
            poblarSelectDocentesNuevoEstudiante();
            actualizarDocenteSugeridoNuevoEstudiante();

            modal.classList.remove('hidden');
        }`;
doReplace(targetAbrirNef, repAbrirNef, 'abrirModalNuevoEstudianteRecibo con sincronización');

// 8. Declarar let docentesGlobales = []; en las variables globales
const targetGlobals = `        let movimientosGlobales = [];
        let estudiantesGlobales = [];
        let respaldosGlobales = [];
        let gruposGlobales = [];`;

const repGlobals = `        let movimientosGlobales = [];
        let estudiantesGlobales = [];
        let respaldosGlobales = [];
        let gruposGlobales = [];
        let docentesGlobales = [];`;
doReplace(targetGlobals, repGlobals, 'docentesGlobales declarado');

// 9. En cargarDocentes: asignar docentesGlobales y llamar poblarSelectDocentesNuevoEstudiante()
const targetCargarDoc = `                const res = await fetch(url);
                const docentes = await res.json();

                const grid = document.getElementById('grid-docentes');`;

const repCargarDoc = `                const res = await fetch(url);
                const docentes = await res.json();
                docentesGlobales = docentes;
                poblarSelectDocentesNuevoEstudiante();

                const grid = document.getElementById('grid-docentes');`;
doReplace(targetCargarDoc, repCargarDoc, 'cargarDocentes actualizado');

// 10. En cargarGrupos: llamar renderTablaDocentesGruposConfig(gruposGlobales)
const targetCargarGrupos = `                renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);
                poblarSelectsGrupos(gruposGlobales);
                poblarSelectorGruposFactura(gruposGlobales);`;

const repCargarGrupos = `                renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);
                poblarSelectsGrupos(gruposGlobales);
                poblarSelectorGruposFactura(gruposGlobales);
                renderTablaDocentesGruposConfig(gruposGlobales);`;
doReplace(targetCargarGrupos, repCargarGrupos, 'cargarGrupos actualizado con renderTablaDocentesGruposConfig');

// 11. En renderReporteCarreras: mostrar nombres de los docentes en cada tarjeta
const targetRenderCarreras = `        function renderReporteCarreras(carreras) {
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
                            <div><i class="fa-solid fa-user-graduate mr-1.5 text-indigo-400"></i> Matriculados: <strong class="text-slate-800 dark:text-slate-200">\${alumnos}</strong></div>
                            <div><i class="fa-solid fa-chalkboard-user mr-1.5 text-purple-400"></i> Docentes: <strong class="text-slate-800 dark:text-slate-200">\${docentes}</strong></div>
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
        }`;

const repRenderCarreras = `        function renderReporteCarreras(carreras) {
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

                // Nombres de los docentes asignados a la carrera técnica
                const docentesStr = c.docentes_nombres || c.grupos_encargados || '';
                const listaDocentes = docentesStr 
                    ? docentesStr.split(',').map(d => d.trim()).filter(Boolean)
                    : [];

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
                            <div><i class="fa-solid fa-user-graduate mr-1.5 text-indigo-400"></i> Matriculados: <strong class="text-slate-800 dark:text-slate-200">\${alumnos}</strong></div>
                            <div><i class="fa-solid fa-chalkboard-user mr-1.5 text-purple-400"></i> Docentes: <strong class="text-slate-800 dark:text-slate-200">\${docentes}</strong></div>
                        </div>

                        <!-- DOCENTES ENCARGADOS DE LA CARRERA TÉCNICA -->
                        <div class="mt-3 p-2.5 bg-indigo-50/70 dark:bg-slate-800/80 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
                            <div class="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-extrabold mb-1.5">
                                <i class="fa-solid fa-chalkboard-user text-xs"></i>
                                <span>Docentes / Responsables de la Especialidad:</span>
                            </div>
                            \${listaDocentes.length > 0 ? \`
                                <div class="flex flex-wrap gap-1">
                                    \${listaDocentes.map(d => \`
                                        <span class="inline-flex items-center space-x-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                                            <i class="fa-solid fa-user-tie text-[9px] text-indigo-500"></i>
                                            <span>\${d}</span>
                                        </span>
                                    \`).join('')}
                                </div>
                            \` : \`
                                <p class="text-[10px] text-slate-400 italic">Docente por asignar en configuración</p>
                            \`}
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
                                <span>Configurar Docentes</span>
                                <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');
        }`;
doReplace(targetRenderCarreras, repRenderCarreras, 'renderReporteCarreras actualizado con nombres de docentes');

// 12. Funciones JavaScript de gestión de docentes por grupo y sincronización de barrita
const funcionesDocentesJS = `
        // =========================================================================
        // GESTIÓN DE DOCENTES ENCARGADOS DE GRUPOS Y BARRITA DE NUEVO ESTUDIANTE
        // =========================================================================
        function poblarSelectDocentesNuevoEstudiante() {
            const sel = document.getElementById('modal-nef-docente');
            if (!sel) return;

            const listaDocentes = new Map();
            if (Array.isArray(docentesGlobales)) {
                docentesGlobales.forEach(d => {
                    if (d && d.nombre && d.nombre.trim()) {
                        listaDocentes.set(d.nombre.trim(), {
                            nombre: d.nombre.trim(),
                            carrera: d.carrera || '',
                            turno: d.turno || ''
                        });
                    }
                });
            }
            if (Array.isArray(gruposGlobales)) {
                gruposGlobales.forEach(g => {
                    if (g && g.encargado && g.encargado.trim() && g.encargado !== 'General' && g.encargado !== 'Por Asignar') {
                        const nom = g.encargado.trim();
                        if (!listaDocentes.has(nom)) {
                            listaDocentes.set(nom, {
                                nombre: nom,
                                carrera: g.carrera || '',
                                turno: g.turno || ''
                            });
                        }
                    }
                });
            }

            const currentVal = sel.value;
            sel.innerHTML = '<option value="">-- Seleccionar Docente Encargado --</option>' +
                Array.from(listaDocentes.values())
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map(d => \`<option value="\${d.nombre}">\${d.nombre} (\${d.carrera ? d.carrera + ' - ' : ''}\${d.turno || 'General'})\</option>\`)
                    .join('');

            if (currentVal && Array.from(sel.options).some(o => o.value === currentVal)) {
                sel.value = currentVal;
            } else {
                actualizarDocenteSugeridoNuevoEstudiante();
            }
        }

        function actualizarDocenteSugeridoNuevoEstudiante() {
            const selDoc = document.getElementById('modal-nef-docente');
            const selCarr = document.getElementById('modal-nef-carrera');
            const selTurno = document.getElementById('modal-nef-turno');
            if (!selDoc || !selCarr) return;

            const carreraSeleccionada = (selCarr.value || '').trim().toLowerCase();
            const turnoSeleccionado = (selTurno?.value || '').trim().toLowerCase();

            // 1. Buscar en gruposGlobales coincidencia por carrera y turno
            let docenteEncontrado = '';
            if (Array.isArray(gruposGlobales)) {
                const matchExacto = gruposGlobales.find(g => 
                    g.carrera && g.carrera.trim().toLowerCase() === carreraSeleccionada &&
                    g.turno && g.turno.trim().toLowerCase() === turnoSeleccionado &&
                    g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar'
                );
                if (matchExacto) {
                    docenteEncontrado = matchExacto.encargado;
                } else {
                    const matchCarrera = gruposGlobales.find(g => 
                        g.carrera && g.carrera.trim().toLowerCase() === carreraSeleccionada &&
                        g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar'
                    );
                    if (matchCarrera) docenteEncontrado = matchCarrera.encargado;
                }
            }

            // 2. Si no, buscar en docentesGlobales
            if (!docenteEncontrado && Array.isArray(docentesGlobales)) {
                const dMatch = docentesGlobales.find(d => 
                    d.carrera && d.carrera.trim().toLowerCase() === carreraSeleccionada
                );
                if (dMatch) docenteEncontrado = dMatch.nombre;
            }

            if (docenteEncontrado) {
                for (let i = 0; i < selDoc.options.length; i++) {
                    if (selDoc.options[i].value.trim().toLowerCase() === docenteEncontrado.trim().toLowerCase()) {
                        selDoc.selectedIndex = i;
                        return;
                    }
                }
                const opt = document.createElement('option');
                opt.value = docenteEncontrado;
                opt.text = docenteEncontrado + ' (Docente Asignado)';
                selDoc.add(opt);
                selDoc.value = docenteEncontrado;
            }
        }

        function renderTablaDocentesGruposConfig(grupos) {
            const tbody = document.getElementById('tabla-docentes-grupos-config-body');
            if (!tbody) return;

            const lista = (grupos && grupos.length > 0) ? grupos : (gruposGlobales || []);
            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400">No hay grupos o secciones registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = lista.map(g => {
                const badgeTurno = g.turno === 'Mañana' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                   (g.turno === 'Tarde' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' :
                                   (g.turno === 'Noche' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                   'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'));

                const docente = g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar' 
                    ? g.encargado 
                    : '<span class="text-amber-500 italic font-semibold">Sin docente asignado</span>';

                const safeNom = (g.nombre || '').replace(/'/g, "\\\\'");
                const safeCarr = (g.carrera || '').replace(/'/g, "\\\\'");
                const safeEnc = (g.encargado || '').replace(/'/g, "\\\\'");

                return \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-3 px-3">
                            <span class="font-bold text-slate-900 dark:text-white">\${g.nombre}</span>
                            \${g.aula_taller ? \`<div class="text-[10px] text-slate-400"><i class="fa-solid fa-door-open mr-1"></i>\${g.aula_taller}</div>\` : ''}
                        </td>
                        <td class="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            <span class="inline-flex items-center space-x-1">
                                <i class="fa-solid fa-graduation-cap text-indigo-500 text-[10px]"></i>
                                <span>\${g.carrera || 'General'}</span>
                            </span>
                        </td>
                        <td class="py-3 px-3 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border \${badgeTurno}">
                                \${g.turno || 'General'}
                            </span>
                        </td>
                        <td class="py-3 px-3">
                            <div class="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                                <i class="fa-solid fa-chalkboard-user text-indigo-500 text-xs"></i>
                                <span>\${docente}</span>
                            </div>
                        </td>
                        <td class="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                            \${g.total_alumnos !== undefined ? g.total_alumnos : '-'}
                        </td>
                        <td class="py-3 px-3 text-right">
                            <button type="button" onclick="abrirModalModificarDocenteGrupo(\${g.id}, '\${safeNom}', '\${safeCarr}', '\${safeEnc}')" class="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] shadow-sm transition">
                                <i class="fa-solid fa-user-pen"></i>
                                <span>Modificar Docente</span>
                            </button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        function abrirModalModificarDocenteGrupo(grupoId, grupoNombre, carrera, encargadoActual) {
            document.getElementById('cfg-editar-grupo-id').value = grupoId;
            document.getElementById('cfg-editar-grupo-nombre').value = grupoNombre;
            document.getElementById('cfg-editar-grupo-carrera').value = carrera;
            
            const inpEnc = document.getElementById('cfg-editar-grupo-encargado');
            inpEnc.value = (encargadoActual && encargadoActual !== 'Por Asignar' && encargadoActual !== 'General') ? encargadoActual : '';
            
            const dl = document.getElementById('lista-sugerencias-docentes-cfg');
            if (dl) {
                const nombresUnicos = new Set();
                if (Array.isArray(docentesGlobales)) {
                    docentesGlobales.forEach(d => d.nombre && nombresUnicos.add(d.nombre.trim()));
                }
                if (Array.isArray(gruposGlobales)) {
                    gruposGlobales.forEach(g => g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar' && nombresUnicos.add(g.encargado.trim()));
                }
                dl.innerHTML = Array.from(nombresUnicos).sort().map(nom => \`<option value="\${nom}">\`).join('');
            }

            document.getElementById('modal-editar-docente-grupo').classList.remove('hidden');
            setTimeout(() => inpEnc.focus(), 100);
        }

        function cerrarModalModificarDocenteGrupo() {
            document.getElementById('modal-editar-docente-grupo').classList.add('hidden');
        }

        async function guardarModificacionDocenteGrupo(e) {
            e.preventDefault();
            const grupoId = document.getElementById('cfg-editar-grupo-id').value;
            const nuevoEncargado = document.getElementById('cfg-editar-grupo-encargado').value.trim();
            if (!nuevoEncargado) {
                alert("Por favor ingrese el nombre del docente encargado.");
                return;
            }
            const btn = document.getElementById('btn-guardar-docente-grupo-cfg');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Guardando...';
            }

            try {
                const res = await fetch(\`/api/grupos/\${grupoId}/encargado\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encargado: nuevoEncargado })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalModificarDocenteGrupo();
                    if (typeof mostrarNotificacion === 'function') {
                        mostrarNotificacion(data.message || 'Docente actualizado correctamente', 'exito');
                    } else {
                        alert(data.message);
                    }
                    await cargarGrupos();
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar el docente'));
                }
            } catch (err) {
                alert('Error de conexión al actualizar el docente: ' + err.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Docente';
                }
            }
        }
`;

const targetScriptEnd = `        window.addEventListener('DOMContentLoaded', () => {`;
doReplace(targetScriptEnd, funcionesDocentesJS + '\n' + targetScriptEnd, 'Funciones JS de docentes insertadas');

if (isCRLF) {
    html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('🎉 Modificaciones completadas exitosamente.');
