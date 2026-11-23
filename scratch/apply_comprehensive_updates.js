const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// =========================================================================
// 1. FIX PRINT CSS FOR ABSOLUTE SECTION ISOLATION
// =========================================================================
const targetPrintCss = `#section-factura { display: block !important; visibility: visible !important; margin: 0 !important; padding: 0 !important; }`;
const newPrintCss = `/* Aislamiento estricto de impresión: solo se imprime la sección activa (sin la clase .hidden) */
          section.hidden {
            display: none !important;
            visibility: hidden !important;
          }
          section:not(.hidden) {
            display: block !important;
            visibility: visible !important;
            margin: 0 !important;
            padding: 10px !important;
            width: 100% !important;
          }
          #section-factura:not(.hidden) {
            padding: 0 !important;
          }`;

if (html.includes(targetPrintCss)) {
    html = html.replace(targetPrintCss, newPrintCss);
    console.log('1. Print CSS updated with strict section isolation');
} else {
    console.log('1. Target print CSS not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetPrintCss.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newPrintCss);
        console.log('1. Print CSS updated with normalized newlines');
    }
}

// =========================================================================
// 2. BOLETA: AGREGAR BOTONES "LIMPIAR / NUEVA SELECCIÓN" Y "ACTUALIZAR"
// =========================================================================
const targetFacturaSelects = `<div class="md:col-span-4 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-receipt text-emerald-600"></i> Recibo / Comprobante:</span>
                                <button type="button" onclick="mostrarTodosLosRecibos()" class="text-[10px] text-sky-600 hover:text-sky-800 dark:text-sky-400 font-bold hover:underline">Ver todos los recibos</button>
                            </label>
                            <select id="factura-recibo-select" onchange="seleccionarFacturaRecibo(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm">
                                <option value="">Cargando comprobantes...</option>
                            </select>
                        </div>`;

const newFacturaSelects = `<div class="md:col-span-3 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-receipt text-emerald-600"></i> Recibo / Comprobante:</span>
                                <button type="button" onclick="mostrarTodosLosRecibos()" class="text-[10px] text-sky-600 hover:text-sky-800 dark:text-sky-400 font-bold hover:underline">Ver todos</button>
                            </label>
                            <select id="factura-recibo-select" onchange="seleccionarFacturaRecibo(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm">
                                <option value="">Cargando comprobantes...</option>
                            </select>
                        </div>

                        <!-- 4. Botones de Acción de Selección en Boleta (Limpiar y Actualizar) -->
                        <div class="md:col-span-1 flex flex-col justify-end space-y-1">
                            <div class="flex items-center space-x-1.5 pt-4">
                                <button type="button" onclick="limpiarSeleccionBoleta()" id="btn-limpiar-boleta" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-2 rounded-xl text-[11px] shadow-sm transition flex items-center justify-center space-x-1" title="Limpiar boleta para seleccionar un nuevo estudiante desde cero">
                                    <i class="fa-solid fa-eraser"></i>
                                    <span>Limpiar</span>
                                </button>
                                <button type="button" onclick="actualizarBoletaSeleccionada()" id="btn-actualizar-boleta" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-xl text-[11px] shadow-sm transition flex items-center justify-center" title="Actualizar datos de la boleta">
                                    <i class="fa-solid fa-rotate"></i>
                                </button>
                            </div>
                        </div>`;

if (html.includes(targetFacturaSelects)) {
    html = html.replace(targetFacturaSelects, newFacturaSelects);
    console.log('2. Boleta selector buttons added successfully');
} else {
    console.log('2. Target factura selects not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetFacturaSelects.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newFacturaSelects);
        console.log('2. Boleta selector buttons added with normalized newlines');
    }
}

// =========================================================================
// 3. ESTUDIANTES: SELECTOR DE ORDENAMIENTO (MÁS RECIENTES PRIMERO POR DEFECTO)
// =========================================================================
const targetEstudiantesFilters = `<select id="filtro-estudiantes-carrera" onchange="filtrarEstudiantesFrontend()" class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                            <option value="todas">Todas las Especialidades</option>
                        </select>`;

const newEstudiantesFilters = `<select id="filtro-estudiantes-carrera" onchange="filtrarEstudiantesFrontend()" class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                            <option value="todas">Todas las Especialidades</option>
                        </select>

                        <!-- Selector de Ordenamiento de Estudiantes (Primero al último y viceversa) -->
                        <div class="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
                            <i class="fa-solid fa-arrow-down-wide-short text-indigo-500 text-xs"></i>
                            <select id="filtro-estudiantes-orden" onchange="filtrarEstudiantesFrontend()" class="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer">
                                <option value="reciente" selected>🔽 Más recientes primero (Últimos agregados)</option>
                                <option value="antiguo">🔼 Primero al último (Antiguo a reciente)</option>
                                <option value="boleta_desc">🧾 N° Boleta: Mayor a menor</option>
                                <option value="boleta_asc">🧾 N° Boleta: Menor a mayor</option>
                                <option value="nombre_asc">🔤 Nombre: A → Z</option>
                                <option value="nombre_desc">🔤 Nombre: Z → A</option>
                            </select>
                        </div>`;

if (html.includes(targetEstudiantesFilters)) {
    html = html.replace(targetEstudiantesFilters, newEstudiantesFilters);
    console.log('3. Student sort selector added to header filters');
} else {
    console.log('3. Target estudiantes filter not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetEstudiantesFilters.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newEstudiantesFilters);
        console.log('3. Student sort selector added with normalized newlines');
    }
}

