const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Original content length:', content.length);

// 1. In left sidebar: Add nav-configuracion after nav-respaldos
const navRespaldosTarget = `            <button onclick="cambiarSeccion('respaldos')" id="nav-respaldos" class="nav-item w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-300 hover:text-white hover:bg-slate-800/60">
                <i class="fa-solid fa-database w-5 text-teal-400"></i>
                <span>Respaldos de Base de Datos</span>
                <span id="badge-backups-count" class="ml-auto bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">0</span>
            </button>`;

const navConfigReplacement = navRespaldosTarget + `\n
            <button onclick="cambiarSeccion('configuracion')" id="nav-configuracion" class="nav-item w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-300 hover:text-white hover:bg-slate-800/60">
                <i class="fa-solid fa-gear w-5 text-amber-400"></i>
                <span>Configuración y Sedes</span>
                <span class="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Ajustes</span>
            </button>`;

if (!content.includes(navRespaldosTarget)) {
    throw new Error('Target 1 (navRespaldosTarget) not found');
}
content = content.replace(navRespaldosTarget, navConfigReplacement);
console.log('Step 1 applied: left sidebar nav-configuracion added.');

// 2. In Excel sheet tabs bar: Add sheet-tab-configuracion
const sheetTabRespaldosTarget = `            <button onclick="cambiarSeccion('respaldos')" id="sheet-tab-respaldos" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-database text-[11px] text-emerald-400"></i>
                <span>RESPALDOS BD</span>
            </button>`;

const sheetTabConfigReplacement = sheetTabRespaldosTarget + `\n
            <button onclick="cambiarSeccion('configuracion')" id="sheet-tab-configuracion" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-gear text-[11px] text-amber-400"></i>
                <span>CONFIGURACIÓN</span>
            </button>`;

if (!content.includes(sheetTabRespaldosTarget)) {
    throw new Error('Target 2 (sheetTabRespaldosTarget) not found');
}
content = content.replace(sheetTabRespaldosTarget, sheetTabConfigReplacement);
console.log('Step 2 applied: sheet-tab-configuracion added.');

// 3. In Top navbar: Update badge 6 -> 0 and add top-nav-configuracion
const topNavGruposTarget = `<span class="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold" id="top-badge-grupos">6</span>`;
const topNavGruposReplacement = `<span class="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold" id="top-badge-grupos">0</span>`;
if (!content.includes(topNavGruposTarget)) {
    throw new Error('Target 3a (topNavGruposTarget) not found');
}
content = content.replace(topNavGruposTarget, topNavGruposReplacement);

const topNavRespaldosTarget = `            <button onclick="cambiarSeccion('respaldos')" id="top-nav-respaldos" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-database text-teal-600"></i>
                <span>Respaldos de BD</span>
            </button>`;

const topNavConfigReplacement = topNavRespaldosTarget + `\n
            <button onclick="cambiarSeccion('configuracion')" id="top-nav-configuracion" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-sliders text-amber-500"></i>
                <span>Configuración y Sedes</span>
            </button>`;

if (!content.includes(topNavRespaldosTarget)) {
    throw new Error('Target 3b (topNavRespaldosTarget) not found');
}
content = content.replace(topNavRespaldosTarget, topNavConfigReplacement);
console.log('Step 3 applied: top-badge-grupos reset to 0 and top-nav-configuracion added.');

// 4. In section-grupos: Update banner text to manual management
const bannerGruposTarget = `                            <div class="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-chalkboard-user"></i>
                                <span>Organización Académica • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-bold">Secciones por Grupo y Encargado de Clase</h3>
                            <p class="text-xs text-slate-300 mt-1">Supervisión integral de grupos, docentes encargados de clase, alumnos inscritos y control de cantidades y movimientos monetarios.</p>`;

const bannerGruposReplacement = `                            <div class="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-chalkboard-user"></i>
                                <span>Organización Académica • Gestión Manual de Secciones • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-sky-200">
                                Secciones por Grupo y Encargado de Clase
                            </h3>
                            <p class="text-xs text-slate-300 mt-1">Crea y gestiona las secciones y grupos de forma manual según la programación académica institucional. Consulta la plantilla oficial, nómina de alumnos y movimientos en tiempo real.</p>`;

if (!content.includes(bannerGruposTarget)) {
    throw new Error('Target 4a (bannerGruposTarget) not found');
}
content = content.replace(bannerGruposTarget, bannerGruposReplacement);

// 4b. In section-grupos: Add empty state card vista-secciones-vacia and Eliminar button
const vistaPlantillaTarget = `                <!-- CONTENEDOR 2: PLANTILLA OFICIAL DE LA SECCIÓN SELECCIONADA -->
                <div id="vista-plantilla-seccion" class="hidden space-y-6">`;

