const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. UPDATE FACTURA TOOLBAR: FROM DUAL TO TRIPLE SELECTOR (GRUPO + ESTUDIANTE + RECIBO)
const targetToolbar = `                <!-- BARRA DE SELECCIÓN DUAL: ESTUDIANTE + RECIBO + ACCIONES -->
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
                </div>`;

const replacementToolbar = `                <!-- BARRA DE SELECCIÓN TRIPLE: GRUPO / SECCIÓN + ESTUDIANTE + RECIBO / COMPROBANTE -->
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 no-print">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        
                        <!-- 1. Selector de Grupos / Secciones (md:col-span-4) -->
                        <div class="md:col-span-4 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-users-rectangle text-indigo-600"></i> Seleccionar Grupo / Sección:</span>
                                <span id="factura-grupo-count" class="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full font-black">15 grupos</span>
                            </label>
                            <select id="factura-grupo-select" onchange="seleccionarGrupoFactura(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                                <option value="todos">⚡ Todos los Grupos (176 Estudiantes)</option>
                            </select>
                        </div>

                        <!-- 2. Selector de Estudiantes Organizado por Grupos (md:col-span-4) -->
                        <div class="md:col-span-4 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-user-graduate text-indigo-600"></i> Estudiante:</span>
                                <span id="factura-est-count" class="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full font-black">176 alumnos</span>
                            </label>
                            <select id="factura-estudiante-select" onchange="seleccionarEstudianteFactura(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                                <option value="">Cargando lista de estudiantes...</option>
                            </select>
                        </div>

                        <!-- 3. Selector de Recibos / Comprobantes (md:col-span-4) -->
                        <div class="md:col-span-4 flex flex-col space-y-1">
                            <label class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-receipt text-emerald-600"></i> Recibo / Comprobante:</span>
                                <button type="button" onclick="mostrarTodosLosRecibos()" class="text-[10px] text-sky-600 hover:text-sky-800 dark:text-sky-400 font-bold hover:underline">Ver todos los recibos</button>
                            </label>
                            <select id="factura-recibo-select" onchange="seleccionarFacturaRecibo(this.value)" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm">
                                <option value="">Cargando comprobantes...</option>
                            </select>
                        </div>

                    </div>
                </div>`;

if (!html.includes(targetToolbar)) {
    throw new Error('targetToolbar not found');
}
html = html.replace(targetToolbar, replacementToolbar);
console.log('1. Toolbar replaced successfully.');

// 2. UPDATE NOTAS PANEL: ADD GRUPO FIELD AND SELECTOR IN RESUMEN
const targetResumen = `                        <!-- Resumen del Registro Actual -->
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
                        </div>`;

const replacementResumen = `                        <!-- Resumen del Registro Actual -->
                        <div class="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                            <div class="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                                <span class="text-slate-400 text-[11px]">Alumno:</span>
                                <span id="notas-resumen-alumno" class="text-indigo-600 dark:text-indigo-400 font-extrabold truncate max-w-[190px]">Ruth Mamani Hancco</span>
                            </div>
                            <div class="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                                <span class="text-slate-400 text-[11px]">Grupo / Sección:</span>
                                <span id="notas-resumen-grupo" class="text-indigo-700 dark:text-indigo-300 font-bold truncate max-w-[190px]">Corte y Ensamblaje - Turno Tarde</span>
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

                        <!-- Selector Rápido para Reasignar / Cambiar Grupo -->
                        <div class="space-y-1">
                            <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>Asignar / Cambiar Grupo:</span>
                                <span class="text-[10px] text-indigo-600 font-normal">Reasignar sección</span>
                            </label>
                            <select id="notas-cambiar-grupo-select" onchange="cambiarGrupoEstudianteDesdeFactura(this.value)" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                                <option value="">Seleccionar Grupo...</option>
                            </select>
                        </div>`;

