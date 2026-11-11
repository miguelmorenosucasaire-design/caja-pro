
        let myChart = null;
        let movimientosGlobales = [];
        let estudiantesGlobales = [];
        let respaldosGlobales = [];
        let gruposGlobales = [];
        let modoVistaEstudiantes = 'grid';

        // =========================================================================
        // GESTIÓN DE TEMA: MODO CLARO Y MODO FUTURISTA CYBER DARK
        // =========================================================================
        function initTheme() {
            const savedTheme = localStorage.getItem('cetpro-theme') || 'dark';
            applyTheme(savedTheme);
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('cetpro-theme', newTheme);
        }

        function applyTheme(theme) {
            const htmlEl = document.documentElement;
            const labelEl = document.getElementById('theme-label');
            const iconEl = document.getElementById('theme-icon');
            const btnEl = document.getElementById('btn-theme-toggle');

            if (theme === 'dark') {
                htmlEl.classList.add('dark');
                if (labelEl) labelEl.innerText = 'Cyber Dark';
                if (iconEl) iconEl.className = 'fa-solid fa-moon text-cyan-400';
                if (btnEl) {
                    btnEl.className = 'cyber-btn px-3 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 shadow-sm shadow-cyan-500/20';
                }
            } else {
                htmlEl.classList.remove('dark');
                if (labelEl) labelEl.innerText = 'Modo Claro';
                if (iconEl) iconEl.className = 'fa-solid fa-sun text-amber-500';
                if (btnEl) {
                    btnEl.className = 'px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-sm';
                }
            }
        }


        // =========================================================================
        // NAVEGACIÓN MAESTRO-DETALLE DE 13 SECCIONES (DE LADO)
        // =========================================================================
        let filtroTurnoSidebarActivo = '';

        function setFiltroTurnoSidebar(turno) {
            filtroTurnoSidebarActivo = turno;
            ['todos', 'manana', 'tarde', 'noche'].forEach(t => {
                const btn = document.getElementById('btn-filtro-turno-' + t);
                if (!btn) return;
                const key = t === 'todos' ? '' : (t === 'manana' ? 'Mañana' : (t === 'tarde' ? 'Tarde' : 'Noche'));
                if (key === turno) {
                    btn.className = 'btn-filtro-turno-sidebar py-1 px-1.5 rounded-lg bg-indigo-600 text-white text-center transition font-bold shadow-sm';
                } else {
                    btn.className = 'btn-filtro-turno-sidebar py-1 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition font-bold';
                }
            });
            filtrarSidebarGrupos();
        }

        function filtrarSidebarGrupos() {
            const buscar = (document.getElementById('filtro-sidebar-grupos')?.value || '').toLowerCase();
            const filtrados = gruposGlobales.filter(g => {
                const coincideTexto = !buscar || 
                    g.nombre.toLowerCase().includes(buscar) || 
                    g.encargado.toLowerCase().includes(buscar) || 
                    g.carrera.toLowerCase().includes(buscar) ||
                    (g.aula_taller && g.aula_taller.toLowerCase().includes(buscar));
                const coincideTurno = !filtroTurnoSidebarActivo || g.turno === filtroTurnoSidebarActivo;
                return coincideTexto && coincideTurno;
            });
            renderListaSidebar(filtrados);
        }

        function renderSidebarSecciones(grupos) {
            renderListaSidebar(grupos);
        }

        function renderListaSidebar(grupos) {
            const contenedor = document.getElementById('sidebar-lista-secciones');
            if (!contenedor) return;

            if (grupos.length === 0) {
                contenedor.innerHTML = `
                    <div class="p-6 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-layer-group text-3xl text-indigo-400 dark:text-indigo-600 mb-2 block"></i>
                        <p class="font-bold text-slate-700 dark:text-slate-300">0 Secciones Registradas</p>
                        <p class="text-[11px] text-slate-400 mt-1">Las secciones se añaden manualmente.</p>
                        <button onclick="abrirModalNuevoGrupo()" class="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[11px] shadow-sm transition">
                            ➕ Añadir Sección
                        </button>
                    </div>
                `;
                return;
            }

            const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            contenedor.innerHTML = grupos.map((g, idx) => {
                const codMatch = g.nombre.match(/^G\d+/i);
                const cod = codMatch ? codMatch[0].toUpperCase() : ('G' + String(idx + 1).padStart(2, '0'));
                const esActivo = g.id == currentPlantillaGrupoId;

                let badgeTurnoColor = 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';

                return `
                    <div onclick="seleccionarSeccionSidebar(${g.id})" id="sidebar-item-grupo-${g.id}" class="sidebar-item-seccion cursor-pointer p-3 rounded-xl border transition-all ${esActivo ? 'cyber-active-item bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}">
                        <div class="flex items-start justify-between gap-1 mb-1">
                            <div class="flex items-center space-x-1.5 min-w-0">
                                <span class="font-black text-[10px] px-1.5 py-0.5 rounded ${esActivo ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'}">
                                    ${cod}
                                </span>
                                <h5 class="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate" title="${g.nombre}">
                                    ${g.nombre.replace(/^G\d+\s*[-·:]\s*/i, '')}
                                </h5>
                            </div>
                            <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${badgeTurnoColor} flex-shrink-0">
                                ${g.turno}
                            </span>
                        </div>

                        <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 truncate mt-1">
                            <i class="fa-solid fa-chalkboard-user text-indigo-500 text-[10px]"></i>
                            <span class="truncate font-medium">${g.encargado}</span>
                        </div>

                        <div class="flex items-center justify-between text-[10px] font-bold mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <span>👥 ${g.total_alumnos || 0} alumnos</span>
                            <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">+S/. ${fMoney(g.total_ingresos || 0)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function seleccionarSeccionSidebar(grupoId) {
            currentPlantillaGrupoId = grupoId;
            document.querySelectorAll('.sidebar-item-seccion').forEach(el => {
                el.classList.remove('cyber-active-item', 'bg-indigo-50/70', 'dark:bg-indigo-950/50', 'border-indigo-400', 'dark:border-indigo-500', 'shadow-sm');
                el.classList.add('bg-white', 'dark:bg-slate-900', 'border-slate-200/90', 'dark:border-slate-800');
            });
            const selEl = document.getElementById('sidebar-item-grupo-' + grupoId);
            if (selEl) {
                selEl.classList.remove('bg-white', 'dark:bg-slate-900', 'border-slate-200/90', 'dark:border-slate-800');
                selEl.classList.add('cyber-active-item', 'bg-indigo-50/70', 'dark:bg-indigo-950/50', 'border-indigo-400', 'dark:border-indigo-500', 'shadow-sm');
            }
            await verPlantillaSeccion(grupoId);
        }

        function toggleFormularioSeccion() {
            const formCont = document.getElementById('form-movimiento-seccion-container');
            const btnLabel = document.getElementById('btn-toggle-form-label');
            if (!formCont) return;
            if (formCont.classList.contains('hidden')) {
                formCont.classList.remove('hidden');
                if (btnLabel) btnLabel.innerText = 'Cerrar Formulario';
                document.getElementById('seccion-form-monto')?.focus();
            } else {
                formCont.classList.add('hidden');
                if (btnLabel) btnLabel.innerText = '➕ Registrar Movimiento';
            }
        }


        // =========================================================================
        // ASIGNACIÓN DE CARRERAS OFICIALES (7 ESPECIALIDADES) A ESTUDIANTES
        // =========================================================================
        function abrirModalAsignarCarrera(id, nombre, carreraActual = '', grupoActual = '') {
            document.getElementById('asignar-carrera-estudiante-id').value = id;
            document.getElementById('asignar-carrera-estudiante-nombre').innerText = nombre;
            
            const selCarrera = document.getElementById('asignar-carrera-select');
            if (carreraActual && !carreraActual.toLowerCase().includes('sin asignar') && !carreraActual.toLowerCase().includes('pendiente')) {
                selCarrera.value = carreraActual;
            } else {
                selCarrera.value = '';
            }
            
            poblarSelectGruposParaAsignar(selCarrera.value, grupoActual);
            document.getElementById('modal-asignar-carrera-estudiante').classList.remove('hidden');
        }

        function cerrarModalAsignarCarrera() {
            document.getElementById('modal-asignar-carrera-estudiante').classList.add('hidden');
        }

        function alCambiarCarreraEnModalAsignar() {
            const carrera = document.getElementById('asignar-carrera-select').value;
            poblarSelectGruposParaAsignar(carrera);
        }

        function poblarSelectGruposParaAsignar(carrera, grupoSeleccionado = '') {
            const selGrupo = document.getElementById('asignar-grupo-select');
            if (!selGrupo) return;
            
            let gruposFiltrados = gruposGlobales;
            if (carrera) {
                const primerToken = carrera.toLowerCase().split(' ')[0];
                gruposFiltrados = gruposGlobales.filter(g => g.carrera === carrera || g.nombre.toLowerCase().includes(primerToken));
                if (gruposFiltrados.length === 0) gruposFiltrados = gruposGlobales;
            }
            
            let opts = '<option value="">-- Seleccionar Sección / Grupo --</option>';
            gruposFiltrados.forEach(g => {
                opts += `<option value="${g.nombre}">${g.nombre} (${g.encargado} - Turno ${g.turno})</option>`;
            });
            opts += '<option value="General">General / Sin Grupo Específico</option>';
            selGrupo.innerHTML = opts;
            
            if (grupoSeleccionado && gruposFiltrados.some(g => g.nombre === grupoSeleccionado)) {
                selGrupo.value = grupoSeleccionado;
            } else if (gruposFiltrados.length > 0) {
                selGrupo.value = gruposFiltrados[0].nombre;
            }
        }

        async function guardarAsignacionCarrera(e) {
            e.preventDefault();
            const id = document.getElementById('asignar-carrera-estudiante-id').value;
            const carrera = document.getElementById('asignar-carrera-select').value;
            const grupo = document.getElementById('asignar-grupo-select').value;

            if (!carrera) {
                alert("Por favor selecciona una de las 7 carreras oficiales.");
                return;
            }

            try {
                const res = await fetch(`/api/estudiantes/${id}/asignar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ carrera, grupo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAsignarCarrera();
                    alert(`✅ Estudiante asignado exitosamente a la especialidad:\n"${carrera}" (Sección: ${grupo || 'General'})\n\nSincronizado en SQLite y en el libro Excel.`);
                    await cargarEstudiantes();
                    await cargarGrupos();
                    await cargarMovimientos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo asignar la carrera'}`);
                }
            } catch (err) {
                alert("Error de conexión al asignar carrera");
            }
        }


        // =========================================================================
        // SEGURIDAD: VERIFICACIÓN CRIPTOGRÁFICA SHA-256 DE RESPALDOS
        // =========================================================================
        async function verificarIntegridadRespaldo(nombre) {
            try {
                const res = await fetch(`/api/backups/verificar/${encodeURIComponent(nombre)}`);
                const data = await res.json();
                
                if (data.error) {
                    alert(`Error al verificar: ${data.error}`);
                    return;
                }

                document.getElementById('verif-archivo-nombre').innerText = nombre;
                document.getElementById('verif-hash-calculado').innerText = data.hash_calculado || '--';
                document.getElementById('verif-hash-esperado').innerText = data.hash_esperado || '(Firma registrada)';
                document.getElementById('verif-tamano').innerText = `${Number(data.tamano_bytes).toLocaleString()} bytes`;
                document.getElementById('verif-sqlite').innerText = data.integrity_sqlite === 'ok' ? 'Consistente y Válido (PRAGMA: ok)' : (data.integrity_sqlite || 'Archivo CSV/Excel');
                
                const badgeEstado = document.getElementById('verif-estado-badge');
                if (data.valido) {
                    badgeEstado.className = 'px-3.5 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black flex items-center space-x-2';
                    badgeEstado.innerHTML = '<i class="fa-solid fa-shield-halved text-emerald-600 text-base"></i> <span>INTEGRIDAD 100% VERIFICADA · ARCHIVO ÍNTEGRO Y SEGURO</span>';
                } else {
                    badgeEstado.className = 'px-3.5 py-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-black flex items-center space-x-2';
                    badgeEstado.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-600 text-base"></i> <span>ALERTA: DISCREPANCIA EN LA FIRMA SHA-256</span>';
                }

                document.getElementById('modal-verificar-respaldo').classList.remove('hidden');
            } catch (err) {
                alert("Error de conexión al verificar el respaldo");
            }
        }

        function cerrarModalVerificarRespaldo() {
            document.getElementById('modal-verificar-respaldo').classList.add('hidden');
        }


        document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];

        // CAMBIO DE PESTAÑAS
        let seccionActivaActual = 'dashboard';
        let currentPlantillaGrupoId = null;

        function cambiarSeccion(seccion) {
            seccionActivaActual = seccion;
            const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos', 'control-pagos', 'diario', 'factura', 'configuracion'];
            
            secciones.forEach(s => {
                const secEl = document.getElementById(`section-${s}`);
                const navEl = document.getElementById(`nav-${s}`);
                const topNavEl = document.getElementById(`top-nav-${s}`);
                const sheetTabEl = document.getElementById(`sheet-tab-${s}`);

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

            const activeSec = document.getElementById(`section-${seccion}`);
            const activeNav = document.getElementById(`nav-${seccion}`);
            const activeTopNav = document.getElementById(`top-nav-${seccion}`);
            const activeSheetTab = document.getElementById(`sheet-tab-${seccion}`);

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
                factura: ['FACTURA · Comprobante de Pago Oficial', 'Emisión e impresión de boletas oficiales con número en letras y sellos'],
                configuracion: ['CONFIGURACIÓN · Sedes, RUC y Facturación', 'Gestión centralizada del campus, sedes, RUC, datos de contacto manual y comprobantes']
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
            if (seccion === 'configuracion') cargarConfiguracion();
            if (seccion === 'carreras') cargarCarreras();
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

            window.location.href = `/api/exportar/hoja?sheet=${sheetName}`;
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
                const res = await fetch(`/api/grupos/${grupoId}/detalle`);
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
                const tabActivo = document.getElementById(`tab-grupo-${grupoId}`);
                if (tabActivo) {
                    tabActivo.classList.remove('text-slate-600', 'hover:bg-slate-100');
                    tabActivo.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
                }

                // Encabezados dinámicos para los 13 grupos
                const idx = gruposGlobales.findIndex(x => x.id == grupoId);
                const codMatch = g.nombre.match(/^G\d+/i);
                const cod = codMatch ? codMatch[0].toUpperCase() : (idx >= 0 ? `G${String(idx + 1).padStart(2, '0')}` : `G${g.id}`);
                document.getElementById('plantilla-seccion-codigo-badge').innerText = cod;
                document.getElementById('plantilla-seccion-nombre').innerText = g.nombre.startsWith(cod) ? g.nombre : `${cod} · ${g.nombre}`;
                document.getElementById('plantilla-seccion-subtitulo').innerText = `Especialidad: ${g.carrera} • Turno: ${g.turno} • Periodo Anual 2026`;
                document.getElementById('plantilla-seccion-encargado').innerText = g.encargado;
                document.getElementById('plantilla-seccion-horario').innerText = `${g.turno} • ${g.horario || 'Regular'}`;
                document.getElementById('plantilla-seccion-aula').innerText = g.aula_taller || 'Taller Principal';
                document.getElementById('plantilla-seccion-carrera').innerText = g.carrera;

                // KPIs
                document.getElementById('plantilla-kpi-alumnos').innerText = `${data.estudiantes.length} Estudiantes`;
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
                    data.estudiantes.map(e => `<option value="${encodeURIComponent(e.nombre)}">${e.codigo} - ${e.nombre} (Pagado: S/. ${e.total_pagado})</option>`).join('') +
                    '<option value="__NUEVO__">+ Registrar Otro / Estudiante Nuevo</option>';

                // Renderizar Tabla 1: Estudiantes
                const tbodyEst = document.getElementById('plantilla-tabla-alumnos-body');
                document.getElementById('plantilla-tabla-alumnos-count').innerText = `${data.estudiantes.length} Alumnos`;
                if (data.estudiantes.length === 0) {
                    tbodyEst.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">No hay alumnos asignados a este grupo aún.</td></tr>';
                } else {
                    tbodyEst.innerHTML = data.estudiantes.map((e, idx) => {
                        const tieneDeuda = (e.total_deuda || 0) > 0;
                        const badgeEstado = tieneDeuda 
                            ? '<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Con Deuda</span>'
                            : '<span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Al Día</span>';
                        return `
                            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                                <td class="py-2.5 px-4 text-slate-400 font-bold">${idx + 1}</td>
                                <td class="py-2.5 px-4 font-bold text-indigo-700">${e.codigo}</td>
                                <td class="py-2.5 px-4 font-semibold text-slate-800">${e.nombre}</td>
                                <td class="py-2.5 px-4 text-slate-500">${e.telefono || '-'}</td>
                                <td class="py-2.5 px-4 text-right font-bold text-emerald-600">${fMoney(e.total_pagado)}</td>
                                <td class="py-2.5 px-4 text-right font-bold ${tieneDeuda ? 'text-rose-600' : 'text-slate-400'}">${fMoney(e.total_deuda)}</td>
                                <td class="py-2.5 px-4 text-center">${badgeEstado}</td>
                                <td class="py-2.5 px-4 text-center no-print">
                                    <button onclick="prellenarAbonoParaEstudiante('${encodeURIComponent(e.nombre)}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold text-[10px] transition mr-1">
                                        + Abonar
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }

                // Renderizar Tabla 2: Movimientos / Recibos de la Sección
                const tbodyMov = document.getElementById('plantilla-tabla-movimientos-body');
                document.getElementById('plantilla-tabla-movimientos-count').innerText = `${data.movimientos.length} Recibos`;
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">No hay movimientos registrados para esta sección aún.</td></tr>';
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => {
                        const isIngreso = m.tipo === 'Ingreso';
                        return `
                            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                                <td class="py-2.5 px-4 font-bold text-slate-800">REC-${String(m.id).padStart(5, '0')}</td>
                                <td class="py-2.5 px-4 text-slate-600">${m.fecha}</td>
                                <td class="py-2.5 px-4 font-semibold text-slate-900">${m.nombre}</td>
                                <td class="py-2.5 px-4 text-slate-700 text-[11px]">${m.encargado || g.encargado}</td>
                                <td class="py-2.5 px-4 text-center">
                                    <span class="${isIngreso ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                        ${m.tipo}
                                    </span>
                                </td>
                                <td class="py-2.5 px-4 text-slate-700 font-medium">${m.concepto}</td>
                                <td class="py-2.5 px-4 text-right font-extrabold ${isIngreso ? 'text-emerald-600' : 'text-rose-600'}">${fMoney(m.monto)}</td>
                                <td class="py-2.5 px-4 text-center text-slate-500">${m.metodo_pago || 'Efectivo'}</td>
                                <td class="py-2.5 px-4 text-center no-print">
                                    <button onclick="verBoletaDirecta(${m.id})" title="Imprimir Boleta" class="text-sky-600 hover:text-sky-800 p-1 font-bold">
                                        <i class="fa-solid fa-receipt"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
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
                notas: `Registrado directamente desde la plantilla de la sección ${grupoNombre}`
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
                        txt.innerText = `¡Movimiento guardado con éxito! Se registró REC-${String(data.id || '').padStart(5, '0')} por S/. ${monto.toFixed(2)} a favor de ${nombreEst}.`;
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

                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-2 px-3 text-slate-400 font-bold">${idx + 1}</td>
                        <td class="py-2 px-3 font-bold text-indigo-700">${e.codigo}</td>
                        <td class="py-2 px-3 font-semibold text-slate-900">${e.nombre}</td>
                        <td class="py-2 px-3 text-slate-600 text-[10px]">${e.grupo || 'General'}</td>
                        <td class="py-2 px-2 text-center text-teal-700 font-bold">✓</td>
                        ${meses.join('')}
                        <td class="py-2 px-3 text-right font-extrabold text-emerald-700">${fMoney(pagado)}</td>
                        <td class="py-2 px-3 text-right font-extrabold ${deuda > 0 ? 'text-rose-600' : 'text-slate-400'}">${fMoney(deuda)}</td>
                    </tr>
                `;
            }).join('');
        }

        // =========================================================================
        // CARGAR HOJA DIARIO & NOTAS
        // =========================================================================
        async function cargarDiario(fecha) {
            try {
                const res = await fetch(`/api/diario?fecha=${encodeURIComponent(fecha)}`);
                const data = await res.json();
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('diario-ingresos').innerText = fMoney(data.ingresos || 0);
                document.getElementById('diario-pagos-count').innerText = `${data.pagos_count || 0} Recibos`;
                document.getElementById('diario-egresos').innerText = fMoney(data.egresos || 0);
                document.getElementById('diario-saldo').innerText = fMoney(data.saldo || 0);

                const tbody = document.getElementById('diario-tabla-movimientos');
                document.getElementById('diario-movs-badge').innerText = `${data.movimientos.length} Registros`;

                if (data.movimientos.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">No se registraron movimientos en esta fecha. Puede elegir otra fecha arriba.</td></tr>';
                } else {
                    tbody.innerHTML = data.movimientos.map(m => `
                        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                            <td class="py-2.5 px-4 font-bold text-slate-800">REC-${String(m.id).padStart(5, '0')}</td>
                            <td class="py-2.5 px-4 font-semibold text-slate-900">${m.nombre}</td>
                            <td class="py-2.5 px-4 text-slate-600">${m.grupo || '-'}</td>
                            <td class="py-2.5 px-4 text-slate-600">${m.encargado || '-'}</td>
                            <td class="py-2.5 px-4 text-slate-700 font-medium">${m.concepto}</td>
                            <td class="py-2.5 px-4 text-right font-extrabold text-emerald-600">${fMoney(m.monto)}</td>
                            <td class="py-2.5 px-4 text-center text-slate-500">${m.metodo_pago || 'Efectivo'}</td>
                        </tr>
                    `).join('');
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
                    movimientosGlobales.map(m => `<option value="${m.id}">REC-${String(m.id).padStart(5, '0')} | ${m.fecha} | ${m.nombre} | S/. ${m.monto.toFixed(2)} - ${m.concepto}</option>`).join('');

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

            const serie = configuracionGlobal.serie_comprobante || 'B001';
            const nroRec = serie + '-' + String(m.id).padStart(6, '0');
            actualizarMembretesFactura();
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

            return `SON: ${texto} CON ${centavosStr}`;
        }

        


        // =========================================================================
        // CONFIGURACIÓN INSTITUCIONAL, SEDES Y FACTURACIÓN
        // =========================================================================
        let configuracionGlobal = {};

        async function cargarConfiguracion() {
            try {
                const res = await fetch('/api/configuracion');
                configuracionGlobal = await res.json();

                const mapFields = {
                    'cfg-nombre-institucion': 'nombre_institucion',
                    'cfg-ruc': 'ruc',
                    'cfg-campus': 'campus',
                    'cfg-direccion': 'direccion',
                    'cfg-telefono': 'telefono',
                    'cfg-email': 'email',
                    'cfg-serie-comprobante': 'serie_comprobante',
                    'cfg-correlativo': 'correlativo_inicio',
                    'cfg-moneda': 'moneda',
                    'cfg-responsable-nombre': 'responsable_nombre',
                    'cfg-responsable-cargo': 'responsable_cargo',
                    'cfg-mensaje-pie': 'mensaje_pie'
                };

                for (const [id, key] of Object.entries(mapFields)) {
                    const el = document.getElementById(id);
                    if (el) el.value = configuracionGlobal[key] || '';
                }

                actualizarVistaPreviaConfig();
                actualizarMembretesFactura();
            } catch (err) {
                console.error("Error al cargar configuración:", err);
            }
        }

        async function guardarConfiguracionForm(e) {
            if (e && e.preventDefault) e.preventDefault();
            const payload = {
                nombre_institucion: (document.getElementById('cfg-nombre-institucion')?.value || '').trim(),
                ruc: (document.getElementById('cfg-ruc')?.value || '').trim(),
                campus: (document.getElementById('cfg-campus')?.value || '').trim(),
                direccion: (document.getElementById('cfg-direccion')?.value || '').trim(),
                telefono: (document.getElementById('cfg-telefono')?.value || '').trim(),
                email: (document.getElementById('cfg-email')?.value || '').trim(),
                serie_comprobante: (document.getElementById('cfg-serie-comprobante')?.value || 'B001').trim(),
                correlativo_inicio: (document.getElementById('cfg-correlativo')?.value || '000203').trim(),
                moneda: (document.getElementById('cfg-moneda')?.value || 'S/.').trim(),
                responsable_nombre: (document.getElementById('cfg-responsable-nombre')?.value || '').trim(),
                responsable_cargo: (document.getElementById('cfg-responsable-cargo')?.value || '').trim(),
                mensaje_pie: (document.getElementById('cfg-mensaje-pie')?.value || '').trim()
            };

            try {
                const res = await fetch('/api/configuracion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    configuracionGlobal = data.configuracion || payload;
                    actualizarVistaPreviaConfig();
                    actualizarMembretesFactura();
                    
                    const msg = document.getElementById('config-status-msg');
                    if (msg) {
                        msg.classList.remove('hidden');
                        setTimeout(() => msg.classList.add('hidden'), 4000);
                    }
                    alert("✅ Configuración institucional guardada exitosamente y sincronizada en el libro Excel.");
                } else {
                    alert("Error al guardar configuración: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al guardar configuración.");
            }
        }

        function actualizarVistaPreviaConfig() {
            const nombre = document.getElementById('cfg-nombre-institucion')?.value || configuracionGlobal.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA';
            const ruc = document.getElementById('cfg-ruc')?.value || configuracionGlobal.ruc || '20485938210';
            const campus = document.getElementById('cfg-campus')?.value || configuracionGlobal.campus || 'Campus Central San Miguel';
            const direccion = document.getElementById('cfg-direccion')?.value || configuracionGlobal.direccion || 'Av. Costanera 1200, San Miguel, Lima';
            const tel = document.getElementById('cfg-telefono')?.value !== undefined ? document.getElementById('cfg-telefono').value.trim() : (configuracionGlobal.telefono || '');
            const email = document.getElementById('cfg-email')?.value !== undefined ? document.getElementById('cfg-email').value.trim() : (configuracionGlobal.email || '');
            const serie = document.getElementById('cfg-serie-comprobante')?.value || configuracionGlobal.serie_comprobante || 'B001';
            const correlativo = document.getElementById('cfg-correlativo')?.value || configuracionGlobal.correlativo_inicio || '000203';
            const moneda = document.getElementById('cfg-moneda')?.value || configuracionGlobal.moneda || 'S/.';
            const resp = document.getElementById('cfg-responsable-nombre')?.value || configuracionGlobal.responsable_nombre || 'Dirección General y Tesorería';
            const cargo = document.getElementById('cfg-responsable-cargo')?.value || configuracionGlobal.responsable_cargo || 'Administración de Caja Institucional';
            const pie = document.getElementById('cfg-mensaje-pie')?.value || configuracionGlobal.mensaje_pie || 'Comprobante oficial válido para control institucional interno.';

            if (document.getElementById('preview-cfg-nombre')) document.getElementById('preview-cfg-nombre').innerText = nombre;
            if (document.getElementById('preview-cfg-ruc')) document.getElementById('preview-cfg-ruc').innerText = ruc;
            if (document.getElementById('preview-cfg-campus')) document.getElementById('preview-cfg-campus').innerText = campus;
            if (document.getElementById('preview-cfg-direccion')) document.getElementById('preview-cfg-direccion').innerText = direccion;
            if (document.getElementById('preview-cfg-serie')) document.getElementById('preview-cfg-serie').innerText = `${serie}-${correlativo}`;
            if (document.getElementById('preview-cfg-monto')) document.getElementById('preview-cfg-monto').innerText = `${moneda} 150.00`;
            if (document.getElementById('preview-cfg-responsable')) document.getElementById('preview-cfg-responsable').innerText = resp;
            if (document.getElementById('preview-cfg-cargo')) document.getElementById('preview-cfg-cargo').innerText = cargo;
            if (document.getElementById('preview-cfg-pie')) document.getElementById('preview-cfg-pie').innerText = pie;

            const contactEl = document.getElementById('preview-cfg-contacto');
            if (contactEl) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(`Tel: ${tel}`);
                    if (email) parts.push(`Email: ${email}`);
                    contactEl.innerText = parts.join(' · ');
                    contactEl.className = 'text-[9px] text-slate-700 dark:text-slate-300 font-semibold mt-1';
                } else {
                    contactEl.innerText = '(Teléfono y correo pendientes de configuración manual)';
                    contactEl.className = 'text-[9px] text-slate-400 italic mt-1';
                }
            }
        }

        function actualizarMembretesFactura() {
            const nombre = configuracionGlobal.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA';
            const ruc = configuracionGlobal.ruc || '20485938210';
            const campus = configuracionGlobal.campus || 'Campus Central San Miguel';
            const direccion = configuracionGlobal.direccion || 'Av. Costanera 1200, San Miguel, Lima';
            const tel = configuracionGlobal.telefono ? configuracionGlobal.telefono.trim() : '';
            const email = configuracionGlobal.email ? configuracionGlobal.email.trim() : '';
            const resp = configuracionGlobal.responsable_nombre || 'Dirección General y Tesorería';
            const cargo = configuracionGlobal.responsable_cargo || 'Administración de Caja Institucional';
            const pie = configuracionGlobal.mensaje_pie || 'Comprobante oficial válido para control institucional interno.';

            const elNombre = document.getElementById('factura-inst-nombre');
            if (elNombre) elNombre.innerText = nombre;

            const elInfo = document.getElementById('factura-inst-info');
            if (elInfo) {
                elInfo.innerHTML = `RUC: ${ruc} · Campus: <strong class="text-slate-800">${campus}</strong> · Dirección: ${direccion}`;
            }

            const elContacto = document.getElementById('factura-contacto-row');
            if (elContacto) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(`Teléfono: <strong class="text-slate-800">${tel}</strong>`);
                    if (email) parts.push(`Correo: <strong class="text-slate-800">${email}</strong>`);
                    elContacto.innerHTML = parts.join(' · ');
                } else {
                    elContacto.innerHTML = `<span class="text-slate-400 italic text-[10px]"><i class="fa-solid fa-circle-info mr-1"></i> (Teléfono y correo pendientes de configuración manual en la pestaña ⚙️ Configuración)</span>`;
                }
            }

            const elResp = document.getElementById('factura-inst-responsable');
            if (elResp) elResp.innerText = resp;

            const elCargo = document.getElementById('factura-inst-cargo');
            if (elCargo) elCargo.innerText = cargo;

            const elPie = document.getElementById('factura-inst-pie');
            if (elPie) elPie.innerText = pie;
        }

        async function eliminarSeccionActual() {
            if (!currentPlantillaGrupoId) return;
            const g = gruposGlobales.find(x => x.id == currentPlantillaGrupoId);
            const nombre = g ? g.nombre : 'esta sección';
            if (!confirm(`¿Está seguro de eliminar la sección "${nombre}"?\nLos estudiantes matriculados pasarán a la sección "General" y los datos se preservarán intactos.`)) {
                return;
            }
            try {
                const res = await fetch(`/api/grupos/${currentPlantillaGrupoId}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ Sección eliminada exitosamente.`);
                    currentPlantillaGrupoId = null;
                    await cargarGrupos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo eliminar la sección'}`);
                }
            } catch (err) {
                alert("Error de conexión al eliminar sección.");
            }
        }

        async function cargarTodo() {
            await cargarConfiguracion();
            await cargarCarreras();
            await cargarStats();
            await cargarGrupos();
            await cargarMovimientos();
            await cargarEstudiantes();
            await cargarDocentes();
            await cargarDeudores();
            await cargarRespaldos();
        }

        // 1. STATS Y DASHBOARD
        async function cargarStats() {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('kpi-saldo').innerText = fMoney(data.saldo_actual);
                document.getElementById('kpi-ingresos').innerText = fMoney(data.total_ingresos);
                document.getElementById('kpi-egresos').innerText = fMoney(data.total_egresos);
                document.getElementById('kpi-deudas').innerText = fMoney(data.total_deudas);

                document.getElementById('kpi-ingresos-mes').innerText = `Este mes: ${fMoney(data.ingresos_mes)}`;
                document.getElementById('kpi-egresos-mes').innerText = `Este mes: ${fMoney(data.egresos_mes)}`;

                document.getElementById('kpi-docentes-salidas').innerText = fMoney(data.docentes.total_salidas);
                document.getElementById('kpi-docentes-entradas').innerText = fMoney(data.docentes.total_entradas);
                document.getElementById('kpi-docentes-balance').innerText = fMoney(data.docentes.balance);

                if (data.estudiantes) {
                    document.getElementById('est-total-alumnos').innerText = data.estudiantes.total_alumnos;
                    document.getElementById('est-faltan-completar').innerText = `${data.estudiantes.faltan_completar} Alumnos`;
                    document.getElementById('est-deben-todo').innerText = `${data.estudiantes.deben_todo} Alumnos`;
                    document.getElementById('est-saldo-restante').innerText = fMoney(data.estudiantes.saldo_restante);
                    
                    const totalDeudores = data.estudiantes.faltan_completar + data.estudiantes.deben_todo;
                    document.getElementById('badge-faltan-completar').innerText = totalDeudores;
                }

                if (data.meses_detalle) {
                    renderTablaResultados(data.meses_detalle, data.año_actual);
                }

                renderChart(data.chart);
                renderReporteCarreras(data.carreras);
            } catch (err) {
                console.error("Error cargando estadísticas:", err);
            }
        }

        function renderTablaResultados(meses, año) {
            const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const anioLabel = document.getElementById('label-ano-resultados');
            if (anioLabel) anioLabel.innerText = año || 2026;

            let totalIngresos = 0;
            let totalEgresos = 0;
            let mejorMes = { nombre: '--', monto: 0 };
            let mayorGasto = { nombre: '--', monto: 0 };
            let mesesConMov = 0;

            const htmlRows = meses.map(m => {
                totalIngresos += m.ingresos;
                totalEgresos += m.egresos;

                if (m.ingresos > mejorMes.monto) {
                    mejorMes = { nombre: m.mes_nombre, monto: m.ingresos };
                }
                if (m.egresos > mayorGasto.monto) {
                    mayorGasto = { nombre: m.mes_nombre, monto: m.egresos };
                }
                if (m.ingresos > 0 || m.egresos > 0) mesesConMov++;

                let badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">⚪ Sin Movimiento</span>';
                if (m.estado === 'Superávit') {
                    badgeEstado = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 Superávit</span>';
                } else if (m.estado === 'Déficit') {
                    badgeEstado = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">🔴 Déficit</span>';
                } else if (m.estado === 'Equilibrado') {
                    badgeEstado = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⚖️ En Equilibrio</span>';
                }

                let badgeNeto = `<span class="text-slate-400 font-bold">S/. 0.00</span>`;
                if (m.neto > 0) {
                    badgeNeto = `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i> +S/. ${fMoney(m.neto)}</span>`;
                } else if (m.neto < 0) {
                    badgeNeto = `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-arrow-trend-down mr-1 text-[10px]"></i> -S/. ${fMoney(Math.abs(m.neto))}</span>`;
                }

                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3 px-4 font-bold text-slate-800 flex items-center">
                            <i class="fa-regular fa-calendar text-sky-600 mr-2"></i>
                            <span>${m.mes_nombre}</span>
                            ${m.movimientos_count > 0 ? `<span class="ml-2 bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-semibold">${m.movimientos_count} movs</span>` : ''}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-emerald-600">
                            ${m.ingresos > 0 ? `+ S/. ${fMoney(m.ingresos)}` : '<span class="text-slate-300 font-normal">S/. 0.00</span>'}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600">
                            ${m.egresos > 0 ? `- S/. ${fMoney(m.egresos)}` : '<span class="text-slate-300 font-normal">S/. 0.00</span>'}
                        </td>
                        <td class="py-3 px-4 text-right">
                            ${badgeNeto}
                        </td>
                        <td class="py-3 px-4 text-center font-bold text-slate-600">
                            ${m.margen}
                        </td>
                        <td class="py-3 px-4 text-center">
                            ${badgeEstado}
                        </td>
                        <td class="py-3 px-4 text-right font-black ${m.saldo_acumulado >= 0 ? 'text-sky-900' : 'text-rose-700'}">
                            S/. ${fMoney(m.saldo_acumulado)}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="filtrarCajaPorMes('${m.mes_str}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 font-bold text-[10px] transition" title="Ver movimientos de ${m.mes_nombre} en la caja">
                                <i class="fa-solid fa-arrow-right-to-bracket mr-1"></i>Ver en Caja
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            const saldoFinal = totalIngresos - totalEgresos;
            const margenAnual = totalIngresos > 0 ? `${((saldoFinal / totalIngresos) * 100).toFixed(1)}%` : '-';
            const estadoAnual = saldoFinal >= 0 ? 'SUPERÁVIT ANUAL' : 'DÉFICIT ANUAL';

            const htmlFoot = `
                <tr class="bg-slate-900 text-white font-extrabold text-xs">
                    <td class="py-4 px-4 uppercase tracking-wider text-amber-300 flex items-center">
                        <i class="fa-solid fa-award text-amber-400 mr-2 text-base"></i>
                        <span>TOTALES ANUALES ACUMULADOS (${año || 2026})</span>
                    </td>
                    <td class="py-4 px-4 text-right text-emerald-400 font-black text-sm">+ S/. ${fMoney(totalIngresos)}</td>
                    <td class="py-4 px-4 text-right text-rose-400 font-black text-sm">- S/. ${fMoney(totalEgresos)}</td>
                    <td class="py-4 px-4 text-right font-black text-sm">
                        <span class="inline-flex items-center px-3 py-1 rounded-lg ${saldoFinal >= 0 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/30 text-rose-300 border border-rose-400/40'}">
                            ${saldoFinal >= 0 ? '+' : '-'} S/. ${fMoney(Math.abs(saldoFinal))}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-center text-cyan-300 font-bold">${margenAnual}</td>
                    <td class="py-4 px-4 text-center">
                        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide ${saldoFinal >= 0 ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'}">
                            ${estadoAnual}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-right text-sky-300 font-black text-base">S/. ${fMoney(saldoFinal)}</td>
                    <td class="py-4 px-4 text-center">
                        <button onclick="exportarResultadosExcel()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] transition shadow">
                            <i class="fa-solid fa-file-excel mr-1"></i> Excel
                        </button>
                    </td>
                </tr>
            `;

            // Insertar en tabla del Dashboard
            const tbodyDash = document.getElementById('tabla-resultados-dashboard');
            const tfootDash = document.getElementById('totales-resultados-dashboard');
            if (tbodyDash) tbodyDash.innerHTML = htmlRows;
            if (tfootDash) tfootDash.innerHTML = htmlFoot;

            // Insertar en sección dedicada
            const tbodyDed = document.getElementById('tabla-resultados-dedicada');
            const tfootDed = document.getElementById('totales-resultados-dedicada');
            if (tbodyDed) tbodyDed.innerHTML = htmlRows;
            if (tfootDed) tfootDed.innerHTML = htmlFoot;

            // Tarjetas de la sección dedicada
            const elMejorNom = document.getElementById('res-mejor-mes-nombre');
            const elMejorMon = document.getElementById('res-mejor-mes-monto');
            const elMayorNom = document.getElementById('res-mayor-gasto-nombre');
            const elMayorMon = document.getElementById('res-mayor-gasto-monto');
            const elPromIng = document.getElementById('res-promedio-ingreso');
            const elMargen = document.getElementById('res-margen-anual');
            const elEstGlobal = document.getElementById('res-estado-global');

            if (elMejorNom) elMejorNom.innerText = mejorMes.nombre;
            if (elMejorMon) elMejorMon.innerText = `S/. ${fMoney(mejorMes.monto)}`;
            if (elMayorNom) elMayorNom.innerText = mayorGasto.nombre;
            if (elMayorMon) elMayorMon.innerText = `S/. ${fMoney(mayorGasto.monto)}`;

            const prom = mesesConMov > 0 ? (totalIngresos / mesesConMov) : 0;
            if (elPromIng) elPromIng.innerText = `S/. ${fMoney(prom)}`;
            if (elMargen) elMargen.innerText = margenAnual;
            if (elEstGlobal) {
                elEstGlobal.innerText = saldoFinal >= 0 ? 'Superávit Institucional' : 'Déficit Institucional';
                elEstGlobal.className = `text-xs font-bold ${saldoFinal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
            }

            // Preparar tabla de impresión
            const printTbody = document.getElementById('print-tabla-resultados');
            const printTfoot = document.getElementById('print-totales-resultados');
            const printFecha = document.getElementById('print-res-fecha');
            if (printFecha) printFecha.innerText = new Date().toLocaleDateString('es-PE', { dateStyle: 'long' });

            if (printTbody) {
                printTbody.innerHTML = meses.map(m => `
                    <tr class="border-b border-slate-200">
                        <td class="border border-slate-300 py-1.5 px-3 font-semibold text-slate-800">${m.mes_nombre}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right text-emerald-700 font-bold">S/. ${fMoney(m.ingresos)}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right text-rose-700 font-bold">S/. ${fMoney(m.egresos)}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right font-black ${m.neto >= 0 ? 'text-emerald-800' : 'text-rose-800'}">
                            ${m.neto >= 0 ? '+' : '-'} S/. ${fMoney(Math.abs(m.neto))}
                        </td>
                        <td class="border border-slate-300 py-1.5 px-3 text-center">${m.margen}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-center font-bold">${m.estado}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right font-bold">S/. ${fMoney(m.saldo_acumulado)}</td>
                    </tr>
                `).join('');
            }

            if (printTfoot) {
                printTfoot.innerHTML = `
                    <tr class="bg-slate-200 text-slate-900 font-black">
                        <td class="border border-slate-300 py-2.5 px-3">TOTAL ANUAL ${año || 2026}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right text-emerald-800">S/. ${fMoney(totalIngresos)}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right text-rose-800">S/. ${fMoney(totalEgresos)}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right">S/. ${fMoney(saldoFinal)}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-center">${margenAnual}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-center uppercase">${estadoAnual}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right font-black">S/. ${fMoney(saldoFinal)}</td>
                    </tr>
                `;
            }
        }

        function exportarResultadosExcel() {
            window.location.href = '/api/exportar/resultados';
        }

        function abrirModalImprimirResultados() {
            document.getElementById('modal-imprimir-resultados').classList.remove('hidden');
        }

        function cerrarModalImprimirResultados() {
            document.getElementById('modal-imprimir-resultados').classList.add('hidden');
        }

        function imprimirResultados() {
            abrirModalImprimirResultados();
            setTimeout(() => {
                window.print();
            }, 300);
        }

        function filtrarCajaPorMes(mesStr) {
            cambiarSeccion('caja');
            const anio = 2026;
            const prefijo = `${anio}-${mesStr}`;
            const filtrados = movimientosGlobales.filter(m => m.fecha && m.fecha.startsWith(prefijo));
            renderTablaMovimientos(filtrados);
            const inputBuscar = document.getElementById('filtro-buscar');
            if (inputBuscar) inputBuscar.value = '';
            alert(`Filtrando caja: se encontraron ${filtrados.length} movimientos en el mes ${mesStr}/${anio}.`);
        }

        function renderChart(chartData) {
            const ctx = document.getElementById('chart-mensual').getContext('2d');
            if (myChart) myChart.destroy();

            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.meses,
                    datasets: [
                        {
                            label: 'Ingresos (Entradas)',
                            data: chartData.ingresos,
                            backgroundColor: 'rgba(16, 185, 129, 0.85)',
                            borderRadius: 6
                        },
                        {
                            label: 'Egresos (Salidas)',
                            data: chartData.egresos,
                            backgroundColor: 'rgba(244, 63, 94, 0.85)',
                            borderRadius: 6
                        },
                        {
                            label: 'Saldo Neto',
                            data: chartData.saldos,
                            type: 'line',
                            borderColor: '#0284c7',
                            backgroundColor: 'rgba(2, 132, 199, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.3,
                            fill: false,
                            pointBackgroundColor: '#0284c7'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } },
                        tooltip: {
                            callbacks: {
                                label: (item) => `${item.dataset.label}: S/. ${Number(item.raw).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: '#f1f5f9' },
                            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
                        }
                    }
                }
            });
        }

        // 2. CAJA DE MOVIMIENTOS
        async function cargarMovimientos() {
            try {
                const res = await fetch('/api/movimientos');
                movimientosGlobales = await res.json();
                renderTablaMovimientos(movimientosGlobales);
            } catch (err) {
                console.error("Error al cargar movimientos:", err);
            }
        }

        function renderTablaMovimientos(lista) {
            const tbody = document.getElementById('tabla-movimientos');
            if (lista.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-slate-400">No se encontraron movimientos registrados con los filtros aplicados.</td></tr>`;
                return;
            }

            tbody.innerHTML = lista.map(m => {
                const isIngreso = m.tipo === 'Ingreso';
                const isPagado = m.estado === 'Pagado';
                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3 px-4 font-semibold text-slate-600">${m.fecha}</td>
                        <td class="py-3 px-4">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isIngreso ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                <i class="fa-solid ${isIngreso ? 'fa-arrow-down' : 'fa-arrow-up'} mr-1"></i>
                                ${m.tipo}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-800">${m.nombre}</div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase">${m.rol}</span>
                        </td>
                        <td class="py-3 px-4">
                            ${m.grupo && m.grupo !== 'General' ? `<span class="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">${m.grupo}</span>` : '<span class="text-slate-400 text-[10px]">General</span>'}
                            ${m.encargado ? `<div class="text-[10px] text-slate-500 font-medium truncate mt-0.5 flex items-center"><i class="fa-solid fa-chalkboard-user mr-1 text-slate-400"></i>${m.encargado}</div>` : ''}
                        </td>
                        <td class="py-3 px-4 text-slate-600">${m.carrera || 'General'}</td>
                        <td class="py-3 px-4">
                            <span class="text-slate-800 font-medium">${m.concepto}</span>
                            ${m.notas ? `<div class="text-[10px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 inline-block border border-amber-200/60 font-medium"><i class="fa-regular fa-note-sticky mr-1 text-amber-500"></i>${m.notas}</div>` : ''}
                            ${m.comprobante ? `<span class="block text-[10px] text-slate-400">Comp: ${m.comprobante}</span>` : ''}
                        </td>
                        <td class="py-3 px-4 text-right font-black ${isIngreso ? 'text-emerald-600' : 'text-rose-600'} text-xs">
                            ${isIngreso ? '+' : '-'} S/. ${Number(m.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">${m.metodo_pago || 'Efectivo'}</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isPagado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                                ${isPagado ? '● Pagado' : '⏱ Pendiente'}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="eliminarMovimiento(${m.id})" class="text-slate-400 hover:text-rose-600 p-1 transition" title="Eliminar movimiento">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function filtrarMovimientos() {
            const buscar = (document.getElementById('filtro-buscar')?.value || '').toLowerCase();
            const tipo = document.getElementById('filtro-tipo')?.value || '';
            const rol = document.getElementById('filtro-rol')?.value || '';
            const estado = document.getElementById('filtro-estado')?.value || '';
            const carrera = document.getElementById('filtro-carrera')?.value || '';
            const grupo = document.getElementById('filtro-grupo')?.value || '';
            const encargado = document.getElementById('filtro-encargado')?.value || '';

            const filtrados = movimientosGlobales.filter(m => {
                const matchBuscar = !buscar || 
                    (m.nombre && m.nombre.toLowerCase().includes(buscar)) || 
                    (m.concepto && m.concepto.toLowerCase().includes(buscar)) ||
                    (m.notas && m.notas.toLowerCase().includes(buscar)) ||
                    (m.encargado && m.encargado.toLowerCase().includes(buscar));
                const matchTipo = !tipo || m.tipo === tipo;
                const matchRol = !rol || m.rol === rol;
                const matchEstado = !estado || m.estado === estado;
                const matchCarrera = !carrera || m.carrera === carrera;
                const matchGrupo = !grupo || m.grupo === grupo;
                const matchEncargado = !encargado || m.encargado === encargado;
                return matchBuscar && matchTipo && matchRol && matchEstado && matchCarrera && matchGrupo && matchEncargado;
            });
            renderTablaMovimientos(filtrados);
        }

        // =====================================================================
        // 3. PLANTILLA DE ESTUDIANTES: DEBEN Y FALTAN COMPLETAR
        // =====================================================================
        async function cargarEstudiantes() {
            try {
                const carrera = document.getElementById('filtro-estudiantes-carrera').value;
                const estado = document.getElementById('filtro-estudiantes-estado').value;
                let url = '/api/estudiantes?';
                if (carrera) url += `carrera=${encodeURIComponent(carrera)}&`;
                if (estado) url += `estado=${encodeURIComponent(estado)}&`;

                const res = await fetch(url);
                estudiantesGlobales = await res.json();
                renderEstudiantes(estudiantesGlobales);
            } catch (err) {
                console.error("Error al cargar estudiantes:", err);
            }
        }

        function setModoVistaEstudiantes(modo) {
            modoVistaEstudiantes = modo;
            const grid = document.getElementById('grid-estudiantes');
            const tabla = document.getElementById('tabla-estudiantes-container');
            const btnGrid = document.getElementById('btn-vista-grid');
            const btnTable = document.getElementById('btn-vista-table');

            if (modo === 'grid') {
                grid.classList.remove('hidden');
                tabla.classList.add('hidden');
                btnGrid.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-sm';
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800';
            } else {
                grid.classList.add('hidden');
                tabla.classList.remove('hidden');
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-sm';
                btnGrid.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800';
            }
        }

        function filtrarEstudiantesFrontend() {
            const buscar = document.getElementById('filtro-estudiantes-buscar').value.toLowerCase();
            const filtrados = estudiantesGlobales.filter(e => {
                return !buscar || e.nombre.toLowerCase().includes(buscar) || e.codigo.toLowerCase().includes(buscar) || e.carrera.toLowerCase().includes(buscar);
            });
            renderEstudiantes(filtrados);
        }

        function renderEstudiantes(lista) {
            const grid = document.getElementById('grid-estudiantes');
            const tbody = document.getElementById('tbody-estudiantes');

            if (lista.length === 0) {
                grid.innerHTML = '<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">No se encontraron estudiantes para los filtros seleccionados.</div>';
                tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron estudiantes con los filtros aplicados.</td></tr>';
                return;
            }

            grid.innerHTML = lista.map(e => {
                const iniciales = e.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
                let barColor = 'from-rose-500 to-rose-600';
                if (e.estado_financiero === 'al_dia') barColor = 'from-emerald-500 to-teal-500';
                else if (e.estado_financiero === 'faltan_completar') barColor = 'from-amber-400 to-orange-500';

                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.toLowerCase().includes('sin asignar') || e.carrera.toLowerCase().includes('pendiente');

                return `
                    <div class="cyber-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-cyan-500/20 flex-shrink-0">
                                    ${iniciales}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <span class="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">${e.codigo}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${e.clase_estado}">
                                            ${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate mt-1" title="${e.nombre}">${e.nombre}</h4>
                                    ${esSinAsignar ? 
                                        '<span class="inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">⚠️ Sin Asignar (Pendiente)</span>' :
                                        `<p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">${e.carrera} • ${e.ciclo}</p>`
                                    }
                                </div>
                            </div>

                            <div class="mb-3">
                                <span class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${e.urgencia_global === 'vencido' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse' : (e.urgencia_global === 'vence_hoy' || e.urgencia_global === 'urgente' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    ${e.msg_urgencia}
                                </span>
                            </div>

                            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center mb-3">
                                <div>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase">Total Cuota</span>
                                    <p class="font-extrabold text-slate-700 dark:text-slate-300 text-xs mt-0.5">S/. ${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</span>
                                    <p class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">S/. ${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                    <span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">Falta Completar</span>
                                    <p class="font-extrabold text-rose-600 dark:text-rose-400 text-xs mt-0.5">S/. ${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Progreso de Pago</span>
                                    <span class="text-slate-800 dark:text-slate-200">${e.porcentaje_avance}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r ${barColor} h-2 rounded-full" style="width: ${e.porcentaje_avance}%"></div>
                                </div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            ${esSinAsignar ? `
                                <button onclick="abrirModalAsignarCarrera(${e.id}, '${encodeURIComponent(e.nombre)}', '${encodeURIComponent(e.carrera || '')}', '${encodeURIComponent(e.grupo || '')}')" class="cyber-btn w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/25 transition">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    <span>🎓 Asignar Carrera (7 Oficiales)</span>
                                </button>
                            ` : ''}

                            ${e.saldo_pendiente > 0 && primerPendiente ? `
                                <button onclick="abrirModalAbonar(${primerPendiente.id}, '${encodeURIComponent(e.nombre)}', '${encodeURIComponent(primerPendiente.concepto)}', ${primerPendiente.monto}, ${primerPendiente.monto_total || primerPendiente.monto}, ${primerPendiente.monto_abonado || 0})" class="cyber-btn w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20 transition">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>${e.estado_financiero === 'faltan_completar' ? 'Completar / Abonar Saldo' : 'Registrar Abono o Pago'}</span>
                                </button>
                            ` : ''}

                            <button onclick="verFichaEstudiante(${e.id})" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">
                                <i class="fa-solid fa-file-invoice text-cyan-600 dark:text-cyan-400"></i>
                                <span>Ver Ficha / Plantilla Oficial</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            tbody.innerHTML = lista.map(e => {
                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.toLowerCase().includes('sin asignar') || e.carrera.toLowerCase().includes('pendiente');

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-900 dark:text-slate-100">${e.nombre}</div>
                            <span class="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">${e.codigo}</span>
                        </td>
                        <td class="py-3 px-4">
                            ${esSinAsignar ? 
                                '<span class="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">⚠️ Sin Asignar</span>' :
                                `<span class="text-slate-700 dark:text-slate-200 font-medium">${e.carrera}</span>
                                 <span class="block text-[10px] text-slate-400">${e.ciclo}</span>`
                            }
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                            S/. ${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            S/. ${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                            S/. ${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="font-bold text-slate-700 dark:text-slate-200">${e.porcentaje_avance}%</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${e.clase_estado}">
                                ${e.estado_financiero === 'faltan_completar' ? '🟠 Falta Completar' : (e.estado_financiero === 'deben_todo' ? '🔴 Debe Total' : '🟢 Al Día')}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            ${esSinAsignar ? `
                                <button onclick="abrirModalAsignarCarrera(${e.id}, '${encodeURIComponent(e.nombre)}', '${encodeURIComponent(e.carrera || '')}', '${encodeURIComponent(e.grupo || '')}')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition mr-1">
                                    <i class="fa-solid fa-graduation-cap mr-1"></i>Asignar
                                </button>
                            ` : ''}
                            ${e.saldo_pendiente > 0 && primerPendiente ? `
                                <button onclick="abrirModalAbonar(${primerPendiente.id}, '${encodeURIComponent(e.nombre)}', '${encodeURIComponent(primerPendiente.concepto)}', ${primerPendiente.monto}, ${primerPendiente.monto_total || primerPendiente.monto}, ${primerPendiente.monto_abonado || 0})" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition">
                                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i>Abonar
                                </button>
                            ` : ''}
                            <button onclick="verFichaEstudiante(${e.id})" class="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition">
                                <i class="fa-solid fa-file-invoice mr-1"></i>Ficha
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        async function verFichaEstudiante(estId) {
            try {
                const res = await fetch(`/api/estudiantes/${estId}/detalle`);
                const data = await res.json();
                const est = data.estudiante;
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('recibo-est-nombre').innerText = est.nombre;
                document.getElementById('recibo-est-codigo').innerText = `Código: ${est.codigo || 'EST-' + est.id}`;
                document.getElementById('recibo-est-carrera').innerText = `Especialidad: ${est.carrera}`;
                document.getElementById('recibo-est-ciclo').innerText = `Módulo: ${est.ciclo || 'Ciclo Regular'}`;
                document.getElementById('recibo-est-email').innerText = `Correo: ${est.email || est.nombre.toLowerCase().replace(/ /g, '.') + '@institucion.edu'}`;
                document.getElementById('recibo-est-telefono').innerText = `Teléfono: ${est.telefono || 'No registrado'}`;
                document.getElementById('recibo-est-fecha-emision').innerText = 'Emisión: ' + new Date().toLocaleDateString('es-PE');

                document.getElementById('recibo-est-total-comprometido').innerText = fMoney(data.total_comprometido);
                document.getElementById('recibo-est-total-pagado').innerText = fMoney(data.total_pagado);
                document.getElementById('recibo-est-saldo-pendiente').innerText = fMoney(data.saldo_pendiente);

                document.getElementById('recibo-est-porcentaje-label').innerText = `${data.porcentaje_avance}% completado`;
                document.getElementById('recibo-est-porcentaje-bar').style.width = `${data.porcentaje_avance}%`;

                const tbodyMov = document.getElementById('recibo-est-tabla-movimientos');
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-400">Sin cuotas ni compromisos registrados aún.</td></tr>`;
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => {
                        const mTot = m.monto_total || m.monto;
                        const mAbo = m.monto_abonado || 0;
                        const mSal = m.estado === 'Pendiente' ? m.monto : 0;
                        return `
                            <tr>
                                <td class="p-2.5 font-bold text-slate-800">${m.concepto}</td>
                                <td class="p-2.5 text-right font-medium">${fMoney(mTot)}</td>
                                <td class="p-2.5 text-right font-medium text-emerald-600">${fMoney(mAbo)}</td>
                                <td class="p-2.5 text-right font-extrabold ${mSal > 0 ? 'text-rose-600' : 'text-slate-400'}">${fMoney(mSal)}</td>
                                <td class="p-2.5 text-center font-medium">${m.fecha_vencimiento || 'Sin límite'}</td>
                                <td class="p-2.5 text-center">
                                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${m.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : (mAbo > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}">
                                        ${m.estado === 'Pagado' ? 'Completado' : (mAbo > 0 ? 'Abonado Parcial' : 'Pendiente Total')}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }

                const tbodyAbo = document.getElementById('recibo-est-tabla-abonos');
                if (data.abonos.length === 0) {
                    tbodyAbo.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-400">Aún no se han registrado abonos parciales directos en esta cuenta.</td></tr>`;
                } else {
                    tbodyAbo.innerHTML = data.abonos.map(a => `
                        <tr>
                            <td class="p-2.5">${a.fecha}</td>
                            <td class="p-2.5 font-medium">${a.concepto_original || 'Abono a Cuota'}</td>
                            <td class="p-2.5 text-slate-400">${a.comprobante || '-'}</td>
                            <td class="p-2.5">${a.metodo_pago || 'Efectivo'}</td>
                            <td class="p-2.5 text-right font-extrabold text-emerald-600">${fMoney(a.monto)}</td>
                        </tr>
                    `).join('');
                }

                document.getElementById('modal-ficha-estudiante').classList.remove('hidden');
            } catch (err) {
                console.error("Error al ver ficha de estudiante:", err);
            }
        }

        function cerrarModalFichaEstudiante() {
            document.getElementById('modal-ficha-estudiante').classList.add('hidden');
        }

        // MODAL DE ABONAR O COMPLETAR PAGO
        function abrirModalAbonar(movId, nombreEst, concepto, saldoRestante, montoTotal, montoAbonado) {
            document.getElementById('abono-mov-id').value = movId;
            document.getElementById('abono-saldo-max').value = saldoRestante;
            document.getElementById('abono-est-nombre').innerText = nombreEst;
            document.getElementById('abono-concepto-nombre').innerText = `Concepto: ${concepto}`;
            document.getElementById('abono-ya-abonado').innerText = 'S/. ' + Number(montoAbonado).toFixed(2);
            document.getElementById('abono-falta-completar').innerText = 'S/. ' + Number(saldoRestante).toFixed(2);
            
            document.getElementById('abono-monto-input').value = Number(saldoRestante).toFixed(2);
            document.getElementById('abono-monto-input').max = saldoRestante;
            document.getElementById('abono-comprobante-input').value = `ABO-${Math.floor(1000 + Math.random() * 9000)}`;
            document.getElementById('abono-notas-input').value = `Abono a ${concepto}`;

            document.getElementById('modal-abonar-estudiante').classList.remove('hidden');
        }

        function cerrarModalAbonar() {
            document.getElementById('modal-abonar-estudiante').classList.add('hidden');
        }

        function setMontoAbonoCompleto() {
            const max = parseFloat(document.getElementById('abono-saldo-max').value);
            document.getElementById('abono-monto-input').value = max.toFixed(2);
        }

        function setMontoAbonoMitad() {
            const max = parseFloat(document.getElementById('abono-saldo-max').value);
            document.getElementById('abono-monto-input').value = (max / 2).toFixed(2);
        }

        async function procesarAbono(e) {
            e.preventDefault();
            const movId = document.getElementById('abono-mov-id').value;
            const monto = parseFloat(document.getElementById('abono-monto-input').value);
            const metodo = document.getElementById('abono-metodo-select').value;
            const comp = document.getElementById('abono-comprobante-input').value;
            const notas = document.getElementById('abono-notas-input').value;

            if (!movId || monto <= 0) {
                alert("Por favor ingresa un monto válido a abonar.");
                return;
            }

            try {
                const res = await fetch('/api/estudiantes/abonar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        movimiento_id: parseInt(movId),
                        monto_abono: monto,
                        metodo_pago: metodo,
                        comprobante: comp,
                        notas: notas
                    })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAbonar();
                    alert(`✅ ${data.message}`);
                    await cargarTodo();
                } else {
                    alert(`Error: ${data.error || 'No se pudo procesar el abono'}`);
                }
            } catch (err) {
                alert("Error de conexión al procesar el abono");
            }
        }

        // 4. DOCENTES
        async function cargarDocentes() {
            try {
                const carrera = document.getElementById('filtro-docentes-carrera').value;
                const url = carrera ? `/api/docentes?carrera=${encodeURIComponent(carrera)}` : '/api/docentes';
                const res = await fetch(url);
                const docentes = await res.json();
                docentesGlobales = docentes;

                const grid = document.getElementById('grid-docentes');
                if (docentes.length === 0) {
                    grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400">No se encontraron docentes para la especialidad seleccionada.</div>`;
                    return;
                }

                grid.innerHTML = docentes.map(d => {
                    const iniciales = d.nombre.replace(/^(Dr\.|Mg\.|Lic\.|Ing\.)\s*/, '').split(' ').slice(0, 2).map(n => n[0]).join('');
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div>
                                <div class="flex items-center space-x-3 mb-4">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-indigo-500/20">
                                        ${iniciales}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-bold text-slate-900 text-sm truncate" title="${d.nombre}">${d.nombre}</h4>
                                        <p class="text-xs text-sky-700 font-semibold truncate">${d.carrera}</p>
                                        <span class="inline-block mt-0.5 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">${d.tipo_contrato || 'Docente'}</span>
                                    </div>
                                </div>

                                <div class="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500 font-medium">Salidas (Honorarios Pagados):</span>
                                        <span class="font-extrabold text-rose-600">S/. ${Number(d.total_salidas).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500 font-medium">Ingresos Generados (Módulos):</span>
                                        <span class="font-extrabold text-emerald-600">S/. ${Number(d.total_ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 font-bold">
                                        <span class="text-slate-700">Balance Neto:</span>
                                        <span class="${d.balance_neto >= 0 ? 'text-emerald-700' : 'text-slate-800'}">
                                            S/. ${Number(d.balance_neto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-5 grid grid-cols-2 gap-2">
                                <button onclick="abrirModalEditarDocente(${d.id})" class="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition border border-amber-200 shadow-sm">
                                    <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                    <span>✏️ Editar</span>
                                </button>
                                <button onclick="verBoletaDocente(${d.id})" class="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm">
                                    <i class="fa-solid fa-file-invoice text-sky-400"></i>
                                    <span>Boleta Oficial</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (err) {
                console.error("Error al cargar docentes:", err);
            }
        }

        async function verBoletaDocente(docId) {
            try {
                const res = await fetch(`/api/docentes/${docId}/detalle`);
                const data = await res.json();
                const d = data.docente;

                document.getElementById('recibo-docente-nombre').innerText = d.nombre;
                document.getElementById('recibo-docente-carrera').innerText = `Especialidad: ${d.carrera}`;
                document.getElementById('recibo-docente-especialidad').innerText = d.especialidad || 'Cátedra Regular';
                document.getElementById('recibo-docente-contacto').innerText = d.email || 'institucion@edu.pe';
                document.getElementById('recibo-fecha-emision').innerText = 'Emisión: ' + new Date().toLocaleDateString('es-PE');

                document.getElementById('recibo-total-salidas').innerText = 'S/. ' + Number(data.total_salidas).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                document.getElementById('recibo-total-entradas').innerText = 'S/. ' + Number(data.total_ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                document.getElementById('recibo-total-balance').innerText = 'S/. ' + Number(data.balance_neto).toLocaleString('es-PE', { minimumFractionDigits: 2 });

                const tbody = document.getElementById('recibo-tabla-movimientos');
                if (data.movimientos.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-400">Sin movimientos registrados aún para este docente.</td></tr>`;
                } else {
                    tbody.innerHTML = data.movimientos.map(m => `
                        <tr>
                            <td class="p-2.5">${m.fecha}</td>
                            <td class="p-2.5">
                                <span class="font-bold ${m.tipo === 'Egreso' ? 'text-rose-600' : 'text-emerald-600'}">${m.tipo}</span>
                            </td>
                            <td class="p-2.5 font-medium">${m.concepto}</td>
                            <td class="p-2.5 text-slate-400">${m.comprobante || '-'}</td>
                            <td class="p-2.5 text-right font-extrabold ${m.tipo === 'Egreso' ? 'text-rose-600' : 'text-emerald-600'}">
                                S/. ${Number(m.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `).join('');
                }

                document.getElementById('modal-recibo-docente').classList.remove('hidden');
            } catch (err) {
                console.error("Error al ver boleta de docente:", err);
            }
        }

        function cerrarModalReciboDocente() {
            document.getElementById('modal-recibo-docente').classList.add('hidden');
        }

        // 5. CONTROL DE VENCIMIENTOS / DEUDORES
        async function cargarDeudores() {
            try {
                const carrera = document.getElementById('filtro-deudores-carrera').value;
                const url = carrera ? `/api/deudores?carrera=${encodeURIComponent(carrera)}` : '/api/deudores';
                const res = await fetch(url);
                const deudores = await res.json();

                document.getElementById('badge-deudores-count').innerText = deudores.length;

                const tbody = document.getElementById('tabla-deudores');
                if (deudores.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">¡Excelente! No hay estudiantes con deudas pendientes en esta categoría.</td></tr>`;
                    return;
                }

                tbody.innerHTML = deudores.map(d => {
                    let badgeColor = 'bg-slate-100 text-slate-700';
                    let alertaIcon = 'fa-calendar';

                    if (d.urgencia === 'vencido') {
                        badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse';
                        alertaIcon = 'fa-circle-xmark';
                    } else if (d.urgencia === 'vence_hoy' || d.urgencia === 'urgente') {
                        badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                        alertaIcon = 'fa-triangle-exclamation';
                    } else if (d.urgencia === 'alerta') {
                        badgeColor = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
                        alertaIcon = 'fa-clock';
                    } else {
                        badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                        alertaIcon = 'fa-circle-check';
                    }

                    return `
                        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                            <td class="py-3.5 px-4 font-bold text-slate-900">${d.nombre}</td>
                            <td class="py-3.5 px-4 text-slate-600">${d.carrera}</td>
                            <td class="py-3.5 px-4 font-medium text-slate-800">
                                ${d.concepto}
                                ${d.falta_completar ? `<span class="block text-[10px] text-amber-600 font-bold">Abonado: S/. ${Number(d.monto_abonado).toFixed(2)}</span>` : ''}
                            </td>
                            <td class="py-3.5 px-4 text-right font-extrabold text-rose-600">
                                S/. ${Number(d.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </td>
                            <td class="py-3.5 px-4 text-center font-semibold text-slate-700">${d.fecha_vencimiento || 'Sin límite'}</td>
                            <td class="py-3.5 px-4 text-center">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}">
                                    <i class="fa-solid ${alertaIcon} mr-1.5"></i>
                                    ${d.mensaje_urgencia}
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-center">
                                <button onclick="abrirModalAbonar(${d.id}, '${d.nombre}', '${d.concepto}', ${d.monto}, ${d.monto_total || d.monto}, ${d.monto_abonado || 0})" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm shadow-cyan-600/30 transition flex items-center space-x-1.5 mx-auto">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>Cobrar / Abonar</span>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            } catch (err) {
                console.error("Error al cargar deudores:", err);
            }
        }

        // 6. REPORTE POR ESPECIALIDADES
        // =========================================================================
        // GESTIÓN DINÁMICA DE CARRERAS Y ESPECIALIDADES
        // =========================================================================
        let carrerasGlobales = [];

        async function cargarCarreras() {
            try {
                const res = await fetch('/api/carreras');
                carrerasGlobales = await res.json();
                renderReporteCarreras(carrerasGlobales);
                renderTablaCarrerasConfig(carrerasGlobales);
                poblarSelectsCarreras(carrerasGlobales);
            } catch (err) {
                console.error("Error al cargar carreras:", err);
            }
        }

        function renderReporteCarreras(carreras) {
            const grid = document.getElementById('grid-carreras-reporte');
            if (!grid) return;
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;
            if (!lista || lista.length === 0) {
                grid.innerHTML = '<div class="col-span-3 p-8 text-center text-slate-400">No hay carreras registradas.</div>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            grid.innerHTML = lista.map(c => {
                const nom = c.nombre || c.carrera;
                const ing = c.total_ingreso || 0;
                const egr = c.total_egreso || 0;
                const neto = ing - egr;
                const alumnos = c.total_alumnos || 0;
                const docentes = c.total_docentes || 0;

                return `
                    <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg border border-purple-200 dark:border-purple-800">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-900 dark:text-white text-sm">${nom}</h4>
                                    <p class="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">${c.codigo || 'PROGRAMA OFICIAL'}</p>
                                </div>
                            </div>
                            <button onclick="abrirModalEditarCarrera(${c.id}, '${nom.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Modificar nombre de carrera">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <div>👥 Matriculados: <strong class="text-slate-800 dark:text-slate-200">${alumnos}</strong></div>
                            <div>👨‍🏫 Docentes: <strong class="text-slate-800 dark:text-slate-200">${docentes}</strong></div>
                        </div>

                        <div class="space-y-1.5 text-xs pt-3">
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Ingresos Totales:</span>
                                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${fMoney(ing)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Egresos / Gastos:</span>
                                <span class="font-extrabold text-rose-600 dark:text-rose-400">${fMoney(egr)}</span>
                            </div>
                            <div class="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span class="text-slate-700 dark:text-slate-300 font-bold">Balance Neto:</span>
                                <span class="font-black ${neto >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}">${fMoney(neto)}</span>
                            </div>
                        </div>

                        <div class="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button onclick="abrirModalEditarCarrera(${c.id}, '${nom.replace(/'/g, "\\'")}')" class="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center space-x-1 transition">
                                <i class="fa-solid fa-pen"></i>
                                <span>Editar Nombre</span>
                            </button>
                            <button onclick="cambiarSeccion('configuracion')" class="text-[11px] font-semibold text-slate-400 hover:text-indigo-500 flex items-center space-x-1 transition">
                                <span>Configuración</span>
                                <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderTablaCarrerasConfig(carreras) {
            const tbody = document.getElementById('tabla-carreras-config-body');
            if (!tbody) return;
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;

            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">No hay carreras registradas.</td></tr>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            tbody.innerHTML = lista.map(c => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3">
                        <span class="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            ${c.codigo || 'ESP'}
                        </span>
                    </td>
                    <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                        ${c.nombre || c.carrera}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        👥 ${c.total_alumnos || 0}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        👨‍🏫 ${c.total_docentes || 0}
                    </td>
                    <td class="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        ${fMoney(c.total_ingreso || 0)}
                    </td>
                    <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button type="button" onclick="abrirModalEditarCarrera(${c.id}, '${(c.nombre || c.carrera).replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-[11px] shadow-sm transition" title="Modificar nombre de la carrera">
                            <i class="fa-solid fa-pen-to-square"></i> <span>Editar Nombre</span>
                        </button>
                        <button type="button" onclick="eliminarCarrera(${c.id}, '${(c.nombre || c.carrera).replace(/'/g, "\\'")}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[11px] border border-rose-200 transition" title="Eliminar carrera">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function poblarSelectsCarreras(carreras) {
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;
            if (!lista || lista.length === 0) return;

            const filtros = [
                { id: 'filtro-carrera', defaultLabel: 'Todas las Especialidades' },
                { id: 'filtro-estudiantes-carrera', defaultLabel: 'Todas las Especialidades' },
                { id: 'filtro-docentes-carrera', defaultLabel: 'Filtrar por Especialidad (Todas)' },
                { id: 'filtro-deudores-carrera', defaultLabel: 'Todas las Especialidades' }
            ];

            filtros.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                let html = `<option value="">${f.defaultLabel}</option>`;
                if (f.id === 'filtro-estudiantes-carrera') {
                    html += `<option value="sin_asignar">⚠️ Sin Asignar (Pendientes)</option>`;
                }
                lista.forEach(c => {
                    const nom = c.nombre || c.carrera;
                    html += `<option value="${nom}">${nom}</option>`;
                });
                el.innerHTML = html;
                if (currentVal) el.value = currentVal;
            });

            const forms = [
                { id: 'form-carrera', defaultLabel: '-- Seleccionar Especialidad --' },
                { id: 'nuevo-grupo-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'editar-grupo-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'editar-docente-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'asignar-carrera-select', defaultLabel: '-- Seleccionar Especialidad --' }
            ];

            forms.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                let html = `<option value="">${f.defaultLabel}</option>`;
                lista.forEach(c => {
                    const nom = c.nombre || c.carrera;
                    html += `<option value="${nom}">${nom}</option>`;
                });
                el.innerHTML = html;
                if (currentVal) el.value = currentVal;
            });
        }

        function abrirModalEditarCarrera(id, nombreActual) {
            document.getElementById('editar-carrera-id').value = id;
            document.getElementById('editar-carrera-nombre-actual').value = nombreActual;
            document.getElementById('editar-carrera-nombre-nuevo').value = nombreActual;
            document.getElementById('modal-editar-carrera').classList.remove('hidden');
            setTimeout(() => document.getElementById('editar-carrera-nombre-nuevo')?.focus(), 100);
        }

        function cerrarModalEditarCarrera() {
            document.getElementById('modal-editar-carrera').classList.add('hidden');
        }

        async function guardarEdicionCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();
            const id = document.getElementById('editar-carrera-id').value;
            const nombreNuevo = document.getElementById('editar-carrera-nombre-nuevo').value.trim();

            if (!nombreNuevo) {
                alert("Por favor ingrese el nuevo nombre de la carrera.");
                return;
            }

            try {
                const res = await fetch(`/api/carreras/${id}/editar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nombreNuevo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarCarrera();
                    alert(`✅ Nombre de la carrera actualizado a "${nombreNuevo}" exitosamente en todo el sistema.`);
                    await cargarCarreras();
                    await cargarStats();
                    await cargarEstudiantes();
                    await cargarDocentes();
                    await cargarMovimientos();
                    await cargarGrupos();
                } else {
                    alert("Error al actualizar carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al actualizar carrera.");
            }
        }

        function abrirModalNuevaCarrera() {
            document.getElementById('nueva-carrera-nombre').value = '';
            document.getElementById('nueva-carrera-codigo').value = '';
            document.getElementById('modal-nueva-carrera').classList.remove('hidden');
            setTimeout(() => document.getElementById('nueva-carrera-nombre')?.focus(), 100);
        }

        function cerrarModalNuevaCarrera() {
            document.getElementById('modal-nueva-carrera').classList.add('hidden');
        }

        async function guardarNuevaCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();
            const nombre = document.getElementById('nueva-carrera-nombre').value.trim();
            const codigo = document.getElementById('nueva-carrera-codigo').value.trim();

            if (!nombre) {
                alert("El nombre de la carrera es obligatorio.");
                return;
            }

            try {
                const res = await fetch('/api/carreras', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, codigo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalNuevaCarrera();
                    alert(`✅ Carrera "${nombre}" creada exitosamente.`);
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert("Error al crear carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al crear carrera.");
            }
        }

        async function eliminarCarrera(id, nombre) {
            if (!confirm(`¿Está seguro de eliminar la carrera "${nombre}" del catálogo oficial?\n(Los estudiantes y movimientos permanecerán en el sistema).`)) {
                return;
            }
            try {
                const res = await fetch(`/api/carreras/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ Carrera eliminada exitosamente.`);
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert("Error al eliminar carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al eliminar carrera.");
            }
        }

        function poblarSelectsGrupos(grupos) {
            const selectModal = document.getElementById('form-grupo');
            const selectFiltroCaja = document.getElementById('filtro-grupo');
            const selectEncargadoCaja = document.getElementById('filtro-encargado');

            if (selectModal) {
                const prevVal = selectModal.value;
                let opts = `<option value="General">General / Institucional</option>`;
                grupos.forEach(g => {
                    opts += `<option value="${g.nombre}" data-encargado="${g.encargado}" data-carrera="${g.carrera}">${g.nombre} (${g.encargado})</option>`;
                });
                selectModal.innerHTML = opts;
                if (prevVal) selectModal.value = prevVal;
            }

            if (selectFiltroCaja) {
                const prevVal = selectFiltroCaja.value;
                let opts = `<option value="">Todos los Grupos / Secciones</option><option value="General">General / Institucional</option>`;
                grupos.forEach(g => {
                    opts += `<option value="${g.nombre}">${g.nombre}</option>`;
                });
                selectFiltroCaja.innerHTML = opts;
                if (prevVal) selectFiltroCaja.value = prevVal;
            }

            if (selectEncargadoCaja) {
                const prevVal = selectEncargadoCaja.value;
                const encargadosUnicos = [...new Set(grupos.map(g => g.encargado).filter(Boolean))].sort();
                let opts = `<option value="">Todos los Encargados</option>`;
                encargadosUnicos.forEach(enc => {
                    opts += `<option value="${enc}">${enc}</option>`;
                });
                selectEncargadoCaja.innerHTML = opts;
                if (prevVal) selectEncargadoCaja.value = prevVal;
            }
        }

        function filtrarGrupos() {
            const buscar = (document.getElementById('filtro-grupos-buscar')?.value || '').toLowerCase();
            const carrera = document.getElementById('filtro-grupos-carrera')?.value || '';
            const turno = document.getElementById('filtro-grupos-turno')?.value || '';

            const filtrados = gruposGlobales.filter(g => {
                const matchBuscar = !buscar || 
                    g.nombre.toLowerCase().includes(buscar) || 
                    g.encargado.toLowerCase().includes(buscar) || 
                    (g.aula_taller && g.aula_taller.toLowerCase().includes(buscar));
                const matchCarrera = !carrera || g.carrera === carrera;
                const matchTurno = !turno || g.turno === turno;
                return matchBuscar && matchCarrera && matchTurno;
            });
            renderGrupos(filtrados);
        }

        
        function renderDashboardGrupos(lista) {
            const container = document.getElementById('dashboard-grid-grupos');
            if (!container) return;

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            container.innerHTML = lista.map(g => {
                let badgeTurnoColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

                return `
                    <div class="bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 p-4 transition-all hover:shadow-md flex flex-col justify-between">
                        <div>
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <span class="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                                    ${g.carrera}
                                </span>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeTurnoColor}">
                                    ${g.turno}
                                </span>
                            </div>

                            <h4 class="font-extrabold text-slate-800 text-sm leading-tight mb-2.5">${g.nombre}</h4>

                            <!-- Encargado -->
                            <div class="bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3 flex items-center space-x-2.5">
                                <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    <i class="fa-solid fa-chalkboard-user"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="text-[10px] text-slate-400 font-bold uppercase">Encargado(a) de Clase</p>
                                    <p class="text-xs font-bold text-slate-800 truncate">${g.encargado || 'Sin Asignar'}</p>
                                </div>
                            </div>

                            <!-- Métricas de sección -->
                            <div class="grid grid-cols-2 gap-2 text-center mb-3">
                                <div class="bg-white p-2 rounded-lg border border-slate-100">
                                    <p class="text-[10px] text-slate-400 font-semibold">Alumnos</p>
                                    <p class="text-xs font-black text-slate-800">${g.total_alumnos || 0} matriculados</p>
                                </div>
                                <div class="bg-white p-2 rounded-lg border border-slate-100">
                                    <p class="text-[10px] text-slate-400 font-semibold">Recaudado</p>
                                    <p class="text-xs font-black text-emerald-600">${fMoney(g.total_ingresos || 0)}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span class="text-[11px] text-slate-500 font-medium">
                                <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${g.aula_taller || 'Aula Principal'}
                            </span>
                            <button onclick="filtrarCajaPorGrupo('${g.nombre.replace(/'/g, "\\'")}')" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 transition">
                                <span>Ver Caja</span>
                                <i class="fa-solid fa-angle-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderTabsSecciones(grupos) {
            const container = document.getElementById('contenedor-tabs-secciones-dinamicas');
            if (!container) return;

            let htmlTabs = `
                <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-black transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                    🌐 Todas las Secciones (${grupos.length})
                </button>
            `;

            grupos.forEach(g => {
                let badgeTurnoBg = 'bg-sky-500';
                if (g.turno === 'Tarde') badgeTurnoBg = 'bg-amber-500';
                if (g.turno === 'Noche') badgeTurnoBg = 'bg-purple-600';
                if (g.turno.includes('Sábado') || g.turno.includes('S/D')) badgeTurnoBg = 'bg-rose-500';

                const shortName = g.nombre.split(' - ')[0];
                htmlTabs += `
                    <button onclick="verPlantillaSeccion(${g.id})" id="tab-grupo-${g.id}" class="tab-grupo-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0 border border-slate-200/90 bg-white">
                        <span class="w-2.5 h-2.5 rounded-full ${badgeTurnoBg} flex-shrink-0"></span>
                        <span class="truncate max-w-[150px]">${shortName}</span>
                        <span class="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">${g.turno}</span>
                    </button>
                `;
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
                const res = await fetch(`/api/grupos/${grupoId}/editar`, {
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
                const res = await fetch(`/api/docentes/${docId}/editar`, {
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

        function renderGrupos(lista) {
            const grid = document.getElementById('grid-grupos');
            if (!grid) return;

            if (lista.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">No se encontraron secciones o grupos registrados con los filtros aplicados. Haz clic en "Crear Nueva Sección / Grupo" para registrar una.</div>`;
                return;
            }

            const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            grid.innerHTML = lista.map(g => {
                const iniciales = g.encargado ? g.encargado.replace(/^(Dr\.|Mg\.|Lic\.|Ing\.|Prof\.|C\.P\.C\.|Chef)\s*/i, '').split(' ').slice(0, 2).map(n => n[0]).join('') : 'CET';
                const balanceNeto = (g.total_ingresos || 0) - (g.total_egresos || 0);

                let badgeTurnoColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

                return `
                    <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <!-- Header de la tarjeta del grupo -->
                            <div class="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <span class="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mb-1">
                                        ${g.carrera}
                                    </span>
                                    <h4 class="font-extrabold text-slate-900 text-base leading-tight">${g.nombre}</h4>
                                </div>
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border ${badgeTurnoColor} flex-shrink-0">
                                    <i class="fa-regular fa-clock mr-1"></i>${g.turno}
                                </span>
                            </div>

                            <!-- Encargado de la clase -->
                            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3 mb-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white font-black flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                                    ${iniciales}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encargado de la Clase</p>
                                    <p class="font-bold text-slate-900 text-xs truncate" title="${g.encargado}">${g.encargado}</p>
                                    <p class="text-[10px] text-slate-500 truncate">${g.horario || 'Horario regular'} • ${g.aula_taller || 'Aula general'}</p>
                                </div>
                            </div>

                            <!-- Resumen Financiero y Alumnos -->
                            <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-500 font-medium">Estudiantes Inscritos:</span>
                                    <span class="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">${g.total_alumnos || 0} Alumnos</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-500 font-medium">Dinero Ingresado:</span>
                                    <span class="font-extrabold text-emerald-600">+S/. ${fMoney(g.total_ingresos || 0)}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-500 font-medium">Dinero Salido (Egresos):</span>
                                    <span class="font-extrabold text-rose-600">-S/. ${fMoney(g.total_egresos || 0)}</span>
                                </div>
                                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 font-bold mt-1">
                                    <span class="text-slate-700">Balance del Grupo:</span>
                                    <span class="${balanceNeto >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-black">
                                        ${balanceNeto >= 0 ? '+' : '-'} S/. ${fMoney(Math.abs(balanceNeto))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div class="pt-3 mt-3 border-t border-slate-100 space-y-2">
                            <!-- Botón para Modificar Nombre y Turno de la Sección -->
                            <button onclick="abrirModalEditarGrupo(${g.id})" class="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm" title="Modificar nombre, turno, encargado y aula">
                                <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                <span>✏️ Modificar Nombre y Turno</span>
                            </button>

                            <div class="flex items-center space-x-2">
                                <button onclick="verPlantillaSeccion(${g.id})" class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm" title="Ver plantilla oficial de esta sección">
                                    <i class="fa-solid fa-table-list"></i>
                                    <span>Plantilla</span>
                                </button>
                                <button onclick="abrirModalNuevoMovimientoParaGrupo('${encodeURIComponent(g.nombre)}', '${encodeURIComponent(g.encargado)}', '${encodeURIComponent(g.carrera)}')" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm" title="Ingresar cantidad / movimiento">
                                    <i class="fa-solid fa-money-bill-wave"></i>
                                    <span>Ingresar S/</span>
                                </button>
                                <button onclick="eliminarGrupo(${g.id}, '${encodeURIComponent(g.nombre)}')" class="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-slate-200" title="Eliminar sección">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Acciones de Grupo
        function abrirModalNuevoGrupo() {
            document.getElementById('form-nuevo-grupo').reset();
            document.getElementById('modal-nuevo-grupo').classList.remove('hidden');
        }

        function cerrarModalNuevoGrupo() {
            document.getElementById('modal-nuevo-grupo').classList.add('hidden');
        }

        async function guardarNuevoGrupo(e) {
            e.preventDefault();
            const payload = {
                nombre: document.getElementById('nuevo-grupo-nombre').value.trim(),
                carrera: document.getElementById('nuevo-grupo-carrera').value,
                encargado: document.getElementById('nuevo-grupo-encargado').value.trim(),
                turno: document.getElementById('nuevo-grupo-turno').value,
                horario: document.getElementById('nuevo-grupo-horario').value.trim(),
                aula_taller: document.getElementById('nuevo-grupo-aula').value.trim(),
                descripcion: document.getElementById('nuevo-grupo-descripcion').value.trim()
            };

            if (!payload.nombre || !payload.encargado) {
                alert("Por favor completa el nombre de la sección y el encargado de la clase.");
                return;
            }

            try {
                const res = await fetch('/api/grupos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalNuevoGrupo();
                    alert(`✅ Sección "${payload.nombre}" creada con éxito.`);
                    await cargarGrupos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo crear la sección'}`);
                }
            } catch (err) {
                alert("Error de conexión al guardar la sección");
            }
        }

        async function eliminarGrupo(id, nombreEncoded) {
            const nombre = decodeURIComponent(nombreEncoded);
            if (!confirm(`¿Estás seguro de que deseas eliminar la sección "${nombre}"?\n\nLos estudiantes asignados a este grupo pasarán a la sección 'General'.`)) {
                return;
            }

            try {
                const res = await fetch(`/api/grupos/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ ${data.message}`);
                    await cargarGrupos();
                    await cargarMovimientos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo eliminar el grupo'}`);
                }
            } catch (err) {
                alert("Error al intentar eliminar el grupo");
            }
        }

        async function abrirModalDetalleGrupo(id) {
            try {
                const res = await fetch(`/api/grupos/${id}/detalle`);
                const data = await res.json();
                const g = data.grupo;
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('detalle-grupo-nombre').innerText = g.nombre;
                document.getElementById('detalle-grupo-subtitulo').innerText = `${g.carrera} • Turno ${g.turno} • Aula: ${g.aula_taller || 'General'}`;
                document.getElementById('detalle-grupo-encargado').innerText = g.encargado;
                document.getElementById('detalle-grupo-turno').innerText = `${g.turno} | ${g.horario || 'Horario regular'}`;
                document.getElementById('detalle-grupo-ingresos').innerText = fMoney(data.total_ingresos);
                document.getElementById('detalle-grupo-egresos').innerText = fMoney(data.total_egresos);
                document.getElementById('detalle-grupo-alumnos-count').innerText = data.estudiantes.length;

                // Configurar botón para registrar en este grupo directamente
                const btnReg = document.getElementById('btn-registrar-en-este-grupo');
                if (btnReg) {
                    btnReg.onclick = () => {
                        cerrarModalDetalleGrupo();
                        abrirModalNuevoMovimientoParaGrupo(encodeURIComponent(g.nombre), encodeURIComponent(g.encargado), encodeURIComponent(g.carrera));
                    };
                }

                // Render lista estudiantes
                const tbodyEst = document.getElementById('detalle-grupo-tabla-alumnos');
                if (data.estudiantes.length === 0) {
                    tbodyEst.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400">No hay estudiantes asignados directamente a este grupo todavía.</td></tr>`;
                } else {
                    tbodyEst.innerHTML = data.estudiantes.map(e => `
                        <tr>
                            <td class="p-2 font-bold text-cyan-700">${e.codigo}</td>
                            <td class="p-2 font-semibold text-slate-800">${e.nombre}</td>
                            <td class="p-2 text-slate-600">${e.ciclo || 'Regular'}</td>
                            <td class="p-2 text-slate-500">${e.telefono || '-'}</td>
                        </tr>
                    `).join('');
                }

                // Render lista movimientos
                const tbodyMov = document.getElementById('detalle-grupo-tabla-movimientos');
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-400">Sin movimientos registrados aún para esta sección. Haz clic en '+ Registrar Movimiento en este Grupo'.</td></tr>`;
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => `
                        <tr>
                            <td class="p-2 font-semibold text-slate-600">${m.fecha}</td>
                            <td class="p-2">
                                <span class="font-bold text-[10px] px-2 py-0.5 rounded-full ${m.tipo === 'Ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                    ${m.tipo}
                                </span>
                            </td>
                            <td class="p-2 font-medium text-slate-800">${m.nombre}</td>
                            <td class="p-2">
                                <span class="text-slate-800">${m.concepto}</span>
                                ${m.notas ? `<div class="text-[10px] text-amber-700 font-medium">${m.notas}</div>` : ''}
                            </td>
                            <td class="p-2 text-right font-black ${m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}">
                                S/. ${Number(m.monto).toFixed(2)}
                            </td>
                            <td class="p-2 text-center">
                                <span class="text-[10px] font-bold ${m.estado === 'Pagado' ? 'text-emerald-700' : 'text-amber-700'}">
                                    ${m.estado}
                                </span>
                            </td>
                        </tr>
                    `).join('');
                }

                document.getElementById('modal-detalle-grupo').classList.remove('hidden');
            } catch (err) {
                console.error("Error al ver detalle del grupo:", err);
            }
        }

        function cerrarModalDetalleGrupo() {
            document.getElementById('modal-detalle-grupo').classList.add('hidden');
        }

        function abrirModalNuevoMovimientoParaGrupo(nombreEncoded, encargadoEncoded, carreraEncoded) {
            const nombre = decodeURIComponent(nombreEncoded);
            const encargado = decodeURIComponent(encargadoEncoded);
            const carrera = decodeURIComponent(carreraEncoded);

            abrirModalNuevoMovimiento();
            const selectGrupo = document.getElementById('form-grupo');
            if (selectGrupo) selectGrupo.value = nombre;

            const inputEncargado = document.getElementById('form-encargado');
            if (inputEncargado) inputEncargado.value = encargado;

            const selectCarrera = document.getElementById('form-carrera');
            if (selectCarrera && carrera) selectCarrera.value = carrera;
        }

        function alCambiarGrupoEnModal() {
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
        }

        // Tipo de Movimiento Selector Visual
        function seleccionarTipoMovimiento(tipo) {
            document.getElementById('form-tipo').value = tipo;
            const btnIngreso = document.getElementById('btn-tipo-ingreso');
            const btnEgreso = document.getElementById('btn-tipo-egreso');

            if (tipo === 'Ingreso') {
                btnIngreso.className = 'py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnEgreso.className = 'py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50 hover:text-rose-700';
            } else {
                btnEgreso.className = 'py-3 px-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnIngreso.className = 'py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-emerald-50 hover:text-emerald-700';
            }
        }

        // Botones de incremento rápido de cantidad
        function setCantidadRapida(val, sumar = false) {
            const inputMonto = document.getElementById('form-monto');
            if (!inputMonto) return;

            if (sumar) {
                const actual = parseFloat(inputMonto.value) || 0;
                inputMonto.value = (actual + val).toFixed(2);
            } else {
                inputMonto.value = val === 0 ? '' : Number(val).toFixed(2);
            }
            inputMonto.focus();
        }

        // MODAL NUEVO MOVIMIENTO
        function abrirModalNuevoMovimiento(rolPreseleccionado = '') {
            if (rolPreseleccionado) {
                document.getElementById('form-rol').value = rolPreseleccionado;
            }
            seleccionarTipoMovimiento('Ingreso');
            document.getElementById('modal-nuevo-movimiento').classList.remove('hidden');
        }

        function cerrarModalNuevoMovimiento() {
            document.getElementById('modal-nuevo-movimiento').classList.add('hidden');
        }

        function toggleFechaVencimiento() {
            const estado = document.getElementById('form-estado').value;
            const div = document.getElementById('div-vencimiento');
            if (estado === 'Pendiente') {
                div.classList.remove('hidden');
            } else {
                div.classList.add('hidden');
            }
        }

        async function guardarMovimiento(e) {
            e.preventDefault();
            const monto = parseFloat(document.getElementById('form-monto').value);
            if (!monto || monto <= 0) {
                alert("Por favor ingresa una cantidad válida mayor a cero.");
                return;
            }

            const payload = {
                tipo: document.getElementById('form-tipo').value,
                estado: document.getElementById('form-estado').value,
                rol: document.getElementById('form-rol').value,
                nombre: document.getElementById('form-nombre').value.trim(),
                grupo: (document.getElementById('form-grupo')?.value || 'General').trim(),
                encargado: (document.getElementById('form-encargado')?.value || 'General').trim(),
                carrera: document.getElementById('form-carrera').value,
                concepto: document.getElementById('form-concepto').value.trim(),
                monto: monto,
                monto_total: monto,
                monto_abonado: 0,
                fecha: document.getElementById('form-fecha').value,
                metodo_pago: document.getElementById('form-metodo').value,
                fecha_vencimiento: document.getElementById('form-vencimiento').value,
                notas: (document.getElementById('form-notas')?.value || '').trim()
            };

            try {
                const res = await fetch('/api/movimientos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalNuevoMovimiento();
                    document.getElementById('form-nuevo-movimiento').reset();
                    document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];
                    seleccionarTipoMovimiento('Ingreso');
                    toggleFechaVencimiento();
                    alert(`✅ Movimiento registrado con éxito por la cantidad de S/. ${monto.toFixed(2)}.`);
                    await cargarTodo();
                } else {
                    alert(`Error: ${data.error || 'No se pudo guardar el movimiento'}`);
                }
            } catch (err) {
                alert("Error al guardar el movimiento");
            }
        }

        async function eliminarMovimiento(id) {
            if (!confirm("¿Estás seguro de que deseas eliminar este movimiento de la caja?")) return;
            try {
                await fetch(`/api/movimientos/${id}`, { method: 'DELETE' });
                await cargarTodo();
            } catch (err) {
                alert("Error al eliminar");
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            initTheme();
            cargarTodo();
        });
    