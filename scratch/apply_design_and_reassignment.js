const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
console.log('Initial templates/index.html size:', html.length);

// =========================================================================
// 1. CONFIGURE TAILWIND DARK MODE CLASS & DEFAULT HTML CLASS
// =========================================================================
if (!html.includes('class="dark"')) {
    html = html.replace('<html lang="es">', '<html lang="es" class="dark">');
    console.log('[+] Added class="dark" to <html> tag.');
}

const tailwindConfigTarget = `    <script>
        tailwind.config = {
            theme: {`;

const tailwindConfigReplacement = `    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {`;

if (html.includes(tailwindConfigTarget)) {
    html = html.replace(tailwindConfigTarget, tailwindConfigReplacement);
    console.log('[+] Added darkMode: "class" to tailwind.config.');
}

// =========================================================================
// 2. ENHANCE CSS STYLES WITH CYBER-FINTECH OBSIDIAN & EMERALD LUXURY GLASS
// =========================================================================
const styleEndTarget = `    </style>`;

const luxuryStyles = `
        /* ========================================================================= */
        /* CYBER-FINTECH OBSIDIAN & EMERALD LUXURY GLASS STYLES                      */
        /* ========================================================================= */
        :root {
            --color-emerald-accent: #10b981;
            --color-indigo-accent: #6366f1;
            --color-amber-accent: #f59e0b;
        }

        .dark body {
            background-color: #070a13 !important;
            color: #f1f5f9 !important;
        }

        body {
            background-color: #f8fafc;
            color: #0f172a;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Glassmorphism & Cyber Cards */
        .cyber-card {
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dark .cyber-card {
            background: rgba(13, 19, 33, 0.88);
            border: 1px solid rgba(51, 65, 85, 0.45);
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.45);
        }

        .dark .cyber-card:hover {
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.65), 0 0 15px -3px rgba(99, 102, 241, 0.15);
        }

        .cyber-glass-panel {
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        .dark .cyber-glass-panel {
            background: rgba(9, 13, 24, 0.94);
            border: 1px solid rgba(30, 41, 59, 0.7);
        }

        /* Neon Glow Accents */
        .glow-emerald {
            box-shadow: 0 0 25px -4px rgba(16, 185, 129, 0.3);
        }

        .glow-indigo {
            box-shadow: 0 0 25px -4px rgba(99, 102, 241, 0.3);
        }

        .glow-amber {
            box-shadow: 0 0 25px -4px rgba(245, 158, 11, 0.3);
        }

        .glow-cyan {
            box-shadow: 0 0 25px -4px rgba(6, 182, 212, 0.3);
        }

        /* Custom Elegant Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        .dark ::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 9999px;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
            background: #334155;
        }
    </style>`;

if (html.includes(styleEndTarget)) {
    html = html.replace(styleEndTarget, luxuryStyles);
    console.log('[+] Cyber-FinTech Obsidian & Emerald Luxury Glass CSS applied.');
}

// =========================================================================
// 3. ADD THEME TOGGLE BUTTON IN TOP HEADER
// =========================================================================
const headerTarget = `<header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">`;
const headerReplacement = `<header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 flex-shrink-0 transition-colors duration-200">`;

if (html.includes(headerTarget)) {
    html = html.replace(headerTarget, headerReplacement);
}

// Add Theme Toggle button next to user profile / server status
const headerUserTarget = `<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-cyan-500/20">`;
const headerThemeBtn = `<!-- Botón Selector de Tema Obsidian / Light -->
                <button onclick="toggleTheme()" id="btn-theme-toggle" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 text-xs font-bold mr-2" title="Alternar entre Modo Oscuro Obsidian y Modo Claro">
                    <i class="fa-solid fa-moon dark:hidden"></i>
                    <i class="fa-solid fa-sun hidden dark:inline"></i>
                    <span class="hidden md:inline dark:text-slate-200">Tema</span>
                </button>
                ` + headerUserTarget;

