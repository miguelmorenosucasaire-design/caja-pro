const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Update Boleta Header Logo (replace <img class="recibo__logo-minedu" ...> with crisp minedu_barras + text)
const oldMineduImg1 = '<img class="recibo__logo-minedu logo-minedu-nitido" src="/public/img/minedu_azul.svg" alt="Ministerio de Educación" />';
const newMineduLogo1 = `<div class="recibo__ministerio flex flex-col items-center justify-center">
                    <img src="/public/img/minedu_barras.png" alt="Ministerio de Educación" class="logo-minedu-nitido" style="width: 85px; height: auto; max-height: 40px; object-fit: contain;" onerror="if(!this.dataset.fallback){this.dataset.fallback=1; this.src='/public/img/minedu_azul.svg';}">
                    <b class="text-[7.5px] font-bold mt-1 text-[#2258a8] leading-tight text-center uppercase tracking-tight block">Ministerio de Educación</b>
                    <small class="text-[5.5px] font-bold text-[#2258a8] leading-none text-center uppercase tracking-wider block">República del Perú</small>
                </div>`;

const newMineduLogo2 = `<div class="recibo__ministerio flex flex-col items-center justify-center">
                    <img src="/public/img/minedu_barras_azul.png" alt="Ministerio de Educación" class="logo-minedu-nitido" style="width: 85px; height: auto; max-height: 40px; object-fit: contain;" onerror="if(!this.dataset.fallback){this.dataset.fallback=1; this.src='/public/img/minedu_azul.svg';}">
                    <b class="text-[7.5px] font-bold mt-1 text-[#2258a8] leading-tight text-center uppercase tracking-tight block">Ministerio de Educación</b>
                    <small class="text-[5.5px] font-bold text-[#2258a8] leading-none text-center uppercase tracking-wider block">República del Perú</small>
                </div>`;

// Replace first occurrence in original and second in copia
if (html.includes(oldMineduImg1)) {
    html = html.replace(oldMineduImg1, newMineduLogo1);
    html = html.replace(oldMineduImg1, newMineduLogo2);
    console.log('Minedu logos replaced successfully in both vouchers');
} else {
    console.log('Warning: oldMineduImg1 not found directly');
}

// 2. Add visible DNI and Celular next to Señor (a) in boleta
const oldEstudiante1 = '<div class="recibo__campo">Señor (a): <span class="punteado" id="factura-estudiante"></span></div>';
const newEstudiante1 = `<div class="recibo__campo">Señor (a): <span class="punteado" id="factura-estudiante"></span> <span class="text-[11px] font-bold text-slate-800 ml-2 whitespace-nowrap" id="factura-contacto-row">(DNI: <span id="factura-dni"></span> - Cel: <span id="factura-telefono"></span>)</span></div>`;

const oldEstudiante2 = '<div class="recibo__campo">Señor (a): <span class="punteado" id="copia-factura-estudiante"></span></div>';
const newEstudiante2 = `<div class="recibo__campo">Señor (a): <span class="punteado" id="copia-factura-estudiante"></span> <span class="text-[11px] font-bold text-slate-800 ml-2 whitespace-nowrap" id="copia-factura-contacto-row">(DNI: <span id="copia-factura-dni"></span> - Cel: <span id="copia-factura-telefono"></span>)</span></div>`;

if (html.includes(oldEstudiante1)) {
    html = html.replace(oldEstudiante1, newEstudiante1);
    console.log('Señor (a) original replaced');
}
if (html.includes(oldEstudiante2)) {
    html = html.replace(oldEstudiante2, newEstudiante2);
    console.log('Señor (a) copia replaced');
}

// 3. Update Modal Movimiento (Section 2, 3 and 3.1)
const startModalSection2 = '<!-- 2. SECCIÓN POR GRUPO Y ENCARGADO DE ESA CLASE -->';
const endModalSection31 = '<!-- 4. CONCEPTO Y NOTA -->';

const idxStartModal = html.indexOf(startModalSection2);
const idxEndModal = html.indexOf(endModalSection31);

console.log('Modal Section indexes:', idxStartModal, idxEndModal);

