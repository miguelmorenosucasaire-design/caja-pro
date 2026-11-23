const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// =========================================================================
// 1. ADD SORT SELECTOR TO ESTUDIANTES FILTER BAR
// =========================================================================
if (!html.includes('id="filtro-estudiantes-orden"')) {
    const target = 'id="filtro-estudiantes-carrera"';
    const idx = html.indexOf(target);
    if (idx !== -1) {
        // find closing select tag
        const closeSelectIdx = html.indexOf('</select>', idx);
        if (closeSelectIdx !== -1) {
            const insertion = `</select>

                        <!-- Selector de Ordenamiento de Estudiantes (Recientes primero por defecto) -->
                        <div class="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
                            <i class="fa-solid fa-arrow-down-wide-short text-indigo-500 text-xs"></i>
                            <select id="filtro-estudiantes-orden" onchange="filtrarEstudiantesFrontend()" class="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer">
                                <option value="reciente" selected>🔽 Más recientes primero (N° Boleta / Nuevos)</option>
                                <option value="antiguo">🔼 Primero al último (Antiguo a reciente)</option>
                                <option value="boleta_desc">🧾 N° Boleta: Mayor a menor</option>
                                <option value="boleta_asc">🧾 N° Boleta: Menor a mayor</option>
                                <option value="nombre_asc">🔤 Nombre: A → Z</option>
                                <option value="nombre_desc">🔤 Nombre: Z → A</option>
                            </select>
                        </div>`;
            html = html.slice(0, closeSelectIdx) + insertion + html.slice(closeSelectIdx + 9);
            console.log('1. filtro-estudiantes-orden inserted into DOM');
        }
    }
} else {
    console.log('1. filtro-estudiantes-orden already present');
}

