const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8');

const badSnippet = `if (grid) grid.innerHTML = '<div class="col-span-12 p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-xl mb-2">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">No hay ningún estudiante en Deudores</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Los estudiantes solo aparecerán en esta sección cuando los escojas o asignes manualmente usando el botón naranja <strong>'+ Asignar Deudor / Cuota Pendiente'</strong> arriba.
                    </p>
                </div>';`;

const goodSnippet = `if (grid) grid.innerHTML = \`<div class="col-span-12 p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-xl mb-2">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">No hay ningún estudiante en Deudores</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Los estudiantes solo aparecerán en esta sección cuando los escojas o asignes manualmente usando el botón naranja <strong>'+ Asignar Deudor / Cuota Pendiente'</strong> arriba.
                    </p>
                </div>\`;`;

const badLF = badSnippet.replace(/\r\n/g, '\n');
const badCRLF = badLF.replace(/\n/g, '\r\n');

if (html.includes(badCRLF)) {
    html = html.replace(badCRLF, goodSnippet.replace(/\n/g, '\r\n'));
    console.log('Fixed badSnippet CRLF');
} else if (html.includes(badLF)) {
    html = html.replace(badLF, goodSnippet);
    console.log('Fixed badSnippet LF');
} else {
    console.log('Regex replace...');
    html = html.replace(/if\s*\(grid\)\s*grid\.innerHTML\s*=\s*'[\s\S]*?<\/div>';/, goodSnippet);
}

fs.writeFileSync('templates/index.html', html, 'utf8');
