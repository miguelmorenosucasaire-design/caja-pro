const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. UPDATE CSS FOR PRINT AND AZUL STYLE
const oldPrintCssTarget = `@media print {
            @page {
                size: auto;
                margin: 6mm 10mm;
            }`;

const newPrintCss = `/* ESTILO AZUL TALONARIO INSTITUCIONAL (MONOCROMÁTICO OFICIAL) */
        .voucher-estilo-azul {
            color: #1e40af !important;
            border-color: #1e40af !important;
        }
        .voucher-estilo-azul * {
            color: #1e40af !important;
            border-color: #1e40af !important;
        }
        .voucher-estilo-azul img {
            filter: brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3025%) hue-rotate(218deg) brightness(91%) contrast(98%) !important;
        }
        .voucher-estilo-azul #factura-nro-comprobante,
        .voucher-estilo-azul #copia-factura-nro-comprobante {
            color: #1e40af !important;
        }
        .voucher-estilo-azul .bg-blue-50,
        .voucher-estilo-azul .bg-blue-50\\/40 {
            background-color: #eff6ff !important;
        }

        @media print {
            @page {
                size: letter portrait;
                margin: 4mm 6mm;
            }
            body {
                background: white !important;
                color: #0f172a !important;
                font-size: 8.5pt !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            aside, header, #excel-sheet-tabs-bar, #filtro-top-bar, .no-print, button, form, .modal-backdrop, select, input {
                display: none !important;
            }
            main {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                overflow: visible !important;
            }
            #section-factura {
                display: block !important;
                visibility: visible !important;
            }
            #contenedor-impresion-factura {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .voucher-media-carta {
                box-shadow: none !important;
                margin: 0 auto 3mm auto !important;
                width: 100% !important;
                max-width: 100% !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                padding: 3.5mm 5.5mm !important;
            }`;

if (html.includes(oldPrintCssTarget)) {
    html = html.replace(oldPrintCssTarget, newPrintCss);
    console.log('1. Print and Azul CSS updated');
} else {
    console.log('1. Note: oldPrintCssTarget not matched verbatim, looking for @media print');
}

// 2. UPDATE FACTURA BANNER TOOLBAR
const oldBannerButtons = `<div class="flex items-center space-x-3">
                        <button onclick="imprimirFactura()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-print"></i>
                            <span>Imprimir Comprobante Oficial</span>
                        </button>
                    </div>`;

const newBannerButtons = `<div class="flex flex-wrap items-center gap-2.5">
                        <button onclick="abrirModalNuevoEstudianteRecibo()" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-user-plus text-sky-200"></i>
                            <span>+ Emitir a Nuevo Alumno Hoy</span>
                        </button>
                        <button onclick="abrirModalCalendarizacion()" class="bg-slate-800/90 hover:bg-slate-700 text-sky-300 border border-sky-500/40 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-calendar-days text-sky-400"></i>
                            <span>📅 Calendarización de Ingresos</span>
                        </button>
                        <button onclick="descargarReciboExcel()" class="bg-teal-700 hover:bg-teal-600 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-excel text-emerald-300"></i>
                            <span>Guardar Recibo en Excel (.xlsx)</span>
                        </button>
                        <button onclick="imprimirFactura()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-print"></i>
                            <span>Imprimir Comprobante</span>
                        </button>
                    </div>`;

if (html.includes(oldBannerButtons)) {
    html = html.replace(oldBannerButtons, newBannerButtons);
    console.log('2. Banner buttons updated');
} else {
    console.log('2. Warning: oldBannerButtons not matched verbatim');
}

// 3. ADD PRINT OPTIONS & EMISSION DATE TOOLBAR ABOVE THE VOUCHER
const targetAboveVoucher = `<!-- CONTENEDOR MAESTRO: COMPROBANTE OFICIAL + SECCIÓN INTEGRADA PARA EDITAR NOTAS -->`;

const printControlToolbar = `<!-- BARRA DE CONTROLES: FORMATO DE IMPRESIÓN, ESTILO DE COLOR Y FECHA DE EMISIÓN -->
                <div class="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
                    
                    <!-- Controles de Formato y Estilo de Impresión -->
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <span class="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                                <i class="fa-solid fa-copy text-indigo-500 mr-1"></i> Formato:
                            </span>
                            <button type="button" id="btn-formato-doble" onclick="setFormatoVoucher('doble')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm">
                                📄 Doble Media Carta (Original + Copia)
                            </button>
                            <button type="button" id="btn-formato-simple" onclick="setFormatoVoucher('simple')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                📑 Simple (1 Recibo)
                            </button>
                        </div>

                        <div class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <span class="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                                <i class="fa-solid fa-palette text-indigo-500 mr-1"></i> Color:
                            </span>
                            <button type="button" id="btn-estilo-color" onclick="setEstiloVoucher('color')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm">
                                🎨 Color Oficial
                            </button>
                            <button type="button" id="btn-estilo-azul" onclick="setEstiloVoucher('azul')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                📘 Tinta Azul Talonario
                            </button>
                        </div>
                    </div>

                    <!-- Selector / Editor de Fecha de Emisión del Recibo Actual -->
                    <div class="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-3 py-1.5 rounded-xl">
                        <label for="factura-fecha-emision-input" class="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 whitespace-nowrap">
                            <i class="fa-regular fa-calendar-check text-indigo-600 dark:text-indigo-400"></i> Fecha Emisión:
                        </label>
                        <input type="date" id="factura-fecha-emision-input" onchange="cambiarFechaEmisionFactura(this.value)" class="bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer">
                        <button type="button" onclick="establecerFechaHoyFactura()" title="Asignar fecha de hoy" class="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-sm">
                            Hoy
                        </button>
                    </div>

                </div>

                ` + targetAboveVoucher;

if (html.includes(targetAboveVoucher) && !html.includes('id="btn-formato-doble"')) {
    html = html.replace(targetAboveVoucher, printControlToolbar);
    console.log('3. Print control toolbar added');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html partially updated, moving to voucher duplicate');