if (!html.includes(targetResumen)) {
    throw new Error('targetResumen not found');
}
html = html.replace(targetResumen, replacementResumen);
console.log('2. Resumen panel with grupo updated successfully.');

// 3. JAVASCRIPT: REPLACE FACTURA LOGIC WITH GROUP SELECTION AND OPTGROUPS
const targetJsFactura = `        let currentFacturaReciboId = null;
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
        }`;

const replacementJsFactura = `        let currentFacturaReciboId = null;
        let currentFacturaEstudianteId = null;
        let currentFacturaGrupoFiltro = 'todos';

        // CARGAR GRUPOS DE LA BASE DE DATOS
        async function cargarGrupos() {
            try {
                const carrera = document.getElementById('filtro-grupos-carrera')?.value || '';
                const turno = document.getElementById('filtro-grupos-turno')?.value || '';
                let url = '/api/grupos';
                const params = [];
                if (carrera) params.push(\`carrera=\${encodeURIComponent(carrera)}\`);
                if (turno) params.push(\`turno=\${encodeURIComponent(turno)}\`);
                if (params.length > 0) url += '?' + params.join('&');

                const res = await fetch(url);
                gruposGlobales = await res.json();
                
                renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);
                poblarSelectsGrupos(gruposGlobales);
                poblarSelectorGruposFactura(gruposGlobales);
            } catch (err) {
                console.error("Error al cargar grupos:", err);
            }
        }

        function toggleVoucherBox(el) {
            if (!el) return;
            el.innerText = el.innerText === 'X' ? '' : 'X';
        }

        async function poblarSelectorFactura() {
            try {
                if (!gruposGlobales || gruposGlobales.length === 0) {
                    const resG = await fetch('/api/grupos');
                    gruposGlobales = await resG.json();
                }
                if (!movimientosGlobales || movimientosGlobales.length === 0) {
                    const res = await fetch('/api/movimientos');
                    movimientosGlobales = await res.json();
                }
                if (!estudiantesGlobales || estudiantesGlobales.length === 0) {
                    const resE = await fetch('/api/estudiantes');
                    estudiantesGlobales = await resE.json();
                }

                // 1. Poblar Selector de Grupos en Factura
                poblarSelectorGruposFactura(gruposGlobales);

                // 2. Poblar Selector de Estudiantes (Inicialmente con todos los grupos organizados)
                poblarSelectorEstudiantesOpciones(currentFacturaGrupoFiltro);

                // 3. Poblar Selector de Recibos
                poblarSelectorRecibosOpciones(movimientosGlobales);

                // 4. Default prioritario al recibo 0000716 de la foto oficial o al primer registro
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

        function poblarSelectorGruposFactura(grupos) {
            const selectGrp = document.getElementById('factura-grupo-select');
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            if (!selectGrp && !selectCambiar) return;

            const totalEst = estudiantesGlobales ? estudiantesGlobales.length : 176;

            let htmlOptions = \`<option value="todos">⚡ Todos los Grupos (\${totalEst} Estudiantes)</option>\`;
            let htmlCambiar = \`<option value="">-- Asignar a un Grupo Oficial --</option>\`;

            (grupos || []).forEach(g => {
                const count = (estudiantesGlobales || []).filter(e => e.grupo === g.nombre).length;
                htmlOptions += \`<option value="\${g.nombre}">\${g.nombre} (\${count} alumnos)</option>\`;
                htmlCambiar += \`<option value="\${g.nombre}">\${g.nombre} (\${g.encargado})</option>\`;
            });

            if (selectGrp) {
                selectGrp.innerHTML = htmlOptions;
                selectGrp.value = currentFacturaGrupoFiltro || 'todos';
            }
            if (selectCambiar) {
                selectCambiar.innerHTML = htmlCambiar;
            }

            const countBadge = document.getElementById('factura-grupo-count');
            if (countBadge) countBadge.innerText = \`\${(grupos || []).length} grupos\`;
        }

        function poblarSelectorEstudiantesOpciones(grupoFiltro = 'todos') {
            const selectEst = document.getElementById('factura-estudiante-select');
            if (!selectEst) return;

            let lista = [...(estudiantesGlobales || [])];
            
            if (grupoFiltro && grupoFiltro !== 'todos') {
                lista = lista.filter(e => e.grupo === grupoFiltro);
            }

            lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

            let html = '';
            if (grupoFiltro === 'todos') {
                html = \`<option value="">-- Seleccionar Estudiante (Todos los Grupos: \${lista.length} Alumnos) --</option>\`;
                // Agrupar estudiantes por grupo con optgroup
                const gruposMap = {};
                lista.forEach(e => {
                    const g = e.grupo || 'Sin Grupo Asignado';
                    if (!gruposMap[g]) gruposMap[g] = [];
                    gruposMap[g].push(e);
                });

                Object.keys(gruposMap).sort().forEach(grpName => {
                    const arr = gruposMap[grpName];
                    html += \`<optgroup label="📂 \${grpName} (\${arr.length} alumnos)">\`;
                    arr.forEach(e => {
                        const dniStr = e.dni && e.dni !== 'No registrado' ? \` [DNI: \${e.dni}]\` : '';
                        html += \`<option value="\${e.id}">\${e.nombre}\${dniStr}</option>\`;
                    });
                    html += \`</optgroup>\`;
                });
            } else {
                html = \`<option value="">-- Seleccionar Estudiante de \${grupoFiltro} (\${lista.length} alumnos) --</option>\`;
                lista.forEach(e => {
                    const dniStr = e.dni && e.dni !== 'No registrado' ? \` [DNI: \${e.dni}]\` : '';
                    html += \`<option value="\${e.id}">\${e.nombre}\${dniStr}</option>\`;
                });
            }

            selectEst.innerHTML = html;

            const countEl = document.getElementById('factura-est-count');
            if (countEl) {
                countEl.innerText = grupoFiltro === 'todos' ? \`\${lista.length} alumnos\` : \`\${lista.length} en este grupo\`;
            }

            if (currentFacturaEstudianteId && lista.some(e => e.id == currentFacturaEstudianteId)) {
                selectEst.value = currentFacturaEstudianteId;
            }
        }

        function seleccionarGrupoFactura(grupoNombre) {
            currentFacturaGrupoFiltro = grupoNombre;
            poblarSelectorEstudiantesOpciones(grupoNombre);

            let lista = [...(estudiantesGlobales || [])];
            if (grupoNombre && grupoNombre !== 'todos') {
                lista = lista.filter(e => e.grupo === grupoNombre);
            }

            if (lista.length > 0) {
                // Si el estudiante actual no está en la lista filtrada, seleccionar el primer alumno del grupo
                if (!currentFacturaEstudianteId || !lista.some(e => e.id == currentFacturaEstudianteId)) {
                    seleccionarEstudianteFactura(lista[0].id, false);
                }
            }
        }`;

