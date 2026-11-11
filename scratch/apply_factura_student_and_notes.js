const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. TARGET: Toolbar de selección y contenedor de comprobante
// Let's locate from `<!-- Selector de Recibo -->` to the end of `contenedor-comprobante-oficial`
const toolbarTarget = `                <!-- Selector de Recibo -->
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
                    <div class="flex items-center space-x-3 flex-1 min-w-[280px]">
                        <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Seleccionar Recibo a Emitir:</label>
                        <select id="factura-recibo-select" onchange="seleccionarFacturaRecibo(this.value)" class="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Cargando comprobantes...</option>
                        </select>
                    </div>
                </div>

                <!-- FORMATO OFICIAL IMPRIMIBLE DEL COMPROBANTE (IDÉNTICO A LA FOTO OFICIAL) -->
                <div class="flex justify-center">
                    <div id="contenedor-comprobante-oficial"`;

const newToolbarAndLayout = `                <!-- BARRA DE SELECCIÓN DUAL: ESTUDIANTE + RECIBO + ACCIONES -->
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 no-print">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        <!-- Selector de Estudiantes (6 cols) -->
                        <div class="md:col-span-6 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-user-graduate text-indigo-600"></i> Seleccionar por Estudiante (Lista Oficial):</span>
                                <span id="factura-est-count" class="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full font-black">176 alumnos</span>
                            </label>
                            <select id="factura-estudiante-select" onchange="seleccionarEstudianteFactura(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                                <option value="">Cargando lista de estudiantes...</option>
                            </select>
                        </div>

                        <!-- Selector de Recibos / Comprobantes (6 cols) -->
                        <div class="md:col-span-6 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-receipt text-emerald-600"></i> Seleccionar por Recibo / Comprobante:</span>
                                <button type="button" onclick="mostrarTodosLosRecibos()" class="text-[10px] text-sky-600 hover:text-sky-800 dark:text-sky-400 font-bold hover:underline">Ver todos los recibos</button>
                            </label>
                            <select id="factura-recibo-select" onchange="seleccionarFacturaRecibo(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm">
                                <option value="">Cargando comprobantes...</option>
                            </select>
                        </div>

                    </div>
                </div>

                <!-- CONTENEDOR MAESTRO: COMPROBANTE OFICIAL + SECCIÓN INTEGRADA PARA EDITAR NOTAS -->
                <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    <!-- COLUMNA PRINCIPAL (xl:col-span-8): COMPROBANTE OFICIAL (VOUCHER TALONARIO) -->
                    <div class="xl:col-span-8 flex justify-center">
                        <div id="contenedor-comprobante-oficial"`;

if (!html.includes(toolbarTarget)) {
    throw new Error('toolbarTarget not found in templates/index.html');
}
html = html.replace(toolbarTarget, newToolbarAndLayout);
console.log('Toolbar and main grid container applied.');

// 2. TARGET: Close of contenedor-comprobante-oficial and append Side Section for EDITAR NOTAS
const voucherEndTarget = `                        <!-- Elementos de Compatibilidad Ocultos para mantener scripts y tests 100% estables -->
                        <div class="hidden">
                            <span id="factura-inst-info"></span>
                            <span id="factura-contacto-row"></span>
                            <span id="factura-orden-ingreso"></span>
                            <span id="factura-fecha"></span>
                            <span id="factura-grupo"></span>
                            <span id="factura-docente"></span>
                            <span id="factura-forma-pago"></span>
                            <span id="factura-concepto"></span>
                            <span id="factura-precio-unit"></span>
                            <span id="factura-total-fila"></span>
                            <span id="factura-monto-letras"></span>
                            <span id="factura-inst-responsable"></span>
                            <span id="factura-inst-cargo"></span>
                            <span id="factura-inst-pie"></span>
                        </div>

                    </div>
                </div>
            </div>`;

