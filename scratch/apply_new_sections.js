const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const mainEnd = html.indexOf('</main>');

const newSectionsHTML = `
            <!-- =================================================================== -->
            <!-- 10. SECCIÓN: CONTROL DE PAGOS POR MES (HOJA CONTROL_PAGOS)          -->
            <!-- =================================================================== -->
            <div id="section-control-pagos" class="hidden space-y-6">
                <!-- Membrete Print -->
                <div class="hidden print-header-institucional">
                    <h1 class="text-xl font-extrabold text-slate-900">CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA</h1>
                    <p class="text-xs text-slate-600">HOJA OFICIAL: CONTROL DE PAGOS POR MES (MATRIZ MES A MES 2026)</p>
                </div>

                <!-- Banner -->
                <div class="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center text-2xl shadow-lg">
                            <i class="fa-solid fa-calendar-days"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-table-list"></i>
                                <span>Hoja Excel: CONTROL_PAGOS • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-bold">Control de Pagos por Mes (Matriz Enero a Diciembre)</h3>
                            <p class="text-xs text-slate-300 mt-1">Supervisión mensual de pagos de matrícula y cuotas por cada uno de los 147 estudiantes.</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button onclick="exportarHojaPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>Exportar a PDF</span>
                        </button>
                        <button onclick="exportarHojaExcel()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>Exportar a Excel</span>
                        </button>
                    </div>
                </div>

                <!-- Filtro de la Matriz -->
                <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-3 items-center justify-between no-print">
                    <div class="relative min-w-[280px]">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
                        <input type="text" id="filtro-control-pagos-buscar" oninput="filtrarControlPagos()" placeholder="Buscar alumno en matriz mensual..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
                    </div>

                    <div class="flex items-center space-x-3 text-xs font-semibold">
                        <span class="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                            <span>Verde = Mes Pagado</span>
                        </span>
                        <span class="flex items-center space-x-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <span class="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
                            <span>Guión = Sin Pago</span>
                        </span>
                    </div>
                </div>

                <!-- Tabla Matriz Mes a Mes -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-[11px]">
                            <thead>
                                <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                                    <th class="py-3 px-3">ID</th>
                                    <th class="py-3 px-3">DNI</th>
                                    <th class="py-3 px-3 min-w-[180px]">Estudiante</th>
                                    <th class="py-3 px-3">Grupo / Sección</th>
                                    <th class="py-3 px-2 text-center text-teal-700 font-extrabold">Matr.</th>
                                    <th class="py-3 px-2 text-center">Ene</th>
                                    <th class="py-3 px-2 text-center">Feb</th>
                                    <th class="py-3 px-2 text-center">Mar</th>
                                    <th class="py-3 px-2 text-center">Abr</th>
                                    <th class="py-3 px-2 text-center">May</th>
                                    <th class="py-3 px-2 text-center">Jun</th>
                                    <th class="py-3 px-2 text-center">Jul</th>
                                    <th class="py-3 px-2 text-center">Ago</th>
                                    <th class="py-3 px-2 text-center">Set</th>
                                    <th class="py-3 px-2 text-center">Oct</th>
                                    <th class="py-3 px-2 text-center">Nov</th>
                                    <th class="py-3 px-2 text-center">Dic</th>
                                    <th class="py-3 px-3 text-right font-extrabold text-emerald-700">Pagado</th>
                                    <th class="py-3 px-3 text-right font-extrabold text-rose-700">Deuda</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-control-pagos-body" class="divide-y divide-slate-100 font-medium">
                                <tr>
                                    <td colspan="19" class="text-center py-8 text-slate-400">Cargando matriz mensual de control de pagos...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- =================================================================== -->
            <!-- 11. SECCIÓN: DIARIO & NOTAS (HOJAS DIARIO Y NOTAS DE EXCEL)         -->
            <!-- =================================================================== -->
            <div id="section-diario" class="hidden space-y-6">
                <!-- Membrete Print -->
                <div class="hidden print-header-institucional">
                    <h1 class="text-xl font-extrabold text-slate-900">CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA</h1>
                    <p class="text-xs text-slate-600">HOJA OFICIAL: DIARIO DE CAJA Y NOTAS DE CLASE</p>
                </div>

                <!-- Banner -->
                <div class="bg-gradient-to-r from-amber-900 via-slate-900 to-orange-950 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl shadow-lg">
                            <i class="fa-solid fa-book-bookmark"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-calendar-day"></i>
                                <span>Hojas Excel: DIARIO y NOTAS • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-bold">Diario de Caja y Bitácora de Clase</h3>
                            <p class="text-xs text-slate-300 mt-1">Supervisión diaria de ingresos, salidas y notas de actividad pedagógica por cada docente.</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <div class="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 flex items-center space-x-2">
                            <span class="text-xs font-bold text-amber-300">Fecha:</span>
                            <input type="date" id="diario-selector-fecha" onchange="cargarDiario(this.value)" class="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none">
                        </div>
                        <button onclick="exportarHojaPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>PDF</span>
                        </button>
                    </div>
                </div>

                <!-- Tarjetas del Día -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Ingresos del Día</p>
                        <h4 id="diario-ingresos" class="text-xl font-black text-emerald-600 mt-0.5">S/. 0.00</h4>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Pagos Recibidos</p>
                        <h4 id="diario-pagos-count" class="text-xl font-black text-slate-800 mt-0.5">0 Recibos</h4>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Gastos del Día</p>
                        <h4 id="diario-egresos" class="text-xl font-black text-rose-600 mt-0.5">S/. 0.00</h4>
                    </div>

                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p class="text-[11px] font-bold text-slate-400 uppercase">Saldo Neto del Día</p>
                        <h4 id="diario-saldo" class="text-xl font-black text-sky-700 mt-0.5">S/. 0.00</h4>
                    </div>
                </div>

                <!-- Tabla Movimientos del Día -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                            <i class="fa-solid fa-cash-register text-emerald-600"></i>
                            <span>Movimientos y Pagos del Día</span>
                        </h4>
                        <span id="diario-movs-badge" class="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">0 Registros</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                    <th class="py-3 px-4">N° Recibo</th>
                                    <th class="py-3 px-4">Estudiante / Persona</th>
                                    <th class="py-3 px-4">Grupo / Especialidad</th>
                                    <th class="py-3 px-4">Encargado de Clase</th>
                                    <th class="py-3 px-4">Concepto / Nota</th>
                                    <th class="py-3 px-4 text-right">Monto (S/.)</th>
                                    <th class="py-3 px-4 text-center">Método</th>
                                </tr>
                            </thead>
                            <tbody id="diario-tabla-movimientos" class="divide-y divide-slate-100 font-medium">
                                <tr>
                                    <td colspan="7" class="text-center py-6 text-slate-400">Seleccione una fecha para ver las operaciones...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Bitácora de Actividades y Notas Pedagógicas de Clase -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                            <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                            <span>Bitácora Oficial de Notas y Actividades Desarrolladas (Hoja NOTAS)</span>
                        </h4>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                    <th class="py-3 px-4">Código Grupo</th>
                                    <th class="py-3 px-4">Especialidad / Grupo</th>
                                    <th class="py-3 px-4">Docente Encargado(a)</th>
                                    <th class="py-3 px-4">Actividad Realizada / Tema Desarrollado</th>
                                    <th class="py-3 px-4">Observaciones Pedagógicas</th>
                                </tr>
                            </thead>
                            <tbody id="diario-tabla-notas" class="divide-y divide-slate-100 font-medium">
                                <tr>
                                    <td class="p-3 font-bold text-indigo-700">G01</td>
                                    <td class="p-3 font-semibold text-slate-800">Confección Textil</td>
                                    <td class="p-3 text-slate-700">Teresa Aguilar Gómez</td>
                                    <td class="p-3 text-slate-600">Trazado y corte de patrones de prendas para dama</td>
                                    <td class="p-3 text-emerald-700 font-semibold">Asistencia completa, prácticas en taller 1</td>
                                </tr>
                                <tr>
                                    <td class="p-3 font-bold text-indigo-700">G02</td>
                                    <td class="p-3 font-semibold text-slate-800">Computación e Informática</td>
                                    <td class="p-3 text-slate-700">Rosa Elena Quispe Huamán</td>
                                    <td class="p-3 text-slate-600">Instalación de software ofimático y gestión de bases de datos</td>
                                    <td class="p-3 text-emerald-700 font-semibold">Evaluación práctica de laboratorio 1</td>
                                </tr>
                                <tr>
                                    <td class="p-3 font-bold text-indigo-700">G03</td>
                                    <td class="p-3 font-semibold text-slate-800">Cosmetología y Peluquería</td>
                                    <td class="p-3 text-slate-700">Lucía Fernanda Paredes Soto</td>
                                    <td class="p-3 text-slate-600">Técnicas de colorimetría y ondulación permanente</td>
                                    <td class="p-3 text-emerald-700 font-semibold">Práctica con modelos reales en taller</td>
                                </tr>
                                <tr>
                                    <td class="p-3 font-bold text-indigo-700">G04</td>
                                    <td class="p-3 font-semibold text-slate-800">Gastronomía y Pastelería</td>
                                    <td class="p-3 text-slate-700">Marleny Huaylla Condori</td>
                                    <td class="p-3 text-slate-600">Preparación de masas batidas y pastelería fina comercial</td>
                                    <td class="p-3 text-emerald-700 font-semibold">Venta de producción para fondos de taller</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- =================================================================== -->
            <!-- 12. SECCIÓN: COMPROBANTE DE PAGO / FACTURA (HOJA FACTURA DE EXCEL) -->
            <!-- =================================================================== -->
            <div id="section-factura" class="hidden space-y-6">
                <!-- Banner -->
                <div class="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center text-2xl shadow-lg">
                            <i class="fa-solid fa-receipt"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1">
                                <i class="fa-solid fa-file-invoice"></i>
                                <span>Hoja Excel: FACTURA • CETPRO San Miguel</span>
                            </div>
                            <h3 class="text-xl font-bold">Emisión Oficial de Boletas y Comprobantes</h3>
                            <p class="text-xs text-slate-300 mt-1">Generación e impresión de comprobantes de pago institucionales con número en letras y firma.</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button onclick="imprimirFactura()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition">
                            <i class="fa-solid fa-print"></i>
                            <span>Imprimir Comprobante Oficial</span>
                        </button>
                    </div>
                </div>

                <!-- Selector de Recibo -->
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
                    <div class="flex items-center space-x-3 flex-1 min-w-[280px]">
                        <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Seleccionar Recibo a Emitir:</label>
                        <select id="factura-recibo-select" onchange="seleccionarFacturaRecibo(this.value)" class="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                            <option value="">Cargando comprobantes...</option>
                        </select>
                    </div>
                </div>

                <!-- FORMATO OFICIAL IMPRIMIBLE DEL COMPROBANTE (IDÉNTICO A HOJA FACTURA) -->
                <div class="flex justify-center">
                    <div id="contenedor-comprobante-oficial" class="bg-white border-2 border-slate-800 p-8 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800">
                        <!-- Membrete -->
                        <div class="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-4">
                            <div class="flex items-center space-x-3">
                                <img src="/public/img/logo_institucion.jpg" class="w-16 h-16 rounded-xl object-contain border border-slate-300 p-1">
                                <div>
                                    <h2 class="text-lg font-black text-slate-900 tracking-tight leading-tight">CETPRO MICAELA BASTIDAS PUYUCAMA</h2>
                                    <p class="text-[11px] font-semibold text-slate-600">RUC: 20485938210 · Dirección: Av. Costanera 1200, San Miguel, Lima</p>
                                    <p class="text-[11px] text-slate-500">Teléfono: (01) 566-2390 · Correo: cetpro_micaelabastidas@educacion.gob.pe</p>
                                </div>
                            </div>
                            <div class="border-2 border-slate-800 p-3 rounded-xl text-center bg-slate-50 min-w-[180px]">
                                <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">COMPROBANTE DE PAGO</p>
                                <h3 id="factura-nro-comprobante" class="text-base font-black text-rose-700 tracking-wider">R001-000142</h3>
                                <p id="factura-orden-ingreso" class="text-[10px] text-slate-600 font-bold">Orden Ingreso N° 000142</p>
                            </div>
                        </div>

                        <!-- Datos del Comprobante -->
                        <div class="grid grid-cols-2 gap-4 text-xs mb-5">
                            <div>
                                <p><strong class="text-slate-500 uppercase text-[10px]">Fecha de Pago:</strong> <span id="factura-fecha" class="font-bold text-slate-900">12/03/2026</span></p>
                                <p class="mt-1.5"><strong class="text-slate-500 uppercase text-[10px]">Estudiante:</strong> <span id="factura-estudiante" class="font-extrabold text-slate-900">Ana María Quispe Mendoza</span></p>
                                <p class="mt-1.5"><strong class="text-slate-500 uppercase text-[10px]">DNI / Código:</strong> <span id="factura-dni" class="font-bold text-indigo-700">72849102</span></p>
                            </div>
                            <div>
                                <p><strong class="text-slate-500 uppercase text-[10px]">Sección / Grupo:</strong> <span id="factura-grupo" class="font-bold text-slate-900">Confección Textil - Grupo A</span></p>
                                <p class="mt-1.5"><strong class="text-slate-500 uppercase text-[10px]">Docente a Cargo:</strong> <span id="factura-docente" class="font-bold text-slate-900">Teresa Aguilar Gómez</span></p>
                                <p class="mt-1.5"><strong class="text-slate-500 uppercase text-[10px]">Forma de Pago:</strong> <span id="factura-forma-pago" class="font-bold text-emerald-700">Efectivo en Caja</span></p>
                            </div>
                        </div>

                        <!-- Detalle -->
                        <table class="w-full text-left border-collapse text-xs mb-5">
                            <thead>
                                <tr class="bg-slate-100 border-y-2 border-slate-800 text-slate-800 font-bold uppercase text-[10px]">
                                    <th class="py-2.5 px-3">Cant.</th>
                                    <th class="py-2.5 px-3">Descripción / Concepto</th>
                                    <th class="py-2.5 px-3 text-right">Precio Unit. (S/)</th>
                                    <th class="py-2.5 px-3 text-right">Total (S/)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200">
                                <tr>
                                    <td class="py-3 px-3 font-bold">1</td>
                                    <td class="py-3 px-3 font-semibold" id="factura-concepto">Matrícula Anual y Cuota de Taller Módulo 1</td>
                                    <td class="py-3 px-3 text-right" id="factura-precio-unit">S/. 150.00</td>
                                    <td class="py-3 px-3 text-right font-extrabold text-slate-900" id="factura-total-fila">S/. 150.00</td>
                                </tr>
                            </tbody>
                            <tfoot class="border-t-2 border-slate-800 font-extrabold">
                                <tr>
                                    <td colspan="3" class="py-3 px-3 text-right uppercase text-xs">TOTAL CANCELADO:</td>
                                    <td class="py-3 px-3 text-right text-base font-black text-emerald-700" id="factura-total-monto">S/. 150.00</td>
                                </tr>
                            </tfoot>
                        </table>

                        <!-- Monto en Letras -->
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 mb-8">
                            <span class="text-slate-400 font-semibold uppercase text-[10px] block">Son:</span>
                            <span id="factura-monto-letras" class="text-slate-900 font-black tracking-wide">SON: CIENTO CINCUENTA Y 00/100 SOLES</span>
                        </div>

                        <!-- Firmas -->
                        <div class="grid grid-cols-2 gap-12 text-center text-xs pt-8 border-t border-dashed border-slate-300">
                            <div>
                                <div class="w-48 border-b-2 border-slate-800 mx-auto mb-1.5"></div>
                                <p class="font-extrabold text-slate-800">Firma del Estudiante / Apoderado</p>
                                <p class="text-[10px] text-slate-500">Conforme con la recepción y pago</p>
                            </div>
                            <div>
                                <div class="w-48 border-b-2 border-slate-800 mx-auto mb-1.5"></div>
                                <p class="font-extrabold text-slate-800">Tesorería / Caja Institucional</p>
                                <p class="text-[10px] text-slate-500">CETPRO Micaela Bastidas Puyucama</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
`;

if (mainEnd > -1) {
    html = html.substring(0, mainEnd) + newSectionsHTML + '\r\n        ' + html.substring(mainEnd);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('New sections (control-pagos, diario, factura) added cleanly before </main>!');
} else {
    console.log('Error: </main> tag not found');
}