if (idxStartModal !== -1 && idxEndModal !== -1) {
    const newModalBody = `<!-- 2. SECCIÓN POR GRUPO Y ENCARGADO DE ESA CLASE -->
                <div class="bg-indigo-50/50 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                    <div class="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                        <i class="fa-solid fa-users-rectangle text-indigo-600 dark:text-indigo-400"></i>
                        <span>2. Sección por Grupo y Encargado de esa Clase</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Grupo o Sección</label>
                            <select id="form-grupo" onchange="alCambiarGrupoEnModal()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs text-slate-900 dark:text-white shadow-sm">
                                <option value="General">General / Institucional</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Docente / Encargado de la Clase</label>
                            <select id="form-encargado" onchange="alCambiarDocenteEncargadoEnModal()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs text-slate-900 dark:text-white shadow-sm">
                                <option value="General">General / Institucional</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 3. PERSONA, ROL Y ESPECIALIDAD (SEPARACIÓN POR ROLES: ESTUDIANTE, DOCENTE, INSTITUCIÓN) -->
                <div class="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                            3. Tipo de Persona / Beneficiario *
                        </label>
                        <!-- Selector de 3 pestañas: Estudiante, Docente, Institución -->
                        <div class="inline-flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl space-x-1" id="tabs-rol-persona">
                            <button type="button" id="tab-rol-estudiante" onclick="seleccionarRolPersonaModal('Estudiante')" class="px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1">
                                <i class="fa-solid fa-graduation-cap"></i>
                                <span>Estudiante</span>
                            </button>
                            <button type="button" id="tab-rol-docente" onclick="seleccionarRolPersonaModal('Docente')" class="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1">
                                <i class="fa-solid fa-chalkboard-user"></i>
                                <span>Docente</span>
                            </button>
                            <button type="button" id="tab-rol-general" onclick="seleccionarRolPersonaModal('General')" class="px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1">
                                <i class="fa-solid fa-building-columns"></i>
                                <span>Institución</span>
                            </button>
                        </div>
                        <input type="hidden" id="form-rol" value="Estudiante">
                    </div>

                    <!-- Si es Estudiante: selector rápido de estudiante o campo manual -->
                    <div id="contenedor-seleccion-estudiante" class="space-y-1.5">
                        <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Buscar Estudiante de la Nómina (autocompleta DNI, Celular, Carrera y Grupo):
                        </label>
                        <select id="select-estudiante-modal" onchange="alSeleccionarEstudianteEnModal(this.value)" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                            <option value="">-- Seleccionar Estudiante Registrado o Escribir Manual Abajo --</option>
                        </select>
                    </div>

                    <!-- Si es Docente: selector de todos los docentes institucionales -->
                    <div id="contenedor-seleccion-docente" class="hidden space-y-1.5">
                        <label class="block text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                            Docente Institucional (al seleccionar se llena su nombre, especialidad y grupo asignado):
                        </label>
                        <select id="select-docente-persona-modal" onchange="alSeleccionarDocentePersonaEnModal(this.value)" class="w-full bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl px-3.5 py-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm">
                            <option value="">-- Seleccionar Docente de la Institución --</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo (*)</label>
                            <input type="text" id="form-nombre" list="lista-estudiantes-sugerencias" oninput="alEscribirNombreEnModal()" required placeholder="Ej: Fernando Quispe / Prof. Carlos" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs">
                            <datalist id="lista-estudiantes-sugerencias"></datalist>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad / Carrera (*)</label>
                            <select id="form-carrera" required class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs">
                                <option value="Computación e Informática">Computación e Informática</option>
                                <option value="Corte y Ensamblaje">Corte y Ensamblaje (Confección Textil)</option>
                                <option value="Peluquería y Barbería">Peluquería y Barbería (Cosmetología)</option>
                                <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                                <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                                <option value="Mecánica de Motos">Mecánica de Motos</option>
                                <option value="Carpintería Metálica">Carpintería Metálica</option>
                                <option value="Contabilidad y Finanzas">Contabilidad y Finanzas</option>
                                <option value="General">General / Institucional</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 3.1 CAMPOS NUMÉRICOS OFICIALES (N° COMPROBANTE, DNI, CELULAR Y TURNO) -->
                <div class="bg-amber-50/70 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200/90 dark:border-amber-900/60 space-y-2.5">
                    <div class="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                        <i class="fa-solid fa-receipt text-amber-600"></i>
                        <span>Control Numérico de Caja (N° Comprobante, DNI y Celular)</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                <i class="fa-solid fa-hashtag text-rose-500 mr-1 text-[11px]"></i>
                                <span>N° Comprobante / Recibo</span>
                            </label>
                            <input type="text" id="form-comprobante" placeholder="Ej: 0000808" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-red-600 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                            <span class="text-[10px] text-slate-500 dark:text-slate-400">Correlativo sugerido</span>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                <i class="fa-solid fa-id-card text-sky-500 mr-1 text-[11px]"></i>
                                <span>DNI de la Persona</span>
                            </label>
                            <input type="text" id="form-dni" maxlength="12" placeholder="Ej: 75936591" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                            <span class="text-[10px] text-slate-500 dark:text-slate-400">8 dígitos DNI</span>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                <i class="fa-solid fa-phone text-emerald-500 mr-1 text-[11px]"></i>
                                <span>Celular / Teléfono</span>
                            </label>
                            <input type="text" id="form-telefono" maxlength="15" placeholder="Ej: 981763281" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs">
                            <span class="text-[10px] text-slate-500 dark:text-slate-400">Número de contacto</span>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                <i class="fa-regular fa-clock text-indigo-500 mr-1 text-[11px]"></i>
                                <span>Turno</span>
                            </label>
                            <select id="form-turno" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs text-slate-800 dark:text-white">
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde" selected>Tarde</option>
                                <option value="Noche">Noche</option>
                                <option value="Sábado">Sábado</option>
                                <option value="Virtual">Virtual</option>
                            </select>
                            <span class="text-[10px] text-slate-500 dark:text-slate-400">Horario de clase</span>
                        </div>
                    </div>
                </div>

                `;
    html = html.substring(0, idxStartModal) + newModalBody + html.substring(idxEndModal);
    console.log('Modal section replaced successfully');
}