if (html.includes(headerUserTarget)) {
    html = html.replace(headerUserTarget, headerThemeBtn);
    console.log('[+] Theme toggle button added to header.');
}

// =========================================================================
// 4. UPDATE FILTER AND OPTIONS IN SECTION-ESTUDIANTES
// =========================================================================
const filtroCarreraSelectTarget = `<select id="filtro-estudiantes-carrera" onchange="cargarEstudiantes()" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none min-w-[200px]">
                            <option value="">Todas las Especialidades</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Confección Textil">Confección Textil</option>
                            <option value="Cosmetología y Peluquería">Cosmetología y Peluquería</option>
                            <option value="Gastronomía y Pastelería">Gastronomía y Pastelería</option>
                            <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                            <option value="Contabilidad y Finanzas">Contabilidad y Finanzas</option>
                        </select>`;

const filtroCarreraSelectReplacement = `<select id="filtro-estudiantes-carrera" onchange="cargarEstudiantes()" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none min-w-[220px]">
                            <option value="">Todas las Especialidades</option>
                            <option value="sin_asignar" class="text-amber-600 font-bold">⏳ Sin Asignar (Pendiente)</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Confección Textil">Confección Textil</option>
                            <option value="Peluquería y Barbería">Peluquería y Barbería</option>
                            <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                            <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                            <option value="Hostelería y Turismo">Hostelería y Turismo</option>
                            <option value="Panadería y Pastelería">Panadería y Pastelería</option>
                            <option value="Carpintería y Ebanistería">Carpintería y Ebanistería</option>
                        </select>`;

if (html.includes(filtroCarreraSelectTarget)) {
    html = html.replace(filtroCarreraSelectTarget, filtroCarreraSelectReplacement);
    console.log('[+] filtro-estudiantes-carrera updated with Sin Asignar (Pendiente) and 8 official careers.');
}

