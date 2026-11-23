const fs = require('fs');

let raw = fs.readFileSync('templates/index.html', 'utf8');
const isCRLF = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

// 1. Eliminar botones repetidos de la barra superior (cambiar por 1 botón de Descargar PDF y 1 botón de Imprimir)
const targetTopButtons = `                        <!-- PANEL DE DESCARGA PDF: 1 O LAS 2 VERSIONES -->
                        <div class="flex items-center space-x-1 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-1 rounded-xl">
                            <span class="text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider px-2 flex items-center gap-1">
                                <i class="fa-solid fa-file-pdf text-rose-600"></i> Descargar PDF:
                            </span>
                            <button type="button" onclick="exportarFacturaPDF('simple')" class="btn-exportar-pdf-voucher px-2.5 py-1 rounded-lg text-xs font-bold transition bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 shadow-sm flex items-center space-x-1" title="Descargar 1 versión (Recibo Simple)">
                                <i class="fa-solid fa-file text-rose-500"></i>
                                <span>1 Versión</span>
                            </button>
                            <button type="button" onclick="exportarFacturaPDF('doble')" class="btn-exportar-pdf-voucher px-2.5 py-1 rounded-lg text-xs font-bold transition bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center space-x-1" title="Descargar las 2 versiones (Original + Copia)">
                                <i class="fa-solid fa-copy text-rose-200"></i>
                                <span>2 Versiones</span>
                            </button>
                        </div>

                        <!-- PANEL DE IMPRESIÓN DIRECTA: 1 O LAS 2 VERSIONES -->
                        <div class="flex items-center space-x-1 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 p-1 rounded-xl">
                            <span class="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider px-2 flex items-center gap-1">
                                <i class="fa-solid fa-print text-emerald-600"></i> Imprimir:
                            </span>
                            <button type="button" onclick="imprimirFacturaVersion('simple')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center space-x-1" title="Imprimir 1 versión (Recibo Simple)">
                                <span>1 Versión</span>
                            </button>
                            <button type="button" onclick="imprimirFacturaVersion('doble')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1" title="Imprimir las 2 versiones (Original + Copia)">
                                <span>2 Versiones</span>
                            </button>
                        </div>`;

const repTopButtons = `                        <!-- ACCIONES PRINCIPALES ÚNICAS: DESCARGAR PDF E IMPRIMIR (SIN REPETIR) -->
                        <div class="flex items-center space-x-2">
                            <button type="button" id="btn-exportar-pdf-voucher" onclick="exportarFacturaPDF()" class="btn-exportar-pdf-voucher px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center space-x-1.5" title="Descargar comprobante en formato PDF">
                                <i class="fa-solid fa-file-pdf"></i>
                                <span>Descargar PDF</span>
                            </button>
                            <button type="button" id="btn-imprimir-voucher" onclick="imprimirFacturaVersion()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1.5" title="Imprimir comprobante oficial">
                                <i class="fa-solid fa-print"></i>
                                <span>Imprimir</span>
                            </button>
                        </div>`;

if (html.includes(targetTopButtons)) {
    html = html.replace(targetTopButtons, repTopButtons);
    console.log('✔ Botones 1 Versión / 2 Versiones reemplazados por botones únicos');
} else {
    console.warn('⚠ targetTopButtons no encontrado');
}

// 2. Eliminar la barra duplicada pdf-preview-actions-bar de la barra de pestañas
const targetTabBar = `                        <!-- BARRA DE PESTAÑAS: VISTA COMPROBANTE (EDICIÓN) vs PREVISUALIZADOR PDF OFICIAL -->
                        <div class="w-full max-w-2xl sm:max-w-3xl flex flex-wrap items-center justify-between mb-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm no-print gap-2">
                            <div class="flex items-center space-x-2">
                                <button type="button" id="tab-vista-voucher" onclick="cambiarVistaComprobante('voucher')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2">
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>Vista Comprobante (Edición)</span>
                                </button>
                                <button type="button" id="tab-vista-pdf" onclick="cambiarVistaComprobante('pdf')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2">
                                    <i class="fa-solid fa-file-pdf text-rose-500"></i>
                                    <span>Previsualizador PDF Oficial</span>
                                </button>
                            </div>

                            <div id="pdf-preview-actions-bar" class="hidden flex items-center space-x-2">
                                <button type="button" onclick="actualizarPrevisualizadorPDF()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center space-x-1.5" title="Regenerar vista previa del PDF">
                                    <i class="fa-solid fa-arrows-rotate text-indigo-500"></i>
                                    <span>Refrescar</span>
                                </button>
                                <button type="button" onclick="descargarPDFPrevisualizado()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center space-x-1.5 transition">
                                    <i class="fa-solid fa-download"></i>
                                    <span>Descargar PDF</span>
                                </button>
                                <button type="button" onclick="imprimirPDFPrevisualizado()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1.5 transition">
                                    <i class="fa-solid fa-print"></i>
                                    <span>Imprimir</span>
                                </button>
                            </div>
                        </div>`;

const repTabBar = `                        <!-- BARRA DE PESTAÑAS: VISTA COMPROBANTE (EDICIÓN) vs PREVISUALIZADOR PDF OFICIAL (LIMPIO) -->
                        <div class="w-full max-w-2xl sm:max-w-3xl flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm no-print">
                            <div class="flex items-center space-x-2">
                                <button type="button" id="tab-vista-voucher" onclick="cambiarVistaComprobante('voucher')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2">
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>Vista Comprobante (Edición)</span>
                                </button>
                                <button type="button" id="tab-vista-pdf" onclick="cambiarVistaComprobante('pdf')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2">
                                    <i class="fa-solid fa-file-pdf text-rose-500"></i>
                                    <span>Previsualizador PDF Oficial</span>
                                </button>
                            </div>
                        </div>`;

