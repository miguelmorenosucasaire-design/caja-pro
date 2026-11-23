import re

with open('templates/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# =========================================================================
# 1. AGREGAR ESTILOS CSS PARA EL TALONARIO MODAL DUAL EN 1 HOJA
# =========================================================================
css_marker = '/* Copia en tinta azul */'
css_new = '''/* Talonario Modal Dual (1 Hoja: Original Color + Copia Azul) */
        .talonario-modal-hoja {
            width: 100%;
            background: #ffffff !important;
            color: #1e3a8a;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid #cbd5e1;
            padding: 12px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .dark .talonario-modal-hoja {
            background: #ffffff !important;
            color: #1e3a8a !important;
        }
        .recibo-mini-talonario {
            width: 100%;
            background: #ffffff !important;
            color: #1e3a8a;
            font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
            border: 1.5px solid #1e3a8a;
            border-radius: 14px;
            padding: 10px 14px 8px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        .recibo-mini-talonario.recibo--copia,
        .recibo-mini-talonario.voucher-estilo-azul {
            color: #1e40af !important;
            border-color: #1e40af !important;
        }
        .recibo-mini-talonario.recibo--copia *,
        .recibo-mini-talonario.voucher-estilo-azul * {
            color: #1e40af !important;
            border-color: #1e40af !important;
        }
        .recibo-mini-talonario .voucher-box-check {
            transition: all 0.15s ease-in-out;
            user-select: none;
        }
        .recibo-mini-talonario .voucher-box-check:hover {
            background-color: #e0e7ff !important;
            transform: scale(1.1);
        }
        .btn-cuadro-mod.activo {
            background: #4f46e5 !important;
            color: #ffffff !important;
            border-color: #4338ca !important;
        }

        /* Copia en tinta azul */'''

if css_marker in html and 'talonario-modal-hoja' not in html:
    html = html.replace(css_marker, css_new, 1)
    print("CSS rules added successfully.")

# =========================================================================
# 2. REEMPLAZO DEL CUERPO DEL MODAL (COLUMNA IZQUIERDA Y COLUMNA DERECHA)
# =========================================================================
body_marker_start = '<!-- Modal Body: 2 Columns Split Screen (Left: Form, Right: Live Voucher "Al costadito") -->'
body_marker_end = '<!-- ======================================================== -->\n    <!-- MODAL 3.1: CREAR NUEVA SECCIÓN / GRUPO                   -->'

idx_start = html.find(body_marker_start)
idx_end = html.find(body_marker_end)

if idx_start == -1 or idx_end == -1:
    print(f"Error finding modal body markers! start={idx_start}, end={idx_end}")
    exit(1)

# Find where the modal-nuevo-movimiento actually ends (the 3 closing divs before body_marker_end)
sub_chunk = html[idx_start:idx_end]
closing_idx = html.rfind('</div>\n        </div>\n    </div>', idx_start, idx_end)

if closing_idx == -1:
    # try variations
    m_close = re.search(r'</div>\s*</div>\s*</div>\s*$', sub_chunk)
    if m_close:
        closing_idx = idx_start + m_close.start()

print("closing_idx found at:", closing_idx)

new_modal_body = '''<!-- Modal Body: 2 Columns Split Screen (Left: Form, Right: Live Dual Voucher "Original Color + Copia Azul") -->
            <div class="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
                
                <!-- COLUMNA IZQUIERDA (lg:col-span-6 xl:col-span-6): FORMULARIO -->
                <form id="form-nuevo-movimiento" onsubmit="guardarMovimiento(event)" class="lg:col-span-6 xl:col-span-6 p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto custom-scrollbar">
                    
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

                        <!-- Si es Estudiante: selector rápido o manual -->
                        <div id="contenedor-seleccion-estudiante" class="space-y-1">
                            <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                Buscar Estudiante Registrado (autocompleta sus datos):
                            </label>
                            <select id="select-estudiante-modal" onchange="alSeleccionarEstudianteEnModal(this.value); actualizarBoletaModalEnVivo();" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                                <option value="">-- Seleccionar Estudiante Registrado o Escribir Manual Abajo --</option>
                            </select>
                        </div>

                        <!-- Si es Docente -->
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

                    <!-- 4.1 CONTROL DE CUADRITOS DE LA BOLETA (MÓDULOS 1 AL 7, CONSTANCIA, FUT Y OTROS) -->
                    <div class="bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="block font-black text-indigo-900 dark:text-indigo-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-square-check text-indigo-600 dark:text-indigo-400"></i>
                                <span>Marcado de Cuadritos en la Boleta (Original y Copia)</span>
                            </label>
                            <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Clic para marcar [X]</span>
                        </div>

                        <!-- Fila 1: Módulos del 1 al 7 -->
                        <div class="space-y-1">
                            <div class="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                <span>1.- Aporte por Mantenimiento (Módulos):</span>
                                <div class="flex items-center space-x-1">
                                    <button type="button" onclick="marcarTodosModulosModal(true)" class="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold hover:bg-indigo-200">Marcar Todos [1-7]</button>
                                    <button type="button" onclick="marcarTodosModulosModal(false)" class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold hover:bg-slate-300">Limpiar</button>
                                </div>
                            </div>
                            <div class="grid grid-cols-7 gap-1 pt-0.5">
                                <button type="button" id="btn-toggle-mod-1" onclick="toggleCuadroModal('mod', 1)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-indigo-500 bg-indigo-600 text-white font-black text-xs text-center shadow-sm transition hover:scale-105" title="Módulo 1">I [X]</button>
                                <button type="button" id="btn-toggle-mod-2" onclick="toggleCuadroModal('mod', 2)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400" title="Módulo 2">II [ ]</button>
                                <button type="button" id="btn-toggle-mod-3" onclick="toggleCuadroModal('mod', 3)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400" title="Módulo 3">III [ ]</button>
                                <button type="button" id="btn-toggle-mod-4" onclick="toggleCuadroModal('mod', 4)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400" title="Módulo 4">IV [ ]</button>
                                <button type="button" id="btn-toggle-mod-5" onclick="toggleCuadroModal('mod', 5)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400" title="Módulo 5">V [ ]</button>
                                <button type="button" id="btn-toggle-mod-6" onclick="toggleCuadroModal('mod', 6)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400" title="Módulo 6">VI [ ]</button>
                                <button type="button" id="btn-toggle-mod-7" onclick="toggleCuadroModal('mod', 7)" class="btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400" title="Módulo 7">VII [ ]</button>
                            </div>
                        </div>

                        <!-- Fila 2: Constancia, FUT y Otros -->
                        <div class="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-200/80 dark:border-indigo-900/60">
                            <label class="flex items-center space-x-1.5 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-400 transition">
                                <input type="checkbox" id="chk-modal-constancia" onchange="toggleCuadroModal('constancia', this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5">
                                <span class="text-[10px] font-bold text-slate-800 dark:text-white truncate">2. Constancia</span>
                            </label>
                            <label class="flex items-center space-x-1.5 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-400 transition">
                                <input type="checkbox" id="chk-modal-fut" onchange="toggleCuadroModal('fut', this.checked)" class="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5">
                                <span class="text-[10px] font-bold text-slate-800 dark:text-white truncate">3. FUT</span>
                            </label>
                            <label class="flex items-center space-x-1.5 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-400 transition">
                                <input type="checkbox" id="chk-modal-otros" onchange="toggleCuadroModal('otros', this.checked)" checked class="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5">
                                <span class="text-[10px] font-bold text-slate-800 dark:text-white truncate">4. Otros</span>
                            </label>
                        </div>
                    </div>

                    <!-- 5. NOTAS U OBSERVACIONES (REFLEJADAS EN LA LÍNEA 4 'OTROS' DEL VOUCHER) -->
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                            <span class="flex items-center gap-1"><i class="fa-solid fa-pen-to-square text-amber-500"></i> Nota u Observación (Se refleja en línea "4.- Otros" del Talonario)</span>
                            <span class="text-[10px] text-slate-400 font-normal">Sincroniza con DB y Excel</span>
                        </label>
                        <input type="text" id="form-notas" oninput="actualizarBoletaModalEnVivo()" placeholder="Ej: Módulo I (Computación e Informática), pago cuota, constancia..." class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 dark:text-white shadow-sm">
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

                    <!-- BOTONES PRINCIPALES DE ACCIÓN: GUARDAR Y GUARDAR E IMPRIMIR DIRECTO -->
                    <div class="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onclick="cerrarModalNuevoMovimiento()" class="px-3.5 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition text-xs">
                            Cerrar
                        </button>
                        <div class="flex items-center space-x-2">
                            <button type="submit" id="btn-guardar-mov-modal" class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-md transition flex items-center space-x-1.5 text-xs cursor-pointer">
                                <i class="fa-solid fa-floppy-disk"></i>
                                <span>💾 Guardar Movimiento</span>
                            </button>
                            <button type="button" onclick="guardarEImprimirDirectoModal()" id="btn-guardar-imprimir-modal" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 text-xs hover:scale-105 active:scale-95 cursor-pointer" title="Guarda en base de datos, Excel y abre la impresión oficial en 1 sola hoja de inmediato">
                                <i class="fa-solid fa-print"></i>
                                <span>⚡ Guardar e Imprimir Directo</span>
                            </button>
                        </div>
                    </div>
                </form>

                <!-- COLUMNA DERECHA ("AL COSTADITO") (lg:col-span-6 xl:col-span-6): TALONARIO OFICIAL DUAL (1 HOJA) -->
                <div class="lg:col-span-6 xl:col-span-6 p-3 sm:p-4 bg-slate-100/90 dark:bg-slate-950/90 flex flex-col justify-between space-y-3 overflow-y-auto custom-scrollbar border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
                    
                    <div>
                        <!-- Header del Talonario Dual al costadito -->
                        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                            <div class="flex items-center space-x-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span>Talonario Oficial CETPRO</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">1 Hoja (Color + Azul)</span>
                                </h4>
                            </div>
                            
                            <!-- Acciones rápidas en la cabecera del visor -->
                            <div class="flex items-center space-x-1.5">
                                <button type="button" onclick="imprimirBoletaModalDirecta()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition hover:scale-105" title="Imprimir Talonario (1 Hoja: Original + Copia)">
                                    <i class="fa-solid fa-print text-[11px]"></i>
                                    <span>Imprimir</span>
                                </button>
                                <button type="button" onclick="descargarBoletaModalDirecta()" class="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition hover:scale-105" title="Descargar PDF (1 Hoja: Original + Copia)">
                                    <i class="fa-solid fa-file-pdf text-[11px]"></i>
                                    <span>PDF</span>
                                </button>
                                <button type="button" onclick="reiniciarModalParaSiguiente()" class="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold p-1.5 rounded-lg text-xs transition" title="Limpiar y nuevo">
                                    <i class="fa-solid fa-rotate-left text-[11px]"></i>
                                </button>
                            </div>
                        </div>

                        <!-- CONTENEDOR TALONARIO OFICIAL DUAL EN 1 SOLA HOJA (ORIGINAL COLOR + CORTE + COPIA AZUL) -->
                        <div id="contenedor-boleta-modal-costado" class="talonario-modal-hoja">
                            
                            <!-- ======================================================== -->
                            <!-- 1. COMPROBANTE ORIGINAL (COLOR OFICIAL)                  -->
                            <!-- ======================================================== -->
                            <div id="modal-recibo-original" class="recibo-mini-talonario relative">
                                <header class="recibo__cab">
                                    <div class="recibo__ministerio flex flex-col items-center justify-center">
                                        <img src="/public/img/minedu_barras.png" alt="Minedu" class="logo-minedu-nitido" style="width: 75px; height: auto; max-height: 36px; object-fit: contain;" onerror="this.src='/public/img/minedu_azul.svg'">
                                        <b class="text-[6.5px] font-bold mt-0.5 text-[#2258a8] leading-tight text-center uppercase tracking-tight block">Ministerio de Educación</b>
                                        <small class="text-[5px] font-bold text-[#2258a8] leading-none text-center uppercase tracking-wider block">República del Perú</small>
                                    </div>
                                    <div class="recibo__titulos">
                                        <h1 class="text-[17px] tracking-wide font-black text-[#1e3a8a]">Ministerio de Educación</h1>
                                        <p class="text-[8.5px] text-[#1e3a8a]">Unidad de Gestión Educativa Local San Román</p>
                                        <p class="text-[8.5px] text-[#1e3a8a]">Institución Educativa CETPRO Micaela Bastidas</p>
                                        <p class="recibo__ciudad text-[9px] text-[#1e3a8a]">
                                            Juliaca <span class="recibo__numero text-rose-600 font-mono font-black text-[12px] ml-2" id="modal-boleta-nro">0000811</span>
                                        </p>
                                    </div>
                                    <div class="recibo__escudo text-center">
                                        <img id="img-modal-escudo-oficial" src="/public/img/escudo_recibo_ingreso.png" alt="CETPRO" class="logo-cetpro-nitido w-7 h-7 mx-auto object-contain mb-0.5">
                                        <b class="text-[9px] font-black text-[#1e3a8a] block leading-tight">CETPRO</b>
                                        <small class="text-[5.5px] font-bold text-slate-700 block leading-tight">“MICAELA BASTIDAS”</small>
                                    </div>
                                </header>

                                <h2 class="recibo__seccion text-[12px] py-1 border-t-2 border-b font-extrabold uppercase text-[#1e3a8a] mt-1">
                                    Ingresos de recursos propios
                                </h2>

                                <div class="recibo__marco border border-[#1e3a8a] rounded-xl p-2 mt-1.5 flex flex-col space-y-1.5">
                                    <div class="recibo__datos border border-[#1e3a8a] rounded-lg p-2 space-y-1">
                                        <div class="recibo__campo text-[10px] font-bold text-[#1e3a8a] flex items-baseline gap-1">
                                            <span class="whitespace-nowrap">Señor (a):</span>
                                            <span class="punteado border-b border-dotted border-[#1e3a8a] text-slate-900 font-semibold flex-1 px-1 truncate" id="modal-boleta-estudiante">---------------------------------</span>
                                            <span class="text-[9px] text-slate-700 whitespace-nowrap ml-1">(DNI: <span id="modal-boleta-dni" class="font-mono font-bold">--------</span> - Cel: <span id="modal-boleta-telefono" class="font-mono font-bold">---------</span>)</span>
                                        </div>
                                        <div class="recibo__campo text-[10px] font-bold text-[#1e3a8a] flex items-baseline gap-1">
                                            <span class="whitespace-nowrap">Especialidad:</span>
                                            <span class="punteado border-b border-dotted border-[#1e3a8a] text-slate-800 font-semibold flex-1 px-1 truncate" id="modal-boleta-carrera">Computación e Informática - Tarde</span>
                                        </div>

                                        <div class="recibo__conceptos border border-[#1e3a8a] rounded-lg p-1.5 grid grid-cols-12 gap-1 mt-1 text-[9px]">
                                            <div class="recibo__items col-span-9 flex flex-col space-y-1">
                                                <!-- 1.- Aporte por Mantenimiento -->
                                                <div class="recibo__fila flex items-center justify-between">
                                                    <span class="font-bold text-[#1e3a8a]">1.- Aporte por Mantenimiento</span>
                                                    <span class="recibo__celdas inline-flex">
                                                        <i id="modal-box-mod-1" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900" onclick="toggleModalCuadroDirecto('mod', 1)">X</i>
                                                        <i id="modal-box-mod-2" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900 -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 2)"></i>
                                                        <i id="modal-box-mod-3" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900 -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 3)"></i>
                                                        <i id="modal-box-mod-4" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900 -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 4)"></i>
                                                        <i id="modal-box-mod-5" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900 -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 5)"></i>
                                                        <i id="modal-box-mod-6" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900 -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 6)"></i>
                                                        <i id="modal-box-mod-7" class="voucher-box-check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900 -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 7)"></i>
                                                    </span>
                                                    <span class="moneda font-bold text-[#1e3a8a] ml-1">S/</span>
                                                </div>

                                                <!-- 2.- Expedición de constancia de estudio -->
                                                <div class="recibo__fila flex items-center justify-between">
                                                    <span class="font-bold text-[#1e3a8a]">2.- Expedición de constancia de estudio</span>
                                                    <span class="recibo__check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900" id="modal-check-constancia" onclick="toggleModalCuadroDirecto('constancia')"></span>
                                                </div>

                                                <!-- 3.- FUT -->
                                                <div class="recibo__fila flex items-center justify-between">
                                                    <span class="font-bold text-[#1e3a8a]">3.- FUT</span>
                                                    <span class="recibo__check w-4 h-4 border border-[#1e3a8a] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-slate-900" id="modal-check-fut" onclick="toggleModalCuadroDirecto('fut')"></span>
                                                    <span class="punteado flex-1 border-b border-dotted border-[#1e3a8a] ml-1.5 h-3"></span>
                                                </div>

                                                <!-- 4.- Otros -->
                                                <div class="recibo__fila flex items-baseline justify-between pt-0.5">
                                                    <span class="font-bold text-[#1e3a8a] whitespace-nowrap">4.- Otros</span>
                                                    <span class="punteado flex-1 border-b border-dotted border-[#1e3a8a] text-slate-800 italic px-1 mx-1 truncate font-medium" id="modal-boleta-nota-otros">Observaciones / notas</span>
                                                    <span class="total-lbl font-extrabold text-[#1e3a8a]">TOTAL</span>
                                                </div>
                                            </div>

                                            <!-- Columna de Importes -->
                                            <div class="recibo__importes col-span-3 flex flex-col font-mono font-bold text-[9.5px] text-right">
                                                <div id="modal-monto-aporte" class="border border-[#1e3a8a] px-1 py-0.5 h-[19px] flex items-center justify-end text-slate-900">150.00</div>
                                                <div id="modal-monto-constancia" class="border-x border-b border-[#1e3a8a] px-1 py-0.5 h-[19px] flex items-center justify-end text-slate-400">/</div>
                                                <div id="modal-monto-fut" class="border-x border-b border-[#1e3a8a] px-1 py-0.5 h-[19px] flex items-center justify-end text-slate-400">/</div>
                                                <div id="modal-boleta-total" class="border-x border-b border-[#1e3a8a] px-1 py-0.5 h-[19px] flex items-center justify-end text-slate-900 font-black bg-blue-50/50">150.00</div>
                                            </div>
                                        </div>
                                    </div>

                                    <footer class="recibo__pie flex items-end justify-between pt-1 text-[8px] text-[#1e3a8a]">
                                        <div class="recibo__fecha flex items-center gap-1 font-bold">
                                            <span>Juliaca:</span>
                                            <table class="border-collapse text-center">
                                                <thead><tr><th class="px-0.5 text-[6.5px]">DÍA</th><th class="px-0.5 text-[6.5px]">MES</th><th class="px-0.5 text-[6.5px]">AÑO</th></tr></thead>
                                                <tbody>
                                                    <tr>
                                                        <td id="modal-boleta-dia" class="border border-[#1e3a8a] px-1 font-mono font-bold">16</td>
                                                        <td id="modal-boleta-mes" class="border border-[#1e3a8a] px-1 font-mono font-bold">11</td>
                                                        <td id="modal-boleta-ano" class="border border-[#1e3a8a] px-1 font-mono font-bold">26</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="recibo__firmas flex gap-3 text-center text-[6.5px] uppercase font-bold text-slate-600">
                                            <div class="border-t border-dotted border-[#1e3a8a] pt-0.5 w-24">Sello y firma del tesorero</div>
                                            <div class="border-t border-dotted border-[#1e3a8a] pt-0.5 w-24">Sello y firma del recaudador</div>
                                        </div>
                                    </footer>
                                </div>
                            </div>

                            <!-- ======================================================== -->
                            <!-- 2. LÍNEA DE CORTE TALONARIO (MEDIA CARTA)                -->
                            <!-- ======================================================== -->
                            <div id="modal-separador-corte" class="recibo-corte text-center py-1 text-[9px] font-black text-slate-500 border-y border-dashed border-slate-400 select-none my-0.5">
                                ✂ - - - - - - CORTE TALONARIO (MEDIA CARTA) - - - - - - ✂
                            </div>

                            <!-- ======================================================== -->
                            <!-- 3. COMPROBANTE COPIA (TALONARIO EN TINTA AZUL)          -->
                            <!-- ======================================================== -->
                            <div id="modal-recibo-copia" class="recibo-mini-talonario recibo--copia voucher-estilo-azul relative">
                                <header class="recibo__cab">
                                    <div class="recibo__ministerio flex flex-col items-center justify-center">
                                        <img src="/public/img/minedu_barras_azul.png" alt="Minedu" class="logo-minedu-nitido" style="width: 75px; height: auto; max-height: 36px; object-fit: contain;" onerror="this.src='/public/img/minedu_azul.svg'">
                                        <b class="text-[6.5px] font-bold mt-0.5 text-[#1e40af] leading-tight text-center uppercase tracking-tight block">Ministerio de Educación</b>
                                        <small class="text-[5px] font-bold text-[#1e40af] leading-none text-center uppercase tracking-wider block">República del Perú</small>
                                    </div>
                                    <div class="recibo__titulos">
                                        <h1 class="text-[17px] tracking-wide font-black text-[#1e40af]">Ministerio de Educación</h1>
                                        <p class="text-[8.5px] text-[#1e40af]">Unidad de Gestión Educativa Local San Román</p>
                                        <p class="text-[8.5px] text-[#1e40af]">Institución Educativa CETPRO Micaela Bastidas</p>
                                        <p class="recibo__ciudad text-[9px] text-[#1e40af]">
                                            Juliaca <span class="recibo__numero text-[#1e40af] font-mono font-black text-[12px] ml-2" id="copia-modal-boleta-nro">0000811</span>
                                        </p>
                                    </div>
                                    <div class="recibo__escudo text-center">
                                        <img id="img-copia-modal-escudo-oficial" src="/public/img/escudo_recibo_azul.png" alt="CETPRO" class="logo-cetpro-nitido w-7 h-7 mx-auto object-contain mb-0.5">
                                        <b class="text-[9px] font-black text-[#1e40af] block leading-tight">CETPRO</b>
                                        <small class="text-[5.5px] font-bold text-[#1e40af] block leading-tight">“MICAELA BASTIDAS”</small>
                                    </div>
                                </header>

                                <h2 class="recibo__seccion text-[12px] py-1 border-t-2 border-b font-extrabold uppercase text-[#1e40af] mt-1">
                                    Ingresos de recursos propios
                                </h2>

                                <div class="recibo__marco border border-[#1e40af] rounded-xl p-2 mt-1.5 flex flex-col space-y-1.5">
                                    <div class="recibo__datos border border-[#1e40af] rounded-lg p-2 space-y-1">
                                        <div class="recibo__campo text-[10px] font-bold text-[#1e40af] flex items-baseline gap-1">
                                            <span class="whitespace-nowrap">Señor (a):</span>
                                            <span class="punteado border-b border-dotted border-[#1e40af] text-[#1e40af] font-semibold flex-1 px-1 truncate" id="copia-modal-boleta-estudiante">---------------------------------</span>
                                            <span class="text-[9px] text-[#1e40af] whitespace-nowrap ml-1">(DNI: <span id="copia-modal-boleta-dni" class="font-mono font-bold">--------</span> - Cel: <span id="copia-modal-boleta-telefono" class="font-mono font-bold">---------</span>)</span>
                                        </div>
                                        <div class="recibo__campo text-[10px] font-bold text-[#1e40af] flex items-baseline gap-1">
                                            <span class="whitespace-nowrap">Especialidad:</span>
                                            <span class="punteado border-b border-dotted border-[#1e40af] text-[#1e40af] font-semibold flex-1 px-1 truncate" id="copia-modal-boleta-carrera">Computación e Informática - Tarde</span>
                                        </div>

                                        <div class="recibo__conceptos border border-[#1e40af] rounded-lg p-1.5 grid grid-cols-12 gap-1 mt-1 text-[9px]">
                                            <div class="recibo__items col-span-9 flex flex-col space-y-1">
                                                <!-- 1.- Aporte por Mantenimiento -->
                                                <div class="recibo__fila flex items-center justify-between">
                                                    <span class="font-bold text-[#1e40af]">1.- Aporte por Mantenimiento</span>
                                                    <span class="recibo__celdas inline-flex">
                                                        <i id="copia-modal-box-mod-1" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af]" onclick="toggleModalCuadroDirecto('mod', 1)">X</i>
                                                        <i id="copia-modal-box-mod-2" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af] -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 2)"></i>
                                                        <i id="copia-modal-box-mod-3" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af] -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 3)"></i>
                                                        <i id="copia-modal-box-mod-4" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af] -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 4)"></i>
                                                        <i id="copia-modal-box-mod-5" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af] -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 5)"></i>
                                                        <i id="copia-modal-box-mod-6" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af] -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 6)"></i>
                                                        <i id="copia-modal-box-mod-7" class="voucher-box-check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af] -ml-[1px]" onclick="toggleModalCuadroDirecto('mod', 7)"></i>
                                                    </span>
                                                    <span class="moneda font-bold text-[#1e40af] ml-1">S/</span>
                                                </div>

                                                <!-- 2.- Expedición de constancia de estudio -->
                                                <div class="recibo__fila flex items-center justify-between">
                                                    <span class="font-bold text-[#1e40af]">2.- Expedición de constancia de estudio</span>
                                                    <span class="recibo__check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af]" id="copia-modal-check-constancia" onclick="toggleModalCuadroDirecto('constancia')"></span>
                                                </div>

                                                <!-- 3.- FUT -->
                                                <div class="recibo__fila flex items-center justify-between">
                                                    <span class="font-bold text-[#1e40af]">3.- FUT</span>
                                                    <span class="recibo__check w-4 h-4 border border-[#1e40af] flex items-center justify-center font-bold text-[9px] cursor-pointer bg-white text-[#1e40af]" id="copia-modal-check-fut" onclick="toggleModalCuadroDirecto('fut')"></span>
                                                    <span class="punteado flex-1 border-b border-dotted border-[#1e40af] ml-1.5 h-3"></span>
                                                </div>

                                                <!-- 4.- Otros -->
                                                <div class="recibo__fila flex items-baseline justify-between pt-0.5">
                                                    <span class="font-bold text-[#1e40af] whitespace-nowrap">4.- Otros</span>
                                                    <span class="punteado flex-1 border-b border-dotted border-[#1e40af] text-[#1e40af] italic px-1 mx-1 truncate font-medium" id="copia-modal-boleta-nota-otros">Observaciones / notas</span>
                                                    <span class="total-lbl font-extrabold text-[#1e40af]">TOTAL</span>
                                                </div>
                                            </div>

                                            <!-- Columna de Importes Copia -->
                                            <div class="recibo__importes col-span-3 flex flex-col font-mono font-bold text-[9.5px] text-right">
                                                <div id="copia-modal-monto-aporte" class="border border-[#1e40af] px-1 py-0.5 h-[19px] flex items-center justify-end text-[#1e40af]">150.00</div>
                                                <div id="copia-modal-monto-constancia" class="border-x border-b border-[#1e40af] px-1 py-0.5 h-[19px] flex items-center justify-end text-[#1e40af]/60">/</div>
                                                <div id="copia-modal-monto-fut" class="border-x border-b border-[#1e40af] px-1 py-0.5 h-[19px] flex items-center justify-end text-[#1e40af]/60">/</div>
                                                <div id="copia-modal-boleta-total" class="border-x border-b border-[#1e40af] px-1 py-0.5 h-[19px] flex items-center justify-end text-[#1e40af] font-black bg-blue-50/50">150.00</div>
                                            </div>
                                        </div>
                                    </div>

                                    <footer class="recibo__pie flex items-end justify-between pt-1 text-[8px] text-[#1e40af]">
                                        <div class="recibo__fecha flex items-center gap-1 font-bold">
                                            <span>Juliaca:</span>
                                            <table class="border-collapse text-center">
                                                <thead><tr><th class="px-0.5 text-[6.5px]">DÍA</th><th class="px-0.5 text-[6.5px]">MES</th><th class="px-0.5 text-[6.5px]">AÑO</th></tr></thead>
                                                <tbody>
                                                    <tr>
                                                        <td id="copia-modal-boleta-dia" class="border border-[#1e40af] px-1 font-mono font-bold">16</td>
                                                        <td id="copia-modal-boleta-mes" class="border border-[#1e40af] px-1 font-mono font-bold">11</td>
                                                        <td id="copia-modal-boleta-ano" class="border border-[#1e40af] px-1 font-mono font-bold">26</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="recibo__firmas flex gap-3 text-center text-[6.5px] uppercase font-bold text-[#1e40af]">
                                            <div class="border-t border-dotted border-[#1e40af] pt-0.5 w-24">Sello y firma del tesorero</div>
                                            <div class="border-t border-dotted border-[#1e40af] pt-0.5 w-24">Sello y firma del recaudador</div>
                                        </div>
                                    </footer>
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
                                <span>Talonario Dual: 1° Original Color + 2° Copia Azul</span>
                            </span>
                            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Ajuste exacto a 1 sola hoja</span>
                        </div>

                        <!-- Banner 2: Emitido con Éxito (Botones Imprimir y PDF en un solo clic) -->
                        <div id="modal-boleta-banner-emitido" class="hidden bg-emerald-50 dark:bg-emerald-950/80 p-3 rounded-2xl border-2 border-emerald-500 text-xs font-bold text-emerald-950 dark:text-emerald-200 shadow-xl space-y-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <i class="fa-solid fa-circle-check text-emerald-500 text-base"></i>
                                    <span class="font-extrabold">¡BOLETA EMITIDA Y GUARDADA CON ÉXITO!</span>
                                </div>
                                <span id="modal-badge-emitido-nro" class="text-[10px] font-mono bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-md text-emerald-900 dark:text-emerald-100">0000811</span>
                            </div>
                            <p class="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Registrado en base de datos SQLite y sincronizado con el Excel oficial.</p>
                            
                            <!-- Botones Inmediatos: Imprimir (1 Hoja), Descargar PDF y Emitir Siguiente -->
                            <div class="flex items-center space-x-2 pt-1">
                                <button type="button" onclick="imprimirBoletaModalDirecta()" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer" title="Imprimir Talonario (Original + Copia en 1 Hoja)">
                                    <i class="fa-solid fa-print"></i>
                                    <span>Imprimir (1 Hoja)</span>
                                </button>
                                <button type="button" onclick="descargarBoletaModalDirecta()" class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer" title="Descargar PDF (Original + Copia en 1 Hoja)">
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

            </div>'''

# Replace modal body
html = html[:idx_start] + new_modal_body + html[closing_idx + len('</div>\n        </div>\n    </div>'):]
print("Modal body updated successfully.")

# =========================================================================
# 3. REEMPLAZO DE LAS FUNCIONES JAVASCRIPT DEL MODAL (AL FINAL DE INDEX.HTML)
# =========================================================================
js_marker_start = '// =========================================================================\n        // SINCRONIZACIÓN EN VIVO DE LA BOLETA "AL COSTADITO" EN EL MODAL'
js_marker_end = '</script>\n</body>\n</html>'

idx_js_start = html.find(js_marker_start)
idx_js_end = html.find(js_marker_end)

if idx_js_start == -1 or idx_js_end == -1:
    print(f"Error finding JS markers! start={idx_js_start}, end={idx_js_end}")
    exit(1)

new_js_code = '''// =========================================================================
        // SINCRONIZACIÓN EN VIVO DE LA BOLETA DUAL (ORIGINAL + COPIA) EN EL MODAL
        // =========================================================================
        let modalCuadrosEstado = {
            modulos: [true, false, false, false, false, false, false],
            constancia: false,
            fut: false,
            otros: true
        };

        function toggleCuadroModal(tipo, val) {
            if (tipo === 'mod') {
                const idx = Number(val) - 1;
                if (idx >= 0 && idx < 7) {
                    modalCuadrosEstado.modulos[idx] = !modalCuadrosEstado.modulos[idx];
                }
            } else if (tipo === 'constancia') {
                modalCuadrosEstado.constancia = (typeof val === 'boolean') ? val : !modalCuadrosEstado.constancia;
            } else if (tipo === 'fut') {
                modalCuadrosEstado.fut = (typeof val === 'boolean') ? val : !modalCuadrosEstado.fut;
            } else if (tipo === 'otros') {
                modalCuadrosEstado.otros = (typeof val === 'boolean') ? val : !modalCuadrosEstado.otros;
            }
            actualizarBoletaModalEnVivo();
        }

        function toggleModalCuadroDirecto(tipo, val) {
            toggleCuadroModal(tipo, val);
        }

        function marcarTodosModulosModal(todos) {
            modalCuadrosEstado.modulos = [todos, todos, todos, todos, todos, todos, todos];
            actualizarBoletaModalEnVivo();
        }

        function actualizarBoletaModalEnVivo() {
            const nomVal = (document.getElementById('form-nombre')?.value || '').trim();
            const dniVal = (document.getElementById('form-dni')?.value || '').trim();
            const telVal = (document.getElementById('form-telefono')?.value || '').trim();
            const carrVal = document.getElementById('form-carrera')?.value || 'Computación e Informática';
            const turnoVal = document.getElementById('form-turno')?.value || 'Tarde';
            const compVal = (document.getElementById('form-comprobante')?.value || '').trim();
            const concVal = (document.getElementById('form-concepto')?.value || '').trim();
            const montoVal = parseFloat(document.getElementById('form-monto')?.value) || 0;
            const notasVal = (document.getElementById('form-notas')?.value || '').trim();
            const fechaVal = document.getElementById('form-fecha')?.value || new Date().toISOString().split('T')[0];

            // 1. Número correlativo oficial (rojo en Original, azul en Copia)
            const compTexto = compVal ? compVal.padStart(7, '0') : '0000811';
            const elNro = document.getElementById('modal-boleta-nro');
            const elCopiaNro = document.getElementById('copia-modal-boleta-nro');
            if (elNro) elNro.innerText = compTexto;
            if (elCopiaNro) elCopiaNro.innerText = compTexto;

            // 2. Estudiante / Señor (a)
            const nombreMostrado = nomVal ? nomVal : '---------------------------------';
            const elEst = document.getElementById('modal-boleta-estudiante');
            const elCopiaEst = document.getElementById('copia-modal-boleta-estudiante');
            if (elEst) elEst.innerText = nombreMostrado;
            if (elCopiaEst) elCopiaEst.innerText = nombreMostrado;

            // 3. DNI y Celular
            const elDni = document.getElementById('modal-boleta-dni');
            const elCopiaDni = document.getElementById('copia-modal-boleta-dni');
            if (elDni) elDni.innerText = dniVal || '--------';
            if (elCopiaDni) elCopiaDni.innerText = dniVal || '--------';

            const elTel = document.getElementById('modal-boleta-telefono');
            const elCopiaTel = document.getElementById('copia-modal-boleta-telefono');
            if (elTel) elTel.innerText = telVal || '---------';
            if (elCopiaTel) elCopiaTel.innerText = telVal || '---------';

            // 4. Especialidad
            const especialidadTexto = turnoVal ? `${carrVal} - ${turnoVal}` : carrVal;
            const elCarr = document.getElementById('modal-boleta-carrera');
            const elCopiaCarr = document.getElementById('copia-modal-boleta-carrera');
            if (elCarr) elCarr.innerText = especialidadTexto;
            if (elCopiaCarr) elCopiaCarr.innerText = especialidadTexto;

            // 5. Módulos 1 al 7
            for (let i = 1; i <= 7; i++) {
                const activo = !!modalCuadrosEstado.modulos[i - 1];
                const boxOrig = document.getElementById(`modal-box-mod-${i}`);
                const boxCopia = document.getElementById(`copia-modal-box-mod-${i}`);
                const btnToggle = document.getElementById(`btn-toggle-mod-${i}`);
                const mark = activo ? 'X' : '';

                if (boxOrig) boxOrig.innerText = mark;
                if (boxCopia) boxCopia.innerText = mark;

                if (btnToggle) {
                    const romanos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
                    btnToggle.innerText = `${romanos[i - 1]} [${mark || ' '}]`;
                    if (activo) {
                        btnToggle.className = 'btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-indigo-500 bg-indigo-600 text-white font-black text-xs text-center shadow-sm transition hover:scale-105';
                    } else {
                        btnToggle.className = 'btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400';
                    }
                }
            }

            // 6. Constancia y FUT
            const boxConst = document.getElementById('modal-check-constancia');
            const boxCopiaConst = document.getElementById('copia-modal-check-constancia');
            const chkConst = document.getElementById('chk-modal-constancia');
            const markConst = modalCuadrosEstado.constancia ? 'X' : '';
            if (boxConst) boxConst.innerText = markConst;
            if (boxCopiaConst) boxCopiaConst.innerText = markConst;
            if (chkConst) chkConst.checked = !!modalCuadrosEstado.constancia;

            const boxFut = document.getElementById('modal-check-fut');
            const boxCopiaFut = document.getElementById('copia-modal-check-fut');
            const chkFut = document.getElementById('chk-modal-fut');
            const markFut = modalCuadrosEstado.fut ? 'X' : '';
            if (boxFut) boxFut.innerText = markFut;
            if (boxCopiaFut) boxCopiaFut.innerText = markFut;
            if (chkFut) chkFut.checked = !!modalCuadrosEstado.fut;

            const chkOtros = document.getElementById('chk-modal-otros');
            if (chkOtros) chkOtros.checked = !!modalCuadrosEstado.otros;

            // 7. Línea 4 Otros (Notas u observaciones)
            const textoNota = modalCuadrosEstado.otros ? (notasVal || concVal || 'Módulo I (Computación e Informática)') : '';
            const nOtros = document.getElementById('modal-boleta-nota-otros');
            const nCopiaOtros = document.getElementById('copia-modal-boleta-nota-otros');
            if (nOtros) nOtros.innerText = textoNota;
            if (nCopiaOtros) nCopiaOtros.innerText = textoNota;

            // 8. Importes
            const fMoney = (val) => Number(val).toFixed(2);
            const montoStr = fMoney(montoVal);
            const anyModActive = modalCuadrosEstado.modulos.some(Boolean);

            const mAporte = document.getElementById('modal-monto-aporte');
            const mCopiaAporte = document.getElementById('copia-modal-monto-aporte');
            const mConst = document.getElementById('modal-monto-constancia');
            const mCopiaConst = document.getElementById('copia-modal-monto-constancia');
            const mFut = document.getElementById('modal-monto-fut');
            const mCopiaFut = document.getElementById('copia-modal-monto-fut');
            const elTotal = document.getElementById('modal-boleta-total');
            const elCopiaTotal = document.getElementById('copia-modal-boleta-total');

            if (elTotal) elTotal.innerText = montoStr;
            if (elCopiaTotal) elCopiaTotal.innerText = montoStr;

            if (modalCuadrosEstado.constancia && !anyModActive) {
                if (mConst) mConst.innerText = montoStr;
                if (mCopiaConst) mCopiaConst.innerText = montoStr;
                if (mAporte) mAporte.innerText = '/';
                if (mCopiaAporte) mCopiaAporte.innerText = '/';
            } else if (modalCuadrosEstado.fut && !anyModActive) {
                if (mFut) mFut.innerText = montoStr;
                if (mCopiaFut) mCopiaFut.innerText = montoStr;
                if (mAporte) mAporte.innerText = '/';
                if (mCopiaAporte) mCopiaAporte.innerText = '/';
            } else {
                if (mAporte) mAporte.innerText = montoStr;
                if (mCopiaAporte) mCopiaAporte.innerText = montoStr;
                if (mConst) mConst.innerText = '/';
                if (mCopiaConst) mCopiaConst.innerText = '/';
                if (mFut) mFut.innerText = '/';
                if (mCopiaFut) mCopiaFut.innerText = '/';
            }

            // 9. Fecha
            const [y, m, d] = fechaVal.split('-');
            const diaStr = d || '16';
            const mesStr = m || '11';
            const anoStr = (y || '2026').slice(-2);

            const elDia = document.getElementById('modal-boleta-dia');
            const elMes = document.getElementById('modal-boleta-mes');
            const elAno = document.getElementById('modal-boleta-ano');
            if (elDia) elDia.innerText = diaStr;
            if (elMes) elMes.innerText = mesStr;
            if (elAno) elAno.innerText = anoStr;

            const elCopiaDia = document.getElementById('copia-modal-boleta-dia');
            const elCopiaMes = document.getElementById('copia-modal-boleta-mes');
            const elCopiaAno = document.getElementById('copia-modal-boleta-ano');
            if (elCopiaDia) elCopiaDia.innerText = diaStr;
            if (elCopiaMes) elCopiaMes.innerText = mesStr;
            if (elCopiaAno) elCopiaAno.innerText = anoStr;
        }

        function setConceptoModal(conc) {
            const inp = document.getElementById('form-concepto');
            if (inp) {
                inp.value = conc;
                const concLow = conc.toLowerCase();
                if (concLow.includes('constancia')) {
                    modalCuadrosEstado.constancia = true;
                    modalCuadrosEstado.fut = false;
                } else if (concLow.includes('fut')) {
                    modalCuadrosEstado.fut = true;
                    modalCuadrosEstado.constancia = false;
                } else if (concLow.includes('aporte')) {
                    modalCuadrosEstado.modulos[0] = true;
                }
                actualizarBoletaModalEnVivo();
            }
        }

        function setMontoModal(monto) {
            const inp = document.getElementById('form-monto');
            if (inp) {
                inp.value = monto > 0 ? monto.toFixed(2) : '';
                actualizarBoletaModalEnVivo();
            }
        }

        // =========================================================================
        // ACCIONES DIRECTAS EN EL TALONARIO DUAL (GUARDAR E IMPRIMIR, PRINT Y PDF)
        // =========================================================================
        async function guardarEImprimirDirectoModal() {
            const form = document.getElementById('form-nuevo-movimiento');
            if (form && !form.reportValidity()) return;

            // Ejecutar guardado estándar
            await guardarMovimiento(new Event('submit', { cancelable: true }));

            // Inmediatamente abrir impresión dual en 1 sola hoja
            setTimeout(() => {
                imprimirBoletaModalDirecta();
            }, 350);
        }

        function imprimirBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const nro = document.getElementById('modal-boleta-nro')?.innerText || '0000811';
            const printWin = window.open('', '_blank', 'width=880,height=850');
            if (!printWin) {
                window.print();
                return;
            }

            printWin.document.write('<!DOCTYPE html><html><head>');
            printWin.document.write('<meta charset="UTF-8">');
            printWin.document.write('<title>Boleta Oficial CETPRO San Miguel N° ' + nro + ' - Original y Copia</title>');
            printWin.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">');
            printWin.document.write('<style>');
            printWin.document.write('@page { size: letter portrait; margin: 4mm 6mm !important; }');
            printWin.document.write('* { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }');
            printWin.document.write('body { font-family: "Arial Narrow", Arial, Helvetica, sans-serif !important; background: #ffffff !important; margin: 0 !important; padding: 0 !important; color: #1e3a8a !important; }');
            printWin.document.write('.talonario-modal-hoja { width: 8.2in !important; max-width: 8.2in !important; height: 10.6in !important; max-height: 10.6in !important; margin: 0 auto !important; padding: 0 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; page-break-after: avoid !important; page-break-inside: avoid !important; border: none !important; box-shadow: none !important; background: #ffffff !important; }');
            printWin.document.write('.recibo-mini-talonario { width: 100% !important; height: 5.15in !important; max-height: 5.15in !important; padding: 0.12in 0.35in 0.08in !important; display: flex !important; flex-direction: column !important; page-break-inside: avoid !important; overflow: hidden !important; background: #ffffff !important; border: 1.5px solid #1e3a8a !important; border-radius: 12px !important; }');
            printWin.document.write('.recibo-corte { height: 0.22in !important; line-height: 0.22in !important; text-align: center !important; font-size: 9.5px !important; font-weight: 800 !important; color: #475569 !important; border-top: 1px dashed #64748b !important; border-bottom: 1px dashed #64748b !important; margin: 2px 0 !important; page-break-inside: avoid !important; }');
            printWin.document.write('.recibo__cab { display: grid !important; grid-template-columns: 1.35in 1fr 1.15in !important; align-items: center !important; column-gap: 6px !important; }');
            printWin.document.write('.recibo__titulos h1 { margin: 0 !important; font-size: 20px !important; letter-spacing: 1px !important; font-weight: 800 !important; color: #1e3a8a !important; text-align: center !important; }');
            printWin.document.write('.recibo__titulos p { margin: 0 !important; font-size: 9px !important; text-align: center !important; }');
            printWin.document.write('.recibo__seccion { border-top: 2px double #1e3a8a !important; border-bottom: 1.5px solid #1e3a8a !important; padding: 2px 0 !important; font-size: 13px !important; font-weight: 800 !important; text-align: center !important; }');
            printWin.document.write('.recibo__marco { border: 1.5px solid #1e3a8a !important; border-radius: 10px !important; padding: 6px 10px !important; flex: 1 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }');
            printWin.document.write('.recibo__datos { border: 1px solid #1e3a8a !important; border-radius: 8px !important; padding: 4px 8px !important; }');
            printWin.document.write('.voucher-estilo-azul, .voucher-estilo-azul * { color: #1e40af !important; border-color: #1e40af !important; }');
            printWin.document.write('.voucher-estilo-azul .recibo__numero { color: #1e40af !important; }');
            printWin.document.write('</style>');
            printWin.document.write('</head><body>');
            printWin.document.write('<div class="talonario-modal-hoja">');
            printWin.document.write(cont.innerHTML);
            printWin.document.write('</div>');
            printWin.document.write('<' + 'script' + '>');
            printWin.document.write('window.onload = function() { setTimeout(function() { window.focus(); window.print(); window.close(); }, 350); };');
            printWin.document.write('<' + '/script' + '>');
            printWin.document.write('</body></html>');
            printWin.document.close();
        }

        function descargarBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const nro = document.getElementById('modal-boleta-nro')?.innerText || '0000811';
            const nom = (document.getElementById('modal-boleta-estudiante')?.innerText || 'ALUMNO').trim().replace(/[^a-zA-Z0-9]/g, '_');
            
            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [0.12, 0.20, 0.12, 0.20],
                    filename: `Boleta_Oficial_${nro}_${nom}_Original_y_Copia.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };
                html2pdf().set(opt).from(cont).save();
            } else {
                imprimirBoletaModalDirecta();
            }
        }

        function reiniciarModalParaSiguiente() {
            const form = document.getElementById('form-nuevo-movimiento');
            if (form) form.reset();

            // Reiniciar cuadritos a estado inicial
            modalCuadrosEstado = {
                modulos: [true, false, false, false, false, false, false],
                constancia: false,
                fut: false,
                otros: true
            };

            const bEdicion = document.getElementById('modal-boleta-banner-edicion');
            const bEmitido = document.getElementById('modal-boleta-banner-emitido');
            if (bEdicion) bEdicion.classList.remove('hidden');
            if (bEmitido) bEmitido.classList.add('hidden');

            // Cargar fecha de hoy
            const inpFecha = document.getElementById('form-fecha');
            if (inpFecha) inpFecha.value = new Date().toISOString().split('T')[0];

            // Consultar el próximo correlativo oficial
            fetch('/api/movimientos/proximo-comprobante')
                .then(r => r.json())
                .then(d => {
                    const inpComp = document.getElementById('form-comprobante');
                    if (inpComp && d.proximo_comprobante) {
                        inpComp.value = d.proximo_comprobante;
                    }
                    actualizarBoletaModalEnVivo();
                })
                .catch(() => {
                    actualizarBoletaModalEnVivo();
                });
        }
'''

html = html[:idx_js_start] + new_js_code + '\n' + html[idx_js_end:]
print("JavaScript functions updated successfully.")

with open('templates/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("templates/index.html successfully written!")