// =========================================================================
// 2. JAVASCRIPT FUNCTIONS (BOLETA RESET, SORT, DEUDORES FILTER, DIARIO & EXPORT)
// =========================================================================
const newJSCode = `
        // =========================================================================
        // GESTIÓN DE LIMPIEZA Y REINICIO DE BOLETA (SELECCIONAR NUEVO ESTUDIANTE)
        // =========================================================================
        function limpiarSeleccionBoleta() {
            const selEst = document.getElementById('factura-estudiante-select');
            if (selEst) selEst.value = '';

            const selRec = document.getElementById('factura-recibo-select');
            if (selRec) {
                selRec.innerHTML = '<option value="">-- Seleccionar Recibo o Crear Nuevo --</option>';
            }

            // Reiniciar campos visuales del Comprobante Original
            const elNro = document.getElementById('factura-nro-comprobante');
            if (elNro) {
                // Sugerir nuevo correlativo si existe sugerencia
                const sug = document.getElementById('form-comprobante')?.placeholder?.replace(/[^0-9]/g, '') || '0000812';
                elNro.innerText = sug.padStart(7, '0');
            }

            const elEst = document.getElementById('factura-estudiante');
            if (elEst) elEst.innerText = '____________________________________________';

            const elDni = document.getElementById('factura-dni');
            if (elDni) elDni.innerText = '--------';

            const elCel = document.getElementById('factura-telefono');
            if (elCel) elCel.innerText = '---------';

            const elEsp = document.getElementById('factura-carrera');
            if (elEsp) elEsp.innerText = '____________________________________________';

            const elPrecio = document.getElementById('factura-precio-unit');
            if (elPrecio) elPrecio.innerText = '0.00';

            const elTotal = document.getElementById('factura-monto-total');
            if (elTotal) elTotal.innerText = '0.00';

            const elNota = document.getElementById('factura-nota-otros');
            if (elNota) elNota.innerText = '';

            // Desmarcar todas las casillas de módulos y constancia
            for (let i = 1; i <= 7; i++) {
                const box = document.getElementById('box-mod-' + i);
                if (box) box.innerText = '';
            }
            const chkConst = document.getElementById('check-constancia');
            if (chkConst) chkConst.innerText = '';
            const chkFut = document.getElementById('check-fut');
            if (chkFut) chkFut.innerText = '';

            // Fecha a hoy
            const hoy = new Date();
            const elDia = document.getElementById('factura-dia');
            if (elDia) elDia.innerText = String(hoy.getDate()).padStart(2, '0');
            const elMes = document.getElementById('factura-mes');
            if (elMes) elMes.innerText = String(hoy.getMonth() + 1).padStart(2, '0');
            const elAno = document.getElementById('factura-ano');
            if (elAno) elAno.innerText = String(hoy.getFullYear()).slice(-2);

            // Sincronizar comprobante copia (azul)
            if (typeof sincronizarCopiaVoucher === 'function') {
                sincronizarCopiaVoucher();
            }

            // Notificación visual rápida
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 text-xs font-bold flex items-center space-x-2 animate-bounce';
            toast.innerHTML = '<i class="fa-solid fa-eraser text-amber-400"></i><span>Boleta reiniciada. Selecciona un nuevo estudiante arriba para llenarla automáticamente.</span>';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
        }

        function actualizarBoletaSeleccionada() {
            const selRec = document.getElementById('factura-recibo-select');
            if (selRec && selRec.value) {
                seleccionarFacturaRecibo(selRec.value);
            } else {
                const selEst = document.getElementById('factura-estudiante-select');
                if (selEst && selEst.value) {
                    seleccionarEstudianteFactura(selEst.value);
                } else {
                    limpiarSeleccionBoleta();
                }
            }
        }

        // =========================================================================
        // FILTRADO Y ORDENAMIENTO AVANZADO DE ESTUDIANTES (MÁS RECIENTES PRIMERO)
        // =========================================================================
        function ordenarEstudiantesLista(lista, orden) {
            const copia = lista.slice();
            if (orden === 'reciente') {
                // Mayor ID o mayor número de boleta primero (los nuevos estudiantes van arriba)
                return copia.sort((a, b) => (b.id || 0) - (a.id || 0));
            } else if (orden === 'antiguo') {
                // Menor ID primero (primero al último)
                return copia.sort((a, b) => (a.id || 0) - (b.id || 0));
            } else if (orden === 'boleta_desc') {
                return copia.sort((a, b) => {
                    const bNro = Number(String(b.codigo || b.id).replace(/\\D/g, '')) || 0;
                    const aNro = Number(String(a.codigo || a.id).replace(/\\D/g, '')) || 0;
                    return bNro - aNro;
                });
            } else if (orden === 'boleta_asc') {
                return copia.sort((a, b) => {
                    const bNro = Number(String(b.codigo || b.id).replace(/\\D/g, '')) || 0;
                    const aNro = Number(String(a.codigo || a.id).replace(/\\D/g, '')) || 0;
                    return aNro - bNro;
                });
            } else if (orden === 'nombre_asc') {
                return copia.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
            } else if (orden === 'nombre_desc') {
                return copia.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
            }
            return copia;
        }

        // =========================================================================
        // FILTRADO DINÁMICO DE DEUDORES POR NOMBRE O DNI
        // =========================================================================
        let deudoresGlobalesCache = [];

        function filtrarDeudoresEnTabla() {
            const rawVal = document.getElementById('filtro-deudores-buscar')?.value || '';
            const query = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(rawVal) : rawVal.toLowerCase().trim();
            const queryDigits = rawVal.replace(/\\D/g, '');
            const carreraFiltro = document.getElementById('filtro-deudores-carrera')?.value || '';

            const filtrados = (deudoresGlobalesCache || []).filter(d => {
                // Filtro carrera
                if (carreraFiltro && d.carrera !== carreraFiltro) return false;

                if (!query) return true;
                const nombreNorm = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(d.nombre) : (d.nombre || '').toLowerCase();
                const dniNorm = (d.dni || d.codigo || '').toLowerCase();
                const dniDigits = (d.dni || d.codigo || '').replace(/\\D/g, '');

                return nombreNorm.includes(query) ||
                       dniNorm.includes(query) ||
                       (queryDigits.length >= 2 && dniDigits.includes(queryDigits));
            });

            const badge = document.getElementById('badge-deudores-count');
            if (badge) badge.innerText = filtrados.length;

            renderDeudoresRows(filtrados);
        }

        function renderDeudoresRows(deudores) {
            const tbody = document.getElementById('tabla-deudores');
            if (!tbody) return;

            if (deudores.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400 font-medium">No se encontraron estudiantes con deudas pendientes para esta búsqueda.</td></tr>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            tbody.innerHTML = deudores.map(d => {
                let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                let alertaIcon = 'fa-calendar';

                if (d.urgencia === 'vencido') {
                    badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse';
                    alertaIcon = 'fa-circle-xmark';
                } else if (d.urgencia === 'vence_hoy' || d.urgencia === 'urgente') {
                    badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                    alertaIcon = 'fa-triangle-exclamation';
                } else if (d.urgencia === 'alerta') {
                    badgeColor = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
                    alertaIcon = 'fa-clock';
                } else {
                    badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                    alertaIcon = 'fa-circle-check';
                }

                return \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                \${(d.nombre || '').charAt(0)}
                            </span>
                            <div>
                                <span class="block">\${d.nombre}</span>
                                <span class="text-[10px] text-slate-400 font-mono">DNI: \${d.dni || d.codigo || '-'}</span>
                            </div>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">\${d.carrera || d.grupo || '-'}</td>
                        <td class="py-3.5 px-4 font-extrabold text-rose-600">\${fMoney(d.deuda || d.monto_pendiente || 150)}</td>
                        <td class="py-3.5 px-4 text-slate-500 font-medium">\${d.fecha_vencimiento || '2026-11-30'}</td>
                        <td class="py-3.5 px-4">
                            <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide \${badgeColor}">
                                <i class="fa-solid \${alertaIcon}"></i>
                                <span>\${(d.urgencia || 'pendiente').toUpperCase()}</span>
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-center">
                            <button type="button" onclick="irAFacturaConEstudiante('\${d.id || d.nombre}')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1 mx-auto" title="Emitir Boleta de Pago">
                                <i class="fa-solid fa-receipt"></i>
                                <span>Cobrar / Boleta</span>
                            </button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        // =========================================================================
        // CONTROL DINÁMICO DE FECHAS EN DIARIO Y NOTAS
        // =========================================================================
        function irAFechaDiario(tipo) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (!inputF) return;

            if (tipo === 'hoy') {
                inputF.value = new Date().toISOString().split('T')[0];
            } else if (tipo === 'ultimo') {
                if (typeof movimientosGlobales !== 'undefined' && movimientosGlobales.length > 0) {
                    const sortedMovs = movimientosGlobales.slice().sort((a,b) => (b.fecha || '').localeCompare(a.fecha || ''));
                    if (sortedMovs[0] && sortedMovs[0].fecha) {
                        inputF.value = sortedMovs[0].fecha;
                    }
                }
            }
            cargarDiario(inputF.value);
        }

        function cambiarDiaDiario(delta) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (!inputF) return;
            const curVal = inputF.value || new Date().toISOString().split('T')[0];
            const d = new Date(curVal + 'T12:00:00');
            d.setDate(d.getDate() + delta);
            inputF.value = d.toISOString().split('T')[0];
            cargarDiario(inputF.value);
        }

        // =========================================================================
        // EXPORTACIÓN AISLADA DE CADA SECCIÓN (SIN MEZCLAR CON OTRAS SECCIONES)
        // =========================================================================
        function exportarDiarioPDF() {
            const inputF = document.getElementById('diario-selector-fecha');
            const fStr = inputF ? inputF.value : new Date().toISOString().split('T')[0];
            const originalTitle = document.title;
            document.title = \`CETPRO_Micaela_Bastidas_DIARIO_Y_NOTAS_\${fStr}\`;

            const elem = document.getElementById('section-diario');
            if (!elem) { window.print(); return; }

            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: \`CETPRO_Micaela_Bastidas_DIARIO_\${fStr}.pdf\`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(elem).save().then(() => {
                    document.title = originalTitle;
                });
            } else {
                window.print();
                setTimeout(() => { document.title = originalTitle; }, 1000);
            }
        }

        function exportarDiarioExcel() {
            const inputF = document.getElementById('diario-selector-fecha');
            const fStr = inputF ? inputF.value : new Date().toISOString().split('T')[0];
            window.location.href = \`/api/exportar/hoja?sheet=diario&fecha=\${encodeURIComponent(fStr)}\`;
        }

        function exportarControlPagosPDF() {
            const originalTitle = document.title;
            document.title = 'CETPRO_Micaela_Bastidas_CONTROL_PAGOS_2026';
            const elem = document.getElementById('section-control-pagos');
            if (!elem) { window.print(); return; }

            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [8, 8, 8, 8],
                    filename: 'CETPRO_Micaela_Bastidas_CONTROL_PAGOS_2026.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(elem).save().then(() => {
                    document.title = originalTitle;
                });
            } else {
                window.print();
                setTimeout(() => { document.title = originalTitle; }, 1000);
            }
        }

        function exportarControlPagosExcel() {
            window.location.href = '/api/exportar/hoja?sheet=control-pagos';
        }

        function irAFacturaConEstudiante(estId) {
            cambiarSeccion('factura');
            const selEst = document.getElementById('factura-estudiante-select');
            if (selEst) {
                selEst.value = estId;
                seleccionarEstudianteFactura(estId);
            }
        }
`;

