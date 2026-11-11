const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf-8');

console.log(`Initial file length: ${html.length}`);

// 1. Actualizar la cabecera de la tabla de respaldos
const oldBackupHeader = `<tr class="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                    <th class="py-3 px-4">Nombre del Archivo de Respaldo</th>
                                    <th class="py-3 px-4">Formato / Tipo</th>
                                    <th class="py-3 px-4">Fecha y Hora de Creación</th>
                                    <th class="py-3 px-4 text-right">Tamaño</th>
                                    <th class="py-3 px-4 text-center">Acciones</th>
                                </tr>`;

const newBackupHeader = `<tr class="bg-slate-50/50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                    <th class="py-3 px-4">Nombre del Archivo de Respaldo</th>
                                    <th class="py-3 px-4">Formato / Tipo</th>
                                    <th class="py-3 px-4">Firma SHA-256 (Criptográfica)</th>
                                    <th class="py-3 px-4">Fecha y Hora</th>
                                    <th class="py-3 px-4 text-right">Tamaño</th>
                                    <th class="py-3 px-4 text-center">Acciones y Seguridad</th>
                                </tr>`;

if (html.includes(oldBackupHeader)) {
    html = html.replace(oldBackupHeader, newBackupHeader);
    console.log('Cabecera de tabla de respaldos actualizada.');
} else {
    console.warn('No se encontró oldBackupHeader exactamente');
}

// 2. Funciones de Tema (Cyber Dark / Modo Claro)
const themeCode = `
        // =========================================================================
        // GESTIÓN DE TEMA: MODO CLARO Y MODO FUTURISTA CYBER DARK
        // =========================================================================
        function initTheme() {
            const savedTheme = localStorage.getItem('cetpro-theme') || 'dark';
            applyTheme(savedTheme);
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('cetpro-theme', newTheme);
        }

        function applyTheme(theme) {
            const htmlEl = document.documentElement;
            const labelEl = document.getElementById('theme-label');
            const iconEl = document.getElementById('theme-icon');
            const btnEl = document.getElementById('btn-theme-toggle');

            if (theme === 'dark') {
                htmlEl.classList.add('dark');
                if (labelEl) labelEl.innerText = 'Cyber Dark';
                if (iconEl) iconEl.className = 'fa-solid fa-moon text-cyan-400';
                if (btnEl) {
                    btnEl.className = 'cyber-btn px-3 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 shadow-sm shadow-cyan-500/20';
                }
            } else {
                htmlEl.classList.remove('dark');
                if (labelEl) labelEl.innerText = 'Modo Claro';
                if (iconEl) iconEl.className = 'fa-solid fa-sun text-amber-500';
                if (btnEl) {
                    btnEl.className = 'px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-sm';
                }
            }
        }
`;

