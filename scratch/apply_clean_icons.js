const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
console.log('Original size before clean icons:', html.length);

const replacements = [
    // 1. Sidebar action button: "+ Nuevo Movimiento" with fa-circle-plus
    {
        target: `                <i class="fa-solid fa-circle-plus text-sm"></i>
                <span>+ Nuevo Movimiento</span>`,
        replacement: `                <i class="fa-solid fa-circle-plus text-sm"></i>
                <span>Nuevo Movimiento</span>`
    },
    // 2. Sidebar nav-configuracion: duplicate gear emoji badge
    {
        target: `                <i class="fa-solid fa-gear w-4 text-center text-amber-400 text-xs"></i>
                <span class="truncate">CONFIGURACIÓN</span>
                <span class="ml-auto bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-black">⚙️</span>`,
        replacement: `                <i class="fa-solid fa-gear w-4 text-center text-amber-400 text-xs"></i>
                <span class="truncate">CONFIGURACIÓN</span>`
    },
    // 3. Sidebar footer icon: change fa-file-excel to fa-shield-halved (Database Backup)
    {
        target: `<button onclick="exportarYRespaldar()" title="Exportar y Respaldar Base de Datos" class="hover:text-emerald-400 transition p-1">
                <i class="fa-solid fa-file-excel text-emerald-400 text-sm"></i>
            </button>`,
        replacement: `<button onclick="exportarYRespaldar()" title="Exportar y Respaldar Base de Datos" class="hover:text-emerald-400 transition p-1">
                <i class="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
            </button>`
    },
    // 4. Header action button: "+ Movimiento" with fa-plus-circle
    {
        target: `                <!-- Nuevo Movimiento Rápido -->
                <button onclick="abrirModalNuevoMovimiento()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/25">
                    <i class="fa-solid fa-plus-circle"></i>
                    <span>+ Movimiento</span>
                </button>`,
        replacement: `                <!-- Nuevo Movimiento Rápido -->
                <button onclick="abrirModalNuevoMovimiento()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/25">
                    <i class="fa-solid fa-plus-circle"></i>
                    <span>Nuevo Movimiento</span>
                </button>`
    },
    // 5. Section Grupos buttons: Modificar & Eliminar
    {
        target: `                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>✏️ Modificar Sección y Turno</span>`,
        replacement: `                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>Modificar Sección y Turno</span>`
    },
    {
        target: `                                    <i class="fa-solid fa-trash-can"></i>
                                    <span>🗑️ Eliminar</span>`,
        replacement: `                                    <i class="fa-solid fa-trash-can"></i>
                                    <span>Eliminar Sección</span>`
    },
    // 6. Section Grupos Quick Movement buttons
    {
        target: `                                    <i class="fa-solid fa-circle-arrow-down text-emerald-600 text-sm"></i>
                                    <span>🟢 INGRESO (Entrada de Dinero)</span>`,
        replacement: `                                    <i class="fa-solid fa-circle-arrow-down text-emerald-600 text-sm"></i>
                                    <span>INGRESO (Entrada de Dinero)</span>`
    },
    {
        target: `                                    <i class="fa-solid fa-circle-arrow-up text-rose-500 text-sm"></i>
                                    <span>🔴 EGRESO (Salida / Gasto de Clase)</span>`,
        replacement: `                                    <i class="fa-solid fa-circle-arrow-up text-rose-500 text-sm"></i>
                                    <span>EGRESO (Salida / Gasto de Clase)</span>`
    },
    {
        target: `                                    <i class="fa-solid fa-floppy-disk"></i>
                                    <span>💾 Guardar y Añadir a Esta Sección</span>`,
        replacement: `                                    <i class="fa-solid fa-floppy-disk"></i>
                                    <span>Guardar y Añadir a Esta Sección</span>`
    },
    // 7. Section Carreras buttons
    {
        target: `                        <button onclick="abrirModalNuevaCarrera()" class="cyber-btn bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>➕ Nueva Carrera</span>
                        </button>
                        <button onclick="cambiarSeccion('configuracion')" class="cyber-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/30 transition">
                            <i class="fa-solid fa-sliders"></i>
                            <span>⚙️ Configurar Nombres</span>
                        </button>`,
        replacement: `                        <button onclick="abrirModalNuevaCarrera()" class="cyber-btn bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>Nueva Carrera</span>
                        </button>
                        <button onclick="cambiarSeccion('configuracion')" class="cyber-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/30 transition">
                            <i class="fa-solid fa-sliders"></i>
                            <span>Configurar Nombres</span>
                        </button>`
    },
    // 8. Section Configuracion Bloque 4 Carreras button
    {
        target: `                                <button type="button" onclick="abrirModalNuevaCarrera()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition">
                                    <i class="fa-solid fa-plus-circle"></i>
                                    <span>➕ Nueva Carrera</span>
                                </button>`,
        replacement: `                                <button type="button" onclick="abrirModalNuevaCarrera()" class="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition">
                                    <i class="fa-solid fa-plus-circle"></i>
                                    <span>Nueva Carrera</span>
                                </button>`
    },
    // 9. Modal Ficha Estudiante Modificar button
    {
        target: `                    <button onclick="cerrarModalFichaEstudiante(); abrirModalAsignarCarrera(currentFichaEstudianteData.id, currentFichaEstudianteData.nombre, currentFichaEstudianteData.carrera, currentFichaEstudianteData.grupo)" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>✏️ Modificar Carrera</span>
                    </button>`,
        replacement: `                    <button onclick="cerrarModalFichaEstudiante(); abrirModalAsignarCarrera(currentFichaEstudianteData.id, currentFichaEstudianteData.nombre, currentFichaEstudianteData.carrera, currentFichaEstudianteData.grupo)" class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>Modificar Carrera</span>
                    </button>`
    },
    // 10. Modal Nuevo Movimiento Ingreso & Egreso buttons
    {
        target: `                        <button type="button" id="btn-tipo-ingreso" onclick="seleccionarTipoMovimiento('Ingreso')" class="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm">
                            <i class="fa-solid fa-circle-arrow-down text-emerald-600 text-base"></i>
                            <span class="text-xs">🟢 INGRESO (Entrada de Dinero)</span>
                        </button>
                        <button type="button" id="btn-tipo-egreso" onclick="seleccionarTipoMovimiento('Egreso')" class="py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50 hover:text-rose-700">
                            <i class="fa-solid fa-circle-arrow-up text-rose-500 text-base"></i>
                            <span class="text-xs">🔴 EGRESO (Salida / Gasto)</span>
                        </button>`,
        replacement: `                        <button type="button" id="btn-tipo-ingreso" onclick="seleccionarTipoMovimiento('Ingreso')" class="py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm">
                            <i class="fa-solid fa-circle-arrow-down text-emerald-600 text-base"></i>
                            <span class="text-xs font-bold">INGRESO (Entrada de Dinero)</span>
                        </button>
                        <button type="button" id="btn-tipo-egreso" onclick="seleccionarTipoMovimiento('Egreso')" class="py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50 hover:text-rose-700">
                            <i class="fa-solid fa-circle-arrow-up text-rose-500 text-base"></i>
                            <span class="text-xs font-bold">EGRESO (Salida / Gasto)</span>
                        </button>`
    },
    // 11. Modal Asignar Carrera select and title
    {
        target: `tituloEl.innerText = esSinAsignar ? '➕ Asignar Carrera al Estudiante' : '✏️ Modificar o Cambiar Carrera';`,
        replacement: `tituloEl.innerText = esSinAsignar ? 'Asignar Carrera al Estudiante' : 'Modificar o Cambiar Carrera';`
    },
    {
        target: `<option value="Sin Asignar (Pendiente)">⏳ Sin Asignar (Pendiente)</option>`,
        replacement: `<option value="Sin Asignar (Pendiente)">Sin Asignar (Pendiente)</option>`
    },
    {
        target: `<option value="sin_asignar" class="text-amber-600 font-bold">⏳ Sin Asignar (Pendiente)</option>`,
        replacement: `<option value="sin_asignar" class="text-amber-600 font-bold">Sin Asignar (Pendiente)</option>`
    },
    // 12. Student Cards and Table rendering: remove double icons
    {
        target: `                                <i class="fa-solid \${esSinAsignar ? 'fa-user-plus' : 'fa-pen-to-square'}"></i>
                                <span>\${esSinAsignar ? '➕ Asignar Carrera' : '✏️ Modificar / Cambiar Carrera'}</span>`,
        replacement: `                                <i class="fa-solid \${esSinAsignar ? 'fa-user-plus' : 'fa-pen-to-square'}"></i>
                                <span>\${esSinAsignar ? 'Asignar Carrera' : 'Modificar / Cambiar Carrera'}</span>`
    },
    {
        target: `\${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}`,
        replacement: `\${e.estado_financiero === 'faltan_completar' ? 'Falta Completar' : (e.estado_financiero === 'deben_todo' ? 'Debe Total' : 'Al Día')}`
    },
    {
        target: `                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                    ⏳ Sin Asignar
                                </span>`,
        replacement: `                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                    Sin Asignar
                                </span>`
    },
    // 13. Tabs in Secciones / Grupos
    {
        target: `🌐 Todas las Secciones`,
        replacement: `Todas las Secciones`
    },
    // 14. Filter estudiantes estado options
    {
        target: `<option value="faltan_completar">🟠 Solo los que Faltan Completar (Abono Parcial)</option>
                            <option value="deben_todo">🔴 Solo los que Deben Todo (Sin Abonos)</option>
                            <option value="al_dia">🟢 Solo los que están Al Día (100% Pagado)</option>`,
        replacement: `<option value="faltan_completar">Solo los que Faltan Completar (Abono Parcial)</option>
                            <option value="deben_todo">Solo los que Deben Todo (Sin Abonos)</option>
                            <option value="al_dia">Solo los que están Al Día (100% Pagado)</option>`
    },
    // 15. In renderCarreras: clean up 👥 and 👨‍🏫 emojis to match Cyber-FinTech standard
    {
        target: `<div>👥 Matriculados: <strong class="text-slate-800 dark:text-white">\${c.total_alumnos || 0}</strong></div>
                            <div>👨‍🏫 Docentes: <strong class="text-slate-800 dark:text-white">\${c.total_docentes || 0}</strong></div>`,
        replacement: `<div><i class="fa-solid fa-user-graduate mr-1 text-slate-400"></i> Matriculados: <strong class="text-slate-800 dark:text-white">\${c.total_alumnos || 0}</strong></div>
                            <div><i class="fa-solid fa-chalkboard-user mr-1 text-slate-400"></i> Docentes: <strong class="text-slate-800 dark:text-white">\${c.total_docentes || 0}</strong></div>`
    },
    {
        target: `<td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-bold">
                                👥 \${c.total_alumnos || 0}
                            </td>
                            <td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-bold">
                                👨‍🏫 \${c.total_docentes || 0}
                            </td>`,
        replacement: `<td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-bold">
                                \${c.total_alumnos || 0}
                            </td>
                            <td class="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-bold">
                                \${c.total_docentes || 0}
                            </td>`
    },
    // 16. In section-configuracion text: clean up "(Teléfono y correo pendientes... en la pestaña ⚙️ Configuración)"
    {
        target: `pestaña ⚙️ Configuración`,
        replacement: `pestaña Configuración`
    }
];

let appliedCount = 0;
for (const r of replacements) {
    if (html.includes(r.target)) {
        html = html.replace(r.target, r.replacement);
        appliedCount++;
    } else {
        console.warn('Target not found:', r.target.slice(0, 60).replace(/\s+/g, ' '));
    }
}

fs.writeFileSync(filePath, html, 'utf8');
console.log(`✅ Applied ${appliedCount} / ${replacements.length} clean icon rules!`);