const vistaEmptyCard = `                <!-- ESTADO VACÍO CUANDO NO HAY SECCIONES REGISTRADAS -->
                <div id="vista-secciones-vacia" class="hidden space-y-6">
                    <div class="cyber-card p-12 rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-white/90 dark:bg-slate-900/90 text-center shadow-lg">
                        <div class="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                            <i class="fa-solid fa-layer-group"></i>
                        </div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">No Hay Secciones Registradas Aún</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                            Las secciones y grupos se añaden de forma manual según la programación del ciclo lectivo. Los 147 estudiantes matriculados y sus operaciones están protegidos en la base de datos.
                        </p>
                        <button onclick="abrirModalNuevoGrupo()" class="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-xl shadow-indigo-500/25 transition transform active:scale-95 inline-flex items-center space-x-2 text-xs uppercase tracking-wider">
                            <i class="fa-solid fa-plus-circle text-base"></i>
                            <span>Crear Nueva Sección Manualmente</span>
                        </button>
                    </div>
                </div>\n\n` + vistaPlantillaTarget;

if (!content.includes(vistaPlantillaTarget)) {
    throw new Error('Target 4b (vistaPlantillaTarget) not found');
}
content = content.replace(vistaPlantillaTarget, vistaEmptyCard);

// Add Eliminar button in section-grupos header buttons
const btnEditarGrupoTarget = `<button onclick="abrirModalEditarGrupo(currentPlantillaGrupoId)" class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/25 transition">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>✏️ Modificar Sección y Turno</span>
                                </button>`;

const btnEditarYEliminar = btnEditarGrupoTarget + `\n                                <button onclick="eliminarSeccionActual()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/25 transition" title="Eliminar esta sección">
                                    <i class="fa-solid fa-trash-can"></i>
                                    <span>🗑️ Eliminar</span>
                                </button>`;

if (!content.includes(btnEditarGrupoTarget)) {
    throw new Error('Target 4c (btnEditarGrupoTarget) not found');
}
content = content.replace(btnEditarGrupoTarget, btnEditarYEliminar);
console.log('Step 4 applied: section-grupos banner updated, empty state card and delete button added.');

// 5. In section-factura: Update header to dynamic configuration values (no mock phone or email)
const facturaHeaderTarget = `<div class="flex items-center space-x-3">
                                <img src="/public/img/logo_institucion.jpg" class="w-16 h-16 rounded-xl object-contain border border-slate-300 p-1">
                                <div>
                                    <h2 class="text-lg font-black text-slate-900 tracking-tight leading-tight">CETPRO MICAELA BASTIDAS PUYUCAMA</h2>
                                    <p class="text-[11px] font-semibold text-slate-600">RUC: 20485938210 · Dirección: Av. Costanera 1200, San Miguel, Lima</p>
                                    <p class="text-[11px] text-slate-500">Teléfono: (01) 566-2390 · Correo: cetpro_micaelabastidas@educacion.gob.pe</p>
                                </div>
                            </div>`;

const facturaHeaderReplacement = `<div class="flex items-center space-x-3">
                                <img src="/public/img/logo_institucion.jpg" class="w-16 h-16 rounded-xl object-contain border border-slate-300 p-1">
                                <div>
                                    <h2 id="factura-inst-nombre" class="text-lg font-black text-slate-900 tracking-tight leading-tight">CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA</h2>
                                    <p id="factura-inst-info" class="text-[11px] font-semibold text-slate-600">RUC: 20485938210 · Campus: <strong class="text-slate-800">Campus Central San Miguel</strong> · Dirección: Av. Costanera 1200, San Miguel, Lima</p>
                                    <p id="factura-contacto-row" class="text-[11px] text-slate-500 mt-0.5"><span class="text-slate-400 italic text-[10px]"><i class="fa-solid fa-circle-info mr-1"></i> (Teléfono y correo pendientes de configuración manual en la pestaña ⚙️ Configuración)</span></p>
                                </div>
                            </div>`;

if (!content.includes(facturaHeaderTarget)) {
    throw new Error('Target 5a (facturaHeaderTarget) not found');
}
content = content.replace(facturaHeaderTarget, facturaHeaderReplacement);

