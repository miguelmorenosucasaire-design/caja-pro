const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. New aside HTML with exactly 12 items
const newAside = `<aside class="w-72 bg-slate-900 text-white flex flex-col flex-shrink-0 z-20 shadow-2xl border-r border-slate-800 select-none">
        <!-- Logo Institución CETPRO San Miguel -->
        <div class="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
            <img src="/public/img/logo_institucion.jpg" alt="Insignia CETPRO San Miguel" class="w-11 h-11 rounded-xl object-contain bg-white p-0.5 shadow-lg shadow-sky-500/20 flex-shrink-0">
            <div class="min-w-0">
                <h1 class="font-black text-sm tracking-tight leading-tight text-white truncate">CETPRO San Miguel</h1>
                <p class="text-[11px] text-cyan-400 font-bold truncate">Micaela Bastidas Puyucama</p>
                <p class="text-[9px] text-slate-400 uppercase tracking-widest truncate">Caja y Control Escolar</p>
            </div>
        </div>

        <!-- Botón Acción Rápida -->
        <div class="px-3.5 py-3 border-b border-slate-800/70 bg-slate-900/60">
            <button onclick="abrirModalNuevoMovimiento()" class="w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95 text-xs tracking-wider uppercase">
                <i class="fa-solid fa-circle-plus text-sm"></i>
                <span>+ Nuevo Movimiento</span>
            </button>
        </div>

        <!-- Título de Navegación Exclusiva: Hojas de Excel -->
        <div class="px-4 pt-3.5 pb-2 flex items-center justify-between text-slate-400 border-b border-slate-800/40">
            <span class="text-[11px] uppercase font-black tracking-wider flex items-center space-x-2 text-emerald-400">
                <i class="fa-solid fa-table-cells text-xs"></i>
                <span>Hojas de Excel:</span>
            </span>
            <span class="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold">12 Hojas</span>
        </div>

        <!-- Menú de Navegación Único (12 Hojas de Excel) -->
        <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            <!-- 1. INICIO -->
            <button onclick="cambiarSeccion('dashboard')" id="nav-dashboard" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-white bg-indigo-600 shadow-md shadow-indigo-600/30">
                <i class="fa-solid fa-house w-4 text-center text-white text-xs"></i>
                <span class="truncate">INICIO</span>
            </button>

            <!-- 2. RESUMEN ANUAL -->
            <button onclick="cambiarSeccion('resultados')" id="nav-resultados" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-chart-line w-4 text-center text-emerald-400 text-xs"></i>
                <span class="truncate">RESUMEN ANUAL</span>
                <span class="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">12M</span>
            </button>

            <!-- 3. SECCIONES / GRUPOS -->
            <button onclick="cambiarSeccion('grupos')" id="nav-grupos" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-users-rectangle w-4 text-center text-indigo-400 text-xs"></i>
                <span class="truncate">SECCIONES / GRUPOS</span>
                <span id="badge-grupos-count" class="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold">0</span>
            </button>

            <!-- 4. ESTUDIANTES -->
            <button onclick="cambiarSeccion('estudiantes')" id="nav-estudiantes" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-user-graduate w-4 text-center text-sky-400 text-xs"></i>
                <span class="truncate">ESTUDIANTES</span>
                <span id="badge-faltan-completar" class="ml-auto bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-bold">147</span>
            </button>

            <!-- 5. CONTROL PAGOS (MES A MES) -->
            <button onclick="cambiarSeccion('control-pagos')" id="nav-control-pagos" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-calendar-days w-4 text-center text-teal-400 text-xs"></i>
                <span class="truncate">CONTROL PAGOS (MES A MES)</span>
            </button>

            <!-- 6. DEUDORES -->
            <button onclick="cambiarSeccion('deudores')" id="nav-deudores" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-user-clock w-4 text-center text-rose-400 text-xs"></i>
                <span class="truncate">DEUDORES</span>
                <span id="badge-deudores-count" class="ml-auto bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full font-bold">0</span>
            </button>

            <!-- 7. INGRESOS (CAJA) -->
            <button onclick="cambiarSeccion('caja')" id="nav-caja" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-cash-register w-4 text-center text-emerald-400 text-xs"></i>
                <span class="truncate">INGRESOS (CAJA)</span>
            </button>

            <!-- 8. DIARIO & NOTAS -->
            <button onclick="cambiarSeccion('diario')" id="nav-diario" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-book-bookmark w-4 text-center text-amber-400 text-xs"></i>
                <span class="truncate">DIARIO & NOTAS</span>
            </button>

            <!-- 9. DOCENTES -->
            <button onclick="cambiarSeccion('docentes')" id="nav-docentes" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-chalkboard-user w-4 text-center text-purple-400 text-xs"></i>
                <span class="truncate">DOCENTES</span>
            </button>

            <!-- 10. FACTURA / BOLETA -->
            <button onclick="cambiarSeccion('factura')" id="nav-factura" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-receipt w-4 text-center text-cyan-400 text-xs"></i>
                <span class="truncate">FACTURA / BOLETA</span>
            </button>

            <!-- 11. RESPALDOS BD -->
            <button onclick="cambiarSeccion('respaldos')" id="nav-respaldos" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-database w-4 text-center text-teal-400 text-xs"></i>
                <span class="truncate">RESPALDOS BD</span>
                <span id="badge-backups-count" class="ml-auto bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">0</span>
            </button>

            <!-- 12. CONFIGURACIÓN -->
            <button onclick="cambiarSeccion('configuracion')" id="nav-configuracion" class="nav-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all text-slate-300 hover:text-white hover:bg-slate-800/80">
                <i class="fa-solid fa-gear w-4 text-center text-amber-400 text-xs"></i>
                <span class="truncate">CONFIGURACIÓN</span>
                <span class="ml-auto bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-black">⚙️</span>
            </button>
        </nav>

        <!-- Footer Sidebar -->
        <div class="p-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between bg-slate-950/40">
            <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[11px] font-semibold text-slate-300">Servidor Node.js Activo</span>
            </div>
            <button onclick="exportarYRespaldar()" title="Exportar y Respaldar Base de Datos" class="hover:text-emerald-400 transition p-1">
                <i class="fa-solid fa-file-excel text-emerald-400 text-sm"></i>
            </button>
        </div>
    </aside>`;

