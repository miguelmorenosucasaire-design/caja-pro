const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// Target is the content inside section-grupos
const targetStart = `<div id="section-grupos" class="hidden space-y-6">`;

const newGruposContent = `<div id="section-grupos" class="hidden space-y-6">
                <!-- Membrete de Impresión / PDF Oficial para la Hoja de Grupos -->
                <div class="hidden print-header-institucional">
                    <div class="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                        <div>
                            <h1 class="text-xl font-extrabold text-slate-900">CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA</h1>
                            <p class="text-xs text-slate-600">RUC: 20485938210 · Dirección: Av. Costanera 1200, San Miguel · Tel: (01) 566-2390</p>
                            <h2 class="text-sm font-bold text-slate-800 mt-1" id="print-titulo-seccion">HOJA OFICIAL DE SECCIONES Y PLANTILLA POR GRUPO</h2>
                        </div>
                        <div class="text-right text-xs text-slate-500">
                            <p>Año Lectivo: 2026</p>
                            <p>Fecha de Emisión: <span class="font-bold text-slate-800">${new Date().toLocaleDateString('es-PE')}</span></p>
                        </div>
                    </div>
                </div>

                <!-- Banner Superior -->
                <div class="bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center text-2xl shadow-lg">
                            <i class="fa-solid fa-users-rectangle"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-chalkboard-user"></i>
                                <span>Organización Académica • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-bold">Secciones por Grupo y Encargado de Clase</h3>
                            <p class="text-xs text-slate-300 mt-1">Supervisión integral de grupos, docentes encargados de clase, alumnos inscritos y control de cantidades y movimientos monetarios.</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button onclick="exportarHojaPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>Exportar Sección a PDF</span>
                        </button>
                        <button onclick="exportarHojaExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>Exportar a Excel</span>
                        </button>
                        <button onclick="abrirModalNuevoGrupo()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/30 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>Nueva Sección</span>
                        </button>
                    </div>
                </div>

                <!-- SELECTOR RÁPIDO DE SECCIONES (PESTAÑAS ESTILO EXCEL) -->
                <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>Sección:</span>
                    </span>

                    <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        🌐 Todas las Secciones
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
                </div>

                <!-- CONTENEDOR 1: VISTA GENERAL DE TODAS LAS SECCIONES -->
                <div id="vista-todas-secciones" class="space-y-6">
                    <!-- Métricas Rápidas de Grupos -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-users-rectangle"></i>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-slate-400 uppercase">Grupos / Secciones</p>
                                <h4 id="grupos-total-count" class="text-lg font-extrabold text-slate-800">0 Activos</h4>
                            </div>
                        </div>

                        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-user-graduate"></i>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-slate-400 uppercase">Total Estudiantes</p>
                                <h4 id="grupos-total-alumnos" class="text-lg font-extrabold text-slate-800">0 Alumnos</h4>
                            </div>
                        </div>

                        <div class="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-circle-arrow-down"></i>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-emerald-800 uppercase">Ingresos de Grupos</p>
                                <h4 id="grupos-total-ingresos" class="text-lg font-extrabold text-emerald-600">S/. 0.00</h4>
                            </div>
                        </div>

                        <div class="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
                                <i class="fa-solid fa-circle-arrow-up"></i>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-rose-800 uppercase">Egresos de Grupos</p>
                                <h4 id="grupos-total-egresos" class="text-lg font-extrabold text-rose-600">S/. 0.00</h4>
                            </div>
                        </div>
                    </div>

                    <!-- Barra de Filtros de Grupos -->
                    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-4 items-center justify-between no-print">
                        <div class="flex flex-wrap gap-3 items-center flex-1">
                            <div class="relative min-w-[240px]">
                                <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
                                <input type="text" id="filtro-grupos-buscar" oninput="filtrarGrupos()" placeholder="Buscar por grupo o encargado de clase..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            </div>

                            <select id="filtro-grupos-carrera" onchange="cargarGrupos()" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[200px]">
                                <option value="">Todas las Especialidades</option>
                                <option value="Computación e Informática">Computación e Informática</option>
                                <option value="Confección Textil">Confección Textil</option>
                                <option value="Cosmetología y Peluquería">Cosmetología y Peluquería</option>
                                <option value="Gastronomía y Pastelería">Gastronomía y Pastelería</option>
                                <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                                <option value="Contabilidad y Finanzas">Contabilidad y Finanzas</option>
                            </select>

                            <select id="filtro-grupos-turno" onchange="cargarGrupos()" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option value="">Todos los Turnos</option>
                                <option value="Mañana">Turno Mañana</option>
                                <option value="Tarde">Turno Tarde</option>
                                <option value="Noche">Turno Noche</option>
                            </select>
                        </div>
                    </div>

                    <!-- Contenedor Cuadrícula de Tarjetas de Grupos -->
                    <div id="grid-grupos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="col-span-3 text-center py-12 text-slate-400">Cargando secciones por grupo...</div>
                    </div>
                </div>

                <!-- CONTENEDOR 2: PLANTILLA OFICIAL DE LA SECCIÓN SELECCIONADA -->
                <div id="vista-plantilla-seccion" class="hidden space-y-6">
                    <!-- Encabezado de la Plantilla de la Sección -->
                    <div class="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md">
                        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <div class="flex items-center space-x-2 mb-1.5">
                                    <span class="bg-indigo-100 text-indigo-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                        PLANTILLA OFICIAL DE CONTROL DE SECCIÓN
                                    </span>
                                    <span id="plantilla-seccion-codigo-badge" class="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                                        G01
                                    </span>
                                </div>
                                <h3 id="plantilla-seccion-nombre" class="text-2xl font-black text-slate-900 leading-tight">
                                    Corte y Confección - Grupo A
                                </h3>
                                <p id="plantilla-seccion-subtitulo" class="text-xs text-slate-500 font-semibold mt-1">
                                    Módulo de Especialidad Técnica • Periodo Anual 2026
                                </p>
                            </div>

                            <div class="flex items-center space-x-3 no-print">
                                <button onclick="mostrarTodasLasSecciones()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition">
                                    <i class="fa-solid fa-arrow-left"></i>
                                    <span>Ver Todas las Secciones</span>
                                </button>
                                <button onclick="exportarHojaPDF()" class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-sm">
                                    <i class="fa-solid fa-file-pdf text-rose-600"></i>
                                    <span>Exportar a PDF</span>
                                </button>
                                <button onclick="exportarHojaExcel()" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-sm">
                                    <i class="fa-solid fa-file-excel text-emerald-600"></i>
                                    <span>Exportar a Excel</span>
                                </button>
                            </div>
                        </div>

                        <!-- Ficha de Datos Técnicos de la Sección -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-2">
                            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Docente Encargado(a)</span>
                                <h5 id="plantilla-seccion-encargado" class="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center space-x-1.5">
                                    <i class="fa-solid fa-chalkboard-user text-indigo-600"></i>
                                    <span>Teresa Aguilar Gómez</span>
                                </h5>
                            </div>

                            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Turno y Horario</span>
                                <h5 id="plantilla-seccion-horario" class="text-xs font-bold text-slate-800 mt-0.5 flex items-center space-x-1.5">
                                    <i class="fa-solid fa-clock text-sky-600"></i>
                                    <span>Mañana • Lun-Mié-Vie 8:00-13:00</span>
                                </h5>
                            </div>

                            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aula / Taller</span>
                                <h5 id="plantilla-seccion-aula" class="text-xs font-bold text-slate-800 mt-0.5 flex items-center space-x-1.5">
                                    <i class="fa-solid fa-door-open text-emerald-600"></i>
                                    <span>Taller de Confección 1</span>
                                </h5>
                            </div>

                            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialidad</span>
                                <h5 id="plantilla-seccion-carrera" class="text-xs font-bold text-indigo-700 mt-0.5 flex items-center space-x-1.5">
                                    <i class="fa-solid fa-scissors"></i>
                                    <span>Confección Textil</span>
                                </h5>
                            </div>
                        </div>

                        <!-- KPIs de la Sección -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div class="bg-indigo-50/60 border border-indigo-200 p-4 rounded-xl flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
                                    <i class="fa-solid fa-user-graduate"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-bold text-indigo-600 uppercase">Alumnos en esta Sección</p>
                                    <h4 id="plantilla-kpi-alumnos" class="text-xl font-black text-indigo-950">0 Estudiantes</h4>
                                </div>
                            </div>

                            <div class="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
                                    <i class="fa-solid fa-circle-arrow-down"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-bold text-emerald-700 uppercase">Total Recaudado (Ingresos)</p>
                                    <h4 id="plantilla-kpi-ingresos" class="text-xl font-black text-emerald-800">S/. 0.00</h4>
                                </div>
                            </div>

                            <div class="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm">
                                    <i class="fa-solid fa-clock-rotate-left"></i>
                                </div>
                                <div>
                                    <p class="text-[10px] font-bold text-amber-700 uppercase">Deuda Pendiente de Cobro</p>
                                    <h4 id="plantilla-kpi-deuda" class="text-xl font-black text-amber-800">S/. 0.00</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- FORMULARIO DIRECTO INTEGRADO: AÑADIR MOVIMIENTO A ESTA SECCIÓN -->
                    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm no-print">
                        <div class="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-base">
                                <i class="fa-solid fa-money-bill-wave"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                                    Ingresar Cantidad / Registrar Movimiento en Esta Sección
                                </h4>
                                <p class="text-[11px] text-slate-500">
                                    Selecciona el estudiante, indica el tipo de movimiento, nota o concepto y digita la cantidad exacta en Soles. Se reflejará de inmediato abajo.
                                </p>
                            </div>
                        </div>

                        <!-- Banner Verde de Confirmación Instantánea -->
                        <div id="aviso-movimiento-seccion" class="hidden mb-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 font-bold flex items-center justify-between text-xs transition shadow-sm">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
                                <span id="aviso-movimiento-texto">¡Movimiento guardado con éxito!</span>
                            </div>
                            <span class="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-md uppercase font-extrabold">ACTUALIZADO</span>
                        </div>

                        <form id="form-movimiento-seccion-directo" onsubmit="guardarMovimientoEnSeccion(event)" class="space-y-4 text-xs">
                            <input type="hidden" id="seccion-form-tipo" value="Ingreso">
                            <input type="hidden" id="seccion-form-grupo-id" value="">
                            <input type="hidden" id="seccion-form-grupo-nombre" value="">

                            <!-- Selector Visual de Tipo (Ingreso / Egreso) -->
                            <div class="grid grid-cols-2 gap-3">
                                <button type="button" id="btn-seccion-tipo-ingreso" onclick="cambiarTipoMovimientoSeccion('Ingreso')" class="py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm">
                                    <i class="fa-solid fa-circle-arrow-down text-emerald-600 text-sm"></i>
                                    <span>🟢 INGRESO (Entrada de Dinero)</span>
                                </button>
                                <button type="button" id="btn-seccion-tipo-egreso" onclick="cambiarTipoMovimientoSeccion('Egreso')" class="py-2.5 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50">
                                    <i class="fa-solid fa-circle-arrow-up text-rose-500 text-sm"></i>
                                    <span>🔴 EGRESO (Salida / Gasto de Clase)</span>
                                </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <!-- Estudiante -->
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Estudiante de la Sección *</label>
                                    <select id="seccion-form-estudiante-select" onchange="seleccionarEstudianteSeccion(this.value)" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                        <option value="">Seleccione estudiante...</option>
                                    </select>
                                    <input type="text" id="seccion-form-estudiante-custom" placeholder="O escriba nombre completo si es nuevo..." class="mt-1.5 w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                </div>

                                <!-- Encargado de la Clase -->
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Docente Encargado(a) de la Clase *</label>
                                    <input type="text" id="seccion-form-encargado" readonly class="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-not-allowed">
                                </div>

                                <!-- Fecha -->
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Fecha del Movimiento *</label>
                                    <input type="date" id="seccion-form-fecha" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <!-- Nota / Concepto -->
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Nota / Concepto del Movimiento *</label>
                                    <input type="text" id="seccion-form-concepto" required placeholder="Ej: Matrícula, Cuota Mensual, Materiales..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                </div>

                                <!-- Cantidad a Ingresar -->
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Ingresar Cantidad (S/.) *</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2.5 text-slate-500 font-bold">S/.</span>
                                        <input type="number" step="0.50" min="0.50" id="seccion-form-monto" required placeholder="0.00" class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-emerald-300 rounded-xl text-sm font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                    </div>
                                </div>

                                <!-- Método de Pago -->
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Forma de Pago *</label>
                                    <select id="seccion-form-metodo" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                        <option value="Efectivo">Efectivo en Caja</option>
                                        <option value="Yape">Yape</option>
                                        <option value="Plin">Plin</option>
                                        <option value="Transferencia BCP">Transferencia BCP</option>
                                        <option value="Depósito Banco Nación">Depósito Banco de la Nación</option>
                                    </select>
                                </div>
                            </div>

                            <div class="flex items-center justify-end space-x-3 pt-2">
                                <button type="reset" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition">
                                    Limpiar Campos
                                </button>
                                <button type="submit" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition transform active:scale-95">
                                    <i class="fa-solid fa-floppy-disk"></i>
                                    <span>💾 Guardar y Añadir a Esta Sección</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- TABLA 1: NÓMINA DE ESTUDIANTES DE ESTA SECCIÓN (FORMATO EXCEL) -->
                    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-user-graduate text-indigo-600 text-sm"></i>
                                <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                    Nómina de Estudiantes de la Sección (Formato Hoja Excel ESTUDIANTES)
                                </h4>
                            </div>
                            <span id="plantilla-tabla-alumnos-count" class="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                                0 Alumnos
                            </span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                        <th class="py-3 px-4">#</th>
                                        <th class="py-3 px-4">Código / DNI</th>
                                        <th class="py-3 px-4">Apellidos y Nombres</th>
                                        <th class="py-3 px-4">Teléfono</th>
                                        <th class="py-3 px-4 text-right">Total Pagado (S/.)</th>
                                        <th class="py-3 px-4 text-right">DEUDA (S/.)</th>
                                        <th class="py-3 px-4 text-center">Estado Financiero</th>
                                        <th class="py-3 px-4 text-center no-print">Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="plantilla-tabla-alumnos-body" class="divide-y divide-slate-100 font-medium">
                                    <tr>
                                        <td colspan="8" class="text-center py-6 text-slate-400">Cargando nómina de estudiantes...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- TABLA 2: REGISTRO DE RECIBOS Y MOVIMIENTOS DE LA SECCIÓN (FORMATO EXCEL) -->
                    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-receipt text-emerald-600 text-sm"></i>
                                <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider">
                                    Registro de Recibos y Movimientos de Esta Sección (Formato Hoja Excel INGRESOS)
                                </h4>
                            </div>
                            <span id="plantilla-tabla-movimientos-count" class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                                0 Recibos
                            </span>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                        <th class="py-3 px-4">N° Recibo</th>
                                        <th class="py-3 px-4">Fecha</th>
                                        <th class="py-3 px-4">Estudiante / Persona</th>
                                        <th class="py-3 px-4">Encargado de Clase</th>
                                        <th class="py-3 px-4 text-center">Tipo</th>
                                        <th class="py-3 px-4">Nota / Concepto</th>
                                        <th class="py-3 px-4 text-right font-extrabold">Cantidad (S/.)</th>
                                        <th class="py-3 px-4 text-center">Método</th>
                                        <th class="py-3 px-4 text-center no-print">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="plantilla-tabla-movimientos-body" class="divide-y divide-slate-100 font-medium">
                                    <tr>
                                        <td colspan="9" class="text-center py-6 text-slate-400">Cargando movimientos de esta sección...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;

// Replace in html
const endGrupos = html.indexOf('<!-- ===================================================================\r\n            <!-- 3. SECCIÓN: PLANTILLA DE ESTUDIANTES');
const altEndGrupos = html.indexOf('id="section-estudiantes"');

let sliceEnd = altEndGrupos;
if (sliceEnd > -1) {
    // Find the comment or container before section-estudiantes
    const prevComment = html.lastIndexOf('<!-- ===', sliceEnd);
    if (prevComment > -1) sliceEnd = prevComment;
}

const startGrupos = html.indexOf('<div id="section-grupos"');

if (startGrupos > -1 && sliceEnd > -1) {
    html = html.substring(0, startGrupos) + newGruposContent + '\r\n\r\n            ' + html.substring(sliceEnd);
    console.log('section-grupos successfully updated with in-depth template view and instant form!');
    fs.writeFileSync('templates/index.html', html, 'utf8');
} else {
    console.log('Failed to find markers: startGrupos =', startGrupos, 'sliceEnd =', sliceEnd);
}