// Insert the new JS functions before </script>
const scriptEndIdx = html.lastIndexOf('</script>');
if (scriptEndIdx !== -1) {
    html = html.slice(0, scriptEndIdx) + '\n' + newJSCode + '\n' + html.slice(scriptEndIdx);
    console.log('2. New JavaScript functions inserted before </script>');
}

// 3. Update cargarDeudores to cache and call renderDeudoresRows
const targetCargarDeudores = `                document.getElementById('badge-deudores-count').innerText = deudores.length;

                const tbody = document.getElementById('tabla-deudores');`;

const newCargarDeudores = `                deudoresGlobalesCache = deudores;
                document.getElementById('badge-deudores-count').innerText = deudores.length;

                filtrarDeudoresEnTabla();
                return;

                const tbody = document.getElementById('tabla-deudores');`;

if (html.includes(targetCargarDeudores)) {
    html = html.replace(targetCargarDeudores, newCargarDeudores);
    console.log('3. cargarDeudores updated with cache and real-time search support');
}

// 4. Update filtrarEstudiantesFrontend to sort by filtro-estudiantes-orden
const targetRenderEst = `renderEstudiantes(filtrados);`;
const newRenderEst = `const orden = document.getElementById('filtro-estudiantes-orden')?.value || 'reciente';
            const ordenados = typeof ordenarEstudiantesLista === 'function' ? ordenarEstudiantesLista(filtrados, orden) : filtrados;
            renderEstudiantes(ordenados);`;