// 3. Funciones de Secciones Maestro-Detalle Sidebar
const sidebarCode = `
        // =========================================================================
        // NAVEGACIÓN MAESTRO-DETALLE DE 13 SECCIONES (DE LADO)
        // =========================================================================
        let filtroTurnoSidebarActivo = '';

        function setFiltroTurnoSidebar(turno) {
            filtroTurnoSidebarActivo = turno;
            ['todos', 'manana', 'tarde', 'noche'].forEach(t => {
                const btn = document.getElementById('btn-filtro-turno-' + t);
                if (!btn) return;
                const key = t === 'todos' ? '' : (t === 'manana' ? 'Mañana' : (t === 'tarde' ? 'Tarde' : 'Noche'));
                if (key === turno) {
                    btn.className = 'btn-filtro-turno-sidebar py-1 px-1.5 rounded-lg bg-indigo-600 text-white text-center transition font-bold shadow-sm';
                } else {
                    btn.className = 'btn-filtro-turno-sidebar py-1 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition font-bold';
                }
            });
            filtrarSidebarGrupos();
        }

        function filtrarSidebarGrupos() {
            const buscar = (document.getElementById('filtro-sidebar-grupos')?.value || '').toLowerCase();
            const filtrados = gruposGlobales.filter(g => {
                const coincideTexto = !buscar || 
                    g.nombre.toLowerCase().includes(buscar) || 
                    g.encargado.toLowerCase().includes(buscar) || 
                    g.carrera.toLowerCase().includes(buscar) ||
                    (g.aula_taller && g.aula_taller.toLowerCase().includes(buscar));
                const coincideTurno = !filtroTurnoSidebarActivo || g.turno === filtroTurnoSidebarActivo;
                return coincideTexto && coincideTurno;
            });
            renderListaSidebar(filtrados);
        }

        function renderSidebarSecciones(grupos) {
            renderListaSidebar(grupos);
        }

        function renderListaSidebar(grupos) {
            const contenedor = document.getElementById('sidebar-lista-secciones');
            if (!contenedor) return;

            if (grupos.length === 0) {
                contenedor.innerHTML = '<div class="p-4 text-center text-slate-400 text-xs">No hay secciones que coincidan con la búsqueda.</div>';
                return;
            }

            const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            contenedor.innerHTML = grupos.map((g, idx) => {
                const codMatch = g.nombre.match(/^G\\d+/i);
                const cod = codMatch ? codMatch[0].toUpperCase() : ('G' + String(idx + 1).padStart(2, '0'));
                const esActivo = g.id == currentPlantillaGrupoId;

                let badgeTurnoColor = 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';

                return \`
                    <div onclick="seleccionarSeccionSidebar(\${g.id})" id="sidebar-item-grupo-\${g.id}" class="sidebar-item-seccion cursor-pointer p-3 rounded-xl border transition-all \${esActivo ? 'cyber-active-item bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}">
                        <div class="flex items-start justify-between gap-1 mb-1">
                            <div class="flex items-center space-x-1.5 min-w-0">
                                <span class="font-black text-[10px] px-1.5 py-0.5 rounded \${esActivo ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'}">
                                    \${cod}
                                </span>
                                <h5 class="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate" title="\${g.nombre}">
                                    \${g.nombre.replace(/^G\\d+\\s*[-·:]\\s*/i, '')}
                                </h5>
                            </div>
                            <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded border \${badgeTurnoColor} flex-shrink-0">
                                \${g.turno}
                            </span>
                        </div>

                        <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 truncate mt-1">
                            <i class="fa-solid fa-chalkboard-user text-indigo-500 text-[10px]"></i>
                            <span class="truncate font-medium">\${g.encargado}</span>
                        </div>

                        <div class="flex items-center justify-between text-[10px] font-bold mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <span>👥 \${g.total_alumnos || 0} alumnos</span>
                            <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">+S/. \${fMoney(g.total_ingresos || 0)}</span>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        async function seleccionarSeccionSidebar(grupoId) {
            currentPlantillaGrupoId = grupoId;
            document.querySelectorAll('.sidebar-item-seccion').forEach(el => {
                el.classList.remove('cyber-active-item', 'bg-indigo-50/70', 'dark:bg-indigo-950/50', 'border-indigo-400', 'dark:border-indigo-500', 'shadow-sm');
                el.classList.add('bg-white', 'dark:bg-slate-900', 'border-slate-200/90', 'dark:border-slate-800');
            });
            const selEl = document.getElementById('sidebar-item-grupo-' + grupoId);
            if (selEl) {
                selEl.classList.remove('bg-white', 'dark:bg-slate-900', 'border-slate-200/90', 'dark:border-slate-800');
                selEl.classList.add('cyber-active-item', 'bg-indigo-50/70', 'dark:bg-indigo-950/50', 'border-indigo-400', 'dark:border-indigo-500', 'shadow-sm');
            }
            await verPlantillaSeccion(grupoId);
        }

        function toggleFormularioSeccion() {
            const formCont = document.getElementById('form-movimiento-seccion-container');
            const btnLabel = document.getElementById('btn-toggle-form-label');
            if (!formCont) return;
            if (formCont.classList.contains('hidden')) {
                formCont.classList.remove('hidden');
                if (btnLabel) btnLabel.innerText = 'Cerrar Formulario';
                document.getElementById('seccion-form-monto')?.focus();
            } else {
                formCont.classList.add('hidden');
                if (btnLabel) btnLabel.innerText = '➕ Registrar Movimiento';
            }
        }
`;