// 4. Update JS functions in templates/index.html
const oldAlCambiarGrupo = `        function alCambiarGrupoEnModal() {
            const selectGrupo = document.getElementById('form-grupo');
            const grupoNombre = selectGrupo.value;
            const inputEncargado = document.getElementById('form-encargado');
            const selectCarrera = document.getElementById('form-carrera');

            if (grupoNombre === 'General') {
                if (inputEncargado) inputEncargado.value = 'General';
                return;
            }

            const grupo = gruposGlobales.find(g => g.nombre === grupoNombre);
            if (grupo) {
                if (inputEncargado) inputEncargado.value = grupo.encargado;
                if (selectCarrera) selectCarrera.value = grupo.carrera;
            }
        }`;

const newModalJS = `        // -------------------------------------------------------------
        // GESTIÓN REACTIVA DE ROLES, GRUPOS Y DOCENTES EN MODAL MOVIMIENTO
        // -------------------------------------------------------------
        function seleccionarRolPersonaModal(rol) {
            const elRol = document.getElementById('form-rol');
            if (elRol) elRol.value = rol;

            const btnEst = document.getElementById('tab-rol-estudiante');
            const btnDoc = document.getElementById('tab-rol-docente');
            const btnGen = document.getElementById('tab-rol-general');
            const cEst = document.getElementById('contenedor-seleccion-estudiante');
            const cDoc = document.getElementById('contenedor-seleccion-docente');

            [btnEst, btnDoc, btnGen].forEach(b => {
                if (b) b.className = 'px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1';
            });

            if (rol === 'Estudiante') {
                if (btnEst) btnEst.className = 'px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (cEst) cEst.classList.remove('hidden');
                if (cDoc) cDoc.classList.add('hidden');
            } else if (rol === 'Docente') {
                if (btnDoc) btnDoc.className = 'px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (cEst) cEst.classList.add('hidden');
                if (cDoc) cDoc.classList.remove('hidden');
            } else {
                if (btnGen) btnGen.className = 'px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (cEst) cEst.classList.add('hidden');
                if (cDoc) cDoc.classList.add('hidden');
                const inpNom = document.getElementById('form-nombre');
                if (inpNom && !inpNom.value) inpNom.value = 'General / Institucional';
                const selCarr = document.getElementById('form-carrera');
                if (selCarr) selCarr.value = 'General';
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = 'General';
                const selEnc = document.getElementById('form-encargado');
                if (selEnc) selEnc.value = 'General';
            }
        }

        function alSeleccionarEstudianteEnModal(estId) {
            if (!estId) return;
            const est = (estudiantesGlobales || []).find(e => e.id == estId || e.nombre == estId);
            if (!est) return;

            const inpNom = document.getElementById('form-nombre');
            if (inpNom) inpNom.value = est.nombre || '';

            const inpDni = document.getElementById('form-dni');
            if (inpDni && est.dni) inpDni.value = est.dni;

            const inpTel = document.getElementById('form-telefono');
            if (inpTel && est.telefono) inpTel.value = est.telefono;

            const selCarr = document.getElementById('form-carrera');
            if (selCarr && est.carrera) selCarr.value = est.carrera;

            const selTurno = document.getElementById('form-turno');
            if (selTurno && est.turno) selTurno.value = est.turno;

            const selGrp = document.getElementById('form-grupo');
            if (selGrp && est.grupo) {
                selGrp.value = est.grupo;
                alCambiarGrupoEnModal();
            }
        }

        function alSeleccionarDocentePersonaEnModal(docNombre) {
            if (!docNombre) return;
            const doc = (docentesGlobales || []).find(d => d.nombre === docNombre);
            if (!doc) return;

            const inpNom = document.getElementById('form-nombre');
            if (inpNom) inpNom.value = doc.nombre;

            const selCarr = document.getElementById('form-carrera');
            if (selCarr && doc.carrera) selCarr.value = doc.carrera;

            const selTurno = document.getElementById('form-turno');
            if (selTurno && doc.turno) selTurno.value = doc.turno;

            const selEnc = document.getElementById('form-encargado');
            if (selEnc) selEnc.value = doc.nombre;

            // Auto-seleccionar grupo a cargo de este docente
            const grp = (gruposGlobales || []).find(g => g.encargado === doc.nombre || (doc.carrera && g.carrera === doc.carrera));
            if (grp) {
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = grp.nombre;
            }
        }

        function alCambiarDocenteEncargadoEnModal() {
            const selEnc = document.getElementById('form-encargado');
            if (!selEnc) return;
            const docNombre = selEnc.value;
            if (docNombre === 'General') {
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = 'General';
                return;
            }

            const grp = (gruposGlobales || []).find(g => g.encargado === docNombre);
            if (grp) {
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = grp.nombre;

                const selCarr = document.getElementById('form-carrera');
                if (selCarr && grp.carrera) selCarr.value = grp.carrera;

                const selTurno = document.getElementById('form-turno');
                if (selTurno && grp.turno) selTurno.value = grp.turno;
            }
        }

        function alCambiarGrupoEnModal() {
            const selectGrupo = document.getElementById('form-grupo');
            const grupoNombre = selectGrupo ? selectGrupo.value : 'General';
            const selectEncargado = document.getElementById('form-encargado');
            const selectCarrera = document.getElementById('form-carrera');
            const selectTurno = document.getElementById('form-turno');

            if (grupoNombre === 'General') {
                if (selectEncargado) selectEncargado.value = 'General';
                return;
            }

            const grupo = (gruposGlobales || []).find(g => g.nombre === grupoNombre);
            if (grupo) {
                if (selectEncargado) selectEncargado.value = grupo.encargado || 'General';
                if (selectCarrera && grupo.carrera) selectCarrera.value = grupo.carrera;
                if (selectTurno && grupo.turno) selectTurno.value = grupo.turno;
            }
        }`;