// =========================================================================
// 5. UPDATE renderEstudiantes TO ENABLE ASSIGNING & MODIFYING CAREER FOR ANY STUDENT
// =========================================================================
const renderEstudiantesOldFn = `function renderEstudiantes(lista) {
            const grid = document.getElementById('grid-estudiantes');
            const tbody = document.getElementById('tbody-estudiantes');

            if (lista.length === 0) {
                grid.innerHTML = \`<div class="col-span-3 text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">No se encontraron estudiantes para los filtros seleccionados.</div>\`;
                tbody.innerHTML = \`<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron estudiantes con los filtros aplicados.</td></tr>\`;
                return;
            }

            grid.innerHTML = lista.map(e => {
                const iniciales = e.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
                let barColor = 'from-rose-500 to-rose-600';
                if (e.estado_financiero === 'al_dia') barColor = 'from-emerald-500 to-teal-500';
                else if (e.estado_financiero === 'faltan_completar') barColor = 'from-amber-400 to-orange-500';

                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;

                return \`
                    <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-cyan-500/20">
                                    \${iniciales}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">\${e.codigo}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border \${e.clase_estado}">
                                            \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-slate-900 text-sm truncate mt-1" title="\${e.nombre}">\${e.nombre}</h4>
                                    <p class="text-xs text-slate-500 font-medium truncate">\${e.carrera} • \${e.ciclo}</p>
                                </div>
                            </div>

                            <div class="mb-3">
                                <span class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md \${e.urgencia_global === 'vencido' ? 'bg-rose-100 text-rose-700 animate-pulse' : (e.urgencia_global === 'vence_hoy' || e.urgencia_global === 'urgente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')}">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    \${e.msg_urgencia}
                                </span>
                            </div>

                            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center mb-3">
                                <div>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase">Total Cuota</span>
                                    <p class="font-extrabold text-slate-700 text-xs mt-0.5">S/. \${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <span class="text-[9px] font-bold text-emerald-600 uppercase">Abonado</span>
                                    <p class="font-extrabold text-emerald-600 text-xs mt-0.5">S/. \${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div class="bg-white rounded-lg p-1 border border-slate-200">
                                    <span class="text-[9px] font-bold text-rose-600 uppercase">Falta Completar</span>
                                    <p class="font-extrabold text-rose-600 text-xs mt-0.5">S/. \${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                    <span>Progreso de Pago</span>
                                    <span class="text-slate-800">\${e.porcentaje_avance}%</span>
                                </div>
                                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r \${barColor} h-2 rounded-full" style="width: \${e.porcentaje_avance}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 space-y-2">
                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${e.nombre}', '\${primerPendiente.concepto}', \${primerPendiente.monto}, \${primerPendiente.monto_total || primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20 transition">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>\${e.estado_financiero === 'faltan_completar' ? 'Completar / Abonar Saldo' : 'Registrar Abono o Pago'}</span>
                                </button>
                            \` : ''}

                            <button onclick="verFichaEstudiante(\${e.id})" class="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">
                                <i class="fa-solid fa-file-invoice text-cyan-600"></i>
                                <span>Ver Ficha / Plantilla Oficial</span>
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');

            tbody.innerHTML = lista.map(e => {
                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                return \`
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-900">\${e.nombre}</div>
                            <span class="text-[10px] text-cyan-700 font-semibold">\${e.codigo}</span>
                        </td>
                        <td class="py-3 px-4">
                            <span class="text-slate-700 font-medium">\${e.carrera}</span>
                            <span class="block text-[10px] text-slate-400">\${e.ciclo}</span>
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-700">
                            S/. \${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-emerald-600">
                            S/. \${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600">
                            S/. \${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="font-bold text-slate-700">\${e.porcentaje_avance}%</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border \${e.clase_estado}">
                                \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${e.nombre}', '\${primerPendiente.concepto}', \${primerPendiente.monto}, \${primerPendiente.monto_total || primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition">
                                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i>Abonar
                                </button>
                            \` : ''}
                            <button onclick="verFichaEstudiante(\${e.id})" class="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition">
                                <i class="fa-solid fa-file-invoice mr-1"></i>Ficha
                            </button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }`;

