const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Add payment breakdown bar in section-diario
const targetDiarioCards = `<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Ingresos del Día</p>
                        <h4 id="diario-ingresos" class="text-xl font-black text-emerald-600 mt-0.5">S/. 0.00</h4>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Pagos Recibidos</p>
                        <h4 id="diario-pagos-count" class="text-xl font-black text-slate-800 mt-0.5">0 Recibos</h4>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Gastos del Día</p>
                        <h4 id="diario-egresos" class="text-xl font-black text-rose-600 mt-0.5">S/. 0.00</h4>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Saldo Neto del Día</p>
                        <h4 id="diario-saldo" class="text-xl font-black text-indigo-600 mt-0.5">S/. 0.00</h4>
                    </div>
                </div>`;

const newDiarioCards = `<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Ingresos del Día</p>
                        <h4 id="diario-ingresos" class="text-xl font-black text-emerald-600 mt-0.5">S/. 0.00</h4>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Pagos Recibidos</p>
                        <h4 id="diario-pagos-count" class="text-xl font-black text-slate-800 dark:text-white mt-0.5">0 Recibos</h4>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Gastos del Día</p>
                        <h4 id="diario-egresos" class="text-xl font-black text-rose-600 mt-0.5">S/. 0.00</h4>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Saldo Neto del Día</p>
                        <h4 id="diario-saldo" class="text-xl font-black text-indigo-600 mt-0.5">S/. 0.00</h4>
                    </div>
                </div>

                <!-- Desglose por Medio de Pago del Día (Arqueo en Vivo) -->
                <div class="bg-slate-100 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span class="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-extrabold">
                        <i class="fa-solid fa-coins text-amber-500"></i> Desglose de Caja por Método:
                    </span>
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                            <i class="fa-solid fa-money-bill-wave text-emerald-500"></i> Efectivo: <b id="diario-metodo-efectivo" class="text-slate-900 dark:text-white">S/. 0.00</b>
                        </span>
                        <span class="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                            <i class="fa-solid fa-mobile-screen-button text-purple-500"></i> Yape / Plin: <b id="diario-metodo-yape" class="text-slate-900 dark:text-white">S/. 0.00</b>
                        </span>
                        <span class="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                            <i class="fa-solid fa-building-columns text-sky-500"></i> Transferencia: <b id="diario-metodo-transf" class="text-slate-900 dark:text-white">S/. 0.00</b>
                        </span>
                    </div>
                </div>`;

if (html.includes(targetDiarioCards)) {
    html = html.replace(targetDiarioCards, newDiarioCards);
    console.log('1. Diario payment method breakdown cards added');
} else {
    console.log('1. Target diario cards not found with exact spacing, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetDiarioCards.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newDiarioCards);
        console.log('1. Diario payment breakdown cards added with normalized newlines');
    }
}

// 2. Add duplicate detection pill in modal
const targetDniInput = `<input type="text" id="form-dni" maxlength="12" placeholder="Ej: 75936591" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">`;
const newDniInput = `<input type="text" id="form-dni" oninput="verificarDuplicadoEstudianteEnModal()" maxlength="12" placeholder="Ej: 75936591" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                            <div id="alerta-duplicado-dni" class="hidden mt-1 p-1.5 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-lg text-[10px] text-amber-800 dark:text-amber-200 font-bold flex items-center justify-between">
                                <span id="alerta-duplicado-texto">Estudiante ya registrado</span>
                                <button type="button" id="btn-autollenar-duplicado" class="text-indigo-600 dark:text-indigo-400 underline hover:font-black">Cargar</button>
                            </div>`;

if (html.includes(targetDniInput)) {
    html = html.replace(targetDniInput, newDniInput);
    console.log('2. Duplicate detection alert added under DNI in modal');
}

// 3. Update cargarDiario JS to populate breakdown methods
const targetCargarDiarioTbody = `document.getElementById('diario-saldo').innerText = fMoney(data.saldo || 0);`;
const newCargarDiarioTbody = `document.getElementById('diario-saldo').innerText = fMoney(data.saldo || 0);

                if (data.desglose_metodos) {
                    const elEf = document.getElementById('diario-metodo-efectivo');
                    if (elEf) elEf.innerText = fMoney(data.desglose_metodos.efectivo || 0);
                    const elYape = document.getElementById('diario-metodo-yape');
                    if (elYape) elYape.innerText = fMoney(data.desglose_metodos.yape || 0);
                    const elTr = document.getElementById('diario-metodo-transf');
                    if (elTr) elTr.innerText = fMoney(data.desglose_metodos.transferencia || 0);
                }`;

if (html.includes(targetCargarDiarioTbody)) {
    html = html.replace(targetCargarDiarioTbody, newCargarDiarioTbody);
    console.log('3. cargarDiario updated to populate payment method breakdown');
}

// 4. Add verification & keyboard shortcuts JS
const newOrchestrationJS = `
        // =========================================================================
        // DETECCIÓN INTELIGENTE DE ESTUDIANTES YA REGISTRADOS EN MODAL
        // =========================================================================
        function verificarDuplicadoEstudianteEnModal() {
            const dniVal = (document.getElementById('form-dni')?.value || '').trim();
            const alertBox = document.getElementById('alerta-duplicado-dni');
            const alertText = document.getElementById('alerta-duplicado-texto');
            const btnLoad = document.getElementById('btn-autollenar-duplicado');

            if (!dniVal || dniVal.length < 6 || typeof estudiantesGlobales === 'undefined') {
                if (alertBox) alertBox.classList.add('hidden');
                return;
            }

            const est = estudiantesGlobales.find(e => (e.dni && e.dni === dniVal) || (e.codigo && e.codigo === dniVal));
            if (est) {
                if (alertBox) alertBox.classList.remove('hidden');
                if (alertText) alertText.innerText = \`¡Ya registrado! \${est.nombre} (\${est.carrera || 'CETPRO'})\`;
                if (btnLoad) {
                    btnLoad.onclick = () => {
                        alSeleccionarEstudianteEnModal(est.id);
                        alertBox.classList.add('hidden');
                    };
                }
            } else {
                if (alertBox) alertBox.classList.add('hidden');
            }
        }

        // =========================================================================
        // ATAJOS DE TECLADO EJECUTIVOS (HOTKEYS) PARA TESORERÍA
        // =========================================================================
        document.addEventListener('keydown', function(e) {
            // F2 o Ctrl+M: Nuevo Movimiento
            if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm')) {
                e.preventDefault();
                abrirModalNuevoMovimiento();
            }
            // Esc: Cerrar Modales
            if (e.key === 'Escape') {
                cerrarModalNuevoMovimiento();
            }
        });
`;

const scriptEndIdx = html.lastIndexOf('</script>');
if (scriptEndIdx !== -1) {
    html = html.slice(0, scriptEndIdx) + '\n' + newOrchestrationJS + '\n' + html.slice(scriptEndIdx);
    console.log('4. Duplicate detection & keyboard shortcuts JS added');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('All orchestration frontend enhancements successfully written!');
