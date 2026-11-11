const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// =====================================================================
// 1. MODALS TO INSERT BEFORE <!-- JAVASCRIPT LOGIC -->
// =====================================================================
const modalsHtml = `
    <!-- ========================================================= -->
    <!-- MODAL: EMITIR RECIBO A NUEVO ESTUDIANTE HOY               -->
    <!-- ========================================================= -->
    <div id="modal-nuevo-estudiante-factura" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
        <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div class="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-lg font-bold">
                        <i class="fa-solid fa-user-plus"></i>
                    </div>
                    <div>
                        <h3 class="font-extrabold text-base leading-tight">Emitir Recibo a Nuevo Estudiante Hoy</h3>
                        <p class="text-xs text-sky-200 mt-0.5">Genera correlativo oficial automático y registra al alumno en la nómina</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalNuevoEstudianteRecibo()" class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <form onsubmit="guardarNuevoEstudianteConRecibo(event)" class="p-6 space-y-4 text-xs">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DNI del Alumno (*):</label>
                        <input type="text" id="modal-nef-dni" maxlength="8" required placeholder="Ej: 74839201" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Celular / Teléfono:</label>
                        <input type="text" id="modal-nef-telefono" placeholder="Ej: 981763281" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Apellidos y Nombres Completos (*):</label>
                    <input type="text" id="modal-nef-nombre" required placeholder="Ej: MAMANI QUISPE CARLOS ALBERTO" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad / Carrera (*):</label>
                        <select id="modal-nef-carrera" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="Corte y Ensamblaje">Corte y Ensamblaje (Confección Textil)</option>
                            <option value="Computación e Informática">Computación e Informática</option>
                            <option value="Peluquería y Barbería">Peluquería y Barbería (Cosmetología)</option>
                            <option value="Gastronomía y Pastelería">Gastronomía y Pastelería</option>
                            <option value="Electricidad y Electrónica">Electricidad y Electrónica</option>
                            <option value="Mecánica Automotriz">Mecánica Automotriz</option>
                            <option value="Mecánica de Motos">Mecánica de Motos</option>
                            <option value="Carpintería Metálica">Carpintería Metálica</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Turno (*):</label>
                        <select id="modal-nef-turno" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="Tarde">Turno Tarde</option>
                            <option value="Mañana">Turno Mañana</option>
                            <option value="Noche">Turno Noche</option>
                            <option value="Sábado">Turno Sábado</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Emisión del Recibo (*):</label>
                        <input type="date" id="modal-nef-fecha" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto Cobrado (S/.):</label>
                        <input type="number" id="modal-nef-monto" step="0.50" value="150.00" required class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto del Recibo:</label>
                    <input type="text" id="modal-nef-concepto" value="Aporte por Mantenimiento Módulo 1" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                </div>

                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notas u Observaciones:</label>
                    <textarea id="modal-nef-notas" rows="2" placeholder="Observaciones sobre la matrícula o pagos..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none custom-scrollbar"></textarea>
                </div>

                <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onclick="cerrarModalNuevoEstudianteRecibo()" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        Cancelar
                    </button>
                    <button type="submit" id="btn-submit-nuevo-est-recibo" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition">
                        <i class="fa-solid fa-receipt"></i>
                        <span>Emitir Recibo y Registrar Alumno</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL: CALENDARIZACIÓN DE INGRESOS Y NUEVOS ESTUDIANTES   -->
    <!-- ========================================================= -->
    <div id="modal-calendarizacion-ingresos" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
        <div class="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            
            <div class="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-lg font-bold">
                        <i class="fa-solid fa-calendar-days"></i>
                    </div>
                    <div>
                        <h3 class="font-extrabold text-base leading-tight">Calendarización de Ingresos y Nuevos Estudiantes</h3>
                        <p class="text-xs text-slate-300 mt-0.5">Historial cronológico diario de recibos emitidos y alumnos registrados</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalCalendarizacion()" class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Resumen Estadístico Superior -->
            <div class="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Días con Ingresos</div>
                        <div id="cal-stat-dias" class="text-base font-black text-slate-900 dark:text-white font-mono">0</div>
                    </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Estudiantes</div>
                        <div id="cal-stat-estudiantes" class="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">0</div>
                    </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                        <i class="fa-solid fa-money-bill-wave"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recaudado</div>
                        <div id="cal-stat-monto" class="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">S/. 0.00</div>
                    </div>
                </div>
            </div>

            <!-- Buscador y Filtro -->
            <div class="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
                <div class="relative flex-1">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
                    <input type="text" id="cal-buscar-input" oninput="filtrarCalendarizacionEnVivo(this.value)" placeholder="Buscar por fecha (YYYY-MM-DD), nombre de alumno o recibo..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <button type="button" onclick="cargarCalendarizacion()" title="Recargar datos" class="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5">
                    <i class="fa-solid fa-rotate"></i>
                    <span>Actualizar</span>
                </button>
            </div>

            <!-- Contenedor de la Lista / Acordeón de Fechas -->
            <div id="cal-dias-container" class="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
                <div class="text-center py-8 text-slate-400">
                    <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-indigo-500"></i>
                    <p>Cargando calendarización oficial...</p>
                </div>
            </div>
            
            <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button type="button" onclick="cerrarModalCalendarizacion()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
`;

