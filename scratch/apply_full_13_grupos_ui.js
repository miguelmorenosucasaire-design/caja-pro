const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// =========================================================================
// 1. AGREGAR MODAL DE EDITAR GRUPO Y MODAL DE EDITAR DOCENTE
// =========================================================================
const modalNuevoGrupoMarker = '<div id="modal-nuevo-grupo"';

const newModalsHTML = `<!-- MODAL MODIFICAR SECCIÓN / GRUPO Y TURNO -->
    <div id="modal-editar-grupo" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 no-print">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div class="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <div class="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-lg">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base">Modificar Sección / Grupo y Turno</h3>
                        <p class="text-[11px] text-amber-100">Cambia el nombre de la sección, programa de estudio, docente encargado y turno</p>
                    </div>
                </div>
                <button onclick="cerrarModalEditarGrupo()" class="text-white/80 hover:text-white text-lg p-1">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form id="form-editar-grupo" onsubmit="guardarEdicionGrupo(event)" class="p-6 space-y-4 text-xs">
                <input type="hidden" id="editar-grupo-id">

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Nombre de la Sección / Grupo *</label>
                    <input type="text" id="editar-grupo-nombre" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Programa de Estudio (Oficial) *</label>
                        <select id="editar-grupo-carrera" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                            <option value="Corte y Ensamblaje">Corte y Ensamblaje</option>
                            <option value="Peluquería y Barbería">Peluquería y Barbería</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                            <option value="Mecánica de Motos y Vehículo Afines">Mecánica de Motos y Vehículo Afines</option>
                            <option value="Carpintería Metálica">Carpintería Metálica</option>
                            <option value="Mantenimiento de Sistemas Eléctricos">Mantenimiento de Sistemas Eléctricos</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Turno Oficial *</label>
                        <select id="editar-grupo-turno" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                            <option value="Mañana">Mañana (M)</option>
                            <option value="Tarde">Tarde (T)</option>
                            <option value="Noche">Noche (N)</option>
                            <option value="Sábado y Domingo">Sábado y Domingo (S/D)</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Docente Encargado(a) *</label>
                        <input type="text" id="editar-grupo-encargado" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Horario de Clase *</label>
                        <input type="text" id="editar-grupo-horario" placeholder="Ej: Lun-Mié-Vie 8:00 - 13:00" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Aula / Taller Asignado</label>
                        <input type="text" id="editar-grupo-aula" placeholder="Ej: Taller de Confección 1" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Módulo / Descripción</label>
                        <input type="text" id="editar-grupo-desc" placeholder="Ej: Módulo I: Técnicas de trazado..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button type="button" onclick="cerrarModalEditarGrupo()" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">
                        Cancelar
                    </button>
                    <button type="submit" class="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/30 flex items-center space-x-2 transition">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Guardar Cambios de la Sección</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL MODIFICAR DOCENTE -->
    <div id="modal-editar-docente" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4 no-print">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <div class="p-5 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                    <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 text-lg">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-base">Modificar Datos del Docente</h3>
                        <p class="text-[11px] text-purple-200">Actualiza el nombre, programa a cargo, especialidad y teléfono</p>
                    </div>
                </div>
                <button onclick="cerrarModalEditarDocente()" class="text-slate-400 hover:text-white text-lg p-1">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form id="form-editar-docente" onsubmit="guardarEdicionDocente(event)" class="p-6 space-y-4 text-xs">
                <input type="hidden" id="editar-docente-id">

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Apellidos y Nombres del Docente *</label>
                    <input type="text" id="editar-docente-nombre" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Programa / Especialidad *</label>
                        <select id="editar-docente-carrera" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">
                            <option value="Corte y Ensamblaje">Corte y Ensamblaje</option>
                            <option value="Peluquería y Barbería">Peluquería y Barbería</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                            <option value="Mecánica de Motos y Vehículo Afines">Mecánica de Motos y Vehículo Afines</option>
                            <option value="Carpintería Metálica">Carpintería Metálica</option>
                            <option value="Mantenimiento de Sistemas Eléctricos">Mantenimiento de Sistemas Eléctricos</option>
                        </select>
                    </div>

                    <div>
                        <label class="block font-bold text-slate-700 mb-1">Teléfono / Celular</label>
                        <input type="text" id="editar-docente-telefono" placeholder="Ej: 951-234567" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Especialidad Detallada / Módulos a Cargo</label>
                    <input type="text" id="editar-docente-especialidad" placeholder="Ej: Trazado, tendido y corte de prendas de vestir" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 mb-1">Correo Electrónico Institucional</label>
                    <input type="email" id="editar-docente-email" placeholder="docente@cetpro.edu.pe" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none">
                </div>

                <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button type="button" onclick="cerrarModalEditarDocente()" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition">
                        Cancelar
                    </button>
                    <button type="submit" class="bg-purple-700 hover:bg-purple-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-700/30 flex items-center space-x-2 transition">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Guardar Cambios del Docente</span>
                    </button>
                </div>
            </form>
        </div>
    </div>\r\n\r\n    `;

