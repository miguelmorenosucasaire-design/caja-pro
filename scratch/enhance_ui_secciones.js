const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Añadir barra de pestañas superior inmediatamente después del <header>
const headerEnd = '</header>';
const topNavBar = `
        <!-- BARRA SUPERIOR DE ACCESO RÁPIDO A SECCIONES Y MÓDULOS -->
        <div class="bg-white border-b border-slate-200 px-8 py-3 flex items-center space-x-2.5 overflow-x-auto shadow-sm flex-shrink-0 z-10">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 hidden md:inline-flex items-center">
                <i class="fa-solid fa-layer-group mr-1.5 text-indigo-500"></i> Secciones:
            </span>

            <button onclick="cambiarSeccion('grupos')" id="top-nav-grupos" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-indigo-600 text-white shadow-md shadow-indigo-500/25 transition-all transform active:scale-95">
                <i class="fa-solid fa-users-rectangle text-sm"></i>
                <span>SECCIONES POR GRUPO</span>
                <span class="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold" id="top-badge-grupos">6</span>
            </button>

            <button onclick="cambiarSeccion('dashboard')" id="top-nav-dashboard" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-chart-pie text-sky-600"></i>
                <span>Panel General</span>
            </button>

            <button onclick="cambiarSeccion('caja')" id="top-nav-caja" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-cash-register text-emerald-600"></i>
                <span>Caja y Recibos</span>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">202</span>
            </button>

            <button onclick="cambiarSeccion('estudiantes')" id="top-nav-estudiantes" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-user-graduate text-cyan-600"></i>
                <span>Plantilla Estudiantes</span>
                <span class="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">147</span>
            </button>

            <button onclick="cambiarSeccion('docentes')" id="top-nav-docentes" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-chalkboard-user text-amber-600"></i>
                <span>Docentes y Encargados</span>
                <span class="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">6</span>
            </button>

            <button onclick="cambiarSeccion('resultados')" id="top-nav-resultados" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-calendar-check text-indigo-600"></i>
                <span>Resultados Mes a Mes</span>
            </button>

            <button onclick="cambiarSeccion('respaldos')" id="top-nav-respaldos" class="top-nav-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                <i class="fa-solid fa-database text-teal-600"></i>
                <span>Respaldos de BD</span>
            </button>
        </div>
`;

if (!html.includes('top-nav-grupos')) {
    html = html.replace(headerEnd, headerEnd + topNavBar);
    console.log('Barra de pestañas superior añadida.');
}

// 2. Modificar cambiarSeccion para actualizar también los botones superiores
const oldCambiarSeccion = `function cambiarSeccion(seccion) {
            const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos'];
            secciones.forEach(s => {
                const secEl = document.getElementById(\`section-\${s}\`);
                const navEl = document.getElementById(\`nav-\${s}\`);
                if (secEl) secEl.classList.add('hidden');
                if (navEl) {
                    navEl.classList.remove('bg-slate-800', 'text-white');
                    navEl.classList.add('text-slate-300');
                }
            });

            const activeSec = document.getElementById(\`section-\${seccion}\`);
            const activeNav = document.getElementById(\`nav-\${seccion}\`);
            if (activeSec) activeSec.classList.remove('hidden');
            if (activeNav) {
                activeNav.classList.add('bg-slate-800', 'text-white');
                activeNav.classList.remove('text-slate-300');
            }`;

const newCambiarSeccion = `function cambiarSeccion(seccion) {
            const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos'];
            secciones.forEach(s => {
                const secEl = document.getElementById(\`section-\${s}\`);
                const navEl = document.getElementById(\`nav-\${s}\`);
                const topNavEl = document.getElementById(\`top-nav-\${s}\`);
                if (secEl) secEl.classList.add('hidden');
                if (navEl) {
                    navEl.classList.remove('bg-slate-800', 'text-white');
                    navEl.classList.add('text-slate-300');
                }
                if (topNavEl) {
                    topNavEl.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/25');
                    topNavEl.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
                }
            });

            const activeSec = document.getElementById(\`section-\${seccion}\`);
            const activeNav = document.getElementById(\`nav-\${seccion}\`);
            const activeTopNav = document.getElementById(\`top-nav-\${seccion}\`);

            if (activeSec) activeSec.classList.remove('hidden');
            if (activeNav) {
                activeNav.classList.add('bg-slate-800', 'text-white');
                activeNav.classList.remove('text-slate-300');
            }
            if (activeTopNav) {
                activeTopNav.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
                activeTopNav.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/25');
            }`;

