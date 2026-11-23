const fs = require('fs');

console.log('--- APLICANDO MEJORAS SOLICITADAS POR EL USUARIO ---');

let html = fs.readFileSync('templates/index.html', 'utf8');

// =========================================================================
// 1. MEJORA EN NUEVO MOVIMIENTO MODAL:
//    - Selector de conceptos predefinidos + botón para agregar nuevos conceptos
//    - Botón "+ Módulo 1 y Módulo 2"
// =========================================================================

// Localizar la sección del concepto en el modal
const conceptoMarker = `<label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto del Movimiento (*)</label>`;

const conceptoReplacement = `
                            <div class="flex items-center justify-between mb-1">
                                <label class="block font-bold text-slate-700 dark:text-slate-300">Concepto del Movimiento (*)</label>
                                <button type="button" onclick="agregarNuevoConceptoPersonalizado()" class="text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 shadow-sm" title="Agregar un nuevo concepto a la lista de opciones">
                                    <i class="fa-solid fa-plus-circle text-indigo-500"></i> + Agregar Concepto
                                </button>
                            </div>
                            <div class="mb-1.5">
                                <select id="select-concepto-predefinido" onchange="alSeleccionarConceptoPredefinido(this.value)" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm">
                                    <option value="">-- Seleccionar concepto predefinido (puedes editarlo abajo) --</option>
                                    <option value="1.- Aporte por Mantenimiento">1.- Aporte por Mantenimiento</option>
                                    <option value="1.- Aporte por Mantenimiento Módulo I">1.- Aporte por Mantenimiento Módulo I</option>
                                    <option value="1.- Aporte por Mantenimiento Módulo II">1.- Aporte por Mantenimiento Módulo II</option>
                                    <option value="1.- Aporte por Mantenimiento Módulo 1 y 2">1.- Aporte por Mantenimiento Módulo 1 y 2</option>
                                    <option value="2.- Expedición de constancia de estudio">2.- Expedición de constancia de estudio</option>
                                    <option value="3.- FUT (Formulario Único de Trámite)">3.- FUT (Formulario Único de Trámite)</option>
                                    <option value="Matrícula y Talleres Módulo I">Matrícula y Talleres Módulo I</option>
                                    <option value="Matrícula y Talleres Módulo II">Matrícula y Talleres Módulo II</option>
                                    <option value="Matrícula y Talleres Módulo I y II">Matrícula y Talleres Módulo I y II</option>
                                    <option value="Certificado Modular Oficial">Certificado Modular Oficial</option>
                                    <option value="Examen de Suficiencia">Examen de Suficiencia</option>
                                    <option value="4.- Otros">4.- Otros</option>
                                </select>
                            </div>`;

if (html.includes(conceptoMarker)) {
    html = html.replace(conceptoMarker, conceptoReplacement);
    console.log('1. Selector de conceptos editable y botón para agregar concepto insertado.');
} else {
    console.error('No se encontró conceptoMarker');
}

// Localizar los botones rápidos de Módulo en el modal
const modulosMarker = `<button type="button" onclick="setConceptoRapidoModal('Módulo I')" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition">+ Módulo I</button>`;

const modulosReplacement = `
                            <button type="button" onclick="setConceptoRapidoModal('Módulo 1 y Módulo 2')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-md shadow-emerald-600/30 transition flex items-center gap-1" title="Asignar ambos módulos 1 y 2 a la vez en la boleta">
                                <i class="fa-solid fa-layer-group"></i> + Módulo 1 y Módulo 2
                            </button>
                            <button type="button" onclick="setConceptoRapidoModal('Módulo I')" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition">+ Módulo I</button>`;

if (html.includes(modulosMarker)) {
    html = html.replace(modulosMarker, modulosReplacement);
    console.log('2. Botón "+ Módulo 1 y Módulo 2" agregado en el modal de nuevo movimiento.');
} else {
    console.error('No se encontró modulosMarker');
}

// =========================================================================
// 2. MEJORA EN DIARIO & NOTAS:
//    - Mini-Calendario visual de mes con colores según los registros
//    - Indicador de cantidad de registros al seleccionar
// =========================================================================