if (!html.includes('id="modal-nuevo-estudiante-factura"')) {
    html = html.replace('<!-- JAVASCRIPT LOGIC -->', modalsHtml + '\n    <!-- JAVASCRIPT LOGIC -->');
    console.log('1. Modals injected before JAVASCRIPT LOGIC');
}

// =====================================================================
// 2. JAVASCRIPT LOGIC INJECTION
// =====================================================================
const jsLogic = `
        // =============================================================
        // CONTROL DE FORMATO Y ESTILO DEL VOUCHER
        // =============================================================
        let currentVoucherFormato = 'doble'; // 'doble' (media carta x2) o 'simple' (1 recibo)
        let currentVoucherEstilo = 'color';  // 'color' o 'azul' (monocromático talonario)
        let calendarizacionGlobal = [];

        function setFormatoVoucher(formato) {
            currentVoucherFormato = formato;
            const btnDoble = document.getElementById('btn-formato-doble');
            const btnSimple = document.getElementById('btn-formato-simple');
            const copiaVoucher = document.getElementById('contenedor-comprobante-copia');
            const separadorCorte = document.getElementById('separador-corte-talonario');

            if (formato === 'doble') {
                if (btnDoble) {
                    btnDoble.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                }
                if (btnSimple) {
                    btnSimple.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                }
                if (copiaVoucher) copiaVoucher.style.display = 'block';
                if (separadorCorte) separadorCorte.style.display = 'block';
            } else {
                if (btnSimple) {
                    btnSimple.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                }
                if (btnDoble) {
                    btnDoble.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                }
                if (copiaVoucher) copiaVoucher.style.display = 'none';
                if (separadorCorte) separadorCorte.style.display = 'none';
            }
        }

        function setEstiloVoucher(estilo) {
            currentVoucherEstilo = estilo;
            const btnColor = document.getElementById('btn-estilo-color');
            const btnAzul = document.getElementById('btn-estilo-azul');
            const contenedor = document.getElementById('contenedor-impresion-factura');

            if (estilo === 'azul') {
                if (btnAzul) {
                    btnAzul.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                }
                if (btnColor) {
                    btnColor.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                }
                if (contenedor) contenedor.classList.add('voucher-estilo-azul');
            } else {
                if (btnColor) {
                    btnColor.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                }
                if (btnAzul) {
                    btnAzul.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                }
                if (contenedor) contenedor.classList.remove('voucher-estilo-azul');
            }
        }

        // Descargar recibo oficial directamente en formato Excel .xlsx
        function descargarReciboExcel() {
            if (!currentFacturaReciboId) {
                mostrarNotificacion('Seleccione primero un recibo para descargar', 'advertencia');
                return;
            }
            window.location.href = '/api/movimientos/' + currentFacturaReciboId + '/recibo-excel';
            mostrarNotificacion('Descargando recibo oficial en formato Excel...', 'exito');
        }

        // Modificar la fecha de emisión del recibo actual
        async function cambiarFechaEmisionFactura(nuevaFecha) {
            if (!currentFacturaReciboId) return;
            if (!nuevaFecha) return;

            try {
                const res = await fetch('/api/movimientos/' + currentFacturaReciboId + '/fecha', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fecha: nuevaFecha })
                });
                const data = await res.json();
                if (data.success) {
                    // Actualizar en el objeto global
                    const m = (movimientosGlobales || []).find(x => x.id == currentFacturaReciboId);
                    if (m) m.fecha = nuevaFecha;

                    // Actualizar las tablas de día / mes / año en el voucher
                    const parts = nuevaFecha.split('-');
                    if (parts.length === 3) {
                        const dia = parts[2].padStart(2, '0');
                        const mes = parts[1].padStart(2, '0');
                        const ano = parts[0].slice(-2);

                        const elDia = document.getElementById('factura-dia');
                        const elMes = document.getElementById('factura-mes');
                        const elAno = document.getElementById('factura-ano');
                        if (elDia) elDia.innerText = dia;
                        if (elMes) elMes.innerText = mes;
                        if (elAno) elAno.innerText = ano;

                        const copiaDia = document.getElementById('copia-factura-dia');
                        const copiaMes = document.getElementById('copia-factura-mes');
                        const copiaAno = document.getElementById('copia-factura-ano');
                        if (copiaDia) copiaDia.innerText = dia;
                        if (copiaMes) copiaMes.innerText = mes;
                        if (copiaAno) copiaAno.innerText = ano;
                    }

                    mostrarNotificacion('Fecha de emisión actualizada a ' + nuevaFecha + ' y guardada en Excel', 'exito');
                } else {
                    mostrarNotificacion(data.error || 'Error al actualizar fecha', 'error');
                }
            } catch (e) {
                console.error('Error actualizando fecha:', e);
                mostrarNotificacion('Error de conexión al actualizar fecha', 'error');
            }
        }

        function establecerFechaHoyFactura() {
            const hoy = new Date().toISOString().split('T')[0];
            const inp = document.getElementById('factura-fecha-emision-input');
            if (inp) {
                inp.value = hoy;
                cambiarFechaEmisionFactura(hoy);
            }
        }

        // =============================================================
        // MODAL Y EMISIÓN A NUEVO ESTUDIANTE HOY
        // =============================================================
        function abrirModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (!modal) return;
            const hoy = new Date().toISOString().split('T')[0];
            const inpFecha = document.getElementById('modal-nef-fecha');
            if (inpFecha) inpFecha.value = hoy;
            modal.classList.remove('hidden');
        }

        function cerrarModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (modal) modal.classList.add('hidden');
        }

        async function guardarNuevoEstudianteConRecibo(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-nuevo-est-recibo');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Emitiendo Recibo...</span>';
            }

            const payload = {
                dni: document.getElementById('modal-nef-dni').value.trim(),
                nombre: document.getElementById('modal-nef-nombre').value.trim(),
                telefono: document.getElementById('modal-nef-telefono').value.trim(),
                carrera: document.getElementById('modal-nef-carrera').value,
                turno: document.getElementById('modal-nef-turno').value,
                fecha: document.getElementById('modal-nef-fecha').value,
                monto: parseFloat(document.getElementById('modal-nef-monto').value) || 150,
                concepto: document.getElementById('modal-nef-concepto').value.trim(),
                notas: document.getElementById('modal-nef-notas').value.trim()
            };

            try {
                const res = await fetch('/api/estudiantes/nuevo-con-recibo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success) {
                    mostrarNotificacion(data.mensaje, 'exito');
                    cerrarModalNuevoEstudianteRecibo();

                    // Recargar datos del sistema
                    await cargarDatosIniciales();

                    // Seleccionar directamente el nuevo comprobante en la factura
                    if (data.movimiento_id) {
                        seleccionarFacturaRecibo(data.movimiento_id, true);
                    }
                } else {
                    mostrarNotificacion(data.error || 'Error al emitir comprobante', 'error');
                }
            } catch (err) {
                console.error(err);
                mostrarNotificacion('Error de conexión al emitir comprobante', 'error');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-receipt"></i><span>Emitir Recibo y Registrar Alumno</span>';
                }
            }
        }

        // =============================================================
        // MODAL Y CALENDARIZACIÓN DE INGRESOS
        // =============================================================
        function abrirModalCalendarizacion() {
            const modal = document.getElementById('modal-calendarizacion-ingresos');
            if (!modal) return;
            modal.classList.remove('hidden');
            cargarCalendarizacion();
        }

        function cerrarModalCalendarizacion() {
            const modal = document.getElementById('modal-calendarizacion-ingresos');
            if (modal) modal.classList.add('hidden');
        }

        async function cargarCalendarizacion() {
            const container = document.getElementById('cal-dias-container');
            if (container) {
                container.innerHTML = '<div class="text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-indigo-500"></i><p>Cargando calendarización...</p></div>';
            }

            try {
                const res = await fetch('/api/estudiantes/calendarizacion');
                const data = await res.json();

                if (data.success) {
                    calendarizacionGlobal = data.calendarizacion || [];

                    // Actualizar métricas
                    const elDias = document.getElementById('cal-stat-dias');
                    const elEsts = document.getElementById('cal-stat-estudiantes');
                    const elMonto = document.getElementById('cal-stat-monto');

                    let totalEsts = 0;
                    let totalMonto = 0;
                    calendarizacionGlobal.forEach(d => {
                        totalEsts += (d.total_estudiantes || 0);
                        totalMonto += (d.total_monto || 0);
                    });

                    if (elDias) elDias.innerText = data.dias_registrados || calendarizacionGlobal.length;
                    if (elEsts) elEsts.innerText = totalEsts;
                    if (elMonto) elMonto.innerText = 'S/. ' + totalMonto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    renderizarCalendarizacion(calendarizacionGlobal);
                } else {
                    if (container) container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar calendarización</div>';
                }
            } catch (err) {
                console.error(err);
                if (container) container.innerHTML = '<div class="p-4 text-center text-red-500">Error de conexión</div>';
            }
        }

        function renderizarCalendarizacion(lista) {
            const container = document.getElementById('cal-dias-container');
            if (!container) return;

            if (lista.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-slate-400">No se encontraron registros de ingresos para la búsqueda.</div>';
                return;
            }

            let html = '';
            lista.forEach((item, index) => {
                const fechaFormat = item.fecha ? item.fecha.split('-').reverse().join('/') : 'Sin Fecha';
                const totalMontoStr = 'S/. ' + (item.total_monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

                html += \`
                    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition hover:border-indigo-400 dark:hover:border-indigo-600">
                        <div class="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 cursor-pointer" onclick="toggleDetalleDia(\${index})">
                            <div class="flex items-center space-x-3">
                                <span class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                    <i class="fa-regular fa-calendar"></i>
                                </span>
                                <div>
                                    <span class="font-mono font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">\${fechaFormat}</span>
                                    <span class="text-[10px] text-slate-400 ml-1 font-mono">(\${item.fecha})</span>
                                </div>
                            </div>

                            <div class="flex items-center space-x-3">
                                <span class="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold px-2.5 py-1 rounded-lg text-[11px] border border-indigo-200 dark:border-indigo-800">
                                    👥 \${item.total_estudiantes} alumnos
                                </span>
                                <span class="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold px-2.5 py-1 rounded-lg text-[11px] border border-emerald-200 dark:border-emerald-800">
                                    💰 \${totalMontoStr}
                                </span>
                                <i id="icon-chevron-\${index}" class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform"></i>
                            </div>
                        </div>

                        <!-- Lista de Estudiantes / Recibos de ese Día -->
                        <div id="detalle-dia-\${index}" class="p-3 bg-white dark:bg-slate-900 \${index === 0 ? '' : 'hidden'} border-t border-slate-100 dark:border-slate-800/80">
                            <div class="overflow-x-auto custom-scrollbar">
                                <table class="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                                            <th class="py-1.5 px-2">Recibo</th>
                                            <th class="py-1.5 px-2">Estudiante</th>
                                            <th class="py-1.5 px-2">DNI</th>
                                            <th class="py-1.5 px-2">Especialidad</th>
                                            <th class="py-1.5 px-2 text-right">Monto</th>
                                            <th class="py-1.5 px-2 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                \`;

                (item.recibos || []).forEach(r => {
                    const nroRecibo = r.comprobante ? ('N° ' + String(r.comprobante).padStart(7, '0')) : ('N° ' + r.id);
                    const montoFmt = 'S/. ' + (parseFloat(r.monto) || 150).toFixed(2);
                    html += \`
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td class="py-1.5 px-2 font-mono font-bold text-red-600">\${nroRecibo}</td>
                            <td class="py-1.5 px-2 font-bold text-slate-800 dark:text-slate-200 uppercase">\${r.nombre}</td>
                            <td class="py-1.5 px-2 font-mono text-slate-600 dark:text-slate-400">\${r.dni || '-'}</td>
                            <td class="py-1.5 px-2 text-slate-600 dark:text-slate-400">\${r.carrera || 'General'}</td>
                            <td class="py-1.5 px-2 text-right font-mono font-bold text-emerald-600">\${montoFmt}</td>
                            <td class="py-1.5 px-2 text-center">
                                <button onclick="seleccionarDesdeCalendarizacion(\${r.id})" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition flex items-center space-x-1 mx-auto">
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>Ver Recibo</span>
                                </button>
                            </td>
                        </tr>
                    \`;
                });

                html += \`
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                \`;
            });

            container.innerHTML = html;
        }

        function toggleDetalleDia(idx) {
            const el = document.getElementById('detalle-dia-' + idx);
            const ico = document.getElementById('icon-chevron-' + idx);
            if (!el) return;
            if (el.classList.contains('hidden')) {
                el.classList.remove('hidden');
                if (ico) ico.classList.add('rotate-180');
            } else {
                el.classList.add('hidden');
                if (ico) ico.classList.remove('rotate-180');
            }
        }

        function filtrarCalendarizacionEnVivo(query) {
            if (!query || !query.trim()) {
                renderizarCalendarizacion(calendarizacionGlobal);
                return;
            }
            const q = query.trim().toLowerCase();
            const filtrada = calendarizacionGlobal.filter(d => {
                if (d.fecha && d.fecha.toLowerCase().includes(q)) return true;
                const tieneRecibo = (d.recibos || []).some(r => 
                    (r.nombre && r.nombre.toLowerCase().includes(q)) ||
                    (r.comprobante && String(r.comprobante).includes(q)) ||
                    (r.dni && String(r.dni).includes(q))
                );
                return tieneRecibo;
            });
            renderizarCalendarizacion(filtrada);
        }

        function seleccionarDesdeCalendarizacion(reciboId) {
            cerrarModalCalendarizacion();
            mostrarSeccion('factura');
            seleccionarFacturaRecibo(reciboId, true);
        }

        // =============================================================
        // SINCRONIZACIÓN AUTOMÁTICA DEL VOUCHER COPIA CON EL ORIGINAL
        // =============================================================
        function sincronizarCopiaVoucher() {
            // Sincronizar número de comprobante
            const origNro = document.getElementById('factura-nro-comprobante');
            const copiaNro = document.getElementById('copia-factura-nro-comprobante');
            if (origNro && copiaNro) copiaNro.innerText = origNro.innerText;

            // Sincronizar estudiante
            const origEst = document.getElementById('factura-estudiante');
            const copiaEst = document.getElementById('copia-factura-estudiante');
            if (origEst && copiaEst) copiaEst.innerText = origEst.innerText;

            // Sincronizar DNI
            const origDni = document.getElementById('factura-dni');
            const copiaDni = document.getElementById('copia-factura-dni');
            if (origDni && copiaDni) copiaDni.innerText = origDni.innerText;

            // Sincronizar especialidad
            const origEsp = document.getElementById('factura-carrera');
            const copiaEsp = document.getElementById('copia-factura-carrera');
            if (origEsp && copiaEsp) copiaEsp.innerText = origEsp.innerText;

            // Sincronizar celular
            const origCel = document.getElementById('factura-telefono');
            const copiaCel = document.getElementById('copia-factura-telefono');
            if (origCel && copiaCel) copiaCel.innerText = origCel.innerText;

            // Sincronizar casillas
            for (let i = 1; i <= 7; i++) {
                const origBox = document.getElementById('box-mod-' + i);
                const copiaBox = document.getElementById('copia-box-mod-' + i);
                if (origBox && copiaBox) copiaBox.innerText = origBox.innerText;
            }

            // Sincronizar constancia, fut y otros
            const origConst = document.getElementById('check-constancia');
            const copiaConst = document.getElementById('copia-check-constancia');
            if (origConst && copiaConst) copiaConst.innerText = origConst.innerText;

            const origFut = document.getElementById('check-fut');
            const copiaFut = document.getElementById('copia-check-fut');
            if (origFut && copiaFut) copiaFut.innerText = origFut.innerText;

            const origOtros = document.getElementById('factura-otros-texto');
            const copiaOtros = document.getElementById('copia-factura-otros-texto');
            if (origOtros && copiaOtros) copiaOtros.innerText = origOtros.innerText;

            // Sincronizar montos
            const origF1 = document.getElementById('factura-monto-fila1');
            const copiaF1 = document.getElementById('copia-factura-monto-fila1');
            if (origF1 && copiaF1) copiaF1.innerText = origF1.innerText;

            const origTotal = document.getElementById('factura-monto-total');
            const copiaTotal = document.getElementById('copia-factura-monto-total');
            if (origTotal && copiaTotal) copiaTotal.innerText = origTotal.innerText;

            // Sincronizar fecha
            const origDia = document.getElementById('factura-dia');
            const copiaDia = document.getElementById('copia-factura-dia');
            if (origDia && copiaDia) copiaDia.innerText = origDia.innerText;

            const origMes = document.getElementById('factura-mes');
            const copiaMes = document.getElementById('copia-factura-mes');
            if (origMes && copiaMes) copiaMes.innerText = origMes.innerText;

            const origAno = document.getElementById('factura-ano');
            const copiaAno = document.getElementById('copia-factura-ano');
            if (origAno && copiaAno) copiaAno.innerText = origAno.innerText;
        }
`;