const voucherEndReplacement = `                        <!-- Elementos de Compatibilidad Ocultos para mantener scripts y tests 100% estables -->
                        <div class="hidden">
                            <span id="factura-inst-info"></span>
                            <span id="factura-contacto-row"></span>
                            <span id="factura-orden-ingreso"></span>
                            <span id="factura-fecha"></span>
                            <span id="factura-grupo"></span>
                            <span id="factura-docente"></span>
                            <span id="factura-forma-pago"></span>
                            <span id="factura-concepto"></span>
                            <span id="factura-precio-unit"></span>
                            <span id="factura-total-fila"></span>
                            <span id="factura-monto-letras"></span>
                            <span id="factura-inst-responsable"></span>
                            <span id="factura-inst-cargo"></span>
                            <span id="factura-inst-pie"></span>
                        </div>

                    </div>
                </div>

                <!-- COLUMNA LATERAL (xl:col-span-4): SECCIÓN AHÍ MISMO PARA EDITAR NOTAS -->
                <div class="xl:col-span-4 space-y-4 no-print">
                    
                    <!-- TARJETA: EDITAR NOTAS DEL COMPROBANTE -->
                    <div class="bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-4">
                        
                        <div class="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Editar Notas del Comprobante
                                </h4>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                                    Sección integrada para editar observaciones en tiempo real
                                </p>
                            </div>
                        </div>

                        <!-- Resumen del Registro Actual -->
                        <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                            <div class="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                                <span class="text-slate-400 text-[11px]">Alumno:</span>
                                <span id="notas-resumen-alumno" class="text-indigo-600 dark:text-indigo-400 font-extrabold truncate max-w-[190px]">Ruth Mamani Hancco</span>
                            </div>
                            <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span class="text-slate-400 text-[11px]">Recibo:</span>
                                <span id="notas-resumen-comprobante" class="font-mono font-bold text-red-600">N° 0000716</span>
                            </div>
                            <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span class="text-slate-400 text-[11px]">Monto:</span>
                                <span id="notas-resumen-monto" class="font-mono font-bold text-emerald-600">S/. 150.00</span>
                            </div>
                        </div>

                        <!-- Área de Edición de Notas -->
                        <div class="space-y-1.5">
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>Observaciones / Notas:</span>
                                <span class="text-[10px] text-slate-400 font-normal">Sincroniza con DB y Excel</span>
                            </label>
                            <textarea id="factura-notas-input" rows="4" oninput="sincronizarNotaConVoucher(this.value)" placeholder="Escriba aquí notas u observaciones para este recibo (ej: Módulo I culminado, pago de cuota, turno tarde, convalidación)..." class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"></textarea>
                        </div>

                        <!-- Botones de Inserción Rápida -->
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Insertar Rápido:
                            </label>
                            <div class="flex flex-wrap gap-1.5">
                                <button type="button" onclick="insertarNotaRapida('Módulo I')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ Módulo I</button>
                                <button type="button" onclick="insertarNotaRapida('Módulo II')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ Módulo II</button>
                                <button type="button" onclick="insertarNotaRapida('Módulo III')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ Módulo III</button>
                                <button type="button" onclick="insertarNotaRapida('Aporte Mantenimiento')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ Aporte</button>
                                <button type="button" onclick="insertarNotaRapida('Constancia de Estudio')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ Constancia</button>
                                <button type="button" onclick="insertarNotaRapida('Trámite FUT')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ FUT</button>
                                <button type="button" onclick="insertarNotaRapida('Pago Completo')" class="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition">+ Pago Completo</button>
                            </div>
                        </div>

                        <!-- Checkbox Reflejar en Voucher -->
                        <div class="flex items-center space-x-2 pt-1">
                            <input type="checkbox" id="check-reflejar-nota" onchange="toggleReflejarNota(this.checked)" checked class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500">
                            <label for="check-reflejar-nota" class="text-[11px] font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                                Reflejar nota en línea "4.- Otros" del voucher oficial
                            </label>
                        </div>

                        <!-- Botón Guardar Notas -->
                        <div class="pt-2">
                            <button type="button" onclick="guardarNotasFactura()" id="btn-guardar-notas" class="w-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition">
                                <i class="fa-solid fa-floppy-disk text-sm"></i>
                                <span>Guardar Notas en Sistema y Excel</span>
                            </button>
                            
                            <div id="factura-notas-status" class="hidden text-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 py-2 px-3 rounded-xl mt-2 transition animate-fade-in">
                                <i class="fa-solid fa-circle-check mr-1.5"></i> Notas guardadas exitosamente y sincronizadas en Excel
                            </div>
                        </div>

                    </div>

                    <!-- TARJETA SECUNDARIA: RECIBOS DEL ESTUDIANTE SELECCIONADO -->
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h5 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-clock-rotate-left text-sky-600"></i> Comprobantes de este Alumno
                            </h5>
                            <span id="badge-total-pagos-est" class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                                1 recibo
                            </span>
                        </div>
                        <div id="lista-recibos-estudiante-mini" class="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar text-xs">
                            <!-- Se pobla dinámicamente con los recibos del estudiante actual -->
                        </div>
                    </div>

                </div>

            </div>`;

