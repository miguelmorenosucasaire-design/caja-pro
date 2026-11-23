const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const startTag = '<div id="modal-nuevo-movimiento"';
const startIdx = html.indexOf(startTag);
const formEndTag = '</form>';
const formEndIdx = html.indexOf(formEndTag, startIdx);
const closeDivIdx = html.indexOf('</div>\n    </div>', formEndIdx);
const endIdx = closeDivIdx + '</div>\n    </div>'.length;

console.log('Replacing from', startIdx, 'to', endIdx);

const newModalHTML = `<div id="modal-nuevo-movimiento" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center hidden p-2 sm:p-4 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 w-full max-w-7xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[96vh] flex flex-col my-auto">
            <!-- Modal Header -->
            <div class="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between flex-shrink-0 border-b border-indigo-900/40">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 text-lg shadow-inner">
                        <i class="fa-solid fa-cash-register"></i>
                    </div>
                    <div>
                        <div class="flex items-center space-x-2">
                            <h3 class="font-extrabold text-base text-white">Registrar Movimiento / Estudiante & Emisión Directa</h3>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <i class="fa-solid fa-bolt"></i> Boleta al Costado
                            </span>
                        </div>
                        <p class="text-[11px] text-slate-300">Completa los datos en la izquierda y la boleta oficial se llena y emite automáticamente en tiempo real a la derecha.</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button type="button" onclick="cerrarModalNuevoMovimiento()" class="text-slate-400 hover:text-white text-lg p-1.5 rounded-xl hover:bg-white/10 transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- Modal Body: 2 Columns Split Screen (Left: Form, Right: Live Voucher "Al costadito") -->
            <div class="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
                
                <!-- COLUMNA IZQUIERDA (lg:col-span-7 xl:col-span-7): FORMULARIO -->
                <form id="form-nuevo-movimiento" onsubmit="guardarMovimiento(event)" class="lg:col-span-7 xl:col-span-7 p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto custom-scrollbar">
                    
                    <!-- 1. TIPO DE MOVIMIENTO (SELECTOR VISUAL) -->
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[11px]">
                            1. Tipo de Movimiento *
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <button type="button" id="btn-tipo-ingreso" onclick="seleccionarTipoMovimiento('Ingreso')" class="py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm">
                                <i class="fa-solid fa-circle-arrow-down text-emerald-600 dark:text-emerald-400 text-base"></i>
                                <span class="text-xs font-bold">INGRESO (Entrada de Dinero)</span>
                            </button>
                            <button type="button" id="btn-tipo-egreso" onclick="seleccionarTipoMovimiento('Egreso')" class="py-2.5 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50 hover:text-rose-700">
                                <i class="fa-solid fa-circle-arrow-up text-rose-500 text-base"></i>
                                <span class="text-xs font-bold">EGRESO (Salida / Gasto)</span>
                            </button>
                        </div>
                        <input type="hidden" id="form-tipo" value="Ingreso">
                    </div>

                    <!-- 2. SECCIÓN POR GRUPO Y ENCARGADO DE ESA CLASE -->
                    <div class="bg-indigo-50/50 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
                        <div class="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                            <i class="fa-solid fa-users-rectangle text-indigo-600 dark:text-indigo-400"></i>
                            <span>2. Sección por Grupo y Encargado de esa Clase</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grupo o Sección</label>
                                <select id="form-grupo" onchange="alCambiarGrupoEnModal(); actualizarBoletaModalEnVivo();" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs text-slate-900 dark:text-white shadow-sm">
                                    <option value="General">General / Institucional</option>
                                </select>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Docente / Encargado de la Clase</label>
                                <select id="form-encargado" onchange="alCambiarDocenteEncargadoEnModal(); actualizarBoletaModalEnVivo();" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs text-slate-900 dark:text-white shadow-sm">
                                    <option value="General">General / Institucional</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 3. PERSONA, ROL Y ESPECIALIDAD -->
                    <div class="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                                3. Tipo de Persona / Beneficiario *
                            </label>
                            <!-- Selector de 3 pestañas: Estudiante, Docente, Institución -->
                            <div class="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl space-x-1" id="tabs-rol-persona">
                                <button type="button" id="tab-rol-estudiante" onclick="seleccionarRolPersonaModal('Estudiante')" class="px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    <span>Estudiante</span>
                                </button>
                                <button type="button" id="tab-rol-docente" onclick="seleccionarRolPersonaModal('Docente')" class="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1">
                                    <i class="fa-solid fa-chalkboard-user"></i>
                                    <span>Docente</span>
                                </button>
                                <button type="button" id="tab-rol-general" onclick="seleccionarRolPersonaModal('General')" class="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1">
                                    <i class="fa-solid fa-building-columns"></i>
                                    <span>Institución</span>
                                </button>
                            </div>
                            <input type="hidden" id="form-rol" value="Estudiante">
                        </div>

                        <!-- Si es Estudiante: selector rápido de estudiante o campo manual -->
                        <div id="contenedor-seleccion-estudiante" class="space-y-1">
                            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Buscar Estudiante Registrado (autocompleta sus datos):
                            </label>
                            <select id="select-estudiante-modal" onchange="alSeleccionarEstudianteEnModal(this.value); actualizarBoletaModalEnVivo();" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                                <option value="">-- Seleccionar Estudiante Registrado o Escribir Manual Abajo --</option>
                            </select>
                        </div>

                        <!-- Si es Docente: selector de todos los docentes institucionales -->
                        <div id="contenedor-seleccion-docente" class="hidden space-y-1">
                            <label class="block text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                                Docente Institucional (al seleccionar se llena su nombre, especialidad y grupo asignado):
                            </label>
                            <select id="select-docente-persona-modal" onchange="alSeleccionarDocentePersonaEnModal(this.value); actualizarBoletaModalEnVivo();" class="w-full bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl px-3.5 py-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                                <option value="">-- Seleccionar Docente de la Institución --</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo (*)</label>
                                <input type="text" id="form-nombre" list="lista-estudiantes-sugerencias" oninput="alEscribirNombreEnModal(); actualizarBoletaModalEnVivo();" required placeholder="Ej: Fernando Quispe / Prof. Carlos" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs">
                                <datalist id="lista-estudiantes-sugerencias"></datalist>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad / Carrera (*)</label>
                                <select id="form-carrera" onchange="actualizarBoletaModalEnVivo()" required class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs">
                                    <option value="Computación e Informática">Computación e Informática</option>
                                    <option value="Corte y Ensamblaje">Corte y Ensamblaje (Confección Textil)</option>
                                    <option value="Peluquería y Barbería">Peluquería y Barbería (Cosmetología)</option>
                                    <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                                    <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                                    <option value="Mecánica de Motos">Mecánica de Motos</option>
                                    <option value="Carpintería Metálica">Carpintería Metálica</option>
                                    <option value="Contabilidad y Finanzas">Contabilidad y Finanzas</option>
                                    <option value="General">General / Institucional</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 3.1 CAMPOS NUMÉRICOS OFICIALES (N° COMPROBANTE, DNI, CELULAR Y TURNO) -->
                    <div class="bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200/90 dark:border-amber-900/60 space-y-2">
                        <div class="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                            <i class="fa-solid fa-receipt text-amber-600"></i>
                            <span>Control Numérico de Caja (N° Comprobante, DNI y Celular)</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                    <i class="fa-solid fa-hashtag text-rose-500 mr-1 text-[11px]"></i>
                                    <span>N° Comprobante</span>
                                </label>
                                <input type="text" id="form-comprobante" oninput="actualizarBoletaModalEnVivo()" placeholder="Ej: 0000811" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-red-600 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                                <span class="text-[10px] text-slate-500 dark:text-slate-400">Correlativo sugerido</span>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                    <i class="fa-solid fa-id-card text-sky-500 mr-1 text-[11px]"></i>
                                    <span>DNI de la Persona</span>
                                </label>
                                <input type="text" id="form-dni" oninput="verificarDuplicadoEstudianteEnModal(); actualizarBoletaModalEnVivo();" maxlength="12" placeholder="Ej: 75936591" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                                <div id="alerta-duplicado-dni" class="hidden mt-1 p-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-lg text-[10px] text-amber-800 dark:text-amber-200 font-bold flex items-center justify-between">
                                    <span id="alerta-duplicado-texto">Registrado</span>
                                    <button type="button" id="btn-autollenar-duplicado" class="text-indigo-600 dark:text-indigo-400 underline hover:font-black">Cargar</button>
                                </div>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                    <i class="fa-solid fa-phone text-emerald-500 mr-1 text-[11px]"></i>
                                    <span>Celular / Teléfono</span>
                                </label>
                                <input type="text" id="form-telefono" oninput="actualizarBoletaModalEnVivo()" maxlength="15" placeholder="Ej: 981763281" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                                <span class="text-[10px] text-slate-500 dark:text-slate-400">Contacto</span>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                    <i class="fa-solid fa-clock text-indigo-500 mr-1 text-[11px]"></i>
                                    <span>Turno de Clase</span>
                                </label>
                                <select id="form-turno" onchange="actualizarBoletaModalEnVivo()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde" selected>Tarde</option>
                                    <option value="Noche">Noche</option>
                                    <option value="Virtual">Virtual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 4. CONCEPTO Y CANTIDAD -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto del Movimiento (*)</label>
                            <input type="text" id="form-concepto" oninput="actualizarBoletaModalEnVivo()" required placeholder="Ej: Aporte por Mantenimiento / Pensión / FUT" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs text-slate-900 dark:text-white shadow-sm">
                            <div class="flex flex-wrap gap-1 mt-1.5">
                                <button type="button" onclick="setConceptoModal('1.- Aporte por Mantenimiento')" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">1. Aporte</button>
                                <button type="button" onclick="setConceptoModal('2.- Expedición de constancia de estudio')" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">2. Constancia</button>
                                <button type="button" onclick="setConceptoModal('3.- FUT')" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">3. FUT</button>
                                <button type="button" onclick="setConceptoModal('4.- Otros')" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">4. Otros</button>
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto de la Operación (S/.) (*)</label>
                            <div class="relative">
                                <span class="absolute left-3 top-2 font-bold text-slate-500">S/.</span>
                                <input type="number" id="form-monto" oninput="actualizarBoletaModalEnVivo()" step="0.50" min="0" required placeholder="0.00" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-base">
                            </div>
                            <div class="flex flex-wrap gap-1 mt-1.5">
                                <button type="button" onclick="setMontoModal(20)" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">+S/20</button>
                                <button type="button" onclick="setMontoModal(50)" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">+S/50</button>
                                <button type="button" onclick="setMontoModal(100)" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">+S/100</button>
                                <button type="button" onclick="setMontoModal(150)" class="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">+S/150</button>
                                <button type="button" onclick="setMontoModal(200)" class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">+S/200</button>
                                <button type="button" onclick="setMontoModal(0)" class="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 text-[10px] font-bold">Limpiar</button>
                            </div>
                        </div>
                    </div>

                    <!-- 5. NOTAS U OBSERVACIONES (REFLEJADAS EN LA LÍNEA 4 'OTROS' DEL VOUCHER) -->
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                            <span class="flex items-center gap-1"><i class="fa-solid fa-pen-to-square text-amber-500"></i> Nota u Observación (Se refleja en línea "4.- Otros" del Voucher)</span>
                            <span class="text-[10px] text-slate-400 font-normal">Sincroniza con DB y Excel</span>
                        </label>
                        <input type="text" id="form-notas" oninput="actualizarBoletaModalEnVivo()" placeholder="Ej: Pago de cuota de módulo, convalidación, materiales de taller..." class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 dark:text-white shadow-sm">
                    </div>

                    <!-- 6. FECHA, MÉTODO Y ESTADO -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Registro</label>
                            <input type="date" id="form-fecha" onchange="actualizarBoletaModalEnVivo()" required class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Pago</label>
                            <select id="form-metodo" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                                <option value="Efectivo" selected>💵 Efectivo</option>
                                <option value="Yape / Plin">📱 Yape / Plin</option>
                                <option value="Transferencia Bancaria">🏦 Transferencia</option>
                                <option value="Depósito">💳 Depósito</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                            <select id="form-estado" onchange="toggleFechaVencimiento()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                                <option value="Pagado" selected>Pagado / Cobrado</option>
                                <option value="Pendiente">Pendiente (Deuda)</option>
                            </select>
                        </div>
                    </div>

                    <div id="div-vencimiento" class="hidden bg-amber-50 dark:bg-amber-950/60 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                        <label class="block font-bold text-amber-900 dark:text-amber-300 mb-1">Fecha de Vencimiento de Cuota</label>
                        <input type="date" id="form-vencimiento" class="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    </div>

                    <!-- BOTÓN PRINCIPAL: GUARDAR Y EMITIR BOLETA DIRECTA -->
                    <div class="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onclick="cerrarModalNuevoMovimiento()" class="px-3.5 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition text-xs">
                            Cerrar
                        </button>
                        <button type="submit" id="btn-guardar-mov-modal" class="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2 text-xs cursor-pointer">
                            <i class="fa-solid fa-receipt"></i>
                            <span>💾 Guardar y Emitir Boleta al Instante</span>
                        </button>
                    </div>
                </form>

                <!-- COLUMNA DERECHA ("AL COSTADITO") (lg:col-span-5 xl:col-span-5): VISTA PREVIA EN VIVO Y EMISIÓN INMEDIATA -->
                <div class="lg:col-span-5 xl:col-span-5 p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-950/80 flex flex-col justify-between space-y-3.5 overflow-y-auto custom-scrollbar">
                    
                    <div>
                        <!-- Header de la Boleta al costadito -->
                        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                            <div class="flex items-center space-x-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Boleta Oficial (Vista al Costado)
                                </h4>
                            </div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                Emisión Directa
                            </span>
                        </div>

                        <!-- REPRODUCCIÓN VISUAL DE LA BOLETA TALONARIO OFICIAL (Escala compacta de alta definición) -->
                        <div id="contenedor-boleta-modal-costado" class="bg-white rounded-2xl p-4 shadow-xl border border-slate-300 text-[#1b2a6b] font-sans select-none transition-all">
                            
                            <!-- Membrete Minedu + CETPRO -->
                            <div class="flex items-center justify-between border-b pb-2 mb-2 border-[#2258a8]/40">
                                <div class="flex flex-col items-center justify-center">
                                    <img src="/public/img/minedu_barras.png" alt="Minedu" style="width: 55px; height: auto;" onerror="this.src='/public/img/minedu_azul.svg'">
                                    <b class="text-[6px] font-bold text-[#2258a8] leading-tight text-center uppercase tracking-tight block">Ministerio de Educación</b>
                                    <small class="text-[4.5px] font-bold text-[#2258a8] leading-none text-center uppercase tracking-wider block">República del Perú</small>
                                </div>

                                <div class="text-center px-1">
                                    <h4 class="text-[9px] font-black uppercase text-[#2258a8] leading-tight">Ministerio de Educación</h4>
                                    <p class="text-[7px] font-bold text-slate-700 leading-tight">UGEL San Román · CETPRO Micaela Bastidas</p>
                                    <p class="text-[8px] font-extrabold text-[#2258a8] mt-0.5">
                                        Juliaca <span id="modal-boleta-nro" class="text-rose-600 font-mono font-black text-[10px] ml-1">0000811</span>
                                    </p>
                                </div>

                                <div class="flex flex-col items-center justify-center">
                                    <img src="/public/img/escudo_recibo_ingreso.png" alt="CETPRO" class="w-8 h-8 object-contain">
                                    <b class="text-[6px] font-black text-[#2258a8]">CETPRO</b>
                                    <small class="text-[4.5px] font-bold text-slate-700">MICAELA BASTIDAS</small>
                                </div>
                            </div>

                            <div class="text-center bg-[#2258a8]/10 py-0.5 px-2 rounded font-black text-[8.5px] uppercase tracking-wider text-[#2258a8] mb-2">
                                Ingresos de Recursos Propios
                            </div>

                            <!-- Datos del Señor (a) y Especialidad -->
                            <div class="border border-[#2258a8]/50 rounded-lg p-2 space-y-1 text-[8.5px] mb-2 bg-slate-50/50">
                                <div class="flex items-baseline gap-1">
                                    <b class="text-[#2258a8] whitespace-nowrap">Señor (a):</b>
                                    <span id="modal-boleta-estudiante" class="flex-1 border-b border-dotted border-[#2258a8] text-slate-900 font-bold truncate">---------------------------------</span>
                                </div>
                                <div class="flex items-baseline justify-between text-[7.5px] text-slate-600">
                                    <span><b>DNI:</b> <span id="modal-boleta-dni" class="font-mono font-bold">--------</span></span>
                                    <span><b>Cel:</b> <span id="modal-boleta-telefono" class="font-mono font-bold">---------</span></span>
                                </div>
                                <div class="flex items-baseline gap-1">
                                    <b class="text-[#2258a8] whitespace-nowrap">Especialidad:</b>
                                    <span id="modal-boleta-carrera" class="flex-1 border-b border-dotted border-[#2258a8] text-slate-800 font-semibold truncate">Computación e Informática - Tarde</span>
                                </div>
                            </div>

                            <!-- Matriz de Conceptos -->
                            <div class="border border-[#2258a8]/50 rounded-lg p-1.5 text-[8px] space-y-1 mb-2 bg-white">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5">
                                        <span>1.- Aporte por Mantenimiento</span>
                                        <b id="modal-boleta-check-aporte" class="px-1 border border-[#2258a8] rounded text-[8px] font-black text-slate-900 bg-slate-50">X</b>
                                    </div>
                                    <span class="font-mono font-bold text-slate-900">S/. <span id="modal-boleta-monto-aporte">150.00</span></span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5">
                                        <span>2.- Constancia de estudio</span>
                                        <b id="modal-boleta-check-constancia" class="px-1 border border-[#2258a8] rounded text-[8px] font-black text-slate-900 bg-slate-50"> </b>
                                    </div>
                                    <span class="font-mono font-bold text-slate-400">S/. 0.00</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5">
                                        <span>3.- FUT</span>
                                        <b id="modal-boleta-check-fut" class="px-1 border border-[#2258a8] rounded text-[8px] font-black text-slate-900 bg-slate-50"> </b>
                                    </div>
                                    <span class="font-mono font-bold text-slate-400">S/. 0.00</span>
                                </div>
                                <div class="flex items-baseline justify-between border-t border-dotted border-[#2258a8]/40 pt-1">
                                    <div class="flex-1 pr-2 truncate">
                                        <span class="font-bold text-[#2258a8]">4.- Otros:</span>
                                        <span id="modal-boleta-nota-otros" class="italic text-slate-700 ml-1">Observaciones / notas</span>
                                    </div>
                                    <span class="font-mono font-bold text-slate-400">S/. 0.00</span>
                                </div>
                                <div class="flex items-center justify-between border-t-2 border-[#2258a8] pt-1 text-[9px] font-black text-[#2258a8]">
                                    <span>TOTAL</span>
                                    <span class="text-slate-900 font-mono">S/. <span id="modal-boleta-total">150.00</span></span>
                                </div>
                            </div>

                            <!-- Fecha y Firmas -->
                            <div class="grid grid-cols-12 gap-1 text-[7.5px] items-center pt-1 border-t border-[#2258a8]/40">
                                <div class="col-span-5 flex items-center space-x-1">
                                    <span class="font-bold">Fecha:</span>
                                    <span class="border border-[#2258a8] px-1 rounded font-mono font-bold bg-slate-50">
                                        <span id="modal-boleta-dia">16</span>/<span id="modal-boleta-mes">11</span>/<span id="modal-boleta-ano">26</span>
                                    </span>
                                </div>
                                <div class="col-span-7 flex justify-end space-x-2 text-[6.5px] text-center text-slate-500 font-bold uppercase">
                                    <div class="border-t border-dotted border-slate-400 px-1 pt-0.5">Sello Tesorero</div>
                                    <div class="border-t border-dotted border-slate-400 px-1 pt-0.5">Recaudador</div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Panel Inferior de Estado y Acciones Rápidas Directas -->
                    <div class="space-y-2">
                        <!-- Banner 1: Antes de Guardar (Modo Edición en vivo) -->
                        <div id="modal-boleta-banner-edicion" class="bg-indigo-50 dark:bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                            <span class="flex items-center gap-1.5">
                                <i class="fa-solid fa-eye text-indigo-500"></i>
                                <span>Previsualización en vivo al costadito</span>
                            </span>
                            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Actualización automática</span>
                        </div>

                        <!-- Banner 2: Emitido con Éxito (Botones Imprimir y PDF en un solo clic) -->
                        <div id="modal-boleta-banner-emitido" class="hidden bg-emerald-50 dark:bg-emerald-950/80 p-3 rounded-2xl border-2 border-emerald-500 text-xs font-bold text-emerald-950 dark:text-emerald-200 shadow-xl space-y-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <i class="fa-solid fa-circle-check text-emerald-500 text-base"></i>
                                    <span class="font-extrabold">¡BOLETA EMITIDA Y GUARDADA AL INSTANTE!</span>
                                </div>
                                <span id="modal-badge-emitido-nro" class="text-[10px] font-mono bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-md text-emerald-900 dark:text-emerald-100">0000811</span>
                            </div>
                            <p class="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Registrado en base de datos SQLite y sincronizado con el Excel oficial.</p>
                            
                            <!-- Botones Inmediatos: Imprimir, Descargar PDF y Emitir Siguiente -->
                            <div class="flex items-center space-x-2 pt-1">
                                <button type="button" onclick="imprimirBoletaModalDirecta()" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer">
                                    <i class="fa-solid fa-print"></i>
                                    <span>Imprimir Boleta</span>
                                </button>
                                <button type="button" onclick="descargarBoletaModalDirecta()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer">
                                    <i class="fa-solid fa-file-pdf"></i>
                                    <span>Descargar PDF</span>
                                </button>
                                <button type="button" onclick="reiniciarModalParaSiguiente()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2 rounded-xl text-xs flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition cursor-pointer" title="Emitir otro recibo ahora">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    </div>`;

html = html.slice(0, startIdx) + newModalHTML + html.slice(endIdx);
fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Split modal successfully inserted into templates/index.html!');