if (html.includes(modalNuevoGrupoMarker) && !html.includes('id="modal-editar-grupo"')) {
    html = html.replace(modalNuevoGrupoMarker, newModalsHTML + modalNuevoGrupoMarker);
    console.log('[+] Modales de edición de grupos y docentes agregados a index.html');
}

// =========================================================================
// 2. ACTUALIZAR ENCABEZADO DE VISTA PLANTILLA SECCIÓN CON BOTÓN EDITAR
// =========================================================================
const oldHeaderPlantilla = `<div class="flex items-center space-x-3 no-print">
                                <button onclick="mostrarTodasLasSecciones()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition">
                                    <i class="fa-solid fa-arrow-left"></i>
                                    <span>Ver Todas las Secciones</span>
                                </button>`;

const newHeaderPlantilla = `<div class="flex items-center space-x-3 no-print">
                                <button onclick="abrirModalEditarGrupo(currentPlantillaGrupoId)" class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/25 transition">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                    <span>✏️ Modificar Sección y Turno</span>
                                </button>
                                <button onclick="mostrarTodasLasSecciones()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition">
                                    <i class="fa-solid fa-arrow-left"></i>
                                    <span>Ver Todas las Secciones</span>
                                </button>`;

if (html.includes(oldHeaderPlantilla)) {
    html = html.replace(oldHeaderPlantilla, newHeaderPlantilla);
    console.log('[+] Botón de editar sección agregado al encabezado de la plantilla');
}

// =========================================================================
// 3. ACTUALIZAR RENDERGRUPOS CON BOTONES Y PESTAÑAS DINÁMICAS
// =========================================================================
const oldRenderGruposMarker = `function renderGrupos(lista) {`;

const newRenderGruposFunction = `function renderTabsSecciones(grupos) {
            const container = document.getElementById('contenedor-tabs-secciones-dinamicas');
            if (!container) return;

            let htmlTabs = \`
                <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-black transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                    🌐 Todas las Secciones (\${grupos.length})
                </button>
            \`;

            grupos.forEach(g => {
                let badgeTurnoBg = 'bg-sky-500';
                if (g.turno === 'Tarde') badgeTurnoBg = 'bg-amber-500';
                if (g.turno === 'Noche') badgeTurnoBg = 'bg-purple-600';
                if (g.turno.includes('Sábado') || g.turno.includes('S/D')) badgeTurnoBg = 'bg-rose-500';

                const shortName = g.nombre.split(' - ')[0];
                htmlTabs += \`
                    <button onclick="verPlantillaSeccion(\${g.id})" id="tab-grupo-\${g.id}" class="tab-grupo-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0 border border-slate-200/90 bg-white">
                        <span class="w-2.5 h-2.5 rounded-full \${badgeTurnoBg} flex-shrink-0"></span>
                        <span class="truncate max-w-[150px]">\${shortName}</span>
                        <span class="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">\${g.turno}</span>
                    </button>
                \`;
            });

            container.innerHTML = htmlTabs;
        }

        function abrirModalEditarGrupo(grupoId) {
            const g = gruposGlobales.find(x => x.id == grupoId);
            if (!g) return;

            document.getElementById('editar-grupo-id').value = g.id;
            document.getElementById('editar-grupo-nombre').value = g.nombre;
            document.getElementById('editar-grupo-carrera').value = g.carrera;
            document.getElementById('editar-grupo-turno').value = g.turno || 'Mañana';
            document.getElementById('editar-grupo-encargado').value = g.encargado || '';
            document.getElementById('editar-grupo-horario').value = g.horario || '';
            document.getElementById('editar-grupo-aula').value = g.aula_taller || '';
            document.getElementById('editar-grupo-desc').value = g.descripcion || '';

            document.getElementById('modal-editar-grupo').classList.remove('hidden');
        }

        function cerrarModalEditarGrupo() {
            document.getElementById('modal-editar-grupo').classList.add('hidden');
        }

        async function guardarEdicionGrupo(e) {
            e.preventDefault();
            const grupoId = document.getElementById('editar-grupo-id').value;
            const payload = {
                nombre: document.getElementById('editar-grupo-nombre').value.trim(),
                carrera: document.getElementById('editar-grupo-carrera').value,
                turno: document.getElementById('editar-grupo-turno').value,
                encargado: document.getElementById('editar-grupo-encargado').value.trim(),
                horario: document.getElementById('editar-grupo-horario').value.trim(),
                aula_taller: document.getElementById('editar-grupo-aula').value.trim(),
                descripcion: document.getElementById('editar-grupo-desc').value.trim()
            };

            try {
                const res = await fetch(\`/api/grupos/\${grupoId}/editar\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarGrupo();
                    alert("✅ Sección y turno modificados exitosamente.");
                    await cargarGrupos();
                    if (!document.getElementById('vista-plantilla-seccion').classList.contains('hidden')) {
                        await verPlantillaSeccion(grupoId);
                    }
                } else {
                    alert("Error: " + (data.error || "No se pudo actualizar"));
                }
            } catch (err) {
                alert("Error de conexión al actualizar la sección");
            }
        }

        function abrirModalEditarDocente(docId) {
            const d = docentesGlobales.find(x => x.id == docId);
            if (!d) return;

            document.getElementById('editar-docente-id').value = d.id;
            document.getElementById('editar-docente-nombre').value = d.nombre;
            document.getElementById('editar-docente-carrera').value = d.carrera || 'Corte y Ensamblaje';
            document.getElementById('editar-docente-telefono').value = d.telefono || '';
            document.getElementById('editar-docente-especialidad').value = d.especialidad || '';
            document.getElementById('editar-docente-email').value = d.email || '';

            document.getElementById('modal-editar-docente').classList.remove('hidden');
        }

        function cerrarModalEditarDocente() {
            document.getElementById('modal-editar-docente').classList.add('hidden');
        }

        async function guardarEdicionDocente(e) {
            e.preventDefault();
            const docId = document.getElementById('editar-docente-id').value;
            const payload = {
                nombre: document.getElementById('editar-docente-nombre').value.trim(),
                carrera: document.getElementById('editar-docente-carrera').value,
                telefono: document.getElementById('editar-docente-telefono').value.trim(),
                especialidad: document.getElementById('editar-docente-especialidad').value.trim(),
                email: document.getElementById('editar-docente-email').value.trim()
            };

            try {
                const res = await fetch(\`/api/docentes/\${docId}/editar\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarDocente();
                    alert("✅ Datos del docente modificados exitosamente.");
                    await cargarDocentes();
                    await cargarGrupos();
                } else {
                    alert("Error: " + (data.error || "No se pudo actualizar"));
                }
            } catch (err) {
                alert("Error de conexión al actualizar docente");
            }
        }

        function renderGrupos(lista) {`;