if (!html.includes(targetJsFactura)) {
    throw new Error('targetJsFactura not found');
}
html = html.replace(targetJsFactura, replacementJsFactura);
console.log('3. Factura group selection logic updated successfully.');

// 4. UPDATE seleccionarEstudianteFactura AND seleccionarFacturaRecibo FOR GRUPOS
const targetEstFn = `        function seleccionarEstudianteFactura(estId) {
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
        }`;

const replacementEstFn = `        function seleccionarEstudianteFactura(estId, syncGrupo = true) {
            if (!estId) return;
            currentFacturaEstudianteId = estId;
            const est = (estudiantesGlobales || []).find(x => x.id == estId);
            if (!est) return;

            // Sincronizar selector de estudiante en el DOM
            const selectEst = document.getElementById('factura-estudiante-select');
            if (selectEst && selectEst.value != estId) selectEst.value = estId;

            // Sincronizar selector de grupo si se solicitó o si el filtro actual es 'todos'
            if (syncGrupo && est.grupo) {
                const selectGrp = document.getElementById('factura-grupo-select');
                if (selectGrp && currentFacturaGrupoFiltro !== 'todos' && selectGrp.value !== est.grupo) {
                    selectGrp.value = est.grupo;
                    currentFacturaGrupoFiltro = est.grupo;
                }
            }

            // Sincronizar campo de grupo en el panel de notas
            const resGrupo = document.getElementById('notas-resumen-grupo');
            if (resGrupo) resGrupo.innerText = est.grupo || 'General';
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            if (selectCambiar && est.grupo) selectCambiar.value = est.grupo;

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
                
                const espStr = est.turno ? \`\${est.carrera} - \${est.turno}\` : est.carrera;
                document.getElementById('factura-carrera').innerText = espStr;
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

        async function cambiarGrupoEstudianteDesdeFactura(nuevoGrupo) {
            if (!currentFacturaEstudianteId || !nuevoGrupo) return;
            const est = (estudiantesGlobales || []).find(e => e.id == currentFacturaEstudianteId);
            if (!est) return;

            try {
                const res = await fetch(\`/api/estudiantes/\${currentFacturaEstudianteId}/editar\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ grupo: nuevoGrupo })
                });
                const data = await res.json();
                if (data.success) {
                    est.grupo = nuevoGrupo;
                    const resGrupo = document.getElementById('notas-resumen-grupo');
                    if (resGrupo) resGrupo.innerText = nuevoGrupo;
                    
                    // Actualizar en movimientosGlobales
                    (movimientosGlobales || []).forEach(m => {
                        if (m.nombre && est.nombre && m.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase()) {
                            m.grupo = nuevoGrupo;
                        }
                    });

                    // Recargar grupos y refrescar selectores
                    await cargarGrupos();
                    poblarSelectorEstudiantesOpciones(currentFacturaGrupoFiltro);
                    mostrarMensajeNotas(\`✅ Alumno reasignado a: \${nuevoGrupo}\`);
                } else {
                    alert("Error al actualizar grupo: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al reasignar grupo.");
            }
        }`;