// 2. Replace <aside>...</aside>
const asideStart = html.indexOf('<aside');
const asideEnd = html.indexOf('</aside>') + 8;
if (asideStart === -1 || asideEnd === -1) {
    throw new Error('No se encontró el bloque <aside>');
}
html = html.substring(0, asideStart) + newAside + html.substring(asideEnd);

// 3. Remove the two duplicate top bars between </header> and <main
const headerEnd = html.indexOf('</header>') + 9;
const mainStart = html.indexOf('<main', headerEnd);
if (headerEnd === -1 || mainStart === -1) {
    throw new Error('No se encontraron los límites entre </header> y <main>');
}

console.log('Removiendo barras superiores duplicadas (bytes: ' + (mainStart - headerEnd) + ')...');
html = html.substring(0, headerEnd) + '\n\n        ' + html.substring(mainStart);

// 4. Update cambiarSeccion in JavaScript
const cambiarStart = html.indexOf('function cambiarSeccion(seccion) {');
const cambiarEnd = html.indexOf('// EXPORTACIÓN A PDF Y EXCEL', cambiarStart);

if (cambiarStart === -1 || cambiarEnd === -1) {
    throw new Error('No se encontró el bloque de cambiarSeccion en el script');
}

const newCambiarSeccion = `function cambiarSeccion(seccion) {
            seccionActivaActual = seccion;
            const secciones = [
                'dashboard', 'resultados', 'grupos', 'estudiantes', 
                'control-pagos', 'deudores', 'caja', 'diario', 
                'docentes', 'factura', 'respaldos', 'configuracion', 'carreras'
            ];
            
            secciones.forEach(s => {
                const secEl = document.getElementById('section-' + s);
                const navEl = document.getElementById('nav-' + s);

                if (secEl) {
                    secEl.classList.add('hidden');
                    secEl.classList.remove('section-activa-print');
                }
                if (navEl) {
                    navEl.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/30', 'bg-slate-800');
                    navEl.classList.add('text-slate-300', 'hover:bg-slate-800/80', 'hover:text-white');
                }
            });

            const activeSec = document.getElementById('section-' + seccion);
            const activeNav = document.getElementById('nav-' + seccion);

            if (activeSec) {
                activeSec.classList.remove('hidden');
                activeSec.classList.add('section-activa-print');
            }
            if (activeNav) {
                activeNav.classList.remove('text-slate-300', 'hover:bg-slate-800/80', 'hover:text-white');
                activeNav.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/30');
            }

            const titulos = {
                dashboard: ['INICIO · Panel Financiero General', 'CETPRO San Miguel - Micaela Bastidas Puyucama'],
                resultados: ['RESUMEN ANUAL · Estado de Resultados Mes a Mes', 'Balance de ingresos, salidas y superávit consolidado de cada mes del año escolar'],
                caja: ['INGRESOS (CAJA) · Flujo de Operaciones', 'Registro oficial de todas las operaciones de entrada y salida'],
                estudiantes: ['ESTUDIANTES · Plantilla General y Saldos', 'Nómina oficial de 147 estudiantes, control de cuotas y estados de cuenta'],
                docentes: ['DOCENTES · Plantilla Profesional y Horas', 'Liquidación de honorarios y control de cobros generados por docente'],
                grupos: ['SECCIONES / GRUPOS · Plantillas y Encargados', 'Plantilla individual por cada sección con su docente'],
                deudores: ['DEUDORES · Control de Pagos Pendientes', 'Reporte consolidado de estudiantes con saldo pendiente de pago'],
                respaldos: ['RESPALDOS BD · Base de Datos Criptográfica', 'Gestión de copias de seguridad automáticas y hashes SHA-256'],
                'control-pagos': ['CONTROL PAGOS (MES A MES) · Matriz Anual', 'Cuadrícula oficial de aportes mensuales de cada estudiante'],
                diario: ['DIARIO & NOTAS · Registro Académico y Bitácora', 'Historial cronológico de eventos institucionales y caja diaria'],
                factura: ['FACTURA / BOLETA · Emisión de Comprobantes Oficiales', 'Generación e impresión de boletas, recibos y facturas oficiales'],
                configuracion: ['CONFIGURACIÓN · Sedes, RUC y Facturación', 'Gestión centralizada del campus, sedes, RUC, datos de contacto manual y comprobantes'],
                carreras: ['ESPECIALIDADES / CARRERAS · Oferta Educativa', 'Control y administración de especialidades técnicas activas']
            };

            if (titulos[seccion]) {
                const titleEl = document.getElementById('page-title');
                const subtitleEl = document.getElementById('page-subtitle');
                const activeSheetNameEl = document.getElementById('page-active-sheet-name');
                if (titleEl) titleEl.textContent = titulos[seccion][0];
                if (subtitleEl && activeSheetNameEl) {
                    activeSheetNameEl.textContent = 'Hoja Activa: ' + titulos[seccion][0].split(' · ')[0];
                }
            }

            if (seccion === 'carreras') {
                cargarCarreras();
            } else if (seccion === 'configuracion') {
                cargarConfiguracion();
                cargarCarreras();
            } else if (seccion === 'respaldos') {
                cargarBackups();
            } else if (seccion === 'grupos') {
                cargarGrupos();
            }

            const mainEl = document.querySelector('main');
            if (mainEl) mainEl.scrollTop = 0;
        }

        // =========================================================================
        `;

html = html.substring(0, cambiarStart) + newCambiarSeccion + html.substring(cambiarEnd);

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('✅ Archivo templates/index.html actualizado con la barra lateral única y sin barras superiores.');