// 4. Funciones de Asignación de Carreras
const careerAssignmentCode = `
        // =========================================================================
        // ASIGNACIÓN DE CARRERAS OFICIALES (7 ESPECIALIDADES) A ESTUDIANTES
        // =========================================================================
        function abrirModalAsignarCarrera(id, nombre, carreraActual = '', grupoActual = '') {
            document.getElementById('asignar-carrera-estudiante-id').value = id;
            document.getElementById('asignar-carrera-estudiante-nombre').innerText = nombre;
            
            const selCarrera = document.getElementById('asignar-carrera-select');
            if (carreraActual && !carreraActual.toLowerCase().includes('sin asignar') && !carreraActual.toLowerCase().includes('pendiente')) {
                selCarrera.value = carreraActual;
            } else {
                selCarrera.value = '';
            }
            
            poblarSelectGruposParaAsignar(selCarrera.value, grupoActual);
            document.getElementById('modal-asignar-carrera-estudiante').classList.remove('hidden');
        }

        function cerrarModalAsignarCarrera() {
            document.getElementById('modal-asignar-carrera-estudiante').classList.add('hidden');
        }

        function alCambiarCarreraEnModalAsignar() {
            const carrera = document.getElementById('asignar-carrera-select').value;
            poblarSelectGruposParaAsignar(carrera);
        }

        function poblarSelectGruposParaAsignar(carrera, grupoSeleccionado = '') {
            const selGrupo = document.getElementById('asignar-grupo-select');
            if (!selGrupo) return;
            
            let gruposFiltrados = gruposGlobales;
            if (carrera) {
                const primerToken = carrera.toLowerCase().split(' ')[0];
                gruposFiltrados = gruposGlobales.filter(g => g.carrera === carrera || g.nombre.toLowerCase().includes(primerToken));
                if (gruposFiltrados.length === 0) gruposFiltrados = gruposGlobales;
            }
            
            let opts = '<option value="">-- Seleccionar Sección / Grupo --</option>';
            gruposFiltrados.forEach(g => {
                opts += \`<option value="\${g.nombre}">\${g.nombre} (\${g.encargado} - Turno \${g.turno})</option>\`;
            });
            opts += '<option value="General">General / Sin Grupo Específico</option>';
            selGrupo.innerHTML = opts;
            
            if (grupoSeleccionado && gruposFiltrados.some(g => g.nombre === grupoSeleccionado)) {
                selGrupo.value = grupoSeleccionado;
            } else if (gruposFiltrados.length > 0) {
                selGrupo.value = gruposFiltrados[0].nombre;
            }
        }

        async function guardarAsignacionCarrera(e) {
            e.preventDefault();
            const id = document.getElementById('asignar-carrera-estudiante-id').value;
            const carrera = document.getElementById('asignar-carrera-select').value;
            const grupo = document.getElementById('asignar-grupo-select').value;

            if (!carrera) {
                alert("Por favor selecciona una de las 7 carreras oficiales.");
                return;
            }

            try {
                const res = await fetch(\`/api/estudiantes/\${id}/asignar\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ carrera, grupo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAsignarCarrera();
                    alert(\`✅ Estudiante asignado exitosamente a la especialidad:\\n"\${carrera}" (Sección: \${grupo || 'General'})\\n\\nSincronizado en SQLite y en el libro Excel.\`);
                    await cargarEstudiantes();
                    await cargarGrupos();
                    await cargarMovimientos();
                } else {
                    alert(\`Error: \${data.error || 'No se pudo asignar la carrera'}\`);
                }
            } catch (err) {
                alert("Error de conexión al asignar carrera");
            }
        }
`;

// 5. Funciones de Verificación Criptográfica de Respaldos
const backupVerificationCode = `
        // =========================================================================
        // SEGURIDAD: VERIFICACIÓN CRIPTOGRÁFICA SHA-256 DE RESPALDOS
        // =========================================================================
        async function verificarIntegridadRespaldo(nombre) {
            try {
                const res = await fetch(\`/api/backups/verificar/\${encodeURIComponent(nombre)}\`);
                const data = await res.json();
                
                if (data.error) {
                    alert(\`Error al verificar: \${data.error}\`);
                    return;
                }

                document.getElementById('verif-archivo-nombre').innerText = nombre;
                document.getElementById('verif-hash-calculado').innerText = data.hash_calculado || '--';
                document.getElementById('verif-hash-esperado').innerText = data.hash_esperado || '(Firma registrada)';
                document.getElementById('verif-tamano').innerText = \`\${Number(data.tamano_bytes).toLocaleString()} bytes\`;
                document.getElementById('verif-sqlite').innerText = data.integrity_sqlite === 'ok' ? 'Consistente y Válido (PRAGMA: ok)' : (data.integrity_sqlite || 'Archivo CSV/Excel');
                
                const badgeEstado = document.getElementById('verif-estado-badge');
                if (data.valido) {
                    badgeEstado.className = 'px-3.5 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black flex items-center space-x-2';
                    badgeEstado.innerHTML = '<i class="fa-solid fa-shield-halved text-emerald-600 text-base"></i> <span>INTEGRIDAD 100% VERIFICADA · ARCHIVO ÍNTEGRO Y SEGURO</span>';
                } else {
                    badgeEstado.className = 'px-3.5 py-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-black flex items-center space-x-2';
                    badgeEstado.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-600 text-base"></i> <span>ALERTA: DISCREPANCIA EN LA FIRMA SHA-256</span>';
                }

                document.getElementById('modal-verificar-respaldo').classList.remove('hidden');
            } catch (err) {
                alert("Error de conexión al verificar el respaldo");
            }
        }

        function cerrarModalVerificarRespaldo() {
            document.getElementById('modal-verificar-respaldo').classList.add('hidden');
        }
`;