// Update signatures and footer in factura
const facturaFooterTarget = `                        <!-- Firmas -->
                        <div class="grid grid-cols-2 gap-12 text-center text-xs pt-8 border-t border-dashed border-slate-300">
                            <div>
                                <div class="w-48 border-b-2 border-slate-800 mx-auto mb-1.5"></div>
                                <p class="font-extrabold text-slate-800">Firma del Estudiante / Apoderado</p>
                                <p class="text-[10px] text-slate-500">Conforme con la recepción y pago</p>
                            </div>
                            <div>
                                <div class="w-48 border-b-2 border-slate-800 mx-auto mb-1.5"></div>
                                <p class="font-extrabold text-slate-800">Tesorería / Caja Institucional</p>
                                <p class="text-[10px] text-slate-500">CETPRO Micaela Bastidas Puyucama</p>
                            </div>
                        </div>`;

const facturaFooterReplacement = `                        <!-- Firmas -->
                        <div class="grid grid-cols-2 gap-12 text-center text-xs pt-8 border-t border-dashed border-slate-300">
                            <div>
                                <div class="w-48 border-b-2 border-slate-800 mx-auto mb-1.5"></div>
                                <p class="font-extrabold text-slate-800">Firma del Estudiante / Apoderado</p>
                                <p class="text-[10px] text-slate-500">Conforme con la recepción y pago</p>
                            </div>
                            <div>
                                <div class="w-48 border-b-2 border-slate-800 mx-auto mb-1.5"></div>
                                <p id="factura-inst-responsable" class="font-extrabold text-slate-800">Dirección General y Tesorería</p>
                                <p id="factura-inst-cargo" class="text-[10px] text-slate-500">Administración de Caja Institucional</p>
                            </div>
                        </div>
                        <p id="factura-inst-pie" class="text-[10px] text-slate-400 italic text-center mt-4">Comprobante oficial válido para control institucional interno.</p>`;

if (!content.includes(facturaFooterTarget)) {
    throw new Error('Target 5b (facturaFooterTarget) not found');
}
content = content.replace(facturaFooterTarget, facturaFooterReplacement);
console.log('Step 5 applied: section-factura updated with dynamic elements and clean contact row.');

