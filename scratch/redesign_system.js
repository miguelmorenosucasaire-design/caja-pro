const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Upgraded <head> CSS styles
const newStyles = `<style>
        /* =========================================================================
           NUEVO SISTEMA DE DISEÑO: CYBER-FINTECH OBSIDIAN & EXECUTIVE GLASS
           ========================================================================= */
        :root {
            --accent-primary: #6366f1;
            --accent-cyan: #06b6d4;
            --accent-emerald: #10b981;
            --accent-rose: #f43f5e;
            --accent-amber: #f59e0b;
        }

        /* TIPOGRAFÍA Y SUAVIZADO */
        body {
            font-feature-settings: "cv02", "cv03", "cv04", "cv11";
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* --- MODO CLARO (EXECUTIVE GLASS) --- */
        html:not(.dark) body {
            background-color: #f8fafc;
            color: #0f172a;
            background-image: 
                radial-gradient(circle at 10% 10%, rgba(224, 242, 254, 0.6) 0%, transparent 40%),
                radial-gradient(circle at 90% 90%, rgba(241, 245, 249, 0.8) 0%, transparent 50%);
        }
        html:not(.dark) .cyber-card, html:not(.dark) .bg-white {
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

        /* --- MODO OSCURO (CYBER FINTECH OBSIDIAN) --- */
        html.dark {
            color-scheme: dark;
        }
        html.dark body {
            background-color: #070b14 !important;
            color: #e2e8f0 !important;
            background-image: 
                radial-gradient(ellipse at 15% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 85% 100%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 60%) !important;
            background-attachment: fixed !important;
        }
        html.dark .bg-white {
            background-color: rgba(15, 23, 42, 0.8) !important;
            backdrop-filter: blur(14px) !important;
            border-color: rgba(51, 65, 85, 0.7) !important;
            color: #f1f5f9 !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }
        html.dark .bg-slate-50 {
            background-color: #070b14 !important;
            border-color: rgba(51, 65, 85, 0.6) !important;
            color: #e2e8f0 !important;
        }
        html.dark .bg-slate-100 {
            background-color: rgba(30, 41, 59, 0.7) !important;
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
        html.dark header {
            background-color: rgba(11, 17, 32, 0.85) !important;
            backdrop-filter: blur(16px) !important;
            border-bottom: 1px solid rgba(56, 189, 248, 0.15) !important;
        }
        html.dark aside {
            background: linear-gradient(180deg, #060911 0%, #0c1222 100%) !important;
            border-right: 1px solid rgba(56, 189, 248, 0.15) !important;
            box-shadow: 4px 0 24px -2px rgba(0, 0, 0, 0.6) !important;
        }
        html.dark input, html.dark select, html.dark textarea {
            background-color: #0b1120 !important;
            border-color: #334155 !important;
            color: #f8fafc !important;
        }
        html.dark input:focus, html.dark select:focus, html.dark textarea:focus {
            border-color: #06b6d4 !important;
            box-shadow: 0 0 12px rgba(6, 182, 212, 0.35) !important;
            outline: none !important;
        }

        /* TARJETAS CON BORDE BRILLANTE (FINTECH GLOW) */
        .fintech-kpi {
            position: relative;
            overflow: hidden;
            border-radius: 1rem;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fintech-kpi:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.3) !important;
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
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.15) 100%) !important;
            border-left: 3px solid #06b6d4 !important;
            color: #ffffff !important;
            box-shadow: 0 0 16px rgba(6, 182, 212, 0.22) !important;
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

// Replace <style>...</style> in <head>
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>') + 8;
if (styleStart !== -1 && styleEnd !== -1) {
    html = html.substring(0, styleStart) + newStyles + html.substring(styleEnd);
}

// 2. Upgraded Sidebar with gorgeous Cyber-Fintech visual elements
const newAside = `<aside class="w-72 flex flex-col flex-shrink-0 z-20 select-none transition-all duration-300">
        <!-- Logo Institución CETPRO San Miguel con Resplandor Holográfico -->
        <div class="p-4 border-b border-slate-800/80 flex items-center space-x-3.5 bg-slate-950/50">
            <div class="relative group">
                <div class="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
                <img src="/public/img/logo_institucion.jpg" alt="Insignia CETPRO San Miguel" class="relative w-11 h-11 rounded-xl object-contain bg-white p-0.5 shadow-md flex-shrink-0">
            </div>
            <div class="min-w-0">
                <h1 class="font-black text-sm tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-300 truncate">CETPRO San Miguel</h1>
                <p class="text-[11px] text-cyan-400 font-bold truncate">Micaela Bastidas Puyucama</p>
                <div class="flex items-center space-x-1.5 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-[9px] text-slate-400 uppercase tracking-widest truncate font-semibold">Sistema Contable 2026</span>
                </div>
            </div>
        </div>

        <!-- Botón Acción Rápida: Nuevo Movimiento (Holográfico con Glow) -->
        <div class="px-3.5 py-3 border-b border-slate-800/60 bg-slate-950/25">
            <button onclick="abrirModalNuevoMovimiento()" class="cyber-btn w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95 text-xs tracking-wider uppercase">
                <i class="fa-solid fa-circle-plus text-sm"></i>
                <span>+ Nuevo Movimiento</span>
            </button>
        </div>

        <!-- Título de Navegación Exclusiva: Hojas de Excel -->
        <div class="px-4 pt-3.5 pb-2 flex items-center justify-between text-slate-400 border-b border-slate-800/40">
            <span class="text-[10px] uppercase font-black tracking-widest flex items-center space-x-2 text-cyan-400">
                <i class="fa-solid fa-table-cells text-xs text-emerald-400"></i>
                <span>Hojas de Excel:</span>
            </span>
            <span class="text-[9px] bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-black tracking-wider">12 HOJAS</span>
        </div>

        <!-- Menú de Navegación Único (12 Hojas de Excel) -->
        <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            <!-- 1. INICIO -->
            <button onclick="cambiarSeccion('dashboard')" id="nav-dashboard" class="sidebar-excel-item item-active w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-white">
                <div class="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-house text-xs"></i>
                </div>
                <span class="truncate">INICIO</span>
            </button>

            <!-- 2. RESUMEN ANUAL -->
            <button onclick="cambiarSeccion('resultados')" id="nav-resultados" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-chart-line text-xs"></i>
                </div>
                <span class="truncate">RESUMEN ANUAL</span>
                <span class="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-black">12M</span>
            </button>

            <!-- 3. SECCIONES / GRUPOS -->
            <button onclick="cambiarSeccion('grupos')" id="nav-grupos" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-users-rectangle text-xs"></i>
                </div>
                <span class="truncate">SECCIONES / GRUPOS</span>
                <span id="badge-grupos-count" class="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-black">0</span>
            </button>

            <!-- 4. ESTUDIANTES -->
            <button onclick="cambiarSeccion('estudiantes')" id="nav-estudiantes" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-user-graduate text-xs"></i>
                </div>
                <span class="truncate">ESTUDIANTES</span>
                <span id="badge-faltan-completar" class="ml-auto bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-black">147</span>
            </button>

            <!-- 5. CONTROL PAGOS (MES A MES) -->
            <button onclick="cambiarSeccion('control-pagos')" id="nav-control-pagos" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-calendar-days text-xs"></i>
                </div>
                <span class="truncate">CONTROL PAGOS (MES A MES)</span>
            </button>

            <!-- 6. DEUDORES -->
            <button onclick="cambiarSeccion('deudores')" id="nav-deudores" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-user-clock text-xs"></i>
                </div>
                <span class="truncate">DEUDORES</span>
                <span id="badge-deudores-count" class="ml-auto bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full font-black">0</span>
            </button>

            <!-- 7. INGRESOS (CAJA) -->
            <button onclick="cambiarSeccion('caja')" id="nav-caja" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-cash-register text-xs"></i>
                </div>
                <span class="truncate">INGRESOS (CAJA)</span>
            </button>

            <!-- 8. DIARIO & NOTAS -->
            <button onclick="cambiarSeccion('diario')" id="nav-diario" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-book-bookmark text-xs"></i>
                </div>
                <span class="truncate">DIARIO & NOTAS</span>
            </button>

            <!-- 9. DOCENTES -->
            <button onclick="cambiarSeccion('docentes')" id="nav-docentes" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-chalkboard-user text-xs"></i>
                </div>
                <span class="truncate">DOCENTES</span>
            </button>

            <!-- 10. FACTURA / BOLETA -->
            <button onclick="cambiarSeccion('factura')" id="nav-factura" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-sky-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-receipt text-xs"></i>
                </div>
                <span class="truncate">FACTURA / BOLETA</span>
            </button>

            <!-- 11. RESPALDOS BD -->
            <button onclick="cambiarSeccion('respaldos')" id="nav-respaldos" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-database text-xs"></i>
                </div>
                <span class="truncate">RESPALDOS BD</span>
                <span id="badge-backups-count" class="ml-auto bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-black">0</span>
            </button>

            <!-- 12. CONFIGURACIÓN -->
            <button onclick="cambiarSeccion('configuracion')" id="nav-configuracion" class="sidebar-excel-item w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide text-slate-300">
                <div class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-gear text-xs"></i>
                </div>
                <span class="truncate">CONFIGURACIÓN</span>
                <span class="ml-auto bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-black">⚙️</span>
            </button>
        </nav>

        <!-- Footer Sidebar -->
        <div class="p-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between bg-slate-950/50">
            <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-[11px] font-bold text-slate-300">Servidor Node.js Activo</span>
            </div>
            <button onclick="exportarYRespaldar()" title="Exportar y Respaldar Base de Datos" class="hover:text-emerald-400 transition p-1 text-slate-400 hover:scale-110">
                <i class="fa-solid fa-file-excel text-emerald-400 text-sm"></i>
            </button>
        </div>
    </aside>`;

// Replace <aside>...</aside>
const asideStart = html.indexOf('<aside');
const asideEnd = html.indexOf('</aside>') + 8;
if (asideStart !== -1 && asideEnd !== -1) {
    html = html.substring(0, asideStart) + newAside + html.substring(asideEnd);
}

// 3. Upgraded Header with Modern Floating Breadcrumb and Pill Buttons
const newHeader = `<header class="px-6 py-3 flex items-center justify-between shadow-sm z-10 flex-shrink-0 no-print transition-colors">
            <div class="flex items-center space-x-3.5">
                <div class="flex items-center space-x-2 bg-slate-800/40 dark:bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-1.5">
                    <i class="fa-solid fa-file-excel text-emerald-400 text-sm"></i>
                    <span id="page-active-sheet-name" class="text-xs font-black uppercase tracking-wider text-slate-200">Hoja Activa: INICIO</span>
                </div>
                <div class="hidden lg:block">
                    <h2 id="page-title" class="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">CETPRO San Miguel · Micaela Bastidas Puyucama</h2>
                </div>
            </div>

            <!-- Botones de Acción y Exportación Directa -->
            <div class="flex items-center space-x-2">
                <!-- Exportar a PDF -->
                <button onclick="exportarHojaPDF()" title="Exportar la hoja seleccionada a documento PDF con membrete oficial" class="cyber-btn bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition">
                    <i class="fa-solid fa-file-pdf text-rose-500 text-xs"></i>
                    <span>PDF</span>
                </button>

                <!-- Exportar a Excel -->
                <button onclick="exportarHojaExcel()" title="Descargar datos de la hoja seleccionada en formato compatible con Excel" class="cyber-btn bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition">
                    <i class="fa-solid fa-file-excel text-emerald-500 text-xs"></i>
                    <span>Hoja Excel</span>
                </button>

                <!-- Descargar Libro Completo Actualizado .xlsx -->
                <a href="/api/exportar/excel" download="CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx" title="Descargar libro Excel oficial multi-hoja completo con todos los movimientos y datos en vivo" class="cyber-btn bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/20">
                    <i class="fa-solid fa-download text-xs"></i>
                    <span>Libro .xlsx</span>
                </a>

                <!-- Toggle Modo Futurista / Modo Claro -->
                <button onclick="toggleTheme()" id="btn-theme-toggle" class="cyber-btn px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 shadow-sm shadow-cyan-500/20" title="Alternar entre Modo Futurista (Oscuro) y Modo Ejecutivo (Claro)">
                    <i id="theme-icon" class="fa-solid fa-moon text-cyan-400 text-xs"></i>
                    <span id="theme-label">Cyber Dark</span>
                </button>

                <!-- Actualizar -->
                <button onclick="cargarTodo()" title="Refrescar datos y cálculos en tiempo real" class="cyber-btn bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-700/60 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center transition">
                    <i class="fa-solid fa-rotate text-sky-400"></i>
                </button>
            </div>
        </header>`;

// Replace <header>...</header>
const headerStart = html.indexOf('<header');
const headerEnd = html.indexOf('</header>') + 9;
if (headerStart !== -1 && headerEnd !== -1) {
    html = html.substring(0, headerStart) + newHeader + html.substring(headerEnd);
}

// 4. Update cambiarSeccion to toggle .item-active class on sidebar items
const cambiarStart = html.indexOf('function cambiarSeccion(seccion) {');
const cambiarEnd = html.indexOf('// =========================================================================\n        // EXPORTACIÓN A PDF', cambiarStart);

if (cambiarStart !== -1 && cambiarEnd !== -1) {
    const updatedCambiarSeccion = `function cambiarSeccion(seccion) {
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
                    navEl.classList.remove('item-active');
                    navEl.classList.add('text-slate-300');
                }
            });

            const activeSec = document.getElementById('section-' + seccion);
            const activeNav = document.getElementById('nav-' + seccion);

            if (activeSec) {
                activeSec.classList.remove('hidden');
                activeSec.classList.add('section-activa-print');
            }
            if (activeNav) {
                activeNav.classList.remove('text-slate-300');
                activeNav.classList.add('item-active');
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
                const activeSheetNameEl = document.getElementById('page-active-sheet-name');
                if (titleEl) titleEl.textContent = titulos[seccion][0];
                if (activeSheetNameEl) {
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

        `;

    html = html.substring(0, cambiarStart) + updatedCambiarSeccion + html.substring(cambiarEnd);
}

// 5. Upgrade the 4 KPI Cards in Section Dashboard to have .fintech-kpi classes
const kpiOldBlockStart = html.indexOf('<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">');
const kpiOldBlockEnd = html.indexOf('<!-- Graficos y Tablas Principales -->', kpiOldBlockStart);

if (kpiOldBlockStart !== -1 && kpiOldBlockEnd !== -1) {
    const newKpiBlock = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <!-- KPI 1: Saldo Total -->
                    <div class="fintech-kpi kpi-saldo bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Saldo Total en Caja</span>
                            <div class="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shadow-inner">
                                <i class="fa-solid fa-wallet text-base"></i>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h3 id="kpi-saldo" class="text-3xl font-black font-mono text-slate-900 tracking-tight">S/. 0.00</h3>
                            <p class="text-xs text-indigo-400 font-bold mt-1.5 flex items-center space-x-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Balance Neto Real Auditado</span>
                            </p>
                        </div>
                    </div>

                    <!-- KPI 2: Total Ingresos -->
                    <div class="fintech-kpi kpi-ingresos bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Ingresos</span>
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-inner">
                                <i class="fa-solid fa-circle-arrow-down text-base"></i>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h3 id="kpi-ingresos" class="text-3xl font-black font-mono text-emerald-500 tracking-tight">S/. 0.00</h3>
                            <p id="kpi-ingresos-mes" class="text-xs text-slate-400 font-semibold mt-1.5">Este mes: S/. 0.00</p>
                        </div>
                    </div>

                    <!-- KPI 3: Total Salidas / Egresos -->
                    <div class="fintech-kpi kpi-egresos bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Egresos</span>
                            <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shadow-inner">
                                <i class="fa-solid fa-circle-arrow-up text-base"></i>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h3 id="kpi-egresos" class="text-3xl font-black font-mono text-rose-500 tracking-tight">S/. 0.00</h3>
                            <p id="kpi-egresos-mes" class="text-xs text-slate-400 font-semibold mt-1.5">Este mes: S/. 0.00</p>
                        </div>
                    </div>

                    <!-- KPI 4: Total Alumnos -->
                    <div class="fintech-kpi kpi-alumnos bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Estudiantes Matriculados</span>
                            <div class="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shadow-inner">
                                <i class="fa-solid fa-users text-base"></i>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h3 id="kpi-estudiantes" class="text-3xl font-black font-mono text-sky-400 tracking-tight">147</h3>
                            <p id="kpi-con-deuda" class="text-xs text-slate-400 font-semibold mt-1.5">Con saldo pendiente: 0</p>
                        </div>
                    </div>
                </div>
                `;

    html = html.substring(0, kpiOldBlockStart) + newKpiBlock + html.substring(kpiOldBlockEnd);
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('✅ templates/index.html actualizado exitosamente con el nuevo diseño Cyber-FinTech!');
