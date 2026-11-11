const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Set default class="dark" on <html>
html = html.replace(/<html lang="es"[^>]*>/i, '<html lang="es" class="dark">');

// 2. Replace CSS in <head>
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>') + 8;

const newStyles = `<style>
        /* =========================================================================
           NUEVO SISTEMA DE DISEÑO: CYBER-FINTECH OBSIDIAN & EMERALD LUXURY
           ========================================================================= */
        :root {
            --accent-cyan: #06b6d4;
            --accent-indigo: #6366f1;
            --accent-emerald: #10b981;
            --accent-rose: #f43f5e;
            --accent-amber: #f59e0b;
        }

        body {
            font-feature-settings: "cv02", "cv03", "cv04", "cv11";
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* --- MODO OSCURO PRINCIPAL (CYBER FINTECH DEEP SPACE) --- */
        html.dark {
            color-scheme: dark;
        }
        html.dark body {
            background-color: #050811 !important;
            color: #f1f5f9 !important;
            background-image: 
                radial-gradient(ellipse at 10% 0%, rgba(99, 102, 241, 0.16) 0%, transparent 50%),
                radial-gradient(ellipse at 90% 100%, rgba(6, 182, 212, 0.14) 0%, transparent 50%),
                radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 60%) !important;
            background-attachment: fixed !important;
        }
        html.dark aside {
            background: linear-gradient(180deg, #050811 0%, #0a0f1e 50%, #0c1426 100%) !important;
            border-right: 1px solid rgba(56, 189, 248, 0.14) !important;
            box-shadow: 6px 0 30px rgba(0, 0, 0, 0.7) !important;
        }
        html.dark header {
            background: rgba(8, 13, 25, 0.85) !important;
            backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid rgba(56, 189, 248, 0.14) !important;
        }
        html.dark .bg-white {
            background: rgba(13, 20, 36, 0.78) !important;
            backdrop-filter: blur(16px) !important;
            border-color: rgba(56, 189, 248, 0.14) !important;
            color: #f1f5f9 !important;
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
        }
        html.dark .bg-slate-50 {
            background-color: #050811 !important;
            border-color: rgba(51, 65, 85, 0.6) !important;
            color: #e2e8f0 !important;
        }
        html.dark .bg-slate-100 {
            background-color: rgba(22, 33, 56, 0.7) !important;
            color: #cbd5e1 !important;
            border-color: rgba(51, 65, 85, 0.6) !important;
        }
        html.dark .text-slate-900, html.dark .text-slate-800, html.dark .text-slate-700 {
            color: #f8fafc !important;
        }
        html.dark .text-slate-600, html.dark .text-slate-500 {
            color: #94a3b8 !important;
        }
        html.dark .border-slate-200, 
        html.dark .border-slate-200\\/80, 
        html.dark .border-slate-200\\/90, 
        html.dark .border-slate-100 {
            border-color: rgba(51, 65, 85, 0.6) !important;
        }
        html.dark input, html.dark select, html.dark textarea {
            background-color: #090e1a !important;
            border-color: #26354a !important;
            color: #f8fafc !important;
        }
        html.dark input:focus, html.dark select:focus, html.dark textarea:focus {
            border-color: #06b6d4 !important;
            box-shadow: 0 0 14px rgba(6, 182, 212, 0.35) !important;
            outline: none !important;
        }

        /* --- MODO CLARO (EXECUTIVE GLASS) --- */
        html:not(.dark) body {
            background-color: #f8fafc;
            color: #0f172a;
            background-image: 
                radial-gradient(circle at 10% 10%, rgba(224, 242, 254, 0.6) 0%, transparent 40%),
                radial-gradient(circle at 90% 90%, rgba(241, 245, 249, 0.8) 0%, transparent 50%);
        }
        html:not(.dark) .bg-white {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02) !important;
        }
        html:not(.dark) header {
            background-color: rgba(255, 255, 255, 0.92) !important;
            backdrop-filter: blur(16px) !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }
        html:not(.dark) aside {
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important;
            border-right: 1px solid #334155 !important;
        }

        /* KPI FINTECH GLOW */
        .fintech-kpi {
            position: relative;
            overflow: hidden;
            border-radius: 1.25rem;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fintech-kpi:hover {
            transform: translateY(-3px);
            box-shadow: 0 16px 35px -8px rgba(0, 0, 0, 0.4) !important;
        }
        .fintech-kpi::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            opacity: 0.85;
            transition: opacity 0.3s ease;
        }
        .fintech-kpi:hover::before {
            opacity: 1;
            height: 4px;
        }
        .kpi-saldo::before { background: linear-gradient(90deg, #6366f1, #06b6d4); }
        .kpi-ingresos::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
        .kpi-egresos::before { background: linear-gradient(90deg, #f43f5e, #fb923c); }
        .kpi-alumnos::before { background: linear-gradient(90deg, #38bdf8, #818cf8); }

        /* ITEMS DEL MENÚ LATERAL (HOJAS DE EXCEL) */
        .sidebar-excel-item {
            position: relative;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 3px solid transparent;
        }
        .sidebar-excel-item:hover {
            background: rgba(30, 41, 59, 0.6);
            color: #ffffff;
            transform: translateX(2px);
        }
        .sidebar-excel-item.item-active {
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.16) 100%) !important;
            border-left: 3px solid #06b6d4 !important;
            color: #ffffff !important;
            box-shadow: 0 0 18px rgba(6, 182, 212, 0.25) !important;
        }

        /* BOTONES CON MICRO-INTERACCIÓN */
        .cyber-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cyber-btn:hover {
            transform: translateY(-1px);
            filter: brightness(1.08);
        }
        .cyber-btn:active {
            transform: translateY(0);
        }

        /* SCROLLBAR MODERNO */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(148, 163, 184, 0.35);
            border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(148, 163, 184, 0.6);
        }
        html.dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(51, 65, 85, 0.6);
        }
        html.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(6, 182, 212, 0.5);
        }

        /* TABLAS MODERNAS FINTECH */
        table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
        }
        html.dark table tbody tr {
            transition: background-color 0.15s ease;
        }
        html.dark table tbody tr:hover {
            background-color: rgba(30, 41, 59, 0.55) !important;
        }
        html:not(.dark) table tbody tr:hover {
            background-color: #f1f5f9 !important;
        }

        /* IMPRESIÓN OFICIAL */
        @media print {
            body {
                background: white !important;
                color: black !important;
                font-size: 11pt !important;
            }
            aside, header, .no-print, button, form, .modal-backdrop {
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
        }
    </style>`;