// 6. Insert section-configuracion right before </main>
const sectionConfiguracionHTML = `
            <!-- ============================================================== -->
            <!-- 13. SECCIÓN: CONFIGURACIÓN INSTITUCIONAL, SEDES Y FACTURACIÓN  -->
            <!-- ============================================================== -->
            <div id="section-configuracion" class="hidden space-y-6">
                <!-- Banner Superior -->
                <div class="cyber-card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-indigo-500/20 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
                            <i class="fa-solid fa-sliders"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-building-columns"></i>
                                <span>Parámetros del Sistema • Sedes & Comprobantes Oficiales</span>
                            </div>
                            <h3 class="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-indigo-200">
                                Configuración Institucional, Sedes y Facturación
                            </h3>
                            <p class="text-xs text-slate-300 mt-1">Configura el campus principal, sedes, RUC, parámetros de emisión de comprobantes y datos de contacto manual.</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button onclick="guardarConfiguracionForm(event)" class="cyber-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/30 transition transform active:scale-95">
                            <i class="fa-solid fa-floppy-disk text-sm"></i>
                            <span>Guardar Configuración</span>
                        </button>
                    </div>
                </div>

                <!-- Contenedor Maestro: Formulario + Vista Previa en Vivo -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    <!-- COLUMNA IZQUIERDA: FORMULARIO DE EDICIÓN (7 cols) -->
                    <div class="lg:col-span-7 space-y-6">
                        
                        <!-- Bloque 1: Identidad Institucional y Sedes -->
                        <div class="cyber-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
                            <div class="flex items-center space-x-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                    <i class="fa-solid fa-landmark"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">Identidad Institucional y Sedes</h4>
                                    <p class="text-[11px] text-slate-400">Datos legales y ubicación del campus o filiales</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Nombre / Razón Social de la Institución:
                                    </label>
                                    <input type="text" id="cfg-nombre-institucion" oninput="actualizarVistaPreviaConfig()" placeholder="ej. CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            RUC Institucional:
                                        </label>
                                        <input type="text" id="cfg-ruc" oninput="actualizarVistaPreviaConfig()" placeholder="ej. 20485938210" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Campus / Sede Principal (Editable):
                                        </label>
                                        <input type="text" id="cfg-campus" oninput="actualizarVistaPreviaConfig()" placeholder="ej. Campus Central San Miguel / Sede Juliaca" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Dirección Legal y Ciudad:
                                    </label>
                                    <input type="text" id="cfg-direccion" oninput="actualizarVistaPreviaConfig()" placeholder="ej. Av. Costanera 1200, San Miguel, Lima" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                </div>
                            </div>
                        </div>

                        <!-- Bloque 2: Contacto Oficial (Ingreso Manual) -->
                        <div class="cyber-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
                            <div class="flex items-center space-x-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                    <i class="fa-solid fa-phone"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">Datos de Contacto Oficial (Configuración Manual)</h4>
                                    <p class="text-[11px] text-slate-400">Sin auto-generación de números o correos no verificados</p>
                                </div>
                            </div>

                            <div class="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 mb-4 flex items-start space-x-2.5">
                                <i class="fa-solid fa-shield-halved text-base flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"></i>
                                <div>
                                    <p class="font-bold">Control de Seguridad y Veracidad de Contacto:</p>
                                    <p class="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">El sistema NO genera teléfonos ni correos simulados. Si estos campos se dejan en blanco, el comprobante reflejará un estado limpio pendiente de asignación manual.</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Teléfono Institucional:
                                    </label>
                                    <input type="text" id="cfg-telefono" oninput="actualizarVistaPreviaConfig()" placeholder="ej. (01) 566-2390 / 987654321" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
                                    <span class="text-[10px] text-slate-400 mt-1 block">Opcional: Si se deja vacío, no aparecerá en el recibo.</span>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Correo Electrónico Institucional:
                                    </label>
                                    <input type="email" id="cfg-email" oninput="actualizarVistaPreviaConfig()" placeholder="ej. cetpro_sanmiguel@educacion.gob.pe" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
                                    <span class="text-[10px] text-slate-400 mt-1 block">Opcional: Se configura manualmente por la institución.</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bloque 3: Parámetros de Facturación y Comprobantes -->
                        <div class="cyber-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
                            <div class="flex items-center space-x-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    <i class="fa-solid fa-file-invoice-dollar"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">Parámetros de Emisión y Comprobantes</h4>
                                    <p class="text-[11px] text-slate-400">Series, firmas de tesorería y leyenda al pie</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Serie de Comprobante:
                                        </label>
                                        <input type="text" id="cfg-serie-comprobante" oninput="actualizarVistaPreviaConfig()" placeholder="B001" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Correlativo Inicial:
                                        </label>
                                        <input type="text" id="cfg-correlativo" oninput="actualizarVistaPreviaConfig()" placeholder="000203" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Moneda Oficial:
                                        </label>
                                        <input type="text" id="cfg-moneda" oninput="actualizarVistaPreviaConfig()" placeholder="S/." class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Autoridad / Responsable:
                                        </label>
                                        <input type="text" id="cfg-responsable-nombre" oninput="actualizarVistaPreviaConfig()" placeholder="Dirección General y Tesorería" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Cargo del Responsable:
                                        </label>
                                        <input type="text" id="cfg-responsable-cargo" oninput="actualizarVistaPreviaConfig()" placeholder="Administración de Caja Institucional" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Leyenda al Pie del Comprobante:
                                    </label>
                                    <textarea id="cfg-mensaje-pie" oninput="actualizarVistaPreviaConfig()" rows="2" placeholder="Comprobante oficial válido para control institucional interno." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Botón de Guardado -->
                        <div class="flex items-center justify-between pt-2">
                            <span id="config-status-msg" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hidden flex items-center space-x-1.5">
                                <i class="fa-solid fa-circle-check"></i>
                                <span>Configuración guardada en Base de Datos y sincronizada en Excel.</span>
                            </span>
                            <button onclick="guardarConfiguracionForm(event)" class="ml-auto bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-xl shadow-indigo-500/25 transition transform active:scale-95 flex items-center space-x-2 text-xs uppercase tracking-wider">
                                <i class="fa-solid fa-floppy-disk text-sm"></i>
                                <span>Guardar Todos los Cambios</span>
                            </button>
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: VISTA PREVIA EN VIVO DE FACTURA (5 cols) -->
                    <div class="lg:col-span-5 space-y-4">
                        <div class="cyber-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm sticky top-4">
                            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                                <div class="flex items-center space-x-2">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <h4 class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Vista Previa en Vivo</h4>
                                </div>
                                <span class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                    Comprobante Oficial
                                </span>
                            </div>

                            <!-- Mini Representación de la Boleta -->
                            <div class="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border-2 border-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] space-y-3 font-sans">
                                <div class="border-b-2 border-slate-800 dark:border-slate-700 pb-2.5 flex items-start justify-between gap-2">
                                    <div>
                                        <h5 id="preview-cfg-nombre" class="font-black text-xs text-slate-900 dark:text-white leading-tight">
                                            CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA
                                        </h5>
                                        <p class="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                            RUC: <span id="preview-cfg-ruc">20485938210</span>
                                        </p>
                                        <p class="text-[10px] text-slate-600 dark:text-slate-400">
                                            Campus: <span id="preview-cfg-campus" class="font-bold text-slate-900 dark:text-white">Campus Central San Miguel</span>
                                        </p>
                                        <p id="preview-cfg-direccion" class="text-[9px] text-slate-500">
                                            Av. Costanera 1200, San Miguel, Lima
                                        </p>
                                        <div id="preview-cfg-contacto" class="text-[9px] text-slate-500 mt-1 italic">
                                            (Teléfono y correo pendientes de configuración manual)
                                        </div>
                                    </div>
                                    <div class="border border-slate-800 dark:border-slate-600 p-1.5 rounded-lg text-center bg-white dark:bg-slate-900 flex-shrink-0 min-w-[90px]">
                                        <p class="text-[8px] font-extrabold uppercase text-slate-500">COMPROBANTE</p>
                                        <p id="preview-cfg-serie" class="text-xs font-black text-rose-600">B001-000203</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-[10px] py-1 border-b border-dashed border-slate-300 dark:border-slate-800">
                                    <div>
                                        <p><span class="text-slate-400">Estudiante:</span> <strong>Ana María Quispe</strong></p>
                                        <p><span class="text-slate-400">DNI:</span> 72849102</p>
                                    </div>
                                    <div>
                                        <p><span class="text-slate-400">Sección:</span> Confección Textil</p>
                                        <p><span class="text-slate-400">Pago:</span> Efectivo en Caja</p>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center text-xs font-black pt-1">
                                    <span>TOTAL:</span>
                                    <span class="text-emerald-600 dark:text-emerald-400" id="preview-cfg-monto">S/. 150.00</span>
                                </div>

                                <div class="border-t border-slate-200 dark:border-slate-800 pt-2 text-center">
                                    <p id="preview-cfg-responsable" class="font-bold text-[10px] text-slate-800 dark:text-slate-200">Dirección General y Tesorería</p>
                                    <p id="preview-cfg-cargo" class="text-[9px] text-slate-500">Administración de Caja Institucional</p>
                                    <p id="preview-cfg-pie" class="text-[8px] text-slate-400 italic mt-1.5">Comprobante oficial válido para control institucional interno.</p>
                                </div>
                            </div>

                            <div class="mt-4 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center space-x-2">
                                <i class="fa-solid fa-arrows-rotate text-sm"></i>
                                <span>Los cambios se reflejan al instante en la boleta oficial y en las impresiones en PDF.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>\n`;