// Insertar bloques auxiliares de código justo después de let modoVistaEstudiantes = 'grid';
const scriptStartMarker = "let modoVistaEstudiantes = 'grid';";
if (html.includes(scriptStartMarker)) {
    html = html.replace(scriptStartMarker, scriptStartMarker + '\n' + themeCode + '\n' + sidebarCode + '\n' + careerAssignmentCode + '\n' + backupVerificationCode);
    console.log('Bloques auxiliares de JS insertados.');
} else {
    console.error('ERROR: No se encontró scriptStartMarker');
}

// 6. Actualizar renderEstudiantes para mostrar badge de sin asignar y botón de asignar
const oldRenderEstudiantesSignature = 'function renderEstudiantes(lista) {';
const newRenderEstudiantesCode = `function renderEstudiantes(lista) {
            const grid = document.getElementById('grid-estudiantes');
            const tbody = document.getElementById('tbody-estudiantes');

            if (lista.length === 0) {
                grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">No se encontraron estudiantes para los filtros seleccionados.</div>';
                tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron estudiantes con los filtros aplicados.</td></tr>';
                return;
            }

            grid.innerHTML = lista.map(e => {
                const iniciales = e.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
                let barColor = 'from-rose-500 to-rose-600';
                if (e.estado_financiero === 'al_dia') barColor = 'from-emerald-500 to-teal-500';
                else if (e.estado_financiero === 'faltan_completar') barColor = 'from-amber-400 to-orange-500';

                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.toLowerCase().includes('sin asignar') || e.carrera.toLowerCase().includes('pendiente');

                return \`
                    <div class="cyber-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-cyan-500/20 flex-shrink-0">
                                    \${iniciales}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">\${e.codigo}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border \${e.clase_estado}">
                                            \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate mt-1" title="\${e.nombre}">\${e.nombre}</h4>
                                    \${esSinAsignar ? 
                                        '<span class="inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">⚠️ Sin Asignar (Pendiente)</span>' :
                                        \`<p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">\${e.carrera} • \${e.ciclo}</p>\`
                                    }
                                </div>
                            </div>

                            <div class="mb-3">
                                <span class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md \${e.urgencia_global === 'vencido' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse' : (e.urgencia_global === 'vence_hoy' || e.urgencia_global === 'urgente' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    \${e.msg_urgencia}
                                </span>
                            </div>

                            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center mb-3">
                                <div>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase">Total Cuota</span>
                                    <p class="font-extrabold text-slate-700 dark:text-slate-300 text-xs mt-0.5">S/. \${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</span>
                                    <p class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">S/. \${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                    <span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">Falta Completar</span>
                                    <p class="font-extrabold text-rose-600 dark:text-rose-400 text-xs mt-0.5">S/. \${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Progreso de Pago</span>
                                    <span class="text-slate-800 dark:text-slate-200">\${e.porcentaje_avance}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r \${barColor} h-2 rounded-full" style="width: \${e.porcentaje_avance}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            \${esSinAsignar ? \`
                                <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(e.carrera || '')}', '\${encodeURIComponent(e.grupo || '')}')" class="cyber-btn w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/25 transition">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    <span>🎓 Asignar Carrera (7 Oficiales)</span>
                                </button>
                            \` : ''}

                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(primerPendiente.concepto)}', \${primerPendiente.monto}, \${primerPendiente.monto_total || primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="cyber-btn w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20 transition">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>\${e.estado_financiero === 'faltan_completar' ? 'Completar / Abonar Saldo' : 'Registrar Abono o Pago'}</span>
                                </button>
                            \` : ''}

                            <button onclick="verFichaEstudiante(\${e.id})" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">
                                <i class="fa-solid fa-file-invoice text-cyan-600 dark:text-cyan-400"></i>
                                <span>Ver Ficha / Plantilla Oficial</span>
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');

            tbody.innerHTML = lista.map(e => {
                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.toLowerCase().includes('sin asignar') || e.carrera.toLowerCase().includes('pendiente');

                return \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-900 dark:text-slate-100">\${e.nombre}</div>
                            <span class="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">\${e.codigo}</span>
                        </td>
                        <td class="py-3 px-4">
                            \${esSinAsignar ? 
                                '<span class="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">⚠️ Sin Asignar</span>' :
                                \`<span class="text-slate-700 dark:text-slate-200 font-medium">\${e.carrera}</span>
                                 <span class="block text-[10px] text-slate-400">\${e.ciclo}</span>\`
                            }
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                            S/. \${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            S/. \${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                            S/. \${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="font-bold text-slate-700 dark:text-slate-200">\${e.porcentaje_avance}%</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border \${e.clase_estado}">
                                \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            \${esSinAsignar ? \`
                                <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(e.carrera || '')}', '\${encodeURIComponent(e.grupo || '')}')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition mr-1">
                                    <i class="fa-solid fa-graduation-cap mr-1"></i>Asignar
                                </button>
                            \` : ''}
                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(primerPendiente.concepto)}', \${primerPendiente.monto}, \${primerPendiente.monto_total || primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition">
                                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i>Abonar
                                </button>
                            \` : ''}
                            <button onclick="verFichaEstudiante(\${e.id})" class="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition">
                                <i class="fa-solid fa-file-invoice mr-1"></i>Ficha
                            </button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }`;