if (html.includes(targetTabBar)) {
    html = html.replace(targetTabBar, repTabBar);
    console.log('✔ Barra de pestañas limpiada (eliminados Refrescar, Descargar PDF, Imprimir duplicados)');
} else {
    console.warn('⚠ targetTabBar no encontrado');
}

// 3. En el encabezado del previsualizador card: dejar sólo Actualizar Vista Previa (sin duplicar Descargar PDF e Imprimir)
const targetCardActions = `                                    <div class="flex items-center space-x-2">
                                        <button type="button" onclick="actualizarPrevisualizadorPDF()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center space-x-1.5" title="Regenerar PDF">
                                            <i class="fa-solid fa-arrows-rotate text-indigo-500"></i>
                                            <span>Actualizar</span>
                                        </button>
                                        <button type="button" onclick="descargarPDFPrevisualizado()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center space-x-1.5 transition">
                                            <i class="fa-solid fa-download"></i>
                                            <span>Descargar PDF</span>
                                        </button>
                                        <button type="button" onclick="imprimirPDFPrevisualizado()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1.5 transition">
                                            <i class="fa-solid fa-print"></i>
                                            <span>Imprimir</span>
                                        </button>
                                    </div>`;

const repCardActions = `                                    <div class="flex items-center space-x-2">
                                        <button type="button" onclick="actualizarPrevisualizadorPDF()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700" title="Regenerar vista previa del PDF">
                                            <i class="fa-solid fa-arrows-rotate text-indigo-500"></i>
                                            <span>Actualizar Vista Previa</span>
                                        </button>
                                    </div>`;

if (html.includes(targetCardActions)) {
    html = html.replace(targetCardActions, repCardActions);
    console.log('✔ Cabecera de previsualizador simplificada a Actualizar Vista Previa');
} else {
    console.warn('⚠ targetCardActions no encontrado');
}

// 4. Actualizar cambiarVistaComprobante para no dar error por pdf-preview-actions-bar
const targetFnVista = `            if (vista === 'pdf') {
                if (tabPdf) {
                    tabPdf.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2';
                }
                if (tabVoucher) {
                    tabVoucher.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2';
                }
                if (contenedorVoucher) contenedorVoucher.style.display = 'none';
                if (contenedorPdf) {
                    contenedorPdf.classList.remove('hidden');
                    contenedorPdf.style.display = 'flex';
                }
                if (actionsBarPdf) actionsBarPdf.classList.remove('hidden');

                // Generar o refrescar la previsualización del PDF
                actualizarPrevisualizadorPDF();
            } else {
                if (tabVoucher) {
                    tabVoucher.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2';
                }
                if (tabPdf) {
                    tabPdf.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2';
                }
                if (contenedorPdf) {
                    contenedorPdf.classList.add('hidden');
                    contenedorPdf.style.display = 'none';
                }
                if (contenedorVoucher) contenedorVoucher.style.display = 'flex';
                if (actionsBarPdf) actionsBarPdf.classList.add('hidden');
            }`;

const repFnVista = `            if (vista === 'pdf') {
                if (tabPdf) {
                    tabPdf.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2';
                }
                if (tabVoucher) {
                    tabVoucher.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2';
                }
                if (contenedorVoucher) contenedorVoucher.style.display = 'none';
                if (contenedorPdf) {
                    contenedorPdf.classList.remove('hidden');
                    contenedorPdf.style.display = 'flex';
                }

                // Generar o refrescar la previsualización del PDF
                actualizarPrevisualizadorPDF();
            } else {
                if (tabVoucher) {
                    tabVoucher.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2';
                }
                if (tabPdf) {
                    tabPdf.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2';
                }
                if (contenedorPdf) {
                    contenedorPdf.classList.add('hidden');
                    contenedorPdf.style.display = 'none';
                }
                if (contenedorVoucher) contenedorVoucher.style.display = 'flex';
            }`;

if (html.includes(targetFnVista)) {
    html = html.replace(targetFnVista, repFnVista);
    console.log('✔ cambiarVistaComprobante actualizado');
} else {
    console.warn('⚠ targetFnVista no encontrado');
}

// 5. Actualizar imprimirFacturaVersion para imprimir el formato activo y soportar PDF iframe
const targetImprimirFn = `        function imprimirFacturaVersion(tipo) {
            if (tipo === 'doble') {
                setFormatoVoucher('doble');
            } else {
                setFormatoVoucher('simple');
            }
            setTimeout(() => {
                window.print();
            }, 100);
        }`;

const repImprimirFn = `        function imprimirFacturaVersion(tipo = null) {
            if (tipo === 'doble') {
                setFormatoVoucher('doble');
            } else if (tipo === 'simple') {
                setFormatoVoucher('simple');
            }

            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                imprimirPDFPrevisualizado();
                return;
            }

            setTimeout(() => {
                window.print();
            }, 100);
        }`;

if (html.includes(targetImprimirFn)) {
    html = html.replace(targetImprimirFn, repImprimirFn);
    console.log('✔ imprimirFacturaVersion actualizado');
} else {
    console.warn('⚠ targetImprimirFn no encontrado');
}

if (isCRLF) {
    html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('🎉 Desduplicación de botones completada exitosamente.');