const mainCloseTarget = `        </main>`;
if (!content.includes(mainCloseTarget)) {
    throw new Error('Target 6 (mainCloseTarget) not found');
}
content = content.replace(mainCloseTarget, sectionConfiguracionHTML + mainCloseTarget);
console.log('Step 6 applied: section-configuracion inserted before </main>.');

// 7. Update JavaScript:
// 7a. Add 'configuracion' to cambiarSeccion array
const cambiarSeccionTarget = `            const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos', 'control-pagos', 'diario', 'factura'];`;
const cambiarSeccionReplacement = `            const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos', 'control-pagos', 'diario', 'factura', 'configuracion'];`;

if (!content.includes(cambiarSeccionTarget)) {
    throw new Error('Target 7a (cambiarSeccionTarget) not found');
}
content = content.replace(cambiarSeccionTarget, cambiarSeccionReplacement);

// 7b. In titulos of cambiarSeccion: add configuracion
const titulosTarget = `                diario: ['DIARIO Y NOTAS · Lo que Pasó en el Día', 'Ingresos, gastos y notas pedagógicas de clase por docente del día'],
                factura: ['FACTURA · Comprobante de Pago Oficial', 'Emisión e impresión de boletas oficiales con número en letras y sellos']
            };`;

const titulosReplacement = `                diario: ['DIARIO Y NOTAS · Lo que Pasó en el Día', 'Ingresos, gastos y notas pedagógicas de clase por docente del día'],
                factura: ['FACTURA · Comprobante de Pago Oficial', 'Emisión e impresión de boletas oficiales con número en letras y sellos'],
                configuracion: ['CONFIGURACIÓN · Sedes, RUC y Facturación', 'Gestión centralizada del campus, sedes, RUC, datos de contacto manual y comprobantes']
            };`;

if (!content.includes(titulosTarget)) {
    throw new Error('Target 7b (titulosTarget) not found');
}
content = content.replace(titulosTarget, titulosReplacement);

// 7c. In cambiarSeccion: call cargarConfiguracion() when switching to configuracion
const switchCallTarget = `            if (seccion === 'factura') poblarSelectorFactura();
        }`;

