const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
console.log('Original size:', html.length);

// 1. Comprehensive Cyber Obsidian CSS in <style>
const cyberCSS = `
        /* ========================================================================= */
        /* COMPREHENSIVE CYBER-FINTECH OBSIDIAN & EMERALD LUXURY GLASS STYLES        */
        /* ========================================================================= */
        .dark body, html.dark body {
            background-color: #060911 !important;
            color: #f1f5f9 !important;
        }

        .dark aside {
            background-color: #04060c !important;
            border-right: 1px solid rgba(30, 41, 59, 0.7) !important;
        }

        .dark header {
            background-color: #080c16 !important;
            border-bottom: 1px solid rgba(30, 41, 59, 0.7) !important;
        }

        .dark .bg-white {
            background-color: rgba(12, 17, 30, 0.95) !important;
            border-color: rgba(30, 41, 59, 0.8) !important;
            color: #f1f5f9 !important;
        }

        .dark .text-slate-900,
        .dark .text-slate-800,
        .dark .text-slate-700 {
            color: #f1f5f9 !important;
        }

        .dark .text-slate-600,
        .dark .text-slate-500 {
            color: #94a3b8 !important;
        }

        .dark .border-slate-200,
        .dark .border-slate-100,
        .dark .border-slate-300 {
            border-color: rgba(30, 41, 59, 0.8) !important;
        }

        .dark .bg-slate-50,
        .dark .bg-slate-100 {
            background-color: rgba(17, 24, 39, 0.8) !important;
            color: #e2e8f0 !important;
        }

        .dark .bg-slate-200 {
            background-color: #1e293b !important;
            color: #e2e8f0 !important;
        }

        .dark table thead tr {
            background-color: #0d1322 !important;
            color: #cbd5e1 !important;
        }

        .dark table tbody tr:hover {
            background-color: rgba(30, 41, 59, 0.5) !important;
        }

        .dark input,
        .dark select,
        .dark textarea {
            background-color: #0b0f19 !important;
            color: #f8fafc !important;
            border-color: #334155 !important;
        }

        .dark input::placeholder {
            color: #64748b !important;
        }

        /* Glassmorphism Cards */
        .cyber-card {
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dark .cyber-card {
            background: rgba(12, 17, 30, 0.9) !important;
            border: 1px solid rgba(51, 65, 85, 0.45) !important;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
        }

        .dark .cyber-card:hover {
            border-color: rgba(99, 102, 241, 0.5) !important;
            box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.7), 0 0 15px -3px rgba(99, 102, 241, 0.2);
        }

        /* KPI Glow Cards */
        .kpi-cyber-saldo {
            border-top: 3px solid #06b6d4 !important;
            box-shadow: 0 4px 20px -2px rgba(6, 182, 212, 0.15);
        }
        .kpi-cyber-ingresos {
            border-top: 3px solid #10b981 !important;
            box-shadow: 0 4px 20px -2px rgba(16, 185, 129, 0.15);
        }
        .kpi-cyber-egresos {
            border-top: 3px solid #f43f5e !important;
            box-shadow: 0 4px 20px -2px rgba(244, 63, 94, 0.15);
        }
        .kpi-cyber-deudas {
            border-top: 3px solid #f59e0b !important;
            box-shadow: 0 4px 20px -2px rgba(245, 158, 11, 0.15);
        }
    </style>`;

if (html.includes('</style>')) {
    html = html.replace('</style>', cyberCSS);
    console.log('[+] Added cyberCSS before </style>.');
}

// 2. Add Theme Toggle button into Header
const headerActualizarBtn = `<button onclick="cargarTodo()" title="Refrescar datos y cálculos en tiempo real" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition">
                    <i class="fa-solid fa-rotate text-sky-600"></i>
                </button>`;

const headerThemeBtn = `<button onclick="toggleTheme()" id="btn-theme-toggle" class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm" title="Alternar entre Tema Oscuro Obsidian y Tema Claro">
                    <i class="fa-solid fa-moon dark:hidden text-indigo-600"></i>
                    <i class="fa-solid fa-sun hidden dark:inline text-amber-400"></i>
                    <span class="text-[11px] text-slate-800 dark:text-slate-100">Tema</span>
                </button>
                ` + headerActualizarBtn;

if (html.includes(headerActualizarBtn)) {
    html = html.replace(headerActualizarBtn, headerThemeBtn);
    console.log('[+] Theme toggle button added to header.');
}

// 3. Update KPI cards in section-dashboard with KPI cyber classes
const kpiSaldoTarget = `<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Total en Caja</span>`;

const kpiSaldoReplacement = `<div class="bg-white cyber-card kpi-cyber-saldo p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Total en Caja</span>`;

if (html.includes(kpiSaldoTarget)) {
    html = html.replace(kpiSaldoTarget, kpiSaldoReplacement);
}

const kpiIngresosTarget = `<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ingresos</span>`;

const kpiIngresosReplacement = `<div class="bg-white cyber-card kpi-cyber-ingresos p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Ingresos</span>`;

if (html.includes(kpiIngresosTarget)) {
    html = html.replace(kpiIngresosTarget, kpiIngresosReplacement);
}

const kpiEgresosTarget = `<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Salidas / Egresos</span>`;

const kpiEgresosReplacement = `<div class="bg-white cyber-card kpi-cyber-egresos p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Salidas / Egresos</span>`;

if (html.includes(kpiEgresosTarget)) {
    html = html.replace(kpiEgresosTarget, kpiEgresosReplacement);
}

const kpiDeudasTarget = `<div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer" onclick="cambiarSeccion('estudiantes')">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldos por Cobrar</span>`;

const kpiDeudasReplacement = `<div class="bg-white cyber-card kpi-cyber-deudas p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer" onclick="cambiarSeccion('estudiantes')">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldos por Cobrar</span>`;

if (html.includes(kpiDeudasTarget)) {
    html = html.replace(kpiDeudasTarget, kpiDeudasReplacement);
    console.log('[+] KPI cards updated with cyber glowing borders.');
}

// 4. In modal-ficha-estudiante: add direct career modification button in header
const fichaHeaderBtnsTarget = `<button onclick="window.print()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition">
                        <i class="fa-solid fa-print"></i>
                        <span>Imprimir / Guardar en PDF</span>
                    </button>`;

const fichaHeaderBtnsReplacement = `<button onclick="cerrarModalFichaEstudiante(); abrirModalAsignarCarrera(currentFichaEstudianteData.id, currentFichaEstudianteData.nombre, currentFichaEstudianteData.carrera, currentFichaEstudianteData.grupo)" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>✏️ Modificar Carrera</span>
                    </button>
                    ` + fichaHeaderBtnsTarget;

if (html.includes(fichaHeaderBtnsTarget)) {
    html = html.replace(fichaHeaderBtnsTarget, fichaHeaderBtnsReplacement);
    console.log('[+] Direct career modification button added to Ficha modal header.');
}

// 5. In verFichaEstudiante JS function: store currentFichaEstudianteData
const verFichaDataAnchor = `const est = data.estudiante;`;
const verFichaDataReplacement = `const est = data.estudiante;
                window.currentFichaEstudianteData = est;`;

if (html.includes(verFichaDataAnchor)) {
    html = html.replace(verFichaDataAnchor, verFichaDataReplacement);
    console.log('[+] currentFichaEstudianteData stored in verFichaEstudiante.');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ Final index.html updated successfully! Size:', html.length);
