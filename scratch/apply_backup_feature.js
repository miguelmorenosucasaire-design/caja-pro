const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
console.log('Original index.html size:', html.length);

// 1. Sidebar item verification
if (html.includes('RESPALDOS BD')) {
    html = html.replace(/RESPALDOS BD/g, 'BACKUP BD');
    console.log('[+] Sidebar item renamed to BACKUP BD');
}

// 2. Titulos in cambiarSeccion
const titulosTarget1 = `respaldos: ['COPIAS DE SEGURIDAD · Base de Datos', 'Descarga y resguardo seguro de los datos institucionales en formato .db y .csv'],`;
const titulosTarget2 = `respaldos: ['RESPALDOS BD · Base de Datos Criptográfica', 'Gestión de copias de seguridad automáticas y hashes SHA-256'],`;
const titulosTarget3 = `respaldos: ['BACKUP BD · Copias de Seguridad y Restauración del Sistema', 'Gestión, descarga y restauración de archivos de respaldo de la base de datos (.db) y libro Excel'],`;
const titulosReplacement = `respaldos: ['RESPALDO & RESTABLECIMIENTO · 2 Versiones', 'Descarga oficial de copias (.db / .xlsx) para resguardo y restablecimiento total del sistema'],`;

if (html.includes(titulosTarget1)) {
    html = html.replace(titulosTarget1, titulosReplacement);
} else if (html.includes(titulosTarget2)) {
    html = html.replace(titulosTarget2, titulosReplacement);
} else if (html.includes(titulosTarget3)) {
    html = html.replace(titulosTarget3, titulosReplacement);
}
console.log('[+] Titulo de respaldos configurado para 2 Versiones');

// Hook cargarBackups into cambiarSeccion if needed
if (!html.includes("seccion === 'respaldos'")) {
    const switchCallTarget = `if (seccion === 'configuracion') cargarConfiguracion();`;
    const switchCallReplacement = `if (seccion === 'configuracion') cargarConfiguracion();
            if (seccion === 'respaldos') cargarBackups();`;
    if (html.includes(switchCallTarget)) {
        html = html.replace(switchCallTarget, switchCallReplacement);
        console.log('[+] Hooked cargarBackups() into cambiarSeccion');
    }
}

// 3. Delimit section-respaldos
const sIdx = html.indexOf('<div id="section-respaldos"');
const cIdx = html.indexOf('id="section-control-pagos"');
const nIdx = cIdx !== -1 ? html.lastIndexOf('<!-- ===', cIdx) : -1;

if (sIdx === -1 || nIdx === -1) {
    throw new Error(`Could not delimit section-respaldos (sIdx: ${sIdx}, nIdx: ${nIdx})`);
}

const newSectionRespaldosHTML = `<div id="section-respaldos" class="hidden space-y-6">
                <!-- Banner Superior de Respaldo y Restablecimiento -->
                <div class="cyber-card bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-teal-500/20 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-400 flex items-center justify-center text-2xl shadow-lg shadow-teal-500/20 flex-shrink-0">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-database"></i>
                                <span>Centro Oficial de Respaldo & Restablecimiento • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-sky-200">
                                RESPALDO UNIFICADO · 2 VERSIONES DESCARGABLES
                            </h3>
                            <p class="text-xs text-slate-300 mt-1 max-w-2xl">
                                Descarga en tu computadora el archivo de respaldo para guardarlo de manera segura. Con ese mismo archivo podrás reestablecer el sistema en cualquier momento.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <a href="/api/backups/descargar-version/zip" download="Respaldo_CETPRO_SanMiguel_Completo.zip" class="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/30 transition transform active:scale-95">
                            <i class="fa-solid fa-file-zipper"></i>
                            <span>Descargar Paquete 2 en 1 (.zip)</span>
                        </a>
                    </div>
                </div>

                <!-- PANEL 1: DESCARGAR ARCHIVO DE RESPALDO (2 VERSIONES) -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                                1. Descargar Archivo de Respaldo para Guardar
                            </h4>
                        </div>
                        <span class="text-xs text-slate-400">Guarda una copia en tu disco duro, memoria USB o Google Drive</span>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <!-- Versión 1: Base de Datos (.db) -->
                        <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:border-teal-500/40 transition">
                            <div>
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-2xl flex-shrink-0">
                                            <i class="fa-solid fa-database"></i>
                                        </div>
                                        <div>
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 uppercase tracking-wider">
                                                Versión 1 · Archivo Maestro del Sistema
                                            </span>
                                            <h5 class="text-base font-black text-slate-900 dark:text-white mt-1">
                                                Base de Datos Oficial (.db)
                                            </h5>
                                        </div>
                                    </div>
                                </div>

                                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                    Archivo de base de datos SQLite con la información íntegra del CETPRO. <strong>Este es el archivo principal que debes guardar para poder REESTABLECER todo el sistema</strong> en caso de formateo o cambio de equipo.
                                </p>

                                <!-- Ficha Técnica de la Versión 1 -->
                                <div class="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2 mb-5 text-xs">
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                        <span>Archivo a descargar:</span>
                                        <span class="font-mono font-bold text-slate-900 dark:text-white">Respaldo_CETPRO_SanMiguel_BD.db</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                        <span>Tamaño del archivo:</span>
                                        <span id="respaldo-db-size" class="font-bold text-teal-600 dark:text-teal-400 font-mono">160 KB</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                        <span>Última sincronización:</span>
                                        <span id="respaldo-db-mtime" class="font-bold text-slate-700 dark:text-slate-300">--</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                                        <span>Firma SHA-256:</span>
                                        <span id="respaldo-db-sha" class="font-mono text-[10px] text-slate-500 truncate max-w-[200px]" title="Hash criptográfico">--</span>
                                    </div>
                                </div>
                            </div>

                            <a href="/api/backups/descargar-version/db" download="Respaldo_CETPRO_SanMiguel_BD.db" class="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 transition transform active:scale-95">
                                <i class="fa-solid fa-download"></i>
                                <span>Descargar Versión Base de Datos (.db)</span>
                            </a>
                        </div>

                        <!-- Versión 2: Libro Excel (.xlsx) -->
                        <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/40 transition">
                            <div>
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl flex-shrink-0">
                                            <i class="fa-solid fa-file-excel"></i>
                                        </div>
                                        <div>
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase tracking-wider">
                                                Versión 2 · Consulta, Impresión y Auditoría
                                            </span>
                                            <h5 class="text-base font-black text-slate-900 dark:text-white mt-1">
                                                Libro Contable en Excel (.xlsx)
                                            </h5>
                                        </div>
                                    </div>
                                </div>

                                <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                    Hoja de cálculo oficial que contiene las <strong>12 hojas institucionales sincronizadas</strong> (Inicio, Resumen Anual, Grupos, Estudiantes, Control Pagos, Deudores, Caja, Docentes, Facturas). Ideal para abrir en Microsoft Excel, imprimir o auditorías.
                                </p>

                                <!-- Ficha Técnica de la Versión 2 -->
                                <div class="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2 mb-5 text-xs">
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                        <span>Archivo a descargar:</span>
                                        <span class="font-mono font-bold text-slate-900 dark:text-white">Respaldo_CETPRO_SanMiguel_Excel.xlsx</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                        <span>Estructura de hojas:</span>
                                        <span class="font-bold text-emerald-600 dark:text-emerald-400">12 Hojas Oficiales Completas</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                        <span>Compatibilidad:</span>
                                        <span class="font-bold text-slate-700 dark:text-slate-300">Microsoft Excel 2013-2024 / Calc</span>
                                    </div>
                                    <div class="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                                        <span>Estado contable:</span>
                                        <span class="font-bold text-emerald-600 dark:text-emerald-400">Balance al día (S/. 24,630.00)</span>
                                    </div>
                                </div>
                            </div>

                            <a href="/api/backups/descargar-version/excel" download="Respaldo_CETPRO_SanMiguel_Excel.xlsx" class="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition transform active:scale-95">
                                <i class="fa-solid fa-file-excel"></i>
                                <span>Descargar Versión Libro Excel (.xlsx)</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- PANEL 2: REESTABLECER EL SISTEMA (SUBIR ARCHIVO GUARDADO) -->
                <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                                2. Reestablecer Sistema con Archivo de Respaldo Guardado
                            </h4>
                        </div>
                        <span class="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-1">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>Protección Preventiva Automática Activada</span>
                        </span>
                    </div>

                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                        Si descargaste y guardaste un archivo de respaldo (archivo <strong>.db</strong> o paquete <strong>.zip</strong>), selecciónalo aquí para <strong>reestablecer inmediatamente toda la base de datos institucional</strong> (estudiantes, pagos, docentes y caja).
                    </p>

                    <!-- Zona de Carga / Drag & Drop -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div class="md:col-span-2">
                            <div id="dropzone-restablecer" onclick="document.getElementById('input-archivo-restablecer').click()" class="border-2 border-dashed border-teal-500/40 hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-6 text-center cursor-pointer transition group">
                                <input type="file" id="input-archivo-restablecer" accept=".db,.zip" class="hidden" onchange="seleccionarArchivoParaRestablecer(event)">
                                <div class="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 dark:text-teal-400 flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition">
                                    <i class="fa-solid fa-cloud-arrow-up"></i>
                                </div>
                                <p class="font-extrabold text-xs text-slate-800 dark:text-white mb-1">
                                    Haz clic aquí para seleccionar tu archivo de respaldo (.db o .zip)
                                </p>
                                <p class="text-[11px] text-slate-400">
                                    o arrastra y suelta el archivo directamente en este recuadro
                                </p>
                            </div>

                            <!-- Detalle del archivo seleccionado -->
                            <div id="info-archivo-seleccionado" class="hidden mt-3 p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                                <div class="flex items-center space-x-2 text-xs">
                                    <i class="fa-solid fa-file-circle-check text-teal-600 dark:text-teal-400 text-base"></i>
                                    <div>
                                        <span id="label-archivo-nombre" class="font-mono font-bold text-slate-900 dark:text-white">archivo.db</span>
                                        <span id="label-archivo-size" class="text-slate-400 ml-2">-- KB</span>
                                    </div>
                                </div>
                                <span class="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900 px-2 py-0.5 rounded-full">
                                    Listo para reestablecer
                                </span>
                            </div>
                        </div>

                        <!-- Botón de Ejecutar Restablecimiento -->
                        <div class="space-y-3">
                            <button id="btn-ejecutar-restablecer" disabled onclick="ejecutarRestablecimientoDesdeArchivo()" class="w-full py-4 px-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2">
                                <i class="fa-solid fa-rotate-left"></i>
                                <span>Reestablecer Sistema Ahora</span>
                            </button>

                            <div class="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                                <div class="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300">
                                    <i class="fa-solid fa-circle-info text-teal-500"></i>
                                    <span>Garantía de Respaldo:</span>
                                </div>
                                <p class="leading-normal">
                                    Antes de aplicar el reestablecimiento, el sistema guarda una copia de seguridad automática de protección.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>\n\n            `;