if (html.includes(targetRenderEst)) {
    html = html.replace(targetRenderEst, newRenderEst);
    console.log('4. filtrarEstudiantesFrontend updated with sorting by newest first');
}

// 5. Update cambiarSeccion to auto-init date in diario and load control-pagos / deudores
const targetCambiarSecEnd = `activeSec.classList.add('section-activa-print');
            }`;

const newCambiarSecEnd = `activeSec.classList.add('section-activa-print');
            }

            // Cargas y sincronizaciones reactivas por sección
            if (seccion === 'diario') {
                const inputF = document.getElementById('diario-selector-fecha');
                if (inputF && !inputF.value) {
                    // Inicializar con la fecha de hoy por defecto
                    inputF.value = new Date().toISOString().split('T')[0];
                }
                if (typeof cargarDiario === 'function') {
                    cargarDiario(inputF ? inputF.value : '');
                }
            } else if (seccion === 'control-pagos') {
                if (typeof cargarControlPagos === 'function') {
                    cargarControlPagos();
                }
            } else if (seccion === 'deudores') {
                if (typeof cargarDeudores === 'function') {
                    cargarDeudores();
                }
            }`;

if (html.includes(targetCambiarSecEnd)) {
    html = html.replace(targetCambiarSecEnd, newCambiarSecEnd);
    console.log('5. cambiarSeccion updated with automatic section data init');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('All frontend improvements successfully applied to templates/index.html!');
