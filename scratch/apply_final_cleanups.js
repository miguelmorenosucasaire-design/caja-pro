const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

const additionalReplacements = [
    {
        target: `pestaña ⚙️ Configuración`,
        replacement: `pestaña Configuración`
    },
    {
        target: `<div>👥 Matriculados: <strong class="text-slate-800 dark:text-slate-200">\${alumnos}</strong></div>
                            <div>👨‍🏫 Docentes: <strong class="text-slate-800 dark:text-slate-200">\${docentes}</strong></div>`,
        replacement: `<div><i class="fa-solid fa-user-graduate mr-1.5 text-indigo-400"></i> Matriculados: <strong class="text-slate-800 dark:text-slate-200">\${alumnos}</strong></div>
                            <div><i class="fa-solid fa-chalkboard-user mr-1.5 text-purple-400"></i> Docentes: <strong class="text-slate-800 dark:text-slate-200">\${docentes}</strong></div>`
    },
    {
        target: `<td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        👥 \${c.total_alumnos || 0}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        👨‍🏫 \${c.total_docentes || 0}
                    </td>`,
        replacement: `<td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        \${c.total_alumnos || 0}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        \${c.total_docentes || 0}
                    </td>`
    },
    {
        target: `⚡ Completar Totalidad`,
        replacement: `Completar Totalidad`
    },
    {
        target: `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">⚪ Sin Movimiento</span>`,
        replacement: `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Sin Movimiento</span>`
    },
    {
        target: `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">🔴 Déficit</span>`,
        replacement: `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">Déficit</span>`
    },
    {
        target: `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⚖️ En Equilibrio</span>`,
        replacement: `<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">En Equilibrio</span>`
    },
    {
        target: `html += \`<option value="sin_asignar">⚠️ Sin Asignar (Pendientes)</option>\`;`,
        replacement: `html += \`<option value="sin_asignar">Sin Asignar (Pendientes)</option>\`;`
    },
    {
        target: `🌐 Todas las Secciones (\${grupos.length})`,
        replacement: `Todas las Secciones (\${grupos.length})`
    },
    {
        target: `\${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}`,
        replacement: `\${e.estado_financiero === 'faltan_completar' ? 'Falta Completar' : (e.estado_financiero === 'deben_todo' ? 'Debe Total' : 'Al Día')}`
    }
];

let applied = 0;
for (const r of additionalReplacements) {
    if (html.includes(r.target)) {
        html = html.replace(new RegExp(r.target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), r.replacement);
        applied++;
    } else {
        console.warn('Target not found:', r.target.slice(0, 50));
    }
}

fs.writeFileSync(filePath, html, 'utf8');
console.log(`✅ Applied ${applied} / ${additionalReplacements.length} additional cleanups!`);