// =========================================================================
// 4. DEUDORES: BUSCADOR POR NOMBRE O DNI
// =========================================================================
const targetDeudoresBar = `<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Seleccionar Especialidad:</span>
                        <select id="filtro-deudores-carrera" onchange="cargarDeudores()" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none min-w-[240px]">
                            <option value="">Todas las Especialidades</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Confección Textil">Confección Textil</option>
                            <option value="Cosmetología y Peluquería">Cosmetología y Peluquería</option>
                            <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                            <option value="Contabilidad y Finanzas">Contabilidad y Finanzas</option>
                        </select>
                    </div>`;

const newDeudoresBar = `<div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div class="flex flex-wrap items-center gap-3 flex-1">
                        <!-- Buscador por Nombre o DNI de Deudores -->
                        <div class="relative flex-1 min-w-[240px] max-w-md">
                            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                            <input type="text" id="filtro-deudores-buscar" oninput="filtrarDeudoresEnTabla()" placeholder="Buscar deudor por Nombre o DNI..." class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm">
                        </div>

                        <div class="flex items-center space-x-2">
                            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Especialidad:</span>
                            <select id="filtro-deudores-carrera" onchange="cargarDeudores()" class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none min-w-[200px] shadow-sm">
                                <option value="">Todas las Especialidades</option>
                                <option value="Computación e Informática">Computación e Informática</option>
                                <option value="Corte y Ensamblaje">Corte y Ensamblaje (Confección)</option>
                                <option value="Peluquería y Barbería">Peluquería y Barbería (Cosmetología)</option>
                                <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                                <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                                <option value="Mecánica de Motos">Mecánica de Motos</option>
                                <option value="Carpintería Metálica">Carpintería Metálica</option>
                                <option value="Contabilidad y Finanzas">Contabilidad y Finanzas</option>
                            </select>
                        </div>
                    </div>`;

if (html.includes(targetDeudoresBar)) {
    html = html.replace(targetDeudoresBar, newDeudoresBar);
    console.log('4. Debtors search bar by Name/DNI added successfully');
} else {
    console.log('4. Target deudores bar not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetDeudoresBar.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newDeudoresBar);
        console.log('4. Debtors search bar added with normalized newlines');
    }
}

// =========================================================================
// 5. DIARIO Y NOTAS: SELECTOR DE FECHA DINÁMICO, BOTONES HOY / ÚLTIMO Y EXPORTACIÓN AISLADA
// =========================================================================
const targetDiarioDate = `<div class="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center space-x-2">
                            <span class="text-xs font-bold text-amber-300">Fecha:</span>
                            <input type="date" id="diario-selector-fecha" onchange="cargarDiario(this.value)" class="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none">
                        </div>
                        <button onclick="exportarHojaPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>PDF</span>
                        </button>`;

const newDiarioDate = `<div class="flex flex-wrap items-center gap-2">
                            <div class="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center space-x-2">
                                <span class="text-xs font-bold text-amber-300"><i class="fa-regular fa-calendar text-amber-400 mr-1"></i>Fecha:</span>
                                <input type="date" id="diario-selector-fecha" onchange="cargarDiario(this.value)" class="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none">
                            </div>
                            <button type="button" onclick="irAFechaDiario('hoy')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition shadow-sm" title="Ver movimientos de hoy">
                                Hoy
                            </button>
                            <button type="button" onclick="irAFechaDiario('ultimo')" class="bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition border border-white/30" title="Ver fecha con movimientos más recientes">
                                Último
                            </button>
                            <div class="flex items-center space-x-1">
                                <button type="button" onclick="cambiarDiaDiario(-1)" class="bg-white/15 hover:bg-white/25 text-white px-2 py-1 rounded-lg text-xs font-bold transition" title="Día anterior">◀</button>
                                <button type="button" onclick="cambiarDiaDiario(1)" class="bg-white/15 hover:bg-white/25 text-white px-2 py-1 rounded-lg text-xs font-bold transition" title="Día siguiente">▶</button>
                            </div>
                            <button type="button" onclick="exportarDiarioPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg transition" title="Exportar únicamente esta hoja de diario a PDF">
                                <i class="fa-solid fa-file-pdf"></i>
                                <span>PDF Diario</span>
                            </button>
                            <button type="button" onclick="exportarDiarioExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg transition" title="Exportar diario y notas a Excel/CSV">
                                <i class="fa-solid fa-file-excel"></i>
                                <span>Excel</span>
                            </button>
                        </div>`;

if (html.includes(targetDiarioDate)) {
    html = html.replace(targetDiarioDate, newDiarioDate);
    console.log('5. Diario date controls and dedicated export buttons added successfully');
} else {
    console.log('5. Target diario date not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetDiarioDate.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newDiarioDate);
        console.log('5. Diario date controls added with normalized newlines');
    }
}

// =========================================================================
// 6. CONTROL PAGOS: BOTONES DE EXPORTACIÓN AISLADA
// =========================================================================
const targetControlPagosButtons = `<button onclick="exportarHojaPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>Exportar a PDF</span>
                        </button>
                        <button onclick="exportarHojaExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>Exportar a Excel</span>
                        </button>`;

const newControlPagosButtons = `<button onclick="exportarControlPagosPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition" title="Exportar únicamente la matriz de control de pagos a PDF">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>Exportar a PDF</span>
                        </button>
                        <button onclick="exportarControlPagosExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition" title="Exportar matriz completa a Excel">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>Exportar a Excel</span>
                        </button>`;

if (html.includes(targetControlPagosButtons)) {
    html = html.replace(targetControlPagosButtons, newControlPagosButtons);
    console.log('6. Control pagos dedicated export buttons updated successfully');
} else {
    console.log('6. Target control pagos buttons not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetControlPagosButtons.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newControlPagosButtons);
        console.log('6. Control pagos buttons updated with normalized newlines');
    }
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('HTML structure updates completed!');
