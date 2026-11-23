const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8');

const target = `const calendarizacion = data.calendarizacion || [];

                const elDias = document.getElementById('diario-cal-dias-registrados');`;

const replacement = `const calendarizacion = data.calendarizacion || [];
                calendarizacionGlobal = calendarizacion;
                if (typeof renderizarMiniCalendarioGrid === 'function') renderizarMiniCalendarioGrid();

                const elDias = document.getElementById('diario-cal-dias-registrados');`;

const targetLF = target.replace(/\r\n/g, '\n');
const targetCRLF = targetLF.replace(/\n/g, '\r\n');

if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
    console.log('Target replaced CRLF');
} else if (html.includes(targetLF)) {
    html = html.replace(targetLF, replacement);
    console.log('Target replaced LF');
} else {
    console.error('Target not found');
}

// Update the carrusel colors in cargarCalendarizacionDiario
const carruselTarget = `container.innerHTML = calendarizacion.map(d => {
                    const esActivo = d.fecha === fechaSeleccionada;
                    const fPartes = d.fecha.split('-');
                    const fechaBonita = fPartes.length === 3 ? \`\${fPartes[2]}/\${fPartes[1]}/\${fPartes[0]}\` : d.fecha;

                    return \`
                        <button type="button" onclick="seleccionarDiaEnCalendarizacion('\${d.fecha}')" class="flex-shrink-0 px-3.5 py-2 rounded-xl border text-left transition shadow-sm \${esActivo ? 'bg-amber-500 text-slate-950 border-amber-600 font-black scale-105 shadow-amber-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50/50'}">
                            <div class="flex items-center space-x-1.5 text-[11px] font-extrabold">
                                <i class="fa-regular fa-calendar-check \${esActivo ? 'text-slate-950' : 'text-amber-500'}"></i>
                                <span>\${fechaBonita}</span>
                            </div>
                            <div class="text-[10px] \${esActivo ? 'text-slate-900 font-bold' : 'text-slate-500 dark:text-slate-400'} mt-0.5">
                                \${d.total_recibos} \${d.total_recibos === 1 ? 'recibo' : 'recibos'} • \${fMoney(d.total_monto)}
                            </div>
                        </button>
                    \`;
                }).join('');`;

const carruselReplacement = `container.innerHTML = calendarizacion.map(d => {
                    const esActivo = d.fecha === fechaSeleccionada;
                    const fPartes = d.fecha.split('-');
                    const fechaBonita = fPartes.length === 3 ? \`\${fPartes[2]}/\${fPartes[1]}/\${fPartes[0]}\` : d.fecha;
                    const nRecibos = d.total_recibos || 0;

                    // Colores según los registros
                    let pillColorClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800';
                    let dotColor = 'bg-amber-500';

                    if (nRecibos >= 3) {
                        pillColorClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
                        dotColor = 'bg-emerald-500';
                    } else if (nRecibos === 2) {
                        pillColorClass = 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800';
                        dotColor = 'bg-sky-500';
                    }

                    if (esActivo) {
                        pillColorClass = 'bg-amber-500 text-slate-950 border-amber-600 font-black scale-105 shadow-md shadow-amber-500/30 ring-2 ring-amber-400';
                        dotColor = 'bg-slate-950';
                    }

                    return \`
                        <button type="button" onclick="seleccionarDiaEnCalendarizacion('\${d.fecha}')" class="flex-shrink-0 px-3.5 py-2 rounded-xl border text-left transition shadow-sm \${pillColorClass}">
                            <div class="flex items-center space-x-1.5 text-[11px] font-extrabold">
                                <span class="w-2 h-2 rounded-full \${dotColor} inline-block"></span>
                                <span>\${fechaBonita}</span>
                            </div>
                            <div class="text-[10px] mt-0.5 font-bold">
                                \${d.total_recibos} \${d.total_recibos === 1 ? 'registro' : 'registros'} • \${fMoney(d.total_monto)}
                            </div>
                        </button>
                    \`;
                }).join('');`;

const cTargetLF = carruselTarget.replace(/\r\n/g, '\n');
const cTargetCRLF = cTargetLF.replace(/\n/g, '\r\n');

if (html.includes(cTargetCRLF)) {
    html = html.replace(cTargetCRLF, carruselReplacement.replace(/\n/g, '\r\n'));
    console.log('Carrusel colors replaced CRLF');
} else if (html.includes(cTargetLF)) {
    html = html.replace(cTargetLF, carruselReplacement);
    console.log('Carrusel colors replaced LF');
} else {
    console.error('Carrusel target not found');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