html = html.substring(0, styleStart) + newStyles + html.substring(styleEnd);

// 3. Update modal-asignar-carrera-estudiante
const modalTarget = '<div id="modal-asignar-carrera-estudiante" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">';
const modalIdx = html.indexOf(modalTarget);
const modalCloseIdx = html.indexOf('<!-- MODAL VERIFICACIÓN CRIPTOGRÁFICA DE RESPALDO -->', modalIdx);

const newModalHTML = `<div id="modal-asignar-carrera-estudiante" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
        <div class="cyber-card bg-white dark:bg-slate-900 rounded-3xl border border-cyan-500/40 shadow-2xl max-w-lg w-full p-6 text-slate-800 dark:text-slate-100">
            <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center space-x-3">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 flex items-center justify-center text-xl font-bold border border-cyan-500/30">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <h3 id="modal-asignar-carrera-titulo" class="text-base font-black text-slate-900 dark:text-white">Asignar o Modificar Especialidad</h3>
                        <p id="modal-asignar-carrera-subtitulo" class="text-xs text-slate-400 font-medium">Asigna una carrera oficial o cámbiala en cualquier momento con sincronización automática en Excel.</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalAsignarCarrera()" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <form onsubmit="guardarAsignacionCarrera(event)" class="mt-4 space-y-4 text-xs">
                <input type="hidden" id="asignar-carrera-estudiante-id" value="">
                
                <!-- Info Alumno & Estado Actual -->
                <div class="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] uppercase font-black tracking-wider text-cyan-600 dark:text-cyan-400 block">Estudiante</span>
                        <h4 id="asignar-carrera-estudiante-nombre" class="text-sm font-black text-slate-900 dark:text-white mt-0.5">--</h4>
                    </div>
                    <div class="text-right">
                        <span class="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Carrera Actual</span>
                        <span id="asignar-carrera-estudiante-actual" class="text-xs font-black text-amber-400">Sin Asignar (Pendiente)</span>
                    </div>
                </div>

                <div>
                    <label class="block font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">Especialidad / Carrera Oficial *</label>
                    <select id="asignar-carrera-select" onchange="alCambiarCarreraEnModalAsignar()" required class="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                        <!-- Poblado dinámicamente con carreras y opción de Sin Asignar -->
                    </select>
                </div>

                <div>
                    <label class="block font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">Sección / Grupo de Asignación *</label>
                    <select id="asignar-grupo-select" required class="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                        <!-- Poblado dinámicamente -->
                    </select>
                </div>

                <div class="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 text-[11px] flex items-center space-x-2">
                    <i class="fa-solid fa-circle-info text-cyan-400 text-sm"></i>
                    <span>Al guardar o cambiar la carrera, todos los registros contables y el libro Excel se actualizarán automáticamente.</span>
                </div>

                <div class="flex items-center justify-end space-x-2.5 pt-2">
                    <button type="button" onclick="cerrarModalAsignarCarrera()" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition">
                        Cancelar
                    </button>
                    <button type="submit" class="cyber-btn bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center space-x-2">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span id="modal-asignar-carrera-btn-label">Guardar Asignación / Cambio</span>
                    </button>
                </div>
            </form>
        </div>
    </div>\n\n    `;