if (html.includes(oldRenderGruposMarker) && !html.includes('function abrirModalEditarGrupo')) {
    html = html.replace(oldRenderGruposMarker, newRenderGruposFunction);
    console.log('[+] Funciones de edición y tabs dinámicos agregados a index.html');
}

// 4. Reemplazar contenedor de tabs de grupos en HTML para que use ID dinámico
const oldTabsHTML = `<div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>Sección:</span>
                    </span>

                    <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                        🌐 Todas las Secciones
                    </button>`;

const newTabsContainer = `<div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2 overflow-x-auto custom-scrollbar no-print" id="contenedor-tabs-secciones-dinamicas">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1.5 flex-shrink-0">
                        <i class="fa-solid fa-layer-group text-indigo-600"></i>
                        <span>Sección (13 Grupos):</span>
                    </span>`;

if (html.includes(oldTabsHTML)) {
    const endTabs = html.indexOf('</div>\r\n\r\n                <!-- CONTENEDOR 1: VISTA GENERAL', html.indexOf(oldTabsHTML));
    if (endTabs > -1) {
        html = html.substring(0, html.indexOf(oldTabsHTML)) + newTabsContainer + '\r\n                </div>' + html.substring(endTabs + 6);
        console.log('[+] Contenedor de tabs de secciones actualizado a dinámico');
    }
}

// 5. En cargarGrupos, llamar a renderTabsSecciones(gruposGlobales)
const cargarGruposTarget = `renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);`;

const newCargarGruposCalls = `renderGrupos(gruposGlobales);
                renderTabsSecciones(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);`;

if (html.includes(cargarGruposTarget)) {
    html = html.replace(cargarGruposTarget, newCargarGruposCalls);
    console.log('[+] renderTabsSecciones integrado en cargarGrupos');
}

// 6. En renderGrupos, agregar el botón de modificar a cada tarjeta
const oldButtonsTarjeta = `<button onclick="abrirModalNuevoMovimientoParaGrupo(encodeURIComponent(g.nombre), encodeURIComponent(g.encargado), encodeURIComponent(g.carrera))" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm">
                                    <i class="fa-solid fa-money-bill-wave"></i>
                                    <span>Ingresar Cantidad</span>
                                </button>`;

const newButtonsTarjeta = `<button onclick="abrirModalEditarGrupo(\${g.id})" class="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1" title="Modificar nombre de sección, turno y docente">
                                    <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                    <span>✏️ Modificar Turno/Nombre</span>
                                </button>
                                <button onclick="verPlantillaSeccion(\${g.id})" class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm">
                                    <i class="fa-solid fa-table-list"></i>
                                    <span>📋 Ver Plantilla</span>
                                </button>
                                <button onclick="abrirModalNuevoMovimientoParaGrupo(encodeURIComponent(g.nombre), encodeURIComponent(g.encargado), encodeURIComponent(g.carrera))" class="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm" title="Ingresar cantidad / movimiento">
                                    <i class="fa-solid fa-plus"></i>
                                </button>`;

if (html.includes(oldButtonsTarjeta)) {
    html = html.replace(oldButtonsTarjeta, newButtonsTarjeta);
    console.log('[+] Botones de modificar turno/nombre y plantilla agregados a las tarjetas');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('[OK] index.html actualizado exitosamente.');