const switchCallReplacement = `            if (seccion === 'factura') poblarSelectorFactura();
            if (seccion === 'configuracion') cargarConfiguracion();
        }`;

if (!content.includes(switchCallTarget)) {
    throw new Error('Target 7c (switchCallTarget) not found');
}
content = content.replace(switchCallTarget, switchCallReplacement);

// 7d. Update currentPlantillaGrupoId default to null
const currentGrupoIdTarget = `        let currentPlantillaGrupoId = 11; // Por defecto Confección Textil`;
const currentGrupoIdReplacement = `        let currentPlantillaGrupoId = null;`;
if (!content.includes(currentGrupoIdTarget)) {
    throw new Error('Target 7d (currentGrupoIdTarget) not found');
}
content = content.replace(currentGrupoIdTarget, currentGrupoIdReplacement);

// 7e. Update cargarGrupos to handle 0 groups properly
const cargarGruposLogicTarget = `                renderGrupos(gruposGlobales);
                renderTabsSecciones(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);`;

const cargarGruposLogicReplacement = `                renderGrupos(gruposGlobales);
                renderTabsSecciones(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);

                // Manejo de estado vacío vs secciones activas
                const vacioEl = document.getElementById('vista-secciones-vacia');
                const plantillaEl = document.getElementById('vista-plantilla-seccion');

                if (gruposGlobales.length === 0) {
                    currentPlantillaGrupoId = null;
                    if (vacioEl) vacioEl.classList.remove('hidden');
                    if (plantillaEl) plantillaEl.classList.add('hidden');
                } else {
                    if (vacioEl) vacioEl.classList.add('hidden');
                    if (plantillaEl) plantillaEl.classList.remove('hidden');

                    if (!currentPlantillaGrupoId || !gruposGlobales.some(g => g.id == currentPlantillaGrupoId)) {
                        currentPlantillaGrupoId = gruposGlobales[0].id;
                    }
                    if (currentPlantillaGrupoId) {
                        await verPlantillaSeccion(currentPlantillaGrupoId);
                    }
                }`;

if (!content.includes(cargarGruposLogicTarget)) {
    throw new Error('Target 7e (cargarGruposLogicTarget) not found');
}
content = content.replace(cargarGruposLogicTarget, cargarGruposLogicReplacement);

// 7f. Update renderTabsSecciones for empty groups
const renderTabsTarget = `function renderTabsSecciones(grupos) {
            const container = document.getElementById('contenedor-tabs-secciones-dinamicas');
            if (!container) return;`;

const renderTabsReplacement = `function renderTabsSecciones(grupos) {
            const container = document.getElementById('contenedor-tabs-secciones-dinamicas');
            if (!container) return;

            if (grupos.length === 0) {
                container.innerHTML = '<span class="text-xs text-slate-400 italic py-1 px-3">0 Secciones Registradas (añadir manualmente)</span>';
                return;
            }`;

if (content.includes(renderTabsTarget)) {
    content = content.replace(renderTabsTarget, renderTabsReplacement);
}