const idxOldRender = html.indexOf(oldRenderEstudiantesSignature);
if (idxOldRender !== -1) {
    const idxEndRender = html.indexOf('async function verFichaEstudiante', idxOldRender);
    if (idxEndRender !== -1) {
        html = html.substring(0, idxOldRender) + newRenderEstudiantesCode + '\n\n        ' + html.substring(idxEndRender);
        console.log('renderEstudiantes reemplazado con éxito.');
    }
}

// 7. Actualizar renderTablaRespaldos para mostrar columna SHA-256 y botón verificar
const oldRenderRespaldosSignature = 'function renderTablaRespaldos(lista) {';
const newRenderRespaldosCode = `function renderTablaRespaldos(lista) {
            const tbody = document.getElementById('tabla-respaldos');
            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Aún no se han generado respaldos de la base de datos. Haz clic en "Crear Respaldo Ahora" para crear el primero.</td></tr>';
                return;
            }

            tbody.innerHTML = lista.map(b => {
                const isDb = b.extension === '.db';
                const hashCorto = b.sha256 ? (b.sha256.substring(0, 10) + '...') : 'Protegido';
                return \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2.5">
                            <i class="fa-solid \${isDb ? 'fa-database text-teal-600 dark:text-teal-400' : 'fa-file-excel text-emerald-600 dark:text-emerald-400'} text-base"></i>
                            <span class="truncate max-w-[280px]" title="\${b.nombre}">\${b.nombre}</span>
                        </td>
                        <td class="py-3.5 px-4">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold \${isDb ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'}">
                                \${b.tipo}
                            </span>
                        </td>
                        <td class="py-3.5 px-4">
                            <div class="flex items-center space-x-1.5" title="SHA-256: \${b.sha256 || 'N/A'}">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span class="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                    \${hashCorto}
                                </span>
                            </div>
                        </td>
                        <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">\${b.fecha_creacion}</td>
                        <td class="py-3.5 px-4 text-right font-extrabold text-slate-800 dark:text-slate-100">\${b.tamano}</td>
                        <td class="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <button onclick="verificarIntegridadRespaldo('\${b.nombre}')" class="cyber-btn inline-flex items-center px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 rounded-lg text-xs font-bold transition" title="Verificar integridad criptográfica SHA-256 y consistencia interna">
                                <i class="fa-solid fa-shield-halved mr-1 text-cyan-500"></i> Verificar
                            </button>
                            <a href="/api/backups/descargar/\${encodeURIComponent(b.nombre)}" class="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition" title="Descargar este archivo a tu computadora">
                                <i class="fa-solid fa-download mr-1 text-slate-500"></i> Descargar
                            </a>
                            \${isDb ? \`
                                <button onclick="restaurarRespaldo('\${b.nombre}')" class="inline-flex items-center px-2.5 py-1 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 rounded-lg text-xs font-bold transition" title="Restaurar base de datos a este punto">
                                    <i class="fa-solid fa-rotate-left mr-1"></i> Restaurar
                                </button>
                            \` : ''}
                            <button onclick="eliminarRespaldo('\${b.nombre}')" class="inline-flex items-center px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold transition" title="Eliminar este respaldo del servidor">
                                <i class="fa-solid fa-trash-can mr-1"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }`;

