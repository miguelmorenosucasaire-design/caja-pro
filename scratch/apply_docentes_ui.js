const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

const targetAnchor = 'grid.innerHTML = docentes.map(d => {';
const targetEnd = '<div class="space-y-2.5 pt-3 border-t border-slate-100 text-xs">';

const startIdx = html.indexOf(targetAnchor);
const endIdx = html.indexOf(targetEnd, startIdx);

if (startIdx === -1 || endIdx === -1) {
    throw new Error('Anchor not found for cargarDocentes');
}

const replacement = `grid.innerHTML = docentes.map(d => {
                    const partes = (d.nombre || '').split(', ');
                    const apellidos = partes[0] || d.nombre;
                    const nombres = partes[1] || '';
                    const iniciales = ((nombres ? nombres[0] : '') + (apellidos ? apellidos[0] : '')).toUpperCase();

                    const badgeTurno = d.turno === 'Mañana' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' :
                                       (d.turno === 'Tarde' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300' :
                                       (d.turno === 'Noche' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300' :
                                       'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'));

                    const badgeCargo = d.cargo === 'DIRECTOR' ? 'bg-amber-500 text-slate-950 font-black' :
                                      (d.cargo === 'Docente' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300');

                    return \`
                        <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                            <div>
                                <div class="flex items-center space-x-3 mb-4">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr \${d.cargo === 'DIRECTOR' ? 'from-amber-500 to-yellow-400 text-slate-950 font-black' : 'from-indigo-600 to-sky-500 text-white font-extrabold'} flex items-center justify-center text-sm shadow-md flex-shrink-0">
                                        \${iniciales || 'DOC'}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between gap-1 mb-1">
                                            <span class="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md \${badgeCargo}">
                                                \${d.cargo || 'Docente'}
                                            </span>
                                            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border \${badgeTurno}">
                                                <i class="fa-solid fa-clock mr-1"></i>\${d.turno || 'Mañana'}
                                            </span>
                                        </div>
                                        <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate" title="\${d.nombre}">\${d.nombre}</h4>
                                        <p class="text-xs text-sky-700 dark:text-sky-400 font-semibold truncate">\${d.carrera}</p>
                                        <p class="text-[10px] text-slate-400 truncate mt-0.5"><i class="fa-solid fa-chalkboard-user mr-1 text-slate-400"></i>\${d.especialidad || 'Especialidad Oficial'}</p>
                                    </div>
                                </div>\n\n                                `;

html = html.slice(0, startIdx) + replacement + html.slice(endIdx);
fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ templates/index.html updated successfully with Docentes card UI!');