if (html.includes(oldAlCambiarGrupo)) {
    html = html.replace(oldAlCambiarGrupo, newModalJS);
    console.log('alCambiarGrupo and helpers replaced successfully');
} else {
    console.log('Warning: oldAlCambiarGrupo not found directly, looking for index');
    const idx = html.indexOf('function alCambiarGrupoEnModal()');
    console.log('alCambiarGrupoEnModal found at', idx);
}

// 5. Update poblarSelectsGrupos to also populate form-encargado, select-estudiante-modal and select-docente-persona-modal
const oldPoblarSelectsGrupos = `        function poblarSelectsGrupos(grupos) {
            const selectModal = document.getElementById('form-grupo');
            const selectFiltroCaja = document.getElementById('filtro-grupo');
            const selectEncargadoCaja = document.getElementById('filtro-encargado');

            if (selectModal) {
                const prevVal = selectModal.value;
                let opts = \`<option value="General">General / Institucional</option>\`;
                grupos.forEach(g => {
                    opts += \`<option value="\${g.nombre}" data-encargado="\${g.encargado}" data-carrera="\${g.carrera}">\${g.nombre} (\${g.encargado})</option>\`;
                });
                selectModal.innerHTML = opts;
                if (prevVal) selectModal.value = prevVal;
            }`;