if (!html.includes(targetEstFn)) {
    throw new Error('targetEstFn not found');
}
html = html.replace(targetEstFn, replacementEstFn);
console.log('4. seleccionarEstudianteFactura and cambiarGrupoEstudianteDesdeFactura updated.');

// 5. UPDATE seleccionarFacturaRecibo TO UPDATE notas-resumen-grupo
const targetReciboGrupo = `            const resAlumno = document.getElementById('notas-resumen-alumno');
            const resComp = document.getElementById('notas-resumen-comprobante');
            const resMonto = document.getElementById('notas-resumen-monto');
            if (resAlumno) resAlumno.innerText = m.nombre;
            if (resComp) resComp.innerText = \`N° \${nroRec}\`;
            if (resMonto) resMonto.innerText = \`S/. \${montoVal}\`;`;

const replacementReciboGrupo = `            const resAlumno = document.getElementById('notas-resumen-alumno');
            const resGrupo = document.getElementById('notas-resumen-grupo');
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            const resComp = document.getElementById('notas-resumen-comprobante');
            const resMonto = document.getElementById('notas-resumen-monto');
            if (resAlumno) resAlumno.innerText = m.nombre;
            if (resGrupo) resGrupo.innerText = m.grupo || est.grupo || 'General';
            if (selectCambiar && (m.grupo || est.grupo)) selectCambiar.value = m.grupo || est.grupo;
            if (resComp) resComp.innerText = \`N° \${nroRec}\`;
            if (resMonto) resMonto.innerText = \`S/. \${montoVal}\`;`;

if (!html.includes(targetReciboGrupo)) {
    throw new Error('targetReciboGrupo not found');
}
html = html.replace(targetReciboGrupo, replacementReciboGrupo);
console.log('5. seleccionarFacturaRecibo updated.');

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html successfully updated and saved!');