const calDiarioMarker = `<!-- PANEL DE CALENDARIZACIÓN DE REGISTROS E INGRESOS -->
                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">`;

const calDiarioReplacement = `<!-- PANEL DE CALENDARIZACIÓN Y MINI-CALENDARIO DE ACTIVIDAD POR DÍA -->
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
                                    Los días se iluminan según la cantidad de registros recibidos. Haz clic en cualquier día para ver la cantidad exacta y cargar el diario.
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
                                <span id="mini-cal-info-texto">Selecciona un día en el calendario para ver sus registros.</span>
                            </div>
                            <span id="mini-cal-info-monto" class="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">S/. 0.00</span>
                        </div>
                    </div>`;

if (html.includes(calDiarioMarker)) {
    html = html.replace(calDiarioMarker, calDiarioReplacement);
    console.log('3. Mini-calendario por mes con colores según registros insertado en Diario & Notas.');
} else {
    console.error('No se encontró calDiarioMarker');
}

// =========================================================================
// 3. MEJORA EN DEUDORES:
//    - Mensaje amigable cuando no hay ningún estudiante asignado a deudores
// =========================================================================

const deudoresEmptyTarget = `<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 font-medium">¡Excelente! No se encontraron estudiantes con deudas pendientes para esta búsqueda.</div>`;

const deudoresEmptyReplacement = `<div class="col-span-12 p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-xl mb-2">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">No hay ningún estudiante en Deudores</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Los estudiantes solo aparecerán en esta sección cuando los escojas o asignes manualmente usando el botón naranja <strong>'+ Asignar Deudor / Cuota Pendiente'</strong> arriba.
                    </p>
                </div>`;

if (html.includes(deudoresEmptyTarget)) {
    html = html.replace(deudoresEmptyTarget, deudoresEmptyReplacement);
    console.log('4. Mensaje explicativo para deudores cuando no hay estudiantes asignados.');
} else {
    console.error('No se encontró deudoresEmptyTarget');
}

// =========================================================================
// 4. FUNCIONES JS NUEVAS EN SCRIPT #7:
//    - Mini-Calendario interactivo con lógica de colores y selección
//    - Selector de conceptos predefinidos y agregar nuevos con persistencia
//    - Manejo inteligente de "+ Módulo 1 y Módulo 2"
// =========================================================================

const jsMarker = `function setConceptoRapidoModal(concepto) {`;