if (html.includes(oldCambiarSeccion)) {
    html = html.replace(oldCambiarSeccion, newCambiarSeccion);
    console.log('Función cambiarSeccion actualizada para sincronizar pestañas superiores.');
}

// 3. Añadir el bloque de Secciones directamente en el Dashboard para que sea visible de inmediato
const dashMarker = '<!-- Gráfico de Flujo Mensual (Chart.js) y Resumen Trimestral -->';
const seccionDashBlock = `
                <!-- ======================================================== -->
                <!-- SECCIONES POR GRUPO Y ENCARGADOS DE CLASE (CETPRO REAL)  -->
                <!-- ======================================================== -->
                <div class="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
                    <div class="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                                <i class="fa-solid fa-users-rectangle"></i>
                            </div>
                            <div>
                                <h3 class="text-base font-extrabold text-slate-900 leading-tight">Secciones por Grupo y Encargado de Clase</h3>
                                <p class="text-xs text-slate-500">CETPRO San Miguel (Micaela Bastidas) • 6 Especialidades Técnicas Activas</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="cambiarSeccion('grupos')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition">
                                <span>Ver Gestión Completa de Secciones</span>
                                <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                            <button onclick="abrirModalNuevoMovimiento()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition">
                                <i class="fa-solid fa-plus-circle"></i>
                                <span>Registrar en Sección</span>
                            </button>
                        </div>
                    </div>

                    <!-- Cuadrícula de las 6 Secciones -->
                    <div id="dashboard-grid-grupos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Se poblará dinámicamente con renderDashboardGrupos() -->
                    </div>
                </div>
`;

if (!html.includes('dashboard-grid-grupos') && html.includes(dashMarker)) {
    html = html.replace(dashMarker, seccionDashBlock + '\n' + dashMarker);
    console.log('Bloque de Secciones insertado en el Dashboard.');
}

// 4. Añadir función renderDashboardGrupos() y llamarla en cargarGrupos()
const renderGruposMarker = 'renderGrupos(gruposGlobales);';
const renderDashGruposCall = `renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);`;

if (html.includes(renderGruposMarker) && !html.includes('renderDashboardGrupos(gruposGlobales);')) {
    html = html.replace(renderGruposMarker, renderDashGruposCall);
}

const funcBlock = `
        function renderDashboardGrupos(lista) {
            const container = document.getElementById('dashboard-grid-grupos');
            if (!container) return;

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            container.innerHTML = lista.map(g => {
                let badgeTurnoColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

                return \`
                    <div class="bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 p-4 transition-all hover:shadow-md flex flex-col justify-between">
                        <div>
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <span class="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                                    \${g.carrera}
                                </span>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded border \${badgeTurnoColor}">
                                    \${g.turno}
                                </span>
                            </div>

                            <h4 class="font-extrabold text-slate-800 text-sm leading-tight mb-2.5">\${g.nombre}</h4>

                            <!-- Encargado -->
                            <div class="bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3 flex items-center space-x-2.5">
                                <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    <i class="fa-solid fa-chalkboard-user"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="text-[10px] text-slate-400 font-bold uppercase">Encargado(a) de Clase</p>
                                    <p class="text-xs font-bold text-slate-800 truncate">\${g.encargado || 'Sin Asignar'}</p>
                                </div>
                            </div>

                            <!-- Métricas de sección -->
                            <div class="grid grid-cols-2 gap-2 text-center mb-3">
                                <div class="bg-white p-2 rounded-lg border border-slate-100">
                                    <p class="text-[10px] text-slate-400 font-semibold">Alumnos</p>
                                    <p class="text-xs font-black text-slate-800">\${g.total_alumnos || 0} matriculados</p>
                                </div>
                                <div class="bg-white p-2 rounded-lg border border-slate-100">
                                    <p class="text-[10px] text-slate-400 font-semibold">Recaudado</p>
                                    <p class="text-xs font-black text-emerald-600">\${fMoney(g.total_ingresos || 0)}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span class="text-[11px] text-slate-500 font-medium">
                                <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>\${g.aula_taller || 'Aula Principal'}
                            </span>
                            <button onclick="filtrarCajaPorGrupo('\${g.nombre.replace(/'/g, "\\\\'")}')" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 transition">
                                <span>Ver Caja</span>
                                <i class="fa-solid fa-angle-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');
        }
`;

if (!html.includes('function renderDashboardGrupos')) {
    html = html.replace('function renderGrupos(lista) {', funcBlock + '\n        function renderGrupos(lista) {');
    console.log('Función renderDashboardGrupos añadida.');
}

// 5. Iniciar por defecto en SECCIONES si se desea o mantener sincronizado
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html actualizado exitosamente.');