const newPoblarSelectsGrupos = `        function poblarSelectsGrupos(grupos) {
            const selectModal = document.getElementById('form-grupo');
            const selectEncargadoModal = document.getElementById('form-encargado');
            const selectDocentePersona = document.getElementById('select-docente-persona-modal');
            const selectEstudianteModal = document.getElementById('select-estudiante-modal');
            const selectFiltroCaja = document.getElementById('filtro-grupo');
            const selectEncargadoCaja = document.getElementById('filtro-encargado');

            if (selectModal) {
                const prevVal = selectModal.value;
                let opts = \`<option value="General">General / Institucional</option>\`;
                grupos.forEach(g => {
                    opts += \`<option value="\${g.nombre}" data-encargado="\${g.encargado}" data-carrera="\${g.carrera}">\${g.nombre} (\${g.encargado})</option>\`;
                });
                selectModal.innerHTML = opts;
                if (prevVal) selectModal.value = prevVal;
            }

            // Poblar select de docentes encargados en modal
            if (selectEncargadoModal) {
                const prevVal = selectEncargadoModal.value;
                let opts = \`<option value="General">General / Institucional</option>\`;
                const docsList = (docentesGlobales && docentesGlobales.length > 0) ? docentesGlobales : [...new Set(grupos.map(g => g.encargado).filter(Boolean))].map(n => ({ nombre: n }));
                docsList.forEach(d => {
                    opts += \`<option value="\${d.nombre}">\${d.nombre}\${d.carrera ? ' (' + d.carrera + ')' : ''}</option>\`;
                });
                selectEncargadoModal.innerHTML = opts;
                if (prevVal) selectEncargadoModal.value = prevVal;
            }

            // Poblar select de persona docente
            if (selectDocentePersona) {
                const prevVal = selectDocentePersona.value;
                let opts = \`<option value="">-- Seleccionar Docente de la Institución --</option>\`;
                const docsList = (docentesGlobales && docentesGlobales.length > 0) ? docentesGlobales : [...new Set(grupos.map(g => g.encargado).filter(Boolean))].map(n => ({ nombre: n }));
                docsList.forEach(d => {
                    opts += \`<option value="\${d.nombre}">\${d.nombre}\${d.carrera ? ' (' + d.carrera + ')' : ''}</option>\`;
                });
                selectDocentePersona.innerHTML = opts;
                if (prevVal) selectDocentePersona.value = prevVal;
            }

            // Poblar selector de estudiantes en modal
            if (selectEstudianteModal && estudiantesGlobales && estudiantesGlobales.length > 0) {
                const prevVal = selectEstudianteModal.value;
                let opts = \`<option value="">-- Seleccionar Estudiante Registrado o Escribir Manual Abajo --</option>\`;
                estudiantesGlobales.forEach(e => {
                    opts += \`<option value="\${e.id}">\${e.nombre} (\${e.carrera || 'General'} - DNI: \${e.dni || 'S/DNI'} - Cel: \${e.telefono || 'S/Cel'})\</option>\`;
                });
                selectEstudianteModal.innerHTML = opts;
                if (prevVal) selectEstudianteModal.value = prevVal;
            }`;

if (html.includes(oldPoblarSelectsGrupos)) {
    html = html.replace(oldPoblarSelectsGrupos, newPoblarSelectsGrupos);
    console.log('poblarSelectsGrupos updated successfully');
} else {
    console.log('Warning: oldPoblarSelectsGrupos not found directly');
}

// 6. Update guardarMovimiento to include telefono
const oldGuardarMov = `                carrera: (document.getElementById('form-carrera')?.value || '').trim(),
                grupo: (document.getElementById('form-grupo')?.value || 'General').trim(),
                encargado: (document.getElementById('form-encargado')?.value || 'General').trim(),`;

const newGuardarMov = `                carrera: (document.getElementById('form-carrera')?.value || '').trim(),
                grupo: (document.getElementById('form-grupo')?.value || 'General').trim(),
                encargado: (document.getElementById('form-encargado')?.value || 'General').trim(),
                telefono: (document.getElementById('form-telefono')?.value || '').trim(),`;

if (html.includes(oldGuardarMov)) {
    html = html.replace(oldGuardarMov, newGuardarMov);
    console.log('guardarMovimiento updated with telefono');
} else {
    console.log('Warning: oldGuardarMov not found');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html updated successfully with all improvements!');