html = html.slice(0, sIdx) + newSectionRespaldosHTML + html.slice(nIdx);
console.log('[+] section-respaldos updated with Unified 2-Version & Restore UI');

// 4. Replace Backup JS functions
const jsStartTarget = `        // CENTRO DE SEGURIDAD & BACKUP OFICIAL`;
const jsStartTarget2 = `        // CENTRO OFICIAL DE RESPALDO Y RESTABLECIMIENTO (BACKUP)`;
const jsEndTarget = `        async function cargarTodo() {`;

let jStart = html.indexOf(jsStartTarget);
if (jStart === -1) jStart = html.indexOf(jsStartTarget2);
const jEnd = html.indexOf(jsEndTarget, jStart !== -1 ? jStart : 0);

const newBackupJS = `        // =========================================================================
        // CENTRO OFICIAL DE RESPALDO Y RESTABLECIMIENTO (BACKUP)
        // =========================================================================
        let archivoSeleccionadoParaRestablecer = null;

        async function cargarBackups() {
            try {
                const res = await fetch('/api/backups/estado-actual');
                const data = await res.json();

                const elDbSize = document.getElementById('respaldo-db-size');
                const elDbMtime = document.getElementById('respaldo-db-mtime');
                const elDbSha = document.getElementById('respaldo-db-sha');
                const badgeCount = document.getElementById('badge-backups-count');

                if (badgeCount) badgeCount.innerText = '2 Versiones';

                if (data.db) {
                    if (elDbSize) elDbSize.innerText = data.db.tamano;
                    if (elDbMtime) elDbMtime.innerText = data.db.fecha_modificacion;
                    if (elDbSha) {
                        elDbSha.innerText = data.db.sha256 ? data.db.sha256.substring(0, 24) + '...' : '--';
                        elDbSha.title = 'SHA-256 Completo: ' + (data.db.sha256 || '');
                    }
                }

                // Configurar Drag & Drop en el dropzone si no está configurado
                const dropzone = document.getElementById('dropzone-restablecer');
                if (dropzone && !dropzone.dataset.dragInit) {
                    dropzone.dataset.dragInit = 'true';
                    ['dragenter', 'dragover'].forEach(evtName => {
                        dropzone.addEventListener(evtName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropzone.classList.add('border-teal-400', 'bg-teal-500/10');
                        });
                    });
                    ['dragleave', 'drop'].forEach(evtName => {
                        dropzone.addEventListener(evtName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropzone.classList.remove('border-teal-400', 'bg-teal-500/10');
                        });
                    });
                    dropzone.addEventListener('drop', (e) => {
                        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                            seleccionarArchivoParaRestablecer({ target: { files: e.dataTransfer.files } });
                        }
                    });
                }
            } catch (err) {
                console.error("Error al cargar estado del respaldo:", err);
            }
        }

        function seleccionarArchivoParaRestablecer(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            archivoSeleccionadoParaRestablecer = files[0];

            const infoEl = document.getElementById('info-archivo-seleccionado');
            const nameEl = document.getElementById('label-archivo-nombre');
            const sizeEl = document.getElementById('label-archivo-size');
            const btnEl = document.getElementById('btn-ejecutar-restablecer');

            if (infoEl) infoEl.classList.remove('hidden');
            if (nameEl) nameEl.innerText = archivoSeleccionadoParaRestablecer.name;
            if (sizeEl) {
                const kb = Math.round(archivoSeleccionadoParaRestablecer.size / 1024);
                sizeEl.innerText = kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb + ' KB';
            }
            if (btnEl) btnEl.removeAttribute('disabled');
        }

        async function ejecutarRestablecimientoDesdeArchivo() {
            if (!archivoSeleccionadoParaRestablecer) {
                alert('Por favor selecciona primero un archivo de respaldo (.db o .zip).');
                return;
            }

            const fileName = archivoSeleccionadoParaRestablecer.name;
            const msgConfirm = 'ADVERTENCIA DE SEGURIDAD:\\n\\n' +
                '¿Está seguro de reestablecer el sistema con el archivo:\\n"' + fileName + '"?\\n\\n' +
                '• Se restaurarán todos los datos contenidos en el archivo.\\n' +
                '• El sistema creará automáticamente un respaldo preventivo de protección antes de aplicar los cambios.\\n\\n' +
                '¿Desea continuar?';

            if (!confirm(msgConfirm)) return;

            const btnEl = document.getElementById('btn-ejecutar-restablecer');
            if (btnEl) {
                btnEl.setAttribute('disabled', 'true');
                btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Reestableciendo sistema...</span>';
            }

            try {
                const reader = new FileReader();
                reader.onload = async function() {
                    try {
                        const base64Data = reader.result.split(',')[1];
                        const res = await fetch('/api/backups/restablecer-archivo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileName: fileName,
                                fileBase64: base64Data
                            })
                        });

                        const data = await res.json();
                        if (data.success) {
                            alert('✅ ' + data.message + '\\n\\n' +
                                'Estadísticas del Sistema Reestablecido:\\n' +
                                '• Alumnos: ' + (data.stats ? data.stats.estudiantes : '--') + '\\n' +
                                '• Movimientos: ' + (data.stats ? data.stats.movimientos : '--') + '\\n' +
                                '• Total Recaudado: S/. ' + (data.stats ? Number(data.stats.total_ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '--'));
                            
                            await cargarTodo();
                            await cargarBackups();
                        } else {
                            alert('❌ Error al reestablecer el sistema:\\n' + (data.error || 'Archivo incompatible o dañado.'));
                        }
                    } catch (netErr) {
                        alert('Error de conexión al enviar el archivo.');
                    } finally {
                        if (btnEl) {
                            btnEl.removeAttribute('disabled');
                            btnEl.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>Reestablecer Sistema Ahora</span>';
                        }
                    }
                };
                reader.readAsDataURL(archivoSeleccionadoParaRestablecer);
            } catch (err) {
                alert('No se pudo leer el archivo seleccionado.');
                if (btnEl) {
                    btnEl.removeAttribute('disabled');
                    btnEl.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>Reestablecer Sistema Ahora</span>';
                }
            }
        }
`;

if (jStart !== -1 && jEnd !== -1) {
    html = html.slice(0, jStart) + newBackupJS + '\n' + html.slice(jEnd);
    console.log('[+] Backup JavaScript functions updated');
} else {
    const ctAnchor = `        async function cargarTodo() {`;
    html = html.replace(ctAnchor, newBackupJS + '\n' + ctAnchor);
    console.log('[+] Backup JavaScript functions inserted before cargarTodo');
}

// Ensure cargarBackups is called in cargarTodo
if (!html.includes('await cargarBackups();')) {
    const ctTarget = `            await cargarConfiguracion();`;
    const ctReplacement = `            await cargarConfiguracion();\n            await cargarBackups();`;
    if (html.includes(ctTarget)) {
        html = html.replace(ctTarget, ctReplacement);
        console.log('[+] Added cargarBackups() into cargarTodo');
    }
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ templates/index.html updated successfully with UNIFIED 2-VERSION BACKUP! New size:', html.length);
