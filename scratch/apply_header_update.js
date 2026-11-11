const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// =========================================================================
// 1. MEJORAR ESTILOS PRINT EN <head>
// =========================================================================
const oldPrintStyle = `@media print {
            body * {
                visibility: hidden;
            }
            #printable-receipt, #printable-receipt *,
            #printable-student-receipt, #printable-student-receipt *,
            #printable-resultados, #printable-resultados * {
                visibility: visible;
            }
            #printable-receipt, #printable-student-receipt, #printable-resultados {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 24px;
                background: white;
            }
        }`;

const newPrintStyle = `@media print {
            body {
                background: white !important;
                color: black !important;
                font-size: 11pt !important;
            }
            aside, header, #excel-sheet-tabs-bar, #filtro-top-bar, .no-print, button, form, .modal-backdrop {
                display: none !important;
            }
            main {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                overflow: visible !important;
            }
            .section-activa-print {
                display: block !important;
                visibility: visible !important;
            }
            .print-header-institucional {
                display: block !important;
                margin-bottom: 20px;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 10px;
            }
            table {
                width: 100% !important;
                border-collapse: collapse !important;
            }
            th, td {
                border: 1px solid #cbd5e1 !important;
                padding: 6px 8px !important;
            }
            thead {
                display: table-header-group !important;
                background: #f1f5f9 !important;
            }
        }`;

if (html.includes(oldPrintStyle)) {
    html = html.replace(oldPrintStyle, newPrintStyle);
    console.log('1. Print styles updated successfully.');
}

// =========================================================================
// 2. ACTUALIZAR HEADER CON BOTONES PROFESIONALES DE EXPORTACIÓN Y PESTAÑAS
// =========================================================================
const oldHeader = `<header class="bg-white border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
            <div class="flex items-center space-x-3">
                <img src="/public/img/logo_institucion.jpg" alt="Logo" class="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 hidden md:block">
                <div>
                    <h2 id="page-title" class="text-lg font-bold text-slate-800 leading-tight">Panel Financiero General</h2>
                    <p id="page-subtitle" class="text-[11px] text-slate-500 font-medium">CETPRO San Miguel - Micaela Bastidas Puyucama</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="exportarYRespaldar()" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-sm">
                    <i class="fa-solid fa-download text-emerald-600"></i>
                    <span>Exportar y Respaldar BD</span>
                </button>
                <button onclick="cambiarSeccion('respaldos')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition">
                    <i class="fa-solid fa-database text-teal-600"></i>
                    <span>Ver Respaldos</span>
                </button>
                <button onclick="cargarTodo()" class="bg-sky-50 hover:bg-sky-100 text-sky-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition">
                    <i class="fa-solid fa-rotate text-sky-600"></i>
                    <span>Actualizar</span>
                </button>
            </div>
        </header>`;

