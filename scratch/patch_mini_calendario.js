const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8');

const target = `<!-- PANEL DE CALENDARIZACIÓN DE REGISTROS E INGRESOS -->
                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">`;

const replacement = `<!-- PANEL DE CALENDARIZACIÓN Y MINI-CALENDARIO DE ACTIVIDAD POR DÍA -->
                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shadow-inner">
                                <i class="fa-solid fa-calendar-check"></i>
                            </div>
                            <div>
                                <h4 class="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                                    Calendario Oficial de Actividad y Registros por Día
                                </h4>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                                    Los días se iluminan con colores según la cantidad de registros recibidos. Haz clic en cualquier día para ver la cantidad exacta y cargar el diario.
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 text-xs font-bold">
                            <span class="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1.5">
                                <i class="fa-regular fa-calendar text-indigo-500"></i>
                                <span id="diario-cal-dias-registrados">0 Días Registrados</span>
                            </span>
                            <span class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1.5">
                                <i class="fa-solid fa-coins text-emerald-500"></i>
                                <span id="diario-cal-total-ingresos">S/. 0.00 Total</span>
                            </span>
                        </div>
                    </div>

                    <!-- MINI-CALENDARIO INTERACTIVO POR MES (COLORES SEGÚN REGISTROS) -->
                    <div class="bg-slate-50/70 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div class="flex items-center space-x-2">
                                <button type="button" onclick="cambiarMesMiniCalendario(-1)" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition shadow-sm" title="Mes anterior">◀</button>
                                <span id="mini-cal-mes-titulo" class="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider min-w-[130px] text-center">Mes Año</span>
                                <button type="button" onclick="cambiarMesMiniCalendario(1)" class="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition shadow-sm" title="Mes siguiente">▶</button>
                                <button type="button" onclick="irAMesActualMiniCalendario()" class="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition">Hoy</button>
                            </div>

                            <!-- Leyenda de colores según cantidad de registros -->
                            <div class="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-sm"></span> 3+ Registros</span>
                                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-sky-500 inline-block shadow-sm"></span> 2 Registros</span>
                                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-amber-400 inline-block shadow-sm"></span> 1 Registro</span>
                                <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-800 inline-block border border-slate-300 dark:border-slate-700"></span> Sin Registro</span>
                            </div>
                        </div>

                        <!-- Grilla de días del Mini-Calendario -->
                        <div class="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase mb-1">
                            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                        </div>
                        <div id="mini-cal-grid-dias" class="grid grid-cols-7 gap-1.5">
                            <!-- Días inyectados dinámicamente con sus colores según registros -->
                        </div>

                        <!-- BANNER DINÁMICO: Cantidad de registros del día seleccionado -->
                        <div id="mini-cal-info-seleccion" class="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-calendar-day text-amber-500 text-sm"></i>
                                <span id="mini-cal-info-texto">Haz clic en cualquier día del calendario para ver la cantidad de registros e ingresos.</span>
                            </div>
                            <span id="mini-cal-info-monto" class="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">S/. 0.00</span>
                        </div>
                    </div>`;

const targetLF = target.replace(/\r\n/g, '\n');
const targetCRLF = targetLF.replace(/\n/g, '\r\n');

if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
    console.log('Mini-calendario reemplazado con éxito (CRLF).');
} else if (html.includes(targetLF)) {
    html = html.replace(targetLF, replacement);
    console.log('Mini-calendario reemplazado con éxito (LF).');
} else {
    console.error('No se pudo encontrar target de mini-calendario');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