const renderEstudiantesNewFn = `function renderEstudiantes(lista) {
            const grid = document.getElementById('grid-estudiantes');
            const tbody = document.getElementById('tbody-estudiantes');

            if (lista.length === 0) {
                grid.innerHTML = \`<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">No se encontraron estudiantes para los filtros seleccionados.</div>\`;
                tbody.innerHTML = \`<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron estudiantes con los filtros aplicados.</td></tr>\`;
                return;
            }

            grid.innerHTML = lista.map(e => {
                const iniciales = (e.nombre || '').split(' ').slice(0, 2).map(n => n[0]).join('');
                let barColor = 'from-rose-500 to-rose-600';
                if (e.estado_financiero === 'al_dia') barColor = 'from-emerald-500 to-teal-500';
                else if (e.estado_financiero === 'faltan_completar') barColor = 'from-amber-400 to-orange-500';

                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.trim() === '' || e.carrera === 'Sin Asignar' || e.carrera.includes('Pendiente');
                const safeNombre = (e.nombre || '').replace(/'/g, "\\\\'");
                const safeCarrera = (e.carrera || '').replace(/'/g, "\\\\'");
                const safeGrupo = (e.grupo || '').replace(/'/g, "\\\\'");

                return \`
                    <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                        <div>
                            <!-- Header de Tarjeta Estudiante -->
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr \${esSinAsignar ? 'from-amber-500 to-orange-500' : 'from-indigo-600 to-cyan-500'} text-white font-extrabold flex items-center justify-center text-sm shadow-md \${esSinAsignar ? 'shadow-amber-500/30' : 'shadow-indigo-500/25'} flex-shrink-0">
                                    \${iniciales}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between gap-1">
                                        <span class="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800/60">\${e.codigo}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border \${e.clase_estado}">
                                            \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate mt-1" title="\${e.nombre}">\${e.nombre}</h4>
                                    
                                    <!-- Carrera Badge interactivo -->
                                    <div class="mt-1 flex items-center flex-wrap gap-1.5">
                                        \${esSinAsignar ? \`
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                                <i class="fa-solid fa-triangle-exclamation mr-1"></i> Carrera Pendiente
                                            </span>
                                        \` : \`
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                <i class="fa-solid fa-graduation-cap mr-1"></i> \${e.carrera}
                                            </span>
                                        \`}
                                        <span class="text-[10px] text-slate-400 font-medium">• \${e.ciclo || 'Ciclo I'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <span class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md \${e.urgencia_global === 'vencido' ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 animate-pulse border border-rose-300 dark:border-rose-800' : (e.urgencia_global === 'vence_hoy' || e.urgencia_global === 'urgente' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    \${e.msg_urgencia}
                                </span>
                            </div>

                            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center mb-3">
                                <div>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase">Total Cuota</span>
                                    <p class="font-extrabold text-slate-700 dark:text-slate-200 text-xs mt-0.5">S/. \${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</span>
                                    <p class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">S/. \${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                                    <span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">Falta Completar</span>
                                    <p class="font-extrabold text-rose-600 dark:text-rose-400 text-xs mt-0.5">S/. \${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Progreso de Pago</span>
                                    <span class="text-slate-800 dark:text-slate-200 font-extrabold">\${e.porcentaje_avance}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r \${barColor} h-2 rounded-full" style="width: \${e.porcentaje_avance}%"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción: ASIGNAR O MODIFICAR CARRERA + Ficha + Abono -->
                        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <!-- BOTÓN MODIFICAR / ASIGNAR CARRERA DISPONIBLE PARA CUALQUIER ESTUDIANTE -->
                            <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${safeNombre}', '\${safeCarrera}', '\${safeGrupo}')" class="w-full py-2 px-3 \${esSinAsignar ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black shadow-md shadow-amber-500/25' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black shadow-md shadow-indigo-600/25'} rounded-xl text-xs flex items-center justify-center space-x-1.5 transition transform active:scale-95">
                                <i class="fa-solid \${esSinAsignar ? 'fa-user-plus' : 'fa-pen-to-square'}"></i>
                                <span>\${esSinAsignar ? '➕ Asignar Carrera' : '✏️ Modificar / Cambiar Carrera'}</span>
                            </button>

                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${safeNombre}', '\${primerPendiente.concepto}', \${primerPendiente.monto}, \${primerPendiente.monto_total || primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20 transition">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>\${e.estado_financiero === 'faltan_completar' ? 'Completar / Abonar Saldo' : 'Registrar Abono o Pago'}</span>
                                </button>
                            \` : ''}

                            <button onclick="verFichaEstudiante(\${e.id})" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">
                                <i class="fa-solid fa-file-invoice text-cyan-600 dark:text-cyan-400"></i>
                                <span>Ver Ficha / Plantilla Oficial</span>
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');

            tbody.innerHTML = lista.map(e => {
                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.trim() === '' || e.carrera === 'Sin Asignar' || e.carrera.includes('Pendiente');
                const safeNombre = (e.nombre || '').replace(/'/g, "\\\\'");
                const safeCarrera = (e.carrera || '').replace(/'/g, "\\\\'");
                const safeGrupo = (e.grupo || '').replace(/'/g, "\\\\'");

                return \`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-900 dark:text-white">\${e.nombre}</div>
                            <span class="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">\${e.codigo}</span>
                        </td>
                        <td class="py-3 px-4">
                            \${esSinAsignar ? \`
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                    ⏳ Sin Asignar
                                </span>
                            \` : \`
                                <span class="text-slate-700 dark:text-slate-200 font-bold">\${e.carrera}</span>
                                <span class="block text-[10px] text-slate-400">\${e.ciclo || 'Ciclo I'} • Grupo: \${e.grupo || 'Sin Asignar'}</span>
                            \`}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200">
                            S/. \${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            S/. \${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                            S/. \${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="font-bold text-slate-700 dark:text-slate-300">\${e.porcentaje_avance}%</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border \${e.clase_estado}">
                                \${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <!-- Botón Cambiar / Asignar en Tabla -->
                            <button onclick="abrirModalAsignarCarrera(\${e.id}, '\${safeNombre}', '\${safeCarrera}', '\${safeGrupo}')" class="px-2.5 py-1 \${esSinAsignar ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-lg text-xs font-bold transition shadow-sm" title="\${esSinAsignar ? 'Asignar Carrera' : 'Modificar o Cambiar Carrera'}">
                                <i class="fa-solid \${esSinAsignar ? 'fa-plus' : 'fa-pen-to-square'} mr-1"></i>\${esSinAsignar ? 'Asignar' : 'Cambiar'}
                            </button>

                            \${e.saldo_pendiente > 0 && primerPendiente ? \`
                                <button onclick="abrirModalAbonar(\${primerPendiente.id}, '\${safeNombre}', '\${primerPendiente.concepto}', \${primerPendiente.monto}, \${primerPendiente.monto_total || primerPendiente.monto}, \${primerPendiente.monto_abonado || 0})" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition">
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

if (!html.includes('function renderEstudiantes(lista) {')) {
    throw new Error('renderEstudiantes function not found in index.html');
}

// Replace the function
const rEstIdx = html.indexOf('function renderEstudiantes(lista) {');
const nextFnIdx = html.indexOf('async function verFichaEstudiante(estId) {', rEstIdx);
if (rEstIdx === -1 || nextFnIdx === -1) {
    throw new Error('Could not delimit renderEstudiantes function bounds');
}

html = html.slice(0, rEstIdx) + renderEstudiantesNewFn + '\n\n        ' + html.slice(nextFnIdx);
console.log('[+] renderEstudiantes updated with full Career Assignment & Modification functionality!');

// =========================================================================
// 6. ADD MODAL: ASIGNAR O MODIFICAR CARRERA DE ESTUDIANTE (HTML)
// =========================================================================
const modalAsignarCarreraHTML = `
    <!-- =================================================================== -->
    <!-- MODAL: ASIGNAR O MODIFICAR CARRERA / ESPECIALIDAD DE ESTUDIANTE    -->
    <!-- =================================================================== -->
    <div id="modal-asignar-carrera-estudiante" class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="cyber-card bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scaleIn">
            <!-- Header del Modal -->
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <h3 id="modal-asignar-carrera-titulo" class="text-base font-black text-slate-800 dark:text-white">
                            Asignar o Modificar Carrera
                        </h3>
                        <p class="text-xs text-slate-400">Actualización en tiempo real en Base de Datos y libro Excel</p>
                    </div>
                </div>
                <button onclick="cerrarModalAsignarCarrera()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl transition">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Info del Estudiante -->
            <div class="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-black flex items-center justify-center text-sm flex-shrink-0">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <h4 id="modal-asignar-estudiante-nombre" class="font-bold text-slate-900 dark:text-white text-sm truncate">Estudiante</h4>
                    <p class="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>Carrera actual:</span>
                        <span id="modal-asignar-carrera-actual-badge" class="font-bold px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Sin Asignar (Pendiente)</span>
                    </p>
                </div>
            </div>

            <!-- Formulario de Selección -->
            <form onsubmit="guardarAsignacionCarrera(event)" class="space-y-4">
                <input type="hidden" id="modal-asignar-estudiante-id">

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Seleccionar Carrera / Especialidad Oficial:
                    </label>
                    <select id="modal-asignar-select-carrera" required class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        <!-- Dinámico con JS con todas las carreras oficiales + opción de revertir a Sin Asignar -->
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Sección / Grupo Académico:
                    </label>
                    <select id="modal-asignar-select-grupo" class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        <option value="Sin Asignar">Sin Asignar</option>
                        <option value="General">General</option>
                    </select>
                    <p class="text-[10px] text-slate-400 mt-1">Los grupos se sincronizan con la programación académica.</p>
                </div>

                <div class="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start space-x-2">
                    <i class="fa-solid fa-arrows-rotate text-sm mt-0.5 flex-shrink-0"></i>
                    <p>Al guardar, el cambio se propagará automáticamente a la ficha del estudiante, sus movimientos de caja y la hoja correspondiente del libro Excel institucional.</p>
                </div>

                <!-- Botones -->
                <div class="flex items-center justify-end space-x-3 pt-2">
                    <button type="button" onclick="cerrarModalAsignarCarrera()" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition">
                        Cancelar
                    </button>
                    <button type="submit" class="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/25 transition transform active:scale-95">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Guardar Cambio de Carrera</span>
                    </button>
                </div>
            </form>
        </div>
    </div>\n`;

// Insert modal right before modal-nuevo-grupo or before </body>
const modalTargetAnchor = '<div id="modal-nuevo-grupo"';
if (html.includes(modalTargetAnchor)) {
    html = html.replace(modalTargetAnchor, modalAsignarCarreraHTML + modalTargetAnchor);
    console.log('[+] modal-asignar-carrera-estudiante HTML inserted before modal-nuevo-grupo.');
} else {
    html = html.replace('</body>', modalAsignarCarreraHTML + '</body>');
    console.log('[+] modal-asignar-carrera-estudiante HTML inserted before </body>.');
}

// =========================================================================
// 7. ADD JAVASCRIPT FUNCTIONS FOR CAREER ASSIGNMENT & MODIFICATION AND THEME TOGGLE
// =========================================================================
const jsFunctionsBlock = `
        // =========================================================================
        // GESTIÓN DE TEMAS (DARK OBSIDIAN LUXURY FINTECH / LIGHT EXECUTIVE)
        // =========================================================================
        function initTheme() {
            const savedTheme = localStorage.getItem('cetpro_theme') || 'dark';
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        function toggleTheme() {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('cetpro_theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('cetpro_theme', 'dark');
            }
        }

        // =========================================================================
        // ASIGNAR O MODIFICAR / CAMBIAR CARRERA DE CUALQUIER ESTUDIANTE
        // =========================================================================
        async function abrirModalAsignarCarrera(id, nombre, carreraActual, grupoActual) {
            const modal = document.getElementById('modal-asignar-carrera-estudiante');
            if (!modal) return;

            document.getElementById('modal-asignar-estudiante-id').value = id;
            document.getElementById('modal-asignar-estudiante-nombre').innerText = nombre;

            const tituloEl = document.getElementById('modal-asignar-carrera-titulo');
            const badgeActual = document.getElementById('modal-asignar-carrera-actual-badge');
            const esSinAsignar = !carreraActual || carreraActual.trim() === '' || carreraActual === 'Sin Asignar' || carreraActual.includes('Pendiente');

            if (tituloEl) {
                tituloEl.innerText = esSinAsignar ? '➕ Asignar Carrera al Estudiante' : '✏️ Modificar o Cambiar Carrera';
            }

            if (badgeActual) {
                badgeActual.innerText = esSinAsignar ? 'Sin Asignar (Pendiente)' : carreraActual;
                badgeActual.className = esSinAsignar
                    ? 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
            }

            // Poblar select de carreras dinámicamente con carrerasGlobales
            const selectCarrera = document.getElementById('modal-asignar-select-carrera');
            if (selectCarrera) {
                let opts = '<option value="Sin Asignar (Pendiente)">⏳ Sin Asignar (Pendiente)</option>';

                const carrerasLista = (typeof carrerasGlobales !== 'undefined' && carrerasGlobales && carrerasGlobales.length > 0)
                    ? carrerasGlobales.map(c => c.nombre)
                    : [
                        'Computación e Informática',
                        'Confección Textil',
                        'Peluquería y Barbería',
                        'Mecánica Automotriz',
                        'Electricidad y Electrónica',
                        'Hostelería y Turismo',
                        'Panadería y Pastelería',
                        'Carpintería y Ebanistería'
                    ];

                carrerasLista.forEach(nom => {
                    opts += \`<option value="\${nom}">\${nom}</option>\`;
                });
                selectCarrera.innerHTML = opts;

                // Preseleccionar carrera actual
                if (!esSinAsignar && carrerasLista.includes(carreraActual)) {
                    selectCarrera.value = carreraActual;
                } else if (esSinAsignar) {
                    selectCarrera.value = 'Sin Asignar (Pendiente)';
                } else {
                    selectCarrera.value = carreraActual;
                }
            }

            // Poblar grupos
            const selectGrupo = document.getElementById('modal-asignar-select-grupo');
            if (selectGrupo) {
                let gOpts = '<option value="Sin Asignar">Sin Asignar</option><option value="General">General</option>';
                if (typeof gruposGlobales !== 'undefined' && gruposGlobales && gruposGlobales.length > 0) {
                    gruposGlobales.forEach(g => {
                        gOpts += \`<option value="\${g.nombre}">\${g.nombre} (\${g.encargado})</option>\`;
                    });
                }
                selectGrupo.innerHTML = gOpts;
                if (grupoActual) selectGrupo.value = grupoActual;
            }

            modal.classList.remove('hidden');
        }

        function cerrarModalAsignarCarrera() {
            const modal = document.getElementById('modal-asignar-carrera-estudiante');
            if (modal) modal.classList.add('hidden');
        }

        async function guardarAsignacionCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();

            const id = document.getElementById('modal-asignar-estudiante-id').value;
            const carrera = document.getElementById('modal-asignar-select-carrera').value;
            const grupo = document.getElementById('modal-asignar-select-grupo').value;

            try {
                const res = await fetch(\`/api/estudiantes/\${id}/asignar\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ carrera, grupo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAsignarCarrera();
                    alert(\`✅ Carrera actualizada a "\${carrera}" correctamente y sincronizada en el libro Excel.\`);
                    await cargarEstudiantes();
                    await cargarStats();
                    if (typeof cargarCarreras === 'function') await cargarCarreras();
                    if (typeof cargarGrupos === 'function') await cargarGrupos();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar la carrera'));
                }
            } catch (err) {
                alert('Error de conexión al asignar carrera.');
            }
        }
`;

const jsInsertionAnchor = `        async function cargarTodo() {`;
if (html.includes(jsInsertionAnchor)) {
    html = html.replace(jsInsertionAnchor, jsFunctionsBlock + '\n        async function cargarTodo() {\n            initTheme();');
    console.log('[+] JavaScript functions for Theme & Career Assignment added before cargarTodo.');
}

// Also in verFichaEstudiante: add a button to change career directly from ficha
const verFichaBtnAnchor = `                    <button onclick="cerrarFichaEstudiante()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition">
                        Cerrar Ficha
                    </button>`;

const verFichaBtnReplacement = `                    <button onclick="cerrarFichaEstudiante(); abrirModalAsignarCarrera(\${est.id}, '\${(est.nombre || '').replace(/'/g, "\\\\'")}', '\${(est.carrera || '').replace(/'/g, "\\\\'")}', '\${(est.grupo || '').replace(/'/g, "\\\\"')}')" class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/25 transition">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>✏️ Modificar o Cambiar Carrera de este Estudiante</span>
                    </button>
                    <button onclick="cerrarFichaEstudiante()" class="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition">
                        Cerrar Ficha
                    </button>`;

if (html.includes(verFichaBtnAnchor)) {
    html = html.replace(verFichaBtnAnchor, verFichaBtnReplacement);
    console.log('[+] Added direct career modification button into verFichaEstudiante modal.');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ templates/index.html successfully updated! New size:', html.length);
