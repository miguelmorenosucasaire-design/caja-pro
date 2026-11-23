const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Target function alCambiarGrupoEnModal()
const targetAlCambiarGrupo = `        function alCambiarGrupoEnModal() {
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

const replacementModalJS = `        // GESTIÓN DE ROLES EN MODAL (ESTUDIANTE / DOCENTE / INSTITUCIÓN)
        function seleccionarRolPersonaModal(rol) {
            const inpRol = document.getElementById('form-rol');
            if (inpRol) inpRol.value = rol;

            const tabEst = document.getElementById('tab-rol-estudiante');
            const tabDoc = document.getElementById('tab-rol-docente');
            const tabGen = document.getElementById('tab-rol-general');

            const contEst = document.getElementById('contenedor-seleccion-estudiante');
            const contDoc = document.getElementById('contenedor-seleccion-docente');

            // Reset tab styles
            [tabEst, tabDoc, tabGen].forEach(t => {
                if (t) {
                    t.className = "px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1";
                }
            });

            if (rol === 'Estudiante') {
                if (tabEst) tabEst.className = "px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1";
                if (contEst) contEst.classList.remove('hidden');
                if (contDoc) contDoc.classList.add('hidden');
            } else if (rol === 'Docente') {
                if (tabDoc) tabDoc.className = "px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1";
                if (contEst) contEst.classList.add('hidden');
                if (contDoc) contDoc.classList.remove('hidden');

                const selDoc = document.getElementById('select-docente-persona-modal');
                if (selDoc && selDoc.value) {
                    alSeleccionarDocentePersonaEnModal(selDoc.value);
                }
            } else {
                // General / Institución
                if (tabGen) tabGen.className = "px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1";
                if (contEst) contEst.classList.add('hidden');
                if (contDoc) contDoc.classList.add('hidden');

                const inpNom = document.getElementById('form-nombre');
                if (inpNom) inpNom.value = 'Institución CETPRO Micaela Bastidas';
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

            const inpRol = document.getElementById('form-rol');
            if (inpRol && inpRol.value === 'Docente') {
                const inpNom = document.getElementById('form-nombre');
                if (inpNom) inpNom.value = docNombre;
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

if (html.includes(targetAlCambiarGrupo)) {
    html = html.replace(targetAlCambiarGrupo, replacementModalJS);
    console.log('alCambiarGrupoEnModal and role functions replaced successfully');
} else {
    console.log('CRLF issue on targetAlCambiarGrupo, trying normalized replacement');
    const normalizedHtml = html.replace(/\r\n/g, '\n');
    const normalizedTarget = targetAlCambiarGrupo.replace(/\r\n/g, '\n');
    if (normalizedHtml.includes(normalizedTarget)) {
        html = normalizedHtml.replace(normalizedTarget, replacementModalJS);
        console.log('alCambiarGrupoEnModal and role functions replaced with normalized newlines');
    } else {
        console.error('FAILED to find targetAlCambiarGrupo in html');
    }
}

// 2. Update poblarSelectsGrupos
const idxPoblarStart = html.indexOf('function poblarSelectsGrupos(grupos)');
const idxPoblarEnd = html.indexOf('function filtrarGrupos()', idxPoblarStart);

if (idxPoblarStart !== -1 && idxPoblarEnd !== -1) {
    const newPoblarCode = `function poblarSelectsGrupos(grupos) {
            const selectModal = document.getElementById('form-grupo');
            const selectEncargadoModal = document.getElementById('form-encargado');
            const selectDocentePersona = document.getElementById('select-docente-persona-modal');
            const selectEstudianteModal = document.getElementById('select-estudiante-modal');
            const selectFiltroCaja = document.getElementById('filtro-grupo');
            const selectEncargadoCaja = document.getElementById('filtro-encargado');

            // 1. Selector de Grupo en Modal: Nombre + (Docente Encargado)
            if (selectModal) {
                const prevVal = selectModal.value;
                let opts = \`<option value="General">General / Institucional</option>\`;
                grupos.forEach(g => {
                    const enc = g.encargado ? \` (\${g.encargado})\` : '';
                    opts += \`<option value="\${g.nombre}" data-encargado="\${g.encargado || ''}" data-carrera="\${g.carrera || ''}">\${g.nombre}\${enc}</option>\`;
                });
                selectModal.innerHTML = opts;
                if (prevVal) selectModal.value = prevVal;
            }

            // 2. Selector de Docente / Encargado en Modal
            if (selectEncargadoModal) {
                const prevVal = selectEncargadoModal.value;
                let opts = \`<option value="General">General / Institucional</option>\`;
                // Usar docentesGlobales o lista de encargados
                const listaDocentes = (typeof docentesGlobales !== 'undefined' && docentesGlobales.length > 0)
                    ? docentesGlobales.map(d => d.nombre)
                    : [...new Set(grupos.map(g => g.encargado).filter(Boolean))];
                const unicos = [...new Set(listaDocentes)].sort();
                unicos.forEach(doc => {
                    opts += \`<option value="\${doc}">\${doc}</option>\`;
                });
                selectEncargadoModal.innerHTML = opts;
                if (prevVal) selectEncargadoModal.value = prevVal;
            }

            // 3. Selector de Docente como Persona en Modal
            if (selectDocentePersona) {
                const prevVal = selectDocentePersona.value;
                let opts = \`<option value="">-- Seleccionar Docente de la Institución --</option>\`;
                const listaDocentes = (typeof docentesGlobales !== 'undefined' && docentesGlobales.length > 0)
                    ? docentesGlobales
                    : grupos.map(g => ({ nombre: g.encargado, carrera: g.carrera, turno: g.turno }));
                const unicosDoc = [];
                const nombresVistos = new Set();
                listaDocentes.forEach(d => {
                    if (d.nombre && !nombresVistos.has(d.nombre)) {
                        nombresVistos.add(d.nombre);
                        unicosDoc.push(d);
                    }
                });
                unicosDoc.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(doc => {
                    opts += \`<option value="\${doc.nombre}">👨‍🏫 \${doc.nombre} - \${doc.carrera || 'CETPRO'}</option>\`;
                });
                selectDocentePersona.innerHTML = opts;
                if (prevVal) selectDocentePersona.value = prevVal;
            }

            // 4. Selector de Estudiante como Persona en Modal
            if (selectEstudianteModal && typeof estudiantesGlobales !== 'undefined') {
                const prevVal = selectEstudianteModal.value;
                let opts = \`<option value="">-- Seleccionar Estudiante Registrado o Escribir Manual Abajo --</option>\`;
                estudiantesGlobales.slice().sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(e => {
                    const dni = e.dni ? \` - DNI: \${e.dni}\` : '';
                    const cel = e.telefono ? \` - Cel: \${e.telefono}\` : '';
                    opts += \`<option value="\${e.id}">🎓 \${e.nombre}\${dni}\${cel} (\${e.carrera || 'General'})\</option>\`;
                });
                selectEstudianteModal.innerHTML = opts;
                if (prevVal) selectEstudianteModal.value = prevVal;
            }

            // 5. Filtros en la tabla de caja
            if (selectFiltroCaja) {
                const prevVal = selectFiltroCaja.value;
                let opts = \`<option value="">Todos los Grupos / Secciones</option><option value="General">General / Institucional</option>\`;
                grupos.forEach(g => {
                    opts += \`<option value="\${g.nombre}">\${g.nombre}</option>\`;
                });
                selectFiltroCaja.innerHTML = opts;
                if (prevVal) selectFiltroCaja.value = prevVal;
            }

            if (selectEncargadoCaja) {
                const prevVal = selectEncargadoCaja.value;
                const encargadosUnicos = [...new Set(grupos.map(g => g.encargado).filter(Boolean))].sort();
                let opts = \`<option value="">Todos los Encargados</option>\`;
                encargadosUnicos.forEach(enc => {
                    opts += \`<option value="\${enc}">\${enc}</option>\`;
                });
                selectEncargadoCaja.innerHTML = opts;
                if (prevVal) selectEncargadoCaja.value = prevVal;
            }
        }\n\n        `;

    html = html.slice(0, idxPoblarStart) + newPoblarCode + html.slice(idxPoblarEnd);
    console.log('poblarSelectsGrupos updated successfully');
} else {
    console.error('FAILED to find indices for poblarSelectsGrupos');
}

// 3. Update guardarMovimiento to include telefono
const idxGuardar = html.indexOf('async function guardarMovimiento(e)');
if (idxGuardar !== -1) {
    const chunk = html.slice(idxGuardar, idxGuardar + 800);
    if (!chunk.includes('telefono:')) {
        const targetDni = "dni: (document.getElementById('form-dni')?.value || '').trim(),";
        const replacementDni = "dni: (document.getElementById('form-dni')?.value || '').trim(),\n                telefono: (document.getElementById('form-telefono')?.value || '').trim(),";
        if (html.includes(targetDni)) {
            html = html.replace(targetDni, replacementDni);
            console.log('telefono added to guardarMovimiento payload successfully');
        } else {
            console.log('targetDni not found with standard spacing, checking');
        }
    } else {
        console.log('guardarMovimiento already has telefono');
    }
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('All changes applied successfully!');