const idxOldRespaldos = html.indexOf(oldRenderRespaldosSignature);
if (idxOldRespaldos !== -1) {
    const idxEndRespaldos = html.indexOf('async function crearRespaldoManual', idxOldRespaldos);
    if (idxEndRespaldos !== -1) {
        html = html.substring(0, idxOldRespaldos) + newRenderRespaldosCode + '\n\n        ' + html.substring(idxEndRespaldos);
        console.log('renderTablaRespaldos reemplazado con éxito.');
    }
}

// 8. Actualizar cargarGrupos para alimentar sidebar y seleccionar grupo inicial
const oldCargarGruposSignature = 'async function cargarGrupos() {';
const newCargarGruposCode = `async function cargarGrupos() {
            try {
                const res = await fetch('/api/grupos');
                gruposGlobales = await res.json();

                const totalGrupos = gruposGlobales.length;
                let totalAlumnos = 0;
                let totalIngresos = 0;
                let totalEgresos = 0;

                gruposGlobales.forEach(g => {
                    totalAlumnos += (g.total_alumnos || 0);
                    totalIngresos += (g.total_ingresos || 0);
                    totalEgresos += (g.total_egresos || 0);
                });

                const badgeG = document.getElementById('badge-grupos-count');
                if (badgeG) badgeG.innerText = totalGrupos;
                const topBadgeG = document.getElementById('top-badge-grupos');
                if (topBadgeG) topBadgeG.innerText = totalGrupos;
                const sidebarBadge = document.getElementById('sidebar-secciones-count');
                if (sidebarBadge) sidebarBadge.innerText = \`\${totalGrupos} Activas\`;

                // Poblar select de grupos en modales
                poblarSelectsGrupos(gruposGlobales);

                // Renderizar lista en panel lateral (DE LADO)
                renderSidebarSecciones(gruposGlobales);

                // Seleccionar sección activa inicial
                if (!currentPlantillaGrupoId && gruposGlobales.length > 0) {
                    currentPlantillaGrupoId = gruposGlobales[0].id;
                }
                const grupoExiste = gruposGlobales.some(g => g.id == currentPlantillaGrupoId);
                if (!grupoExiste && gruposGlobales.length > 0) {
                    currentPlantillaGrupoId = gruposGlobales[0].id;
                }
                if (currentPlantillaGrupoId) {
                    await verPlantillaSeccion(currentPlantillaGrupoId);
                }
            } catch (err) {
                console.error("Error al cargar grupos:", err);
            }
        }`;

const idxOldCargarGrupos = html.indexOf(oldCargarGruposSignature);
if (idxOldCargarGrupos !== -1) {
    const idxEndCargarGrupos = html.indexOf('function poblarSelectsGrupos', idxOldCargarGrupos);
    if (idxEndCargarGrupos !== -1) {
        html = html.substring(0, idxOldCargarGrupos) + newCargarGruposCode + '\n\n        ' + html.substring(idxEndCargarGrupos);
        console.log('cargarGrupos reemplazado con éxito.');
    }
}

// 9. Actualizar DOMContentLoaded para inicializar el tema
const oldDomContentLoaded = `window.addEventListener('DOMContentLoaded', () => {
            cargarTodo();
        });`;

const newDomContentLoaded = `window.addEventListener('DOMContentLoaded', () => {
            initTheme();
            cargarTodo();
        });`;

if (html.includes(oldDomContentLoaded)) {
    html = html.replace(oldDomContentLoaded, newDomContentLoaded);
    console.log('DOMContentLoaded actualizado con initTheme.');
}

fs.writeFileSync(filePath, html, 'utf-8');
console.log(`Archivo index.html guardado exitosamente. Longitud final: ${html.length}`);