const newJsFunctions = `// =========================================================================
        // CONTROL DE CONCEPTOS EDITABLES Y PERSONALIZADOS
        // =========================================================================
        function alSeleccionarConceptoPredefinido(val) {
            if (!val) return;
            const inp = document.getElementById('form-concepto');
            const inpNotas = document.getElementById('form-notas');
            if (inp) {
                inp.value = val;
            }
            if (inpNotas && (!inpNotas.value || inpNotas.value.startsWith('1.-') || inpNotas.value.startsWith('2.-') || inpNotas.value.startsWith('3.-'))) {
                inpNotas.value = val;
            }
            actualizarBoletaModalEnVivo();
        }

        function agregarNuevoConceptoPersonalizado() {
            const nuevo = prompt("Escribe el nuevo concepto que deseas agregar a la lista de opciones:");
            if (!nuevo || !nuevo.trim()) return;
            const conceptoTrim = nuevo.trim();

            // Guardar en localStorage
            try {
                let guardados = JSON.parse(localStorage.getItem('cetpro_conceptos_personalizados') || '[]');
                if (!guardados.includes(conceptoTrim)) {
                    guardados.push(conceptoTrim);
                    localStorage.setItem('cetpro_conceptos_personalizados', JSON.stringify(guardados));
                }
            } catch(e) {}

            cargarConceptosPersonalizadosEnSelector(conceptoTrim);

            const inp = document.getElementById('form-concepto');
            if (inp) inp.value = conceptoTrim;
            actualizarBoletaModalEnVivo();
            alert(\`Concepto "\${conceptoTrim}" agregado a tus opciones exitosamente.\`);
        }

        function cargarConceptosPersonalizadosEnSelector(seleccionado = null) {
            const select = document.getElementById('select-concepto-predefinido');
            const datalist = document.getElementById('lista-conceptos-datalist');
            if (!select) return;

            try {
                const guardados = JSON.parse(localStorage.getItem('cetpro_conceptos_personalizados') || '[]');
                guardados.forEach(c => {
                    // Verificar si ya existe en el select
                    let exists = false;
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].value === c) { exists = true; break; }
                    }
                    if (!exists) {
                        const opt = document.createElement('option');
                        opt.value = c;
                        opt.innerText = \`⭐ \${c}\`;
                        select.appendChild(opt);
                    }
                    if (datalist) {
                        let dExists = false;
                        for (let j = 0; j < datalist.options.length; j++) {
                            if (datalist.options[j].value === c) { dExists = true; break; }
                        }
                        if (!dExists) {
                            const dOpt = document.createElement('option');
                            dOpt.value = c;
                            datalist.appendChild(dOpt);
                        }
                    }
                });
            } catch(e) {}

            if (seleccionado) {
                select.value = seleccionado;
            }
        }

        // =========================================================================
        // MINI-CALENDARIO INTERACTIVO CON COLORES SEGÚN REGISTROS
        // =========================================================================
        let miniCalAnoActual = 2026;
        let miniCalMesActual = 7; // Agosto (0-indexed: 7 = Agosto)

        function inicializarMiniCalendario() {
            cargarMiniCalendario();
        }

        function cambiarMesMiniCalendario(delta) {
            miniCalMesActual += delta;
            if (miniCalMesActual < 0) {
                miniCalMesActual = 11;
                miniCalAnoActual--;
            } else if (miniCalMesActual > 11) {
                miniCalMesActual = 0;
                miniCalAnoActual++;
            }
            renderizarMiniCalendarioGrid();
        }

        function irAMesActualMiniCalendario() {
            const hoy = new Date();
            // Si hay movimientos en el año 2026, enfocar en el mes del último movimiento
            const ultimoDia = (calendarizacionGlobal && calendarizacionGlobal.length > 0) ? calendarizacionGlobal[0].fecha : '';
            if (ultimoDia) {
                const partes = ultimoDia.split('-');
                miniCalAnoActual = parseInt(partes[0], 10);
                miniCalMesActual = parseInt(partes[1], 10) - 1;
            } else {
                miniCalAnoActual = hoy.getFullYear();
                miniCalMesActual = hoy.getMonth();
            }
            renderizarMiniCalendarioGrid();
        }

        function renderizarMiniCalendarioGrid() {
            const grid = document.getElementById('mini-cal-grid-dias');
            const tituloMes = document.getElementById('mini-cal-mes-titulo');
            if (!grid || !tituloMes) return;

            const mesesNombres = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];

            tituloMes.innerText = \`\${mesesNombres[miniCalMesActual]} \${miniCalAnoActual}\`;

            // Mapa de fechas a datos de registros
            const mapaDias = {};
            (calendarizacionGlobal || []).forEach(d => {
                if (d.fecha) mapaDias[d.fecha] = d;
            });

            // Primer día del mes y total de días
            const primerDia = new Date(miniCalAnoActual, miniCalMesActual, 1);
            const totalDias = new Date(miniCalAnoActual, miniCalMesActual + 1, 0).getDate();

            // Día de la semana en formato lunes = 0 ... domingo = 6
            let diaSemanaInicio = primerDia.getDay() - 1;
            if (diaSemanaInicio === -1) diaSemanaInicio = 6;

            const fechaSeleccionada = document.getElementById('diario-selector-fecha')?.value || '';

            let htmlCells = '';

            // Celdas vacías previas
            for (let i = 0; i < diaSemanaInicio; i++) {
                htmlCells += '<div class="h-9 rounded-lg opacity-20"></div>';
            }

            // Días del mes
            for (let dia = 1; dia <= totalDias; dia++) {
                const mesStr = String(miniCalMesActual + 1).padStart(2, '0');
                const diaStr = String(dia).padStart(2, '0');
                const fechaStr = \`\${miniCalAnoActual}-\${mesStr}-\${diaStr}\`;

                const registroDia = mapaDias[fechaStr];
                const esActivo = fechaStr === fechaSeleccionada;
                const totalRecibos = registroDia ? registroDia.total_recibos : 0;
                const totalMonto = registroDia ? Number(registroDia.total_monto || 0) : 0;

                // Color según la cantidad de registros
                let bgClass = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
                let badgeDot = '';

                if (totalRecibos >= 3) {
                    // Verde Intenso (Alta actividad de registros)
                    bgClass = 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/30 border-emerald-600';
                    badgeDot = \`<span class="w-1.5 h-1.5 rounded-full bg-white inline-block mt-0.5"></span>\`;
                } else if (totalRecibos === 2) {
                    // Azul / Celeste (2 registros)
                    bgClass = 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/20 border-sky-600';
                    badgeDot = \`<span class="w-1.5 h-1.5 rounded-full bg-white inline-block mt-0.5"></span>\`;
                } else if (totalRecibos === 1) {
                    // Ámbar (1 registro)
                    bgClass = 'bg-amber-400 text-slate-950 font-bold shadow-sm border-amber-500';
                    badgeDot = \`<span class="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block mt-0.5"></span>\`;
                }

                if (esActivo) {
                    bgClass += ' ring-2 ring-indigo-500 scale-105 z-10';
                }

                htmlCells += \`
                    <button type="button" onclick="seleccionarDiaEnMiniCalendario('\${fechaStr}')" class="h-9 rounded-xl flex flex-col items-center justify-center text-xs transition transform hover:scale-110 \${bgClass}" title="\${dia} de \${mesesNombres[miniCalMesActual]}: \${totalRecibos} registros (S/. \${totalMonto.toFixed(2)})">
                        <span class="leading-none">\${dia}</span>
                        \${badgeDot}
                    </button>
                \`;
            }

            grid.innerHTML = htmlCells;
        }

        function seleccionarDiaEnMiniCalendario(fechaStr) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (inputF) inputF.value = fechaStr;

            // Actualizar banner informativo con la cantidad de registros
            const mapaDias = {};
            (calendarizacionGlobal || []).forEach(d => {
                if (d.fecha) mapaDias[d.fecha] = d;
            });
            const reg = mapaDias[fechaStr];
            const infoTexto = document.getElementById('mini-cal-info-texto');
            const infoMonto = document.getElementById('mini-cal-info-monto');

            if (reg && reg.total_recibos > 0) {
                const fPartes = fechaStr.split('-');
                const fechaBonita = \`\${fPartes[2]}/\${fPartes[1]}/\${fPartes[0]}\`;
                if (infoTexto) {
                    infoTexto.innerHTML = \`<span class="text-amber-500 font-extrabold">\${fechaBonita}</span>: <strong>\${reg.total_recibos} \${reg.total_recibos === 1 ? 'registro recibido' : 'registros recibidos'}</strong> en este día.\`;
                }
                if (infoMonto) {
                    infoMonto.innerText = 'S/. ' + Number(reg.total_monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                }
            } else {
                const fPartes = fechaStr.split('-');
                const fechaBonita = \`\${fPartes[2]}/\${fPartes[1]}/\${fPartes[0]}\`;
                if (infoTexto) {
                    infoTexto.innerHTML = \`<span class="text-slate-500 font-extrabold">\${fechaBonita}</span>: Sin registros de ingresos para esta fecha.\`;
                }
                if (infoMonto) infoMonto.innerText = 'S/. 0.00';
            }

            renderizarMiniCalendarioGrid();
            cargarDiario(fechaStr);
            cargarCalendarizacionDiario();
        }

        // =========================================================================
        // CONTROL MEJORADO DE CONCEPTOS Y MÓDULOS EN BOLETA
        // =========================================================================
        function setConceptoRapidoModal(concepto) {
            const inp = document.getElementById('form-concepto');
            const inpNotas = document.getElementById('form-notas');
            const carrVal = document.getElementById('form-carrera')?.value || '';

            if (concepto === 'Módulo 1 y Módulo 2' || concepto === 'Módulo I y Módulo II') {
                const textoFinal = \`Módulo 1 y Módulo 2\${carrVal ? ' (' + carrVal + ')' : ''}\`;
                if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1 y 2';
                if (inpNotas) inpNotas.value = textoFinal;

                // Marcar ambos cuadritos 1 y 2
                modalCuadrosEstado.modulos[0] = true;
                modalCuadrosEstado.modulos[1] = true;
            } else if (concepto === 'Módulo I') {
                if (inpNotas && (inpNotas.value.includes('Módulo II') || inpNotas.value.includes('Módulo 2'))) {
                    inpNotas.value = \`Módulo 1 y Módulo 2\${carrVal ? ' (' + carrVal + ')' : ''}\`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1 y 2';
                    modalCuadrosEstado.modulos[0] = true;
                    modalCuadrosEstado.modulos[1] = true;
                } else {
                    const textoFinal = \`Módulo I\${carrVal ? ' (' + carrVal + ')' : ''}\`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1';
                    if (inpNotas) inpNotas.value = textoFinal;
                    modalCuadrosEstado.modulos[0] = true;
                }
            } else if (concepto === 'Módulo II') {
                if (inpNotas && (inpNotas.value.includes('Módulo I') || inpNotas.value.includes('Módulo 1'))) {
                    inpNotas.value = \`Módulo 1 y Módulo 2\${carrVal ? ' (' + carrVal + ')' : ''}\`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1 y 2';
                    modalCuadrosEstado.modulos[0] = true;
                    modalCuadrosEstado.modulos[1] = true;
                } else {
                    const textoFinal = \`Módulo II\${carrVal ? ' (' + carrVal + ')' : ''}\`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 2';
                    if (inpNotas) inpNotas.value = textoFinal;
                    modalCuadrosEstado.modulos[1] = true;
                }
            } else {
                if (inp) inp.value = concepto;
                if (inpNotas) inpNotas.value = concepto;
            }

            actualizarBoletaModalEnVivo();
        }
`;