html = html.substring(0, modalIdx) + newModalHTML + html.substring(modalCloseIdx);

// 4. Update JS functions for career modal and assignment
const fnStart = html.indexOf('function abrirModalAsignarCarrera(');
const fnEnd = html.indexOf('// =========================================================================\n        // CARGAR HOJA DIARIO', fnStart);

const newFunctions = `function abrirModalAsignarCarrera(id, nombre, carreraActual = '', grupoActual = '') {
            const decNombre = decodeURIComponent(nombre || '');
            const decCarrera = decodeURIComponent(carreraActual || '');
            const decGrupo = decodeURIComponent(grupoActual || '');

            document.getElementById('asignar-carrera-estudiante-id').value = id;
            document.getElementById('asignar-carrera-estudiante-nombre').innerText = decNombre;

            const actualBox = document.getElementById('asignar-carrera-estudiante-actual');
            const titleEl = document.getElementById('modal-asignar-carrera-titulo');
            const subTitleEl = document.getElementById('modal-asignar-carrera-subtitulo');
            const btnLabel = document.getElementById('modal-asignar-carrera-btn-label');

            const esAsignado = decCarrera && !decCarrera.toLowerCase().includes('sin asignar') && !decCarrera.toLowerCase().includes('pendiente');

            if (esAsignado) {
                if (actualBox) {
                    actualBox.innerText = decCarrera;
                    actualBox.className = 'text-xs font-black text-cyan-400';
                }
                if (titleEl) titleEl.innerText = '✏️ Modificar / Cambiar Carrera';
                if (subTitleEl) subTitleEl.innerText = 'Cambia la especialidad del estudiante. Se actualizarán sus movimientos en cascada.';
                if (btnLabel) btnLabel.innerText = 'Confirmar Cambio de Carrera';
            } else {
                if (actualBox) {
                    actualBox.innerText = '⚠️ Sin Asignar (Pendiente)';
                    actualBox.className = 'text-xs font-black text-amber-400';
                }
                if (titleEl) titleEl.innerText = '➕ Asignar Especialidad Oficial';
                if (subTitleEl) subTitleEl.innerText = 'Asigna una carrera oficial del CETPRO al estudiante.';
                if (btnLabel) btnLabel.innerText = 'Guardar Asignación';
            }

            poblarSelectCarreraEnModal(decCarrera);
            poblarSelectGruposParaAsignar(decCarrera, decGrupo);
            document.getElementById('modal-asignar-carrera-estudiante').classList.remove('hidden');
        }

        function poblarSelectCarreraEnModal(carreraSeleccionada = '') {
            const selCarrera = document.getElementById('asignar-carrera-select');
            if (!selCarrera) return;
            const lista = (carrerasGlobales && carrerasGlobales.length > 0) ? carrerasGlobales : [];

            let opts = '<option value="">-- Seleccionar Especialidad Oficial --</option>';
            lista.forEach(c => {
                const nom = c.nombre || c.carrera;
                opts += '<option value="' + nom + '">' + nom + '</option>';
            });
            opts += '<option value="Sin Asignar (Pendiente)">⚠️ Sin Asignar (Dejar Pendiente)</option>';
            selCarrera.innerHTML = opts;

            if (carreraSeleccionada) {
                selCarrera.value = carreraSeleccionada;
            }
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
            
            let gruposFiltrados = gruposGlobales || [];
            if (carrera && !carrera.includes('Sin Asignar')) {
                const primerToken = carrera.toLowerCase().split(' ')[0];
                gruposFiltrados = (gruposGlobales || []).filter(g => g.carrera === carrera || g.nombre.toLowerCase().includes(primerToken));
                if (gruposFiltrados.length === 0) gruposFiltrados = gruposGlobales || [];
            }
            
            let opts = '<option value="">-- Seleccionar Sección / Grupo --</option>';
            gruposFiltrados.forEach(g => {
                opts += '<option value="' + g.nombre + '">' + g.nombre + ' (' + g.encargado + ' - Turno ' + g.turno + ')</option>';
            });
            opts += '<option value="General">General / Sin Grupo Específico</option>';
            selGrupo.innerHTML = opts;
            
            if (grupoSeleccionado && gruposFiltrados.some(g => g.nombre === grupoSeleccionado)) {
                selGrupo.value = grupoSeleccionado;
            } else if (gruposFiltrados.length > 0) {
                selGrupo.value = gruposFiltrados[0].nombre;
            } else {
                selGrupo.value = 'General';
            }
        }

        async function guardarAsignacionCarrera(e) {
            e.preventDefault();
            const id = document.getElementById('asignar-carrera-estudiante-id').value;
            const carrera = document.getElementById('asignar-carrera-select').value;
            const grupo = document.getElementById('asignar-grupo-select').value;
            const nombre = document.getElementById('asignar-carrera-estudiante-nombre').innerText;

            if (!carrera) {
                alert("Por favor selecciona una especialidad o elige Sin Asignar.");
                return;
            }

            try {
                const res = await fetch('/api/estudiantes/' + id + '/asignar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ carrera, grupo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAsignarCarrera();
                    alert('✅ Carrera actualizada exitosamente para ' + nombre + ':\\n"' + carrera + '" (Sección: ' + (grupo || 'General') + ')\\n\\nSincronizado en SQLite y en el libro Excel.');
                    await cargarEstudiantes();
                    await cargarCarreras();
                    await cargarGrupos();
                    await cargarMovimientos();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo asignar la carrera'));
                }
            } catch (err) {
                alert("Error de conexión al asignar carrera");
            }
        }

        `;

