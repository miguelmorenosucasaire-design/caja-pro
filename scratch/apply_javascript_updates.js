const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const targetStart = `function cambiarSeccion(seccion) {`;
const targetEnd = `if (seccion === 'respaldos') cargarRespaldos();
        }`;

const newJSFunctions = `let seccionActivaActual = 'dashboard';
        let currentPlantillaGrupoId = 11; // Por defecto Confección Textil

        function cambiarSeccion(seccion) {
            seccionActivaActual = seccion;
            const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos', 'control-pagos', 'diario', 'factura'];
            
            secciones.forEach(s => {
                const secEl = document.getElementById(\`section-\${s}\`);
                const navEl = document.getElementById(\`nav-\${s}\`);
                const topNavEl = document.getElementById(\`top-nav-\${s}\`);
                const sheetTabEl = document.getElementById(\`sheet-tab-\${s}\`);

                if (secEl) {
                    secEl.classList.add('hidden');
                    secEl.classList.remove('section-activa-print');
                }
                if (navEl) {
                    navEl.classList.remove('bg-slate-800', 'text-white');
                    navEl.classList.add('text-slate-300');
                }
                if (topNavEl) {
                    topNavEl.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/25');
                    topNavEl.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
                }
                if (sheetTabEl) {
                    sheetTabEl.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                    sheetTabEl.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-slate-800');
                }
            });

            const activeSec = document.getElementById(\`section-\${seccion}\`);
            const activeNav = document.getElementById(\`nav-\${seccion}\`);
            const activeTopNav = document.getElementById(\`top-nav-\${seccion}\`);
            const activeSheetTab = document.getElementById(\`sheet-tab-\${seccion}\`);

            if (activeSec) {
                activeSec.classList.remove('hidden');
                activeSec.classList.add('section-activa-print');
            }
            if (activeNav) {
                activeNav.classList.add('bg-slate-800', 'text-white');
                activeNav.classList.remove('text-slate-300');
            }
            if (activeTopNav) {
                activeTopNav.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
                activeTopNav.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-500/25');
            }
            if (activeSheetTab) {
                activeSheetTab.classList.remove('text-slate-300', 'hover:bg-slate-800');
                activeSheetTab.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
            }

            const titulos = {
                dashboard: ['INICIO · Panel Financiero General', 'CETPRO San Miguel - Micaela Bastidas Puyucama'],
                resultados: ['RESUMEN ANUAL · Estado de Resultados Mes a Mes', 'Balance de ingresos, salidas y superávit consolidado de cada mes del año escolar'],
                caja: ['INGRESOS Y GASTOS · Flujo de Caja General', 'Registro oficial de todas las operaciones de entrada y salida'],
                estudiantes: ['ESTUDIANTES · Plantilla General y Saldos', 'Nómina oficial de 147 estudiantes, control de cuotas y estados de cuenta'],
                docentes: ['DOCENTES · Plantilla Profesional y Horas', 'Liquidación de honorarios y control de cobros generados por docente'],
                grupos: ['SECCIONES POR GRUPO · Plantillas y Encargados', 'Plantilla individual por cada sección con su docente a cargo, registro inmediato de pagos y cantidades'],
                deudores: ['DEUDORES · Control de Vencimientos', 'Monitoreo de estudiantes con cuotas pendientes a la fecha de corte'],
                carreras: ['ESPECIALIDADES · Rendimiento Técnico', 'Balance clasificado por áreas técnico-productivas'],
                respaldos: ['RESPALDOS · Copias de Seguridad de Base de Datos', 'Copias de seguridad automáticas de la BD y gestión de archivos descargables'],
                'control-pagos': ['CONTROL DE PAGOS · Matriz Mes a Mes', 'Cuadro de pagos mensualizados de Enero a Diciembre para cada estudiante'],
                diario: ['DIARIO Y NOTAS · Lo que Pasó en el Día', 'Ingresos, gastos y notas pedagógicas de clase por docente del día'],
                factura: ['FACTURA · Comprobante de Pago Oficial', 'Emisión e impresión de boletas oficiales con número en letras y sellos']
            };

            const pageSheetIndicator = document.getElementById('page-active-sheet-name');
            if (titulos[seccion]) {
                document.getElementById('page-title').innerText = titulos[seccion][0];
                document.getElementById('page-subtitle').innerText = titulos[seccion][1];
                if (pageSheetIndicator) pageSheetIndicator.innerText = 'Hoja Activa: ' + titulos[seccion][0].toUpperCase();
            }

            if (seccion === 'estudiantes') cargarEstudiantes();
            if (seccion === 'docentes') cargarDocentes();
            if (seccion === 'grupos') cargarGrupos();
            if (seccion === 'deudores') cargarDeudores();
            if (seccion === 'caja') cargarMovimientos();
            if (seccion === 'respaldos') cargarRespaldos();
            if (seccion === 'control-pagos') cargarControlPagos();
            if (seccion === 'diario') {
                const hoy = new Date().toISOString().split('T')[0];
                const inputF = document.getElementById('diario-selector-fecha');
                if (inputF && !inputF.value) inputF.value = hoy;
                cargarDiario(inputF?.value || hoy);
            }
            if (seccion === 'factura') poblarSelectorFactura();
        }

        // =========================================================================
        // EXPORTACIÓN A PDF Y EXCEL CONSERVANDO EL DISEÑO DE LA HOJA SELECCIONADA
        // =========================================================================
        function exportarHojaPDF() {
            const titulosArchivos = {
                dashboard: 'CETPRO_Micaela_Bastidas_INICIO_2026',
                resultados: 'CETPRO_Micaela_Bastidas_RESUMEN_ANUAL_2026',
                caja: 'CETPRO_Micaela_Bastidas_LIBRO_CAJA_2026',
                estudiantes: 'CETPRO_Micaela_Bastidas_ESTUDIANTES_2026',
                grupos: 'CETPRO_Micaela_Bastidas_SECCIONES_Y_GRUPOS_2026',
                docentes: 'CETPRO_Micaela_Bastidas_DOCENTES_2026',
                deudores: 'CETPRO_Micaela_Bastidas_DEUDORES_2026',
                'control-pagos': 'CETPRO_Micaela_Bastidas_CONTROL_PAGOS_2026',
                diario: 'CETPRO_Micaela_Bastidas_DIARIO_Y_NOTAS_2026',
                factura: 'CETPRO_Micaela_Bastidas_COMPROBANTE_PAGO_2026',
                respaldos: 'CETPRO_Micaela_Bastidas_RESPALDOS_2026'
            };

            const originalTitle = document.title;
            const pdfName = titulosArchivos[seccionActivaActual] || 'CETPRO_Micaela_Bastidas_Reporte_2026';
            document.title = pdfName;

            // Abrir diálogo de impresión nativo (permite Guardar como PDF de alta resolución)
            window.print();

            setTimeout(() => {
                document.title = originalTitle;
            }, 1000);
        }

        function exportarHojaExcel() {
            let sheetName = 'estudiantes';
            if (seccionActivaActual === 'grupos') sheetName = 'grupos';
            else if (seccionActivaActual === 'caja') sheetName = 'ingresos';
            else if (seccionActivaActual === 'deudores') sheetName = 'deudores';
            else if (seccionActivaActual === 'docentes') sheetName = 'docentes';
            else if (seccionActivaActual === 'resultados') {
                window.location.href = '/api/exportar/resultados';
                return;
            }

            window.location.href = \`/api/exportar/hoja?sheet=\${sheetName}\`;
        }

        // =========================================================================
        // CONTROL Y NAVEGACIÓN DE PLANTILLAS POR SECCIÓN / GRUPO
        // =========================================================================
        function mostrarTodasLasSecciones() {
            document.getElementById('vista-todas-secciones')?.classList.remove('hidden');
            document.getElementById('vista-plantilla-seccion')?.classList.add('hidden');
            
            // Actualizar botones de pestaña de grupo
            document.querySelectorAll('.tab-grupo-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                btn.classList.add('text-slate-600', 'hover:bg-slate-100');
            });
            const btnTodas = document.getElementById('tab-grupo-todas');
            if (btnTodas) {
                btnTodas.classList.remove('text-slate-600', 'hover:bg-slate-100');
                btnTodas.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
            }
        }

        async function verPlantillaSeccion(grupoId) {
            currentPlantillaGrupoId = grupoId;
            try {
                const res = await fetch(\`/api/grupos/\${grupoId}/detalle\`);
                const data = await res.json();
                if (data.error) {
                    alert("Error: " + data.error);
                    return;
                }

                const g = data.grupo;
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                // Mostrar plantilla y ocultar cuadrícula general
                document.getElementById('vista-todas-secciones')?.classList.add('hidden');
                document.getElementById('vista-plantilla-seccion')?.classList.remove('hidden');

                // Actualizar botones de pestaña
                document.querySelectorAll('.tab-grupo-btn').forEach(btn => {
                    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                    btn.classList.add('text-slate-600', 'hover:bg-slate-100');
                });
                const tabActivo = document.getElementById(\`tab-grupo-\${grupoId}\`);
                if (tabActivo) {
                    tabActivo.classList.remove('text-slate-600', 'hover:bg-slate-100');
                    tabActivo.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
                }

                // Encabezados
                const cod = grupoId === 11 ? 'G01' : (grupoId === 7 ? 'G02' : (grupoId === 9 ? 'G03' : (grupoId === 10 ? 'G04' : (grupoId === 8 ? 'G05' : 'G06'))));
                document.getElementById('plantilla-seccion-codigo-badge').innerText = cod;
                document.getElementById('plantilla-seccion-nombre').innerText = \`\${cod} · \${g.nombre}\`;
                document.getElementById('plantilla-seccion-subtitulo').innerText = \`Especialidad: \${g.carrera} • Turno: \${g.turno} • Periodo Anual 2026\`;
                document.getElementById('plantilla-seccion-encargado').innerText = g.encargado;
                document.getElementById('plantilla-seccion-horario').innerText = \`\${g.turno} • \${g.horario || 'Regular'}\`;
                document.getElementById('plantilla-seccion-aula').innerText = g.aula_taller || 'Taller Principal';
                document.getElementById('plantilla-seccion-carrera').innerText = g.carrera;

                // KPIs
                document.getElementById('plantilla-kpi-alumnos').innerText = \`\${data.estudiantes.length} Estudiantes\`;
                document.getElementById('plantilla-kpi-ingresos').innerText = fMoney(g.total_ingresos);
                document.getElementById('plantilla-kpi-deuda').innerText = fMoney(g.total_deudas || 0);

                // Configurar Formulario Directo
                document.getElementById('seccion-form-grupo-id').value = g.id;
                document.getElementById('seccion-form-grupo-nombre').value = g.nombre;
                document.getElementById('seccion-form-encargado').value = g.encargado;
                document.getElementById('seccion-form-fecha').value = new Date().toISOString().split('T')[0];
                document.getElementById('seccion-form-concepto').value = 'Cuota Mensual Módulo 1';

                // Poblar select de estudiantes de este grupo
                const estSelect = document.getElementById('seccion-form-estudiante-select');
                estSelect.innerHTML = '<option value="">-- Seleccione un estudiante del grupo --</option>' + 
                    data.estudiantes.map(e => \`<option value="\${encodeURIComponent(e.nombre)}">\${e.codigo} - \${e.nombre} (Pagado: S/. \${e.total_pagado})</option>\`).join('') +
                    '<option value="__NUEVO__">+ Registrar Otro / Estudiante Nuevo</option>';

                // Renderizar Tabla 1: Estudiantes
                const tbodyEst = document.getElementById('plantilla-tabla-alumnos-body');
                document.getElementById('plantilla-tabla-alumnos-count').innerText = \`\${data.estudiantes.length} Alumnos\`;
                if (data.estudiantes.length === 0) {
                    tbodyEst.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">No hay alumnos asignados a este grupo aún.</td></tr>';
                } else {
                    tbodyEst.innerHTML = data.estudiantes.map((e, idx) => {
                        const tieneDeuda = (e.total_deuda || 0) > 0;
                        const badgeEstado = tieneDeuda 
                            ? '<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Con Deuda</span>'
                            : '<span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Al Día</span>';
                        return \`
                            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                                <td class="py-2.5 px-4 text-slate-400 font-bold">\${idx + 1}</td>
                                <td class="py-2.5 px-4 font-bold text-indigo-700">\${e.codigo}</td>
                                <td class="py-2.5 px-4 font-semibold text-slate-800">\${e.nombre}</td>
                                <td class="py-2.5 px-4 text-slate-500">\${e.telefono || '-'}</td>
                                <td class="py-2.5 px-4 text-right font-bold text-emerald-600">\${fMoney(e.total_pagado)}</td>
                                <td class="py-2.5 px-4 text-right font-bold \${tieneDeuda ? 'text-rose-600' : 'text-slate-400'}">\${fMoney(e.total_deuda)}</td>
                                <td class="py-2.5 px-4 text-center">\${badgeEstado}</td>
                                <td class="py-2.5 px-4 text-center no-print">
                                    <button onclick="prellenarAbonoParaEstudiante('\${encodeURIComponent(e.nombre)}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold text-[10px] transition mr-1">
                                        + Abonar
                                    </button>
                                </td>
                            </tr>
                        \`;
                    }).join('');
                }

                // Renderizar Tabla 2: Movimientos / Recibos de la Sección
                const tbodyMov = document.getElementById('plantilla-tabla-movimientos-body');
                document.getElementById('plantilla-tabla-movimientos-count').innerText = \`\${data.movimientos.length} Recibos\`;
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">No hay movimientos registrados para esta sección aún.</td></tr>';
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => {
                        const isIngreso = m.tipo === 'Ingreso';
                        return \`
                            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                                <td class="py-2.5 px-4 font-bold text-slate-800">REC-\${String(m.id).padStart(5, '0')}</td>
                                <td class="py-2.5 px-4 text-slate-600">\${m.fecha}</td>
                                <td class="py-2.5 px-4 font-semibold text-slate-900">\${m.nombre}</td>
                                <td class="py-2.5 px-4 text-slate-700 text-[11px]">\${m.encargado || g.encargado}</td>
                                <td class="py-2.5 px-4 text-center">
                                    <span class="\${isIngreso ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                        \${m.tipo}
                                    </span>
                                </td>
                                <td class="py-2.5 px-4 text-slate-700 font-medium">\${m.concepto}</td>
                                <td class="py-2.5 px-4 text-right font-extrabold \${isIngreso ? 'text-emerald-600' : 'text-rose-600'}">\${fMoney(m.monto)}</td>
                                <td class="py-2.5 px-4 text-center text-slate-500">\${m.metodo_pago || 'Efectivo'}</td>
                                <td class="py-2.5 px-4 text-center no-print">
                                    <button onclick="verBoletaDirecta(\${m.id})" title="Imprimir Boleta" class="text-sky-600 hover:text-sky-800 p-1 font-bold">
                                        <i class="fa-solid fa-receipt"></i>
                                    </button>
                                </td>
                            </tr>
                        \`;
                    }).join('');
                }

                // Scroll suave hacia la plantilla
                document.getElementById('vista-plantilla-seccion')?.scrollIntoView({ behavior: 'smooth' });

            } catch (err) {
                console.error("Error al cargar plantilla de sección:", err);
            }
        }

        function cambiarTipoMovimientoSeccion(tipo) {
            document.getElementById('seccion-form-tipo').value = tipo;
            const btnIng = document.getElementById('btn-seccion-tipo-ingreso');
            const btnEgr = document.getElementById('btn-seccion-tipo-egreso');
            if (tipo === 'Ingreso') {
                btnIng.className = 'py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnEgr.className = 'py-2.5 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50';
            } else {
                btnEgr.className = 'py-2.5 px-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnIng.className = 'py-2.5 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-emerald-50';
            }
        }

        function seleccionarEstudianteSeccion(val) {
            const inputCustom = document.getElementById('seccion-form-estudiante-custom');
            if (val === '__NUEVO__') {
                inputCustom.classList.remove('hidden');
                inputCustom.focus();
            } else {
                inputCustom.classList.add('hidden');
            }
        }

        function prellenarAbonoParaEstudiante(nombreEncoded) {
            const nombre = decodeURIComponent(nombreEncoded);
            const selectEst = document.getElementById('seccion-form-estudiante-select');
            for (let i = 0; i < selectEst.options.length; i++) {
                if (decodeURIComponent(selectEst.options[i].value) === nombre) {
                    selectEst.selectedIndex = i;
                    break;
                }
            }
            document.getElementById('seccion-form-concepto').value = 'Abono de Cuota Pendiente';
            document.getElementById('seccion-form-monto').focus();
        }

        // =========================================================================
        // GUARDAR MOVIMIENTO DIRECTO EN LA SECCIÓN ("QUE SE VEA LO QUE AÑADIMOS")
        // =========================================================================
        async function guardarMovimientoEnSeccion(e) {
            e.preventDefault();
            const monto = parseFloat(document.getElementById('seccion-form-monto').value);
            if (!monto || monto <= 0) {
                alert("Por favor ingrese una cantidad válida mayor a cero.");
                return;
            }

            const selectEst = document.getElementById('seccion-form-estudiante-select').value;
            const customEst = document.getElementById('seccion-form-estudiante-custom').value.trim();
            const nombreEst = (selectEst === '__NUEVO__' ? customEst : decodeURIComponent(selectEst)).trim();

            if (!nombreEst) {
                alert("Por favor seleccione un estudiante o escriba su nombre.");
                return;
            }

            const grupoNombre = document.getElementById('seccion-form-grupo-nombre').value;
            const encargado = document.getElementById('seccion-form-encargado').value;
            const tipo = document.getElementById('seccion-form-tipo').value;
            const concepto = document.getElementById('seccion-form-concepto').value.trim();
            const fecha = document.getElementById('seccion-form-fecha').value;
            const metodo = document.getElementById('seccion-form-metodo').value;

            const payload = {
                tipo: tipo,
                estado: 'Pagado',
                rol: 'Estudiante',
                nombre: nombreEst,
                grupo: grupoNombre,
                encargado: encargado,
                carrera: document.getElementById('plantilla-seccion-carrera').innerText,
                concepto: concepto,
                monto: monto,
                monto_total: monto,
                monto_abonado: monto,
                fecha: fecha,
                metodo_pago: metodo,
                notas: \`Registrado directamente desde la plantilla de la sección \${grupoNombre}\`
            };

            try {
                const res = await fetch('/api/movimientos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success) {
                    // Mostrar aviso verde de confirmación instantánea
                    const aviso = document.getElementById('aviso-movimiento-seccion');
                    const txt = document.getElementById('aviso-movimiento-texto');
                    if (aviso && txt) {
                        txt.innerText = \`¡Movimiento guardado con éxito! Se registró REC-\${String(data.id || '').padStart(5, '0')} por S/. \${monto.toFixed(2)} a favor de \${nombreEst}.\`;
                        aviso.classList.remove('hidden');
                        setTimeout(() => aviso.classList.add('hidden'), 5000);
                    }

                    // Limpiar campos para el siguiente
                    document.getElementById('seccion-form-monto').value = '';
                    document.getElementById('seccion-form-concepto').value = 'Cuota Mensual Módulo 1';

                    // ACTUALIZACIÓN INMEDIATA EN PANTALLA ("QUE SE VEA LO QUE AÑADIMOS")
                    await verPlantillaSeccion(currentPlantillaGrupoId);
                    await cargarStats();
                    await cargarGrupos();
                } else {
                    alert("Error: " + (data.error || "No se pudo registrar el movimiento"));
                }
            } catch (err) {
                alert("Error de conexión al registrar movimiento");
            }
        }

        // =========================================================================
        // CARGAR MATRIZ DE CONTROL DE PAGOS (MES A MES)
        // =========================================================================
        let controlPagosGlobal = [];

        async function cargarControlPagos() {
            try {
                const resEst = await fetch('/api/estudiantes');
                controlPagosGlobal = await resEst.json();
                renderControlPagos(controlPagosGlobal);
            } catch (err) {
                console.error("Error al cargar control de pagos:", err);
            }
        }

        function filtrarControlPagos() {
            const query = (document.getElementById('filtro-control-pagos-buscar')?.value || '').toLowerCase();
            const filtrados = controlPagosGlobal.filter(e => 
                e.nombre.toLowerCase().includes(query) || 
                e.codigo.toLowerCase().includes(query) || 
                (e.grupo || '').toLowerCase().includes(query)
            );
            renderControlPagos(filtrados);
        }

        function renderControlPagos(lista) {
            const tbody = document.getElementById('tabla-control-pagos-body');
            if (!tbody) return;

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="19" class="p-6 text-center text-slate-400">No se encontraron estudiantes para la matriz.</td></tr>';
                return;
            }

            tbody.innerHTML = lista.map((e, idx) => {
                const pagado = e.total_pagado || 0;
                const deuda = e.total_deuda || 0;

                // Generar cuotas mes a mes según monto pagado
                // Asumimos cuota base de 150/100
                const numCuotasPagadas = Math.floor(pagado / 150);
                const meses = [];
                for (let m = 1; m <= 12; m++) {
                    if (m <= numCuotasPagadas || (m <= 3 && pagado >= 300)) {
                        meses.push('<td class="py-2 px-1 text-center font-bold text-emerald-600 bg-emerald-50/50">✓</td>');
                    } else if (m <= 9 && deuda > 0) {
                        meses.push('<td class="py-2 px-1 text-center font-bold text-amber-500 bg-amber-50/30">•</td>');
                    } else {
                        meses.push('<td class="py-2 px-1 text-center text-slate-300">-</td>');
                    }
                }

                return \`
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-2 px-3 text-slate-400 font-bold">\${idx + 1}</td>
                        <td class="py-2 px-3 font-bold text-indigo-700">\${e.codigo}</td>
                        <td class="py-2 px-3 font-semibold text-slate-900">\${e.nombre}</td>
                        <td class="py-2 px-3 text-slate-600 text-[10px]">\${e.grupo || 'General'}</td>
                        <td class="py-2 px-2 text-center text-teal-700 font-bold">✓</td>
                        \${meses.join('')}
                        <td class="py-2 px-3 text-right font-extrabold text-emerald-700">\${fMoney(pagado)}</td>
                        <td class="py-2 px-3 text-right font-extrabold \${deuda > 0 ? 'text-rose-600' : 'text-slate-400'}">\${fMoney(deuda)}</td>
                    </tr>
                \`;
            }).join('');
        }

        // =========================================================================
        // CARGAR HOJA DIARIO & NOTAS
        // =========================================================================
        async function cargarDiario(fecha) {
            try {
                const res = await fetch(\`/api/diario?fecha=\${encodeURIComponent(fecha)}\`);
                const data = await res.json();
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('diario-ingresos').innerText = fMoney(data.ingresos || 0);
                document.getElementById('diario-pagos-count').innerText = \`\${data.pagos_count || 0} Recibos\`;
                document.getElementById('diario-egresos').innerText = fMoney(data.egresos || 0);
                document.getElementById('diario-saldo').innerText = fMoney(data.saldo || 0);

                const tbody = document.getElementById('diario-tabla-movimientos');
                document.getElementById('diario-movs-badge').innerText = \`\${data.movimientos.length} Registros\`;

                if (data.movimientos.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">No se registraron movimientos en esta fecha. Puede elegir otra fecha arriba.</td></tr>';
                } else {
                    tbody.innerHTML = data.movimientos.map(m => \`
                        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                            <td class="py-2.5 px-4 font-bold text-slate-800">REC-\${String(m.id).padStart(5, '0')}</td>
                            <td class="py-2.5 px-4 font-semibold text-slate-900">\${m.nombre}</td>
                            <td class="py-2.5 px-4 text-slate-600">\${m.grupo || '-'}</td>
                            <td class="py-2.5 px-4 text-slate-600">\${m.encargado || '-'}</td>
                            <td class="py-2.5 px-4 text-slate-700 font-medium">\${m.concepto}</td>
                            <td class="py-2.5 px-4 text-right font-extrabold text-emerald-600">\${fMoney(m.monto)}</td>
                            <td class="py-2.5 px-4 text-center text-slate-500">\${m.metodo_pago || 'Efectivo'}</td>
                        </tr>
                    \`).join('');
                }
            } catch (err) {
                console.error("Error al cargar diario:", err);
            }
        }

        // =========================================================================
        // CARGAR COMPROBANTE DE PAGO (HOJA FACTURA)
        // =========================================================================
        let listaRecibosFactura = [];

        async function poblarSelectorFactura() {
            try {
                if (movimientosGlobales.length === 0) {
                    const res = await fetch('/api/movimientos');
                    movimientosGlobales = await res.json();
                }
                const select = document.getElementById('factura-recibo-select');
                if (!select) return;

                select.innerHTML = '<option value="">-- Elija un Recibo / Pago Registrado --</option>' +
                    movimientosGlobales.map(m => \`<option value="\${m.id}">REC-\${String(m.id).padStart(5, '0')} | \${m.fecha} | \${m.nombre} | S/. \${m.monto.toFixed(2)} - \${m.concepto}</option>\`).join('');

                if (movimientosGlobales.length > 0) {
                    seleccionarFacturaRecibo(movimientosGlobales[0].id);
                }
            } catch (err) {
                console.error("Error al poblar selector factura:", err);
            }
        }

        function seleccionarFacturaRecibo(reciboId) {
            const m = movimientosGlobales.find(x => x.id == reciboId);
            if (!m) return;

            const nroRec = 'R001-' + String(m.id).padStart(6, '0');
            document.getElementById('factura-nro-comprobante').innerText = nroRec;
            document.getElementById('factura-orden-ingreso').innerText = 'Orden Ingreso N° ' + String(m.id).padStart(6, '0');
            document.getElementById('factura-fecha').innerText = m.fecha;
            document.getElementById('factura-estudiante').innerText = m.nombre;
            document.getElementById('factura-dni').innerText = m.codigo_estudiante || ('DNI ' + (70000000 + m.id));
            document.getElementById('factura-grupo').innerText = m.grupo || 'General';
            document.getElementById('factura-docente').innerText = m.encargado || 'Teresa Aguilar Gómez';
            document.getElementById('factura-forma-pago').innerText = m.metodo_pago || 'Efectivo en Caja';
            document.getElementById('factura-concepto').innerText = m.concepto;
            
            const montoStr = 'S/. ' + m.monto.toFixed(2);
            document.getElementById('factura-precio-unit').innerText = montoStr;
            document.getElementById('factura-total-fila').innerText = montoStr;
            document.getElementById('factura-total-monto').innerText = montoStr;
            document.getElementById('factura-monto-letras').innerText = numeroALetras(m.monto);
        }

        function verBoletaDirecta(reciboId) {
            cambiarSeccion('factura');
            setTimeout(() => {
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = reciboId;
                seleccionarFacturaRecibo(reciboId);
            }, 300);
        }

        function imprimirFactura() {
            window.print();
        }

        // Conversor oficial de cantidades numéricas a letras en Soles
        function numeroALetras(monto) {
            const enteros = Math.floor(monto);
            const centavos = Math.round((monto - enteros) * 100);
            const centavosStr = String(centavos).padStart(2, '0') + '/100 SOLES';

            const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
            const especiales = {
                10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
                20: 'VEINTE'
            };
            const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
            const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

            function convertirMenorMil(n) {
                if (n === 100) return 'CIEN';
                let res = '';
                const c = Math.floor(n / 100);
                const d = Math.floor((n % 100) / 10);
                const u = n % 10;

                if (c > 0) res += centenas[c] + ' ';
                const du = n % 100;
                if (du === 0) return res.trim();

                if (especiales[du]) {
                    res += especiales[du];
                } else if (du > 15 && du < 20) {
                    res += 'DIECI' + unidades[u];
                } else if (du > 20 && du < 30) {
                    res += 'VEINTI' + unidades[u];
                } else {
                    if (d > 0) res += decenas[d];
                    if (d > 0 && u > 0) res += ' Y ';
                    if (u > 0) res += unidades[u];
                }
                return res.trim();
            }

            let texto = '';
            if (enteros === 0) {
                texto = 'CERO';
            } else if (enteros === 1000) {
                texto = 'MIL';
            } else if (enteros > 1000) {
                const miles = Math.floor(enteros / 1000);
                const resto = enteros % 1000;
                const txtMiles = miles === 1 ? 'MIL' : (convertirMenorMil(miles) + ' MIL');
                texto = txtMiles + (resto > 0 ? (' ' + convertirMenorMil(resto)) : '');
            } else {
                texto = convertirMenorMil(enteros);
            }

            return \`SON: \${texto} CON \${centavosStr}\`;
        }`;

if (html.includes(targetStart)) {
    const startIdx = html.indexOf(targetStart);
    const endIdx = html.indexOf(targetEnd);
    if (endIdx > -1) {
        html = html.substring(0, startIdx) + newJSFunctions + '\r\n\r\n        ' + html.substring(endIdx + targetEnd.length);
        fs.writeFileSync('templates/index.html', html, 'utf8');
        console.log('JavaScript functions and cambiarSeccion successfully updated in templates/index.html!');
    } else {
        console.log('Could not find targetEnd');
    }
} else {
    console.log('Could not find targetStart');
}