if (html.includes(jsMarker)) {
    html = html.replace(jsMarker, newJsFunctions + '\n        // Function original redefinida arriba\n        function _old_setConceptoRapidoModal(concepto) {');
    console.log('5. Funciones JS de conceptos, mini-calendario y módulo 1 y 2 agregadas.');
} else {
    console.error('No se encontró jsMarker');
}

// También actualizar cargarCalendarizacionDiario para que invoque renderizarMiniCalendarioGrid() y aplique colores en el carrusel
const carruselColorTarget = `container.innerHTML = calendarizacion.map(d => {
                    const esActivo = d.fecha === fechaSeleccionada;
                    const fPartes = d.fecha.split('-');
                    const fechaBonita = fPartes.length === 3 ? \`\${fPartes[2]}/\${fPartes[1]}/\${fPartes[0]}\` : d.fecha;

                    return \`
                        <button type="button" onclick="seleccionarDiaEnCalendarizacion('\${d.fecha}')" class="flex-shrink-0 px-3.5 py-2 rounded-xl border text-left transition shadow-sm \${esActivo ? 'bg-amber-500 text-slate-950 border-amber-600 font-black scale-105 shadow-amber-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50/50'}">\`;`;

const carruselColorReplacement = `container.innerHTML = calendarizacion.map(d => {
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
                        </button>\`;`;

// En cargarCalendarizacionDiario:
if (html.includes('const fechaSeleccionada = document.getElementById(\'diario-selector-fecha\')?.value || \'\';')) {
    html = html.replace('calendarizacionGlobal = calendarizacion;', 'calendarizacionGlobal = calendarizacion; renderizarMiniCalendarioGrid();');
    console.log('6. renderizarMiniCalendarioGrid conectado en cargarCalendarizacionDiario.');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('--- ACTUALIZACIÓN DE TEMPLATES/INDEX.HTML COMPLETADA ---');