html = html.substring(0, fnStart) + newFunctions + html.substring(fnEnd);

// 5. Update renderEstudiantes exactly up to verFichaEstudiante
const rStart = html.indexOf('function renderEstudiantes(lista) {');
const rEnd = html.indexOf('async function verFichaEstudiante(estId) {', rStart);

const newRenderEst = `function renderEstudiantes(lista) {
            const grid = document.getElementById('grid-estudiantes');
            const tbody = document.getElementById('tbody-estudiantes');

            if (lista.length === 0) {
                grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">No se encontraron estudiantes para los filtros seleccionados.</div>';
                tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron estudiantes con los filtros aplicados.</td></tr>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // 1. CARDS VIEW
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
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-cyan-500/20 flex-shrink-0">
                                    \${iniciales}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">\${e.codigo}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border \${e.clase_estado}">
                                            \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                                        </span>
                                    </div>
                                    <h4 class="font-black text-slate-900 dark:text-slate-100 text-sm truncate mt-1" title="\${e.nombre}">\${e.nombre}</h4>
                                    \${esSinAsignar ? 
                                        '<span class="inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">⚠️ Sin Asignar (Pendiente)</span>' :
                                        \`<p class="text-xs text-cyan-600 dark:text-cyan-400 font-bold truncate mt-0.5 flex items-center space-x-1"><i class="fa-solid fa-graduation-cap text-[10px]"></i> <span>\${e.carrera}</span></p>\`
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
                                    <p class="font-extrabold text-slate-700 dark:text-slate-300 text-xs mt-0.5">\${fMoney(e.total_comprometido)}</p>
                                </div>
                                <div>
                                    <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</span>
                                    <p class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">\${fMoney(e.total_pagado)}</p>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                    <span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">Falta Completar</span>
                                    <p class="font-extrabold text-rose-600 dark:text-rose-400 text-xs mt-0.5">\${fMoney(e.saldo_pendiente)}</p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Progreso de Pago</span>
                                    <span class="text-slate-800 dark:text-slate-200 font-bold">\${e.porcentaje_avance}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r \${barColor} h-2 rounded-full" style="width: \${e.porcentaje_avance}%"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción: ASIGNAR O MODIFICAR CARRERA SIEMPRE ACCESIBLE -->
                        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            \${esSinAsignar ? \`
                                <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${encodeURIComponent(e.nombre)}', '', '\${encodeURIComponent(e.grupo || '')}')" class="cyber-btn w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-amber-500/25 transition">
                                    <i class="fa-solid fa-user-plus"></i>
                                    <span>🎓 Asignar Carrera Oficial</span>
                                </button>
                            \` : \`
                                <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(e.carrera)}', '\${encodeURIComponent(e.grupo || '')}')" class="cyber-btn w-full py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition shadow-sm" title="Modificar o cambiar carrera">
                                    <i class="fa-solid fa-pen-to-square text-cyan-400"></i>
                                    <span>✏️ Modificar / Cambiar Carrera</span>
                                </button>
                            \`}

                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(primerPendiente.concepto)}', \${primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="cyber-btn w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 transition">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>Registrar Cobro / Abono</span>
                                </button>
                            \` : ''}
                        </div>
                    </div>
                \`;
            }).join('');

            // 2. TABLA DE ESTUDIANTES (Con 8 columnas alineadas)
            tbody.innerHTML = lista.map((e, idx) => {
                const pagado = e.total_pagado || 0;
                const comprometido = e.total_comprometido || 0;
                const deuda = e.saldo_pendiente || 0;
                const iniciales = e.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
                const esSinAsignar = !e.carrera || e.carrera.toLowerCase().includes('sin asignar') || e.carrera.toLowerCase().includes('pendiente');

                let badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Al Día</span>';
                if (e.estado_financiero === 'faltan_completar') {
                    badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Falta Completar</span>';
                } else if (e.estado_financiero === 'deben_todo') {
                    badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Debe Total</span>';
                }

                return \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3 px-4">
                            <div class="flex items-center space-x-2.5">
                                <div class="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                                    \${iniciales}
                                </div>
                                <div class="min-w-0">
                                    <p class="font-black text-slate-900 dark:text-slate-100 text-xs truncate">\${e.nombre}</p>
                                    <p class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">\${e.codigo}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            \${esSinAsignar ? 
                                '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">⚠️ Sin Asignar</span>' :
                                \`<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-800/50">\${e.carrera}</span>\`
                            }
                        </td>
                        <td class="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">\${fMoney(comprometido)}</td>
                        <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">\${fMoney(pagado)}</td>
                        <td class="py-3 px-4 text-right font-mono font-black \${deuda > 0 ? 'text-rose-500' : 'text-slate-400'}">\${fMoney(deuda)}</td>
                        <td class="py-3 px-4 text-center">
                            <span class="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">\${e.porcentaje_avance}%</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            \${badgeEstado}
                        </td>
                        <td class="py-3 px-4 text-center whitespace-nowrap">
                            \${esSinAsignar ? \`
                                <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${encodeURIComponent(e.nombre)}', '', '\${encodeURIComponent(e.grupo || '')}')" class="cyber-btn px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-[10px] font-black uppercase shadow-sm transition flex items-center space-x-1.5 mx-auto">
                                    <i class="fa-solid fa-user-plus text-[10px]"></i>
                                    <span>Asignar</span>
                                </button>
                            \` : \`
                                <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${encodeURIComponent(e.nombre)}', '\${encodeURIComponent(e.carrera)}', '\${encodeURIComponent(e.grupo || '')}')" class="cyber-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl text-[10px] font-black transition flex items-center space-x-1.5 mx-auto" title="Click para modificar o cambiar carrera">
                                    <i class="fa-solid fa-pen-to-square text-[10px] text-cyan-400"></i>
                                    <span>Cambiar</span>
                                </button>
                            \`}
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        `;

html = html.substring(0, rStart) + newRenderEst + html.substring(rEnd);

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('✅ templates/index.html actualizado limpiamente con el nuevo diseño y cambio de carreras!');