// 7g. Add configuracion functions and eliminarSeccionActual
const configJSBlock = `
        // =========================================================================
        // CONFIGURACIÓN INSTITUCIONAL, SEDES Y FACTURACIÓN
        // =========================================================================
        let configuracionGlobal = {};

        async function cargarConfiguracion() {
            try {
                const res = await fetch('/api/configuracion');
                configuracionGlobal = await res.json();

                const mapFields = {
                    'cfg-nombre-institucion': 'nombre_institucion',
                    'cfg-ruc': 'ruc',
                    'cfg-campus': 'campus',
                    'cfg-direccion': 'direccion',
                    'cfg-telefono': 'telefono',
                    'cfg-email': 'email',
                    'cfg-serie-comprobante': 'serie_comprobante',
                    'cfg-correlativo': 'correlativo_inicio',
                    'cfg-moneda': 'moneda',
                    'cfg-responsable-nombre': 'responsable_nombre',
                    'cfg-responsable-cargo': 'responsable_cargo',
                    'cfg-mensaje-pie': 'mensaje_pie'
                };

                for (const [id, key] of Object.entries(mapFields)) {
                    const el = document.getElementById(id);
                    if (el) el.value = configuracionGlobal[key] || '';
                }

                actualizarVistaPreviaConfig();
                actualizarMembretesFactura();
            } catch (err) {
                console.error("Error al cargar configuración:", err);
            }
        }

        async function guardarConfiguracionForm(e) {
            if (e && e.preventDefault) e.preventDefault();
            const payload = {
                nombre_institucion: (document.getElementById('cfg-nombre-institucion')?.value || '').trim(),
                ruc: (document.getElementById('cfg-ruc')?.value || '').trim(),
                campus: (document.getElementById('cfg-campus')?.value || '').trim(),
                direccion: (document.getElementById('cfg-direccion')?.value || '').trim(),
                telefono: (document.getElementById('cfg-telefono')?.value || '').trim(),
                email: (document.getElementById('cfg-email')?.value || '').trim(),
                serie_comprobante: (document.getElementById('cfg-serie-comprobante')?.value || 'B001').trim(),
                correlativo_inicio: (document.getElementById('cfg-correlativo')?.value || '000203').trim(),
                moneda: (document.getElementById('cfg-moneda')?.value || 'S/.').trim(),
                responsable_nombre: (document.getElementById('cfg-responsable-nombre')?.value || '').trim(),
                responsable_cargo: (document.getElementById('cfg-responsable-cargo')?.value || '').trim(),
                mensaje_pie: (document.getElementById('cfg-mensaje-pie')?.value || '').trim()
            };

            try {
                const res = await fetch('/api/configuracion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    configuracionGlobal = data.configuracion || payload;
                    actualizarVistaPreviaConfig();
                    actualizarMembretesFactura();
                    
                    const msg = document.getElementById('config-status-msg');
                    if (msg) {
                        msg.classList.remove('hidden');
                        setTimeout(() => msg.classList.add('hidden'), 4000);
                    }
                    alert("✅ Configuración institucional guardada exitosamente y sincronizada en el libro Excel.");
                } else {
                    alert("Error al guardar configuración: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al guardar configuración.");
            }
        }

        function actualizarVistaPreviaConfig() {
            const nombre = document.getElementById('cfg-nombre-institucion')?.value || configuracionGlobal.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA';
            const ruc = document.getElementById('cfg-ruc')?.value || configuracionGlobal.ruc || '20485938210';
            const campus = document.getElementById('cfg-campus')?.value || configuracionGlobal.campus || 'Campus Central San Miguel';
            const direccion = document.getElementById('cfg-direccion')?.value || configuracionGlobal.direccion || 'Av. Costanera 1200, San Miguel, Lima';
            const tel = document.getElementById('cfg-telefono')?.value !== undefined ? document.getElementById('cfg-telefono').value.trim() : (configuracionGlobal.telefono || '');
            const email = document.getElementById('cfg-email')?.value !== undefined ? document.getElementById('cfg-email').value.trim() : (configuracionGlobal.email || '');
            const serie = document.getElementById('cfg-serie-comprobante')?.value || configuracionGlobal.serie_comprobante || 'B001';
            const correlativo = document.getElementById('cfg-correlativo')?.value || configuracionGlobal.correlativo_inicio || '000203';
            const moneda = document.getElementById('cfg-moneda')?.value || configuracionGlobal.moneda || 'S/.';
            const resp = document.getElementById('cfg-responsable-nombre')?.value || configuracionGlobal.responsable_nombre || 'Dirección General y Tesorería';
            const cargo = document.getElementById('cfg-responsable-cargo')?.value || configuracionGlobal.responsable_cargo || 'Administración de Caja Institucional';
            const pie = document.getElementById('cfg-mensaje-pie')?.value || configuracionGlobal.mensaje_pie || 'Comprobante oficial válido para control institucional interno.';

            if (document.getElementById('preview-cfg-nombre')) document.getElementById('preview-cfg-nombre').innerText = nombre;
            if (document.getElementById('preview-cfg-ruc')) document.getElementById('preview-cfg-ruc').innerText = ruc;
            if (document.getElementById('preview-cfg-campus')) document.getElementById('preview-cfg-campus').innerText = campus;
            if (document.getElementById('preview-cfg-direccion')) document.getElementById('preview-cfg-direccion').innerText = direccion;
            if (document.getElementById('preview-cfg-serie')) document.getElementById('preview-cfg-serie').innerText = \`\${serie}-\${correlativo}\`;
            if (document.getElementById('preview-cfg-monto')) document.getElementById('preview-cfg-monto').innerText = \`\${moneda} 150.00\`;
            if (document.getElementById('preview-cfg-responsable')) document.getElementById('preview-cfg-responsable').innerText = resp;
            if (document.getElementById('preview-cfg-cargo')) document.getElementById('preview-cfg-cargo').innerText = cargo;
            if (document.getElementById('preview-cfg-pie')) document.getElementById('preview-cfg-pie').innerText = pie;

            const contactEl = document.getElementById('preview-cfg-contacto');
            if (contactEl) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(\`Tel: \${tel}\`);
                    if (email) parts.push(\`Email: \${email}\`);
                    contactEl.innerText = parts.join(' · ');
                    contactEl.className = 'text-[9px] text-slate-700 dark:text-slate-300 font-semibold mt-1';
                } else {
                    contactEl.innerText = '(Teléfono y correo pendientes de configuración manual)';
                    contactEl.className = 'text-[9px] text-slate-400 italic mt-1';
                }
            }
        }

        function actualizarMembretesFactura() {
            const nombre = configuracionGlobal.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA';
            const ruc = configuracionGlobal.ruc || '20485938210';
            const campus = configuracionGlobal.campus || 'Campus Central San Miguel';
            const direccion = configuracionGlobal.direccion || 'Av. Costanera 1200, San Miguel, Lima';
            const tel = configuracionGlobal.telefono ? configuracionGlobal.telefono.trim() : '';
            const email = configuracionGlobal.email ? configuracionGlobal.email.trim() : '';
            const resp = configuracionGlobal.responsable_nombre || 'Dirección General y Tesorería';
            const cargo = configuracionGlobal.responsable_cargo || 'Administración de Caja Institucional';
            const pie = configuracionGlobal.mensaje_pie || 'Comprobante oficial válido para control institucional interno.';

            const elNombre = document.getElementById('factura-inst-nombre');
            if (elNombre) elNombre.innerText = nombre;

            const elInfo = document.getElementById('factura-inst-info');
            if (elInfo) {
                elInfo.innerHTML = \`RUC: \${ruc} · Campus: <strong class="text-slate-800">\${campus}</strong> · Dirección: \${direccion}\`;
            }

            const elContacto = document.getElementById('factura-contacto-row');
            if (elContacto) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(\`Teléfono: <strong class="text-slate-800">\${tel}</strong>\`);
                    if (email) parts.push(\`Correo: <strong class="text-slate-800">\${email}</strong>\`);
                    elContacto.innerHTML = parts.join(' · ');
                } else {
                    elContacto.innerHTML = \`<span class="text-slate-400 italic text-[10px]"><i class="fa-solid fa-circle-info mr-1"></i> (Teléfono y correo pendientes de configuración manual en la pestaña ⚙️ Configuración)</span>\`;
                }
            }

            const elResp = document.getElementById('factura-inst-responsable');
            if (elResp) elResp.innerText = resp;

            const elCargo = document.getElementById('factura-inst-cargo');
            if (elCargo) elCargo.innerText = cargo;

            const elPie = document.getElementById('factura-inst-pie');
            if (elPie) elPie.innerText = pie;
        }

        async function eliminarSeccionActual() {
            if (!currentPlantillaGrupoId) return;
            const g = gruposGlobales.find(x => x.id == currentPlantillaGrupoId);
            const nombre = g ? g.nombre : 'esta sección';
            if (!confirm(\`¿Está seguro de eliminar la sección "\${nombre}"?\\nLos estudiantes matriculados pasarán a la sección "General" y los datos se preservarán intactos.\`)) {
                return;
            }
            try {
                const res = await fetch(\`/api/grupos/\${currentPlantillaGrupoId}\`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(\`✅ Sección eliminada exitosamente.\`);
                    currentPlantillaGrupoId = null;
                    await cargarGrupos();
                } else {
                    alert(\`Error: \${data.error || 'No se pudo eliminar la sección'}\`);
                }
            } catch (err) {
                alert("Error de conexión al eliminar sección.");
            }
        }
`;

const cargarTodoTarget = `        async function cargarTodo() {
            await cargarStats();`;

const cargarTodoReplacement = configJSBlock + `\n        async function cargarTodo() {
            await cargarConfiguracion();
            await cargarStats();`;

if (!content.includes(cargarTodoTarget)) {
    throw new Error('Target 7g (cargarTodoTarget) not found');
}
content = content.replace(cargarTodoTarget, cargarTodoReplacement);

// 7h. Update seleccionarFacturaRecibo to call actualizarMembretesFactura and use dynamic serie
const selectFacturaTarget = `            const nroRec = 'R001-' + String(m.id).padStart(6, '0');`;
const selectFacturaReplacement = `            const serie = configuracionGlobal.serie_comprobante || 'B001';
            const nroRec = serie + '-' + String(m.id).padStart(6, '0');
            actualizarMembretesFactura();`;

if (!content.includes(selectFacturaTarget)) {
    throw new Error('Target 7h (selectFacturaTarget) not found');
}
content = content.replace(selectFacturaTarget, selectFacturaReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated index.html! New length:', content.length);