// Insert the jsLogic at the beginning of the <script> tag if not already present
const scriptStartTarget = '<script>\n        let myChart = null;';
const scriptStartTargetWin = '<script>\r\n        let myChart = null;';

if (html.includes(scriptStartTargetWin)) {
    html = html.replace(scriptStartTargetWin, '<script>\n' + jsLogic + '\n        let myChart = null;');
    console.log('2. JavaScript functions injected successfully (Windows line endings)');
} else if (html.includes(scriptStartTarget)) {
    html = html.replace(scriptStartTarget, '<script>\n' + jsLogic + '\n        let myChart = null;');
    console.log('2. JavaScript functions injected successfully (Unix line endings)');
} else {
    console.log('2. Warning: script start target not matched verbatim');
}

// 3. HOOK INTO seleccionarFacturaRecibo TO UPDATE THE FECHA INPUT AND SYNC COPIA
const targetInRecibo = `// 4. Fecha: DÍA | MES | AÑO`;
const hookInRecibo = `// Sincronizar input de fecha de emisión superior
            const inpFechaEmision = document.getElementById('factura-fecha-emision-input');
            if (inpFechaEmision && m.fecha) {
                inpFechaEmision.value = m.fecha;
            }

            // 4. Fecha: DÍA | MES | AÑO`;

if (html.includes(targetInRecibo) && !html.includes('inpFechaEmision.value = m.fecha')) {
    html = html.replace(targetInRecibo, hookInRecibo);
    console.log('3. Date input hook injected into seleccionarFacturaRecibo');
}

// Also call sincronizarCopiaVoucher() at the end of seleccionarFacturaRecibo
const targetEndRecibo = `sincronizarNotaConVoucher(m.notas || '');`;
const hookEndRecibo = `sincronizarNotaConVoucher(m.notas || '');
            sincronizarCopiaVoucher();`;

if (html.includes(targetEndRecibo) && !html.includes('sincronizarCopiaVoucher();')) {
    html = html.replace(targetEndRecibo, hookEndRecibo);
    console.log('4. sincronizarCopiaVoucher call injected into seleccionarFacturaRecibo');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html completely updated!');