if (!html.includes(voucherEndTarget)) {
    throw new Error('voucherEndTarget not found in templates/index.html');
}
html = html.replace(voucherEndTarget, voucherEndReplacement);
console.log('Side section for EDITAR NOTAS applied successfully.');

// 3. TARGET: JavaScript implementation
const jsStartTarget = `        function toggleVoucherBox(el) {
            if (!el) return;
            el.innerText = el.innerText === 'X' ? '' : 'X';
        }

        async function poblarSelectorFactura() {
            try {
                if (movimientosGlobales.length === 0) {
                    const res = await fetch('/api/movimientos');
                    movimientosGlobales = await res.json();
                }
                const select = document.getElementById('factura-recibo-select');
                if (!select) return;

                select.innerHTML = '<option value="">-- Elija un Recibo / Pago Registrado --</option>' +
                    movimientosGlobales.map(m => {
                        const compStr = m.comprobante ? \`N° \${m.comprobante}\` : \`REC-\${String(m.id).padStart(5, '0')}\`;
                        return \`<option value="\${m.id}">\${compStr} | \${m.fecha} | \${m.nombre} | S/. \${Number(m.monto || 0).toFixed(2)} - \${m.carrera || m.concepto}</option>\`;
                    }).join('');

                // Default prioritario al recibo 0000716 de la foto oficial o al primer registro
                const reciboFoto = movimientosGlobales.find(x => x.comprobante === '0000716');
                if (reciboFoto) {
                    select.value = reciboFoto.id;
                    seleccionarFacturaRecibo(reciboFoto.id);
                } else if (movimientosGlobales.length > 0) {
                    select.value = movimientosGlobales[0].id;
                    seleccionarFacturaRecibo(movimientosGlobales[0].id);
                }
            } catch (err) {
                console.error("Error al poblar selector factura:", err);
            }
        }

        function seleccionarFacturaRecibo(reciboId) {
            const m = movimientosGlobales.find(x => x.id == reciboId);
            if (!m) return;

            actualizarMembretesFactura();

            // 1. Número correlativo oficial en rojo (7 dígitos)
            let nroRec = m.comprobante ? String(m.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
            if (!nroRec || nroRec === '0000000') nroRec = String(m.id).padStart(7, '0');
            const elNro = document.getElementById('factura-nro-comprobante');
            if (elNro) elNro.innerText = nroRec;

            // 2. Estudiante / Señor (a)
            const elEst = document.getElementById('factura-estudiante');
            if (elEst) elEst.innerText = m.nombre || '---------------------------------';

            // 3. Lookup de estudiante para complementar DNI, celular y turno si faltan
            const est = (estudiantesGlobales || []).find(e => e.nombre && m.nombre && e.nombre.trim().toLowerCase() === m.nombre.trim().toLowerCase()) || {};
            
            // DNI
            const dniVal = m.dni || est.dni || est.codigo || '';
            const elDni = document.getElementById('factura-dni');
            if (elDni) elDni.innerText = dniVal || '--------';

            // Especialidad y Turno
            const carreraVal = m.carrera || est.carrera || 'General';
            const turnoVal = m.turno || est.turno || '';
            const espStr = turnoVal ? \`\${carreraVal} - \${turnoVal}\` : carreraVal;
            const elEsp = document.getElementById('factura-carrera');
            if (elEsp) elEsp.innerText = espStr;

            // Celular
            const celVal = est.telefono || m.telefono || '';
            const elCel = document.getElementById('factura-telefono');
            if (elCel) elCel.innerText = celVal || '---------';

            // 4. Fecha: DÍA | MES | AÑO
            let dia = '08', mes = '05', ano = '25';
            if (m.fecha) {
                if (m.fecha.includes('-')) {
                    const parts = m.fecha.split('-');
                    if (parts.length >= 3) {
                        ano = parts[0].slice(-2);
                        mes = parts[1].padStart(2, '0');
                        dia = parts[2].padStart(2, '0');
                    }
                } else if (m.fecha.includes('/')) {
                    const parts = m.fecha.split('/');
                    if (parts.length >= 3) {
                        dia = parts[0].padStart(2, '0');
                        mes = parts[1].padStart(2, '0');
                        ano = parts[2].slice(-2);
                    }
                }
            }
            const elDia = document.getElementById('factura-dia');
            const elMes = document.getElementById('factura-mes');
            const elAno = document.getElementById('factura-ano');
            if (elDia) elDia.innerText = dia;
            if (elMes) elMes.innerText = mes;
            if (elAno) elAno.innerText = ano;

            // 5. Casillas de Módulos (1 al 7) y Conceptos
            for (let i = 1; i <= 7; i++) {
                const b = document.getElementById(\`box-mod-\${i}\`);
                if (b) b.innerText = '';
            }
            const elConst = document.getElementById('check-constancia');
            const elFut = document.getElementById('check-fut');
            const elOtrosTxt = document.getElementById('factura-otros-texto');
            if (elConst) elConst.innerText = '';
            if (elFut) elFut.innerText = '';
            if (elOtrosTxt) elOtrosTxt.innerText = '';

            const conc = (m.concepto || '').toLowerCase();
            const notas = (m.notas || '').toLowerCase();

            let targetMod = 0;
            if (conc.includes('módulo 1') || conc.includes('modulo 1') || conc.includes('módulo i') || conc.includes('modulo i') || notas.includes('módulo i') || notas.includes('modulo i')) targetMod = 1;
            else if (conc.includes('módulo 2') || conc.includes('modulo 2') || conc.includes('módulo ii') || conc.includes('modulo ii') || notas.includes('módulo ii') || notas.includes('modulo ii')) targetMod = 2;
            else if (conc.includes('módulo 3') || conc.includes('modulo 3') || conc.includes('módulo iii') || conc.includes('modulo iii') || notas.includes('módulo iii') || notas.includes('modulo iii')) targetMod = 3;
            else if (conc.includes('módulo 4') || conc.includes('modulo 4') || conc.includes('módulo iv') || conc.includes('modulo iv')) targetMod = 4;
            else if (conc.includes('módulo 5') || conc.includes('modulo 5') || conc.includes('módulo v') || conc.includes('modulo v')) targetMod = 5;
            else if (conc.includes('módulo 6') || conc.includes('modulo 6') || conc.includes('módulo vi') || conc.includes('modulo vi')) targetMod = 6;
            else if (conc.includes('módulo 7') || conc.includes('modulo 7') || conc.includes('módulo vii') || conc.includes('modulo vii')) targetMod = 7;

            if (targetMod > 0 || conc.includes('aporte') || conc.includes('mantenimiento') || conc.includes('mensualidad') || conc.includes('matr') || conc.includes('regular')) {
                const boxActive = targetMod > 0 ? targetMod : 1;
                const b = document.getElementById(\`box-mod-\${boxActive}\`);
                if (b) b.innerText = 'X';
            } else if (conc.includes('constancia')) {
                if (elConst) elConst.innerText = 'X';
            } else if (conc.includes('fut')) {
                if (elFut) elFut.innerText = 'X';
            } else {
                if (elOtrosTxt) elOtrosTxt.innerText = m.concepto || '';
            }

            // 6. Montos en la tabla
            const montoVal = Number(m.monto || 0).toFixed(2);
            const elMontoFila = document.getElementById('factura-monto-fila1');
            const elMontoTotal = document.getElementById('factura-monto-total');
            if (elMontoFila) elMontoFila.innerText = montoVal;
            if (elMontoTotal) elMontoTotal.innerText = montoVal;

            // Elementos de compatibilidad
            if (document.getElementById('factura-orden-ingreso')) document.getElementById('factura-orden-ingreso').innerText = 'Orden Ingreso N° ' + nroRec;
            if (document.getElementById('factura-fecha')) document.getElementById('factura-fecha').innerText = m.fecha;
            if (document.getElementById('factura-grupo')) document.getElementById('factura-grupo').innerText = m.grupo || 'General';
            if (document.getElementById('factura-docente')) document.getElementById('factura-docente').innerText = m.encargado || '';
            if (document.getElementById('factura-forma-pago')) document.getElementById('factura-forma-pago').innerText = m.metodo_pago || 'Efectivo en Caja';
            if (document.getElementById('factura-concepto')) document.getElementById('factura-concepto').innerText = m.concepto;
            if (document.getElementById('factura-precio-unit')) document.getElementById('factura-precio-unit').innerText = 'S/. ' + montoVal;
            if (document.getElementById('factura-total-fila')) document.getElementById('factura-total-fila').innerText = 'S/. ' + montoVal;
            if (document.getElementById('factura-monto-letras')) document.getElementById('factura-monto-letras').innerText = numeroALetras(m.monto || 0);
        }`;

const newJsImplementation = `        let currentFacturaReciboId = null;
        let currentFacturaEstudianteId = null;

        function toggleVoucherBox(el) {
            if (!el) return;
            el.innerText = el.innerText === 'X' ? '' : 'X';
        }

        async function poblarSelectorFactura() {
            try {
                if (!movimientosGlobales || movimientosGlobales.length === 0) {
                    const res = await fetch('/api/movimientos');
                    movimientosGlobales = await res.json();
                }
                if (!estudiantesGlobales || estudiantesGlobales.length === 0) {
                    const resE = await fetch('/api/estudiantes');
                    estudiantesGlobales = await resE.json();
                }

                // 1. Poblar Selector de Estudiantes
                const selectEst = document.getElementById('factura-estudiante-select');
                if (selectEst) {
                    const sortedEst = [...(estudiantesGlobales || [])].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                    selectEst.innerHTML = '<option value="">-- Seleccionar Estudiante (176 Alumnos Registrados) --</option>' +
                        sortedEst.map(e => {
                            const dniStr = e.dni && e.dni !== 'No registrado' ? \` [DNI: \${e.dni}]\` : '';
                            const carStr = e.carrera ? \` - \${e.carrera}\` : '';
                            return \`<option value="\${e.id}">\${e.nombre}\${dniStr}\${carStr}</option>\`;
                        }).join('');

                    const countEl = document.getElementById('factura-est-count');
                    if (countEl) countEl.innerText = \`\${estudiantesGlobales.length} alumnos\`;
                }

                // 2. Poblar Selector de Recibos
                poblarSelectorRecibosOpciones(movimientosGlobales);

                // 3. Default prioritario al recibo 0000716 de la foto oficial o al primer registro
                const reciboFoto = movimientosGlobales.find(x => x.comprobante === '0000716');
                if (reciboFoto) {
                    seleccionarFacturaRecibo(reciboFoto.id);
                } else if (movimientosGlobales.length > 0) {
                    seleccionarFacturaRecibo(movimientosGlobales[0].id);
                }
            } catch (err) {
                console.error("Error al poblar selector factura:", err);
            }
        }

        function poblarSelectorRecibosOpciones(lista) {
            const select = document.getElementById('factura-recibo-select');
            if (!select) return;

            select.innerHTML = '<option value="">-- Elija un Recibo / Pago Registrado --</option>' +
                lista.map(m => {
                    const compStr = m.comprobante ? \`N° \${m.comprobante}\` : \`REC-\${String(m.id).padStart(5, '0')}\`;
                    return \`<option value="\${m.id}">\${compStr} | \${m.fecha} | \${m.nombre} | S/. \${Number(m.monto || 0).toFixed(2)} - \${m.carrera || m.concepto}</option>\`;
                }).join('');
        }

        function mostrarTodosLosRecibos() {
            poblarSelectorRecibosOpciones(movimientosGlobales);
            if (currentFacturaReciboId) {
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = currentFacturaReciboId;
            }
        }

        function seleccionarEstudianteFactura(estId) {
            if (!estId) return;
            currentFacturaEstudianteId = estId;
            const est = (estudiantesGlobales || []).find(x => x.id == estId);
            if (!est) return;

            // Buscar todos los movimientos del estudiante
            const movs = (movimientosGlobales || []).filter(m => m.nombre && est.nombre && m.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase());
            
            // Actualizar lista mini de recibos del estudiante
            actualizarListaRecibosMini(est, movs);

            if (movs.length > 0) {
                // Filtrar selector de recibos para mostrar los de este estudiante
                poblarSelectorRecibosOpciones(movs);
                const selRecibo = movs[0];
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = selRecibo.id;
                seleccionarFacturaRecibo(selRecibo.id, false); // no re-seleccionar estudiante para evitar bucle
            } else {
                // El estudiante no tiene recibos registrados: preparar voucher con sus datos para emisión
                currentFacturaReciboId = null;
                document.getElementById('factura-nro-comprobante').innerText = 'NUEVO';
                document.getElementById('factura-estudiante').innerText = est.nombre;
                document.getElementById('factura-dni').innerText = est.dni || '--------';
                document.getElementById('factura-carrera').innerText = est.turno ? \`\${est.carrera} - \${est.turno}\` : est.carrera;
                document.getElementById('factura-telefono').innerText = est.telefono || '---------';

                // Fecha actual
                const hoy = new Date();
                document.getElementById('factura-dia').innerText = String(hoy.getDate()).padStart(2, '0');
                document.getElementById('factura-mes').innerText = String(hoy.getMonth() + 1).padStart(2, '0');
                document.getElementById('factura-ano').innerText = String(hoy.getFullYear()).slice(-2);

                // Limpiar casillas y montos
                for (let i = 1; i <= 7; i++) {
                    const b = document.getElementById(\`box-mod-\${i}\`);
                    if (b) b.innerText = i === 1 ? 'X' : '';
                }
                document.getElementById('factura-monto-fila1').innerText = '150.00';
                document.getElementById('factura-monto-total').innerText = '150.00';

                // Resumen lateral
                document.getElementById('notas-resumen-alumno').innerText = est.nombre;
                document.getElementById('notas-resumen-comprobante').innerText = 'Nuevo Recibo';
                document.getElementById('notas-resumen-monto').innerText = 'S/. 150.00';
                document.getElementById('factura-notas-input').value = est.notas || '';
                sincronizarNotaConVoucher(est.notas || '');
            }
        }

        function actualizarListaRecibosMini(est, movs) {
            const cont = document.getElementById('lista-recibos-estudiante-mini');
            const badge = document.getElementById('badge-total-pagos-est');
            if (badge) badge.innerText = \`\${movs.length} recibo\${movs.length === 1 ? '' : 's'}\`;
            if (!cont) return;

            if (movs.length === 0) {
                cont.innerHTML = '<p class="text-[11px] text-slate-400 italic p-2 text-center">Este estudiante aún no registra recibos.</p>';
                return;
            }

            cont.innerHTML = movs.map(m => {
                const isActive = m.id == currentFacturaReciboId;
                const comp = m.comprobante ? \`N° \${m.comprobante}\` : \`#\${m.id}\`;
                return \`
                    <div onclick="seleccionarFacturaRecibo(\${m.id})" class="p-2 rounded-xl cursor-pointer transition flex items-center justify-between border \${isActive ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700 font-bold' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                        <div>
                            <div class="text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span class="text-red-600 font-mono font-bold">\${comp}</span>
                                <span class="text-slate-500">\${m.fecha}</span>
                            </div>
                            <div class="text-[10px] text-slate-500 truncate max-w-[150px]">\${m.concepto || 'Aporte'}</div>
                        </div>
                        <div class="text-right">
                            <span class="text-emerald-600 font-mono font-bold text-xs">S/. \${Number(m.monto || 0).toFixed(2)}</span>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function seleccionarFacturaRecibo(reciboId, syncEstudiante = true) {
            const m = movimientosGlobales.find(x => x.id == reciboId);
            if (!m) return;
            currentFacturaReciboId = reciboId;

            actualizarMembretesFactura();

            // 1. Número correlativo oficial en rojo (7 dígitos)
            let nroRec = m.comprobante ? String(m.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
            if (!nroRec || nroRec === '0000000') nroRec = String(m.id).padStart(7, '0');
            const elNro = document.getElementById('factura-nro-comprobante');
            if (elNro) elNro.innerText = nroRec;

            // 2. Estudiante / Señor (a)
            const elEst = document.getElementById('factura-estudiante');
            if (elEst) elEst.innerText = m.nombre || '---------------------------------';

            // 3. Lookup de estudiante para complementar DNI, celular y turno si faltan
            const est = (estudiantesGlobales || []).find(e => e.nombre && m.nombre && e.nombre.trim().toLowerCase() === m.nombre.trim().toLowerCase()) || {};
            if (est.id) currentFacturaEstudianteId = est.id;

            // Sincronizar selector de estudiante si corresponde
            if (syncEstudiante && est.id) {
                const selEst = document.getElementById('factura-estudiante-select');
                if (selEst) selEst.value = est.id;
            }

            // DNI
            const dniVal = m.dni || est.dni || est.codigo || '';
            const elDni = document.getElementById('factura-dni');
            if (elDni) elDni.innerText = dniVal || '--------';

            // Especialidad y Turno
            const carreraVal = m.carrera || est.carrera || 'General';
            const turnoVal = m.turno || est.turno || '';
            const espStr = turnoVal ? \`\${carreraVal} - \${turnoVal}\` : carreraVal;
            const elEsp = document.getElementById('factura-carrera');
            if (elEsp) elEsp.innerText = espStr;

            // Celular
            const celVal = est.telefono || m.telefono || '';
            const elCel = document.getElementById('factura-telefono');
            if (elCel) elCel.innerText = celVal || '---------';

            // 4. Fecha: DÍA | MES | AÑO
            let dia = '08', mes = '05', ano = '25';
            if (m.fecha) {
                if (m.fecha.includes('-')) {
                    const parts = m.fecha.split('-');
                    if (parts.length >= 3) {
                        ano = parts[0].slice(-2);
                        mes = parts[1].padStart(2, '0');
                        dia = parts[2].padStart(2, '0');
                    }
                } else if (m.fecha.includes('/')) {
                    const parts = m.fecha.split('/');
                    if (parts.length >= 3) {
                        dia = parts[0].padStart(2, '0');
                        mes = parts[1].padStart(2, '0');
                        ano = parts[2].slice(-2);
                    }
                }
            }
            const elDia = document.getElementById('factura-dia');
            const elMes = document.getElementById('factura-mes');
            const elAno = document.getElementById('factura-ano');
            if (elDia) elDia.innerText = dia;
            if (elMes) elMes.innerText = mes;
            if (elAno) elAno.innerText = ano;

            // 5. Casillas de Módulos (1 al 7) y Conceptos
            for (let i = 1; i <= 7; i++) {
                const b = document.getElementById(\`box-mod-\${i}\`);
                if (b) b.innerText = '';
            }
            const elConst = document.getElementById('check-constancia');
            const elFut = document.getElementById('check-fut');
            const elOtrosTxt = document.getElementById('factura-otros-texto');
            if (elConst) elConst.innerText = '';
            if (elFut) elFut.innerText = '';
            if (elOtrosTxt) elOtrosTxt.innerText = '';

            const conc = (m.concepto || '').toLowerCase();
            const notas = (m.notas || '').toLowerCase();

            let targetMod = 0;
            if (conc.includes('módulo 1') || conc.includes('modulo 1') || conc.includes('módulo i') || conc.includes('modulo i') || notas.includes('módulo i') || notas.includes('modulo i')) targetMod = 1;
            else if (conc.includes('módulo 2') || conc.includes('modulo 2') || conc.includes('módulo ii') || conc.includes('modulo ii') || notas.includes('módulo ii') || notas.includes('modulo ii')) targetMod = 2;
            else if (conc.includes('módulo 3') || conc.includes('modulo 3') || conc.includes('módulo iii') || conc.includes('modulo iii') || notas.includes('módulo iii') || notas.includes('modulo iii')) targetMod = 3;
            else if (conc.includes('módulo 4') || conc.includes('modulo 4') || conc.includes('módulo iv') || conc.includes('modulo iv')) targetMod = 4;
            else if (conc.includes('módulo 5') || conc.includes('modulo 5') || conc.includes('módulo v') || conc.includes('modulo v')) targetMod = 5;
            else if (conc.includes('módulo 6') || conc.includes('modulo 6') || conc.includes('módulo vi') || conc.includes('modulo vi')) targetMod = 6;
            else if (conc.includes('módulo 7') || conc.includes('modulo 7') || conc.includes('módulo vii') || conc.includes('modulo vii')) targetMod = 7;

            if (targetMod > 0 || conc.includes('aporte') || conc.includes('mantenimiento') || conc.includes('mensualidad') || conc.includes('matr') || conc.includes('regular')) {
                const boxActive = targetMod > 0 ? targetMod : 1;
                const b = document.getElementById(\`box-mod-\${boxActive}\`);
                if (b) b.innerText = 'X';
            } else if (conc.includes('constancia')) {
                if (elConst) elConst.innerText = 'X';
            } else if (conc.includes('fut')) {
                if (elFut) elFut.innerText = 'X';
            } else {
                if (elOtrosTxt) elOtrosTxt.innerText = m.concepto || '';
            }

            // 6. Montos en la tabla
            const montoVal = Number(m.monto || 0).toFixed(2);
            const elMontoFila = document.getElementById('factura-monto-fila1');
            const elMontoTotal = document.getElementById('factura-monto-total');
            if (elMontoFila) elMontoFila.innerText = montoVal;
            if (elMontoTotal) elMontoTotal.innerText = montoVal;

            // 7. Sincronizar Panel de Editar Notas
            const notaTexto = m.notas || '';
            const inputNotas = document.getElementById('factura-notas-input');
            if (inputNotas) inputNotas.value = notaTexto;
            sincronizarNotaConVoucher(notaTexto);

            const resAlumno = document.getElementById('notas-resumen-alumno');
            const resComp = document.getElementById('notas-resumen-comprobante');
            const resMonto = document.getElementById('notas-resumen-monto');
            if (resAlumno) resAlumno.innerText = m.nombre;
            if (resComp) resComp.innerText = \`N° \${nroRec}\`;
            if (resMonto) resMonto.innerText = \`S/. \${montoVal}\`;

            // Actualizar selector de recibo si difiere
            const selRec = document.getElementById('factura-recibo-select');
            if (selRec && selRec.value != reciboId) selRec.value = reciboId;

            // Actualizar lista mini de recibos del estudiante
            if (est.nombre) {
                const movsEst = (movimientosGlobales || []).filter(x => x.nombre && x.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase());
                actualizarListaRecibosMini(est, movsEst);
            }

            // Elementos de compatibilidad
            if (document.getElementById('factura-orden-ingreso')) document.getElementById('factura-orden-ingreso').innerText = 'Orden Ingreso N° ' + nroRec;
            if (document.getElementById('factura-fecha')) document.getElementById('factura-fecha').innerText = m.fecha;
            if (document.getElementById('factura-grupo')) document.getElementById('factura-grupo').innerText = m.grupo || 'General';
            if (document.getElementById('factura-docente')) document.getElementById('factura-docente').innerText = m.encargado || '';
            if (document.getElementById('factura-forma-pago')) document.getElementById('factura-forma-pago').innerText = m.metodo_pago || 'Efectivo en Caja';
            if (document.getElementById('factura-concepto')) document.getElementById('factura-concepto').innerText = m.concepto;
            if (document.getElementById('factura-precio-unit')) document.getElementById('factura-precio-unit').innerText = 'S/. ' + montoVal;
            if (document.getElementById('factura-total-fila')) document.getElementById('factura-total-fila').innerText = 'S/. ' + montoVal;
            if (document.getElementById('factura-monto-letras')) document.getElementById('factura-monto-letras').innerText = numeroALetras(m.monto || 0);
        }

        function sincronizarNotaConVoucher(texto) {
            const chk = document.getElementById('check-reflejar-nota');
            const otrosEl = document.getElementById('factura-otros-texto');
            if (otrosEl && chk && chk.checked) {
                otrosEl.innerText = texto || '';
            }
        }

        function toggleReflejarNota(checked) {
            const otrosEl = document.getElementById('factura-otros-texto');
            const inputNotas = document.getElementById('factura-notas-input');
            if (otrosEl) {
                otrosEl.innerText = checked && inputNotas ? inputNotas.value : '';
            }
        }

        function insertarNotaRapida(tag) {
            const input = document.getElementById('factura-notas-input');
            if (!input) return;
            if (input.value.trim() === '') {
                input.value = tag;
            } else {
                input.value += \` - \${tag}\`;
            }
            sincronizarNotaConVoucher(input.value);
        }

        async function guardarNotasFactura() {
            const input = document.getElementById('factura-notas-input');
            const notas = input ? input.value.trim() : '';

            if (!currentFacturaReciboId) {
                // Guardar nota en estudiante si hay alumno activo
                if (currentFacturaEstudianteId) {
                    try {
                        const res = await fetch(\`/api/estudiantes/\${currentFacturaEstudianteId}/notas\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notas })
                        });
                        const data = await res.json();
                        if (data.success) {
                            const est = (estudiantesGlobales || []).find(e => e.id == currentFacturaEstudianteId);
                            if (est) est.notas = notas;
                            mostrarMensajeNotas("✅ Notas de estudiante guardadas correctamente.");
                        } else {
                            alert("Error al guardar notas: " + (data.error || 'Desconocido'));
                        }
                    } catch (e) {
                        alert("Error al guardar notas de estudiante.");
                    }
                } else {
                    alert("Seleccione un estudiante o comprobante para guardar notas.");
                }
                return;
            }

            try {
                const res = await fetch(\`/api/movimientos/\${currentFacturaReciboId}/notas\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notas })
                });
                const data = await res.json();
                if (data.success) {
                    // Actualizar en memoria local
                    const m = (movimientosGlobales || []).find(x => x.id == currentFacturaReciboId);
                    if (m) m.notas = notas;

                    // Si también hay estudiante activo, actualizar nota
                    if (currentFacturaEstudianteId) {
                        const est = (estudiantesGlobales || []).find(e => e.id == currentFacturaEstudianteId);
                        if (est) est.notas = notas;
                    }

                    mostrarMensajeNotas("✅ Notas guardadas exitosamente y sincronizadas en Excel.");
                } else {
                    alert("Error al guardar notas: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                console.error("Error al guardar notas:", err);
                alert("Error de conexión al guardar notas.");
            }
        }

        function mostrarMensajeNotas(texto) {
            const statusMsg = document.getElementById('factura-notas-status');
            if (statusMsg) {
                statusMsg.innerHTML = \`<i class="fa-solid fa-circle-check mr-1.5"></i> \${texto}\`;
                statusMsg.classList.remove('hidden');
                setTimeout(() => {
                    statusMsg.classList.add('hidden');
                }, 3500);
            }
        }`;

if (!html.includes(jsStartTarget)) {
    throw new Error('jsStartTarget not found in templates/index.html');
}
html = html.replace(jsStartTarget, newJsImplementation);
console.log('JavaScript functions for student selection and editing notes replaced successfully.');

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html written successfully!');