const newHeader = `<header class="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm z-10 flex-shrink-0 no-print">
            <div class="flex items-center space-x-3">
                <img src="/public/img/logo_institucion.jpg" alt="Logo CETPRO" class="w-9 h-9 rounded-xl object-contain bg-slate-50 border border-slate-200 p-0.5 shadow-sm">
                <div>
                    <h2 id="page-title" class="text-base font-extrabold text-slate-800 leading-tight">CETPRO MICAELA BASTIDAS PUYUCAMA</h2>
                    <p id="page-subtitle" class="text-[11px] text-slate-500 font-semibold flex items-center space-x-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span id="page-active-sheet-name">Hoja Activa: INICIO / PANEL GENERAL</span>
                    </p>
                </div>
            </div>

            <!-- Botones de Acción y Exportación Directa -->
            <div class="flex items-center space-x-2.5">
                <!-- Exportar a PDF -->
                <button onclick="exportarHojaPDF()" title="Exportar la hoja seleccionada a documento PDF con membrete oficial" class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">
                    <i class="fa-solid fa-file-pdf text-rose-600 text-sm"></i>
                    <span>Exportar Hoja a PDF</span>
                </button>

                <!-- Exportar a Excel -->
                <button onclick="exportarHojaExcel()" title="Descargar datos de la hoja seleccionada en formato compatible con Excel" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">
                    <i class="fa-solid fa-file-excel text-emerald-600 text-sm"></i>
                    <span>Exportar Hoja a Excel</span>
                </button>

                <!-- Descargar Libro Completo .xlsm -->
                <a href="/api/exportar/excel" download="CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm" title="Descargar el archivo Excel (.xlsm) completo con todas las 16 hojas" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/25">
                    <i class="fa-solid fa-download"></i>
                    <span>Libro Completo (.xlsm)</span>
                </a>

                <!-- Nuevo Movimiento Rápido -->
                <button onclick="abrirModalNuevoMovimiento()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/25">
                    <i class="fa-solid fa-plus-circle"></i>
                    <span>+ Movimiento</span>
                </button>

                <!-- Actualizar -->
                <button onclick="cargarTodo()" title="Refrescar datos y cálculos en tiempo real" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition">
                    <i class="fa-solid fa-rotate text-sky-600"></i>
                </button>
            </div>
        </header>

        <!-- BARRA SUPERIOR DE PESTAÑAS ESTILO EXCEL (HOJAS DEL LIBRO) -->
        <div id="excel-sheet-tabs-bar" class="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center space-x-1 overflow-x-auto text-xs font-semibold shadow-inner custom-scrollbar no-print flex-shrink-0">
            <span class="text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-2 flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-table-cells text-emerald-400 text-xs"></i>
                <span>Hojas de Excel:</span>
            </span>

            <button onclick="cambiarSeccion('dashboard')" id="sheet-tab-dashboard" class="sheet-tab px-3 py-1.5 rounded-lg text-white bg-indigo-600 font-bold transition flex items-center space-x-1.5 flex-shrink-0 shadow-sm">
                <i class="fa-solid fa-house text-[11px]"></i>
                <span>INICIO</span>
            </button>

            <button onclick="cambiarSeccion('resultados')" id="sheet-tab-resultados" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-chart-line text-[11px] text-emerald-400"></i>
                <span>RESUMEN ANUAL</span>
            </button>

            <button onclick="cambiarSeccion('grupos')" id="sheet-tab-grupos" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-users-rectangle text-[11px] text-indigo-400"></i>
                <span>SECCIONES / GRUPOS</span>
            </button>

            <button onclick="cambiarSeccion('estudiantes')" id="sheet-tab-estudiantes" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-user-graduate text-[11px] text-sky-400"></i>
                <span>ESTUDIANTES</span>
            </button>

            <button onclick="cambiarSeccion('control-pagos')" id="sheet-tab-control-pagos" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-calendar-days text-[11px] text-teal-400"></i>
                <span>CONTROL PAGOS (MES A MES)</span>
            </button>

            <button onclick="cambiarSeccion('deudores')" id="sheet-tab-deudores" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-user-clock text-[11px] text-rose-400"></i>
                <span>DEUDORES</span>
            </button>

            <button onclick="cambiarSeccion('caja')" id="sheet-tab-caja" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-cash-register text-[11px] text-emerald-400"></i>
                <span>INGRESOS (CAJA)</span>
            </button>

            <button onclick="cambiarSeccion('diario')" id="sheet-tab-diario" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-book-bookmark text-[11px] text-amber-400"></i>
                <span>DIARIO & NOTAS</span>
            </button>

            <button onclick="cambiarSeccion('docentes')" id="sheet-tab-docentes" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-chalkboard-user text-[11px] text-purple-400"></i>
                <span>DOCENTES</span>
            </button>

            <button onclick="cambiarSeccion('factura')" id="sheet-tab-factura" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-receipt text-[11px] text-cyan-400"></i>
                <span>FACTURA / BOLETA</span>
            </button>

            <button onclick="cambiarSeccion('respaldos')" id="sheet-tab-respaldos" class="sheet-tab px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5 flex-shrink-0">
                <i class="fa-solid fa-database text-[11px] text-emerald-400"></i>
                <span>RESPALDOS BD</span>
            </button>
        </div>`;

if (html.includes(oldHeader)) {
    html = html.replace(oldHeader, newHeader);
    console.log('2. Header and Excel sheet tabs bar added successfully.');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Step 1 and 2 saved.');
