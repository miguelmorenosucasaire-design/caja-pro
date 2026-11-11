const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// The single voucher HTML template
function buildVoucherHtml(isCopia = false) {
    const prefix = isCopia ? 'copia-' : '';
    const badgeText = isCopia ? 'COPIA • ARCHIVO DE TESORERÍA / TALONARIO' : 'ORIGINAL • ALUMNO / USUARIO';
    const badgeBg = isCopia ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-[#1e40af] border-[#1e40af]/30';

    return `
        <!-- ${isCopia ? '3. COMPROBANTE COPIA (TALONARIO)' : '1. COMPROBANTE ORIGINAL'} -->
        <div id="${isCopia ? 'contenedor-comprobante-copia' : 'contenedor-comprobante-oficial'}" class="voucher-media-carta bg-white border-2 border-[#1e40af] p-5 sm:p-7 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800 font-sans print:shadow-none print:border-[#1e40af] print:p-3 print:max-w-none relative">
            
            <div class="flex justify-end mb-1 no-print">
                <span class="text-[9.5px] font-black font-mono tracking-widest px-2 py-0.5 rounded border ${badgeBg}">
                    ${badgeText}
                </span>
            </div>

            <!-- ========================================== -->
            <!-- 1. ENCABEZADO SUPERIOR OFICIAL             -->
            <!-- ========================================== -->
            <div class="flex items-center justify-between gap-3 pb-2.5">
                <!-- Logo Minedu a la izquierda -->
                <div class="w-28 sm:w-36 flex-shrink-0 flex items-center">
                    <img src="/public/img/minedu_logo.svg" alt="Ministerio de Educación" class="w-full h-auto object-contain">
                </div>

                <!-- Títulos Institucionales Centrales -->
                <div class="text-center flex-1 px-1 sm:px-2">
                    <h1 class="text-lg sm:text-2xl font-black text-[#1e40af] tracking-tight uppercase leading-tight font-serif">
                        MINISTERIO DE EDUCACIÓN
                    </h1>
                    <h2 class="text-[10px] sm:text-[12px] font-extrabold text-[#1e40af] uppercase tracking-wide leading-tight mt-0.5">
                        UNIDAD DE GESTIÓN EDUCATIVA LOCAL SAN ROMÁN
                    </h2>
                    <h3 class="text-[10px] sm:text-[12px] font-extrabold text-[#1e40af] uppercase tracking-wide leading-tight mt-0.5" id="${prefix}factura-inst-nombre">
                        INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS
                    </h3>
                    <div class="flex items-center justify-center space-x-6 sm:space-x-10 mt-1">
                        <span class="text-xs sm:text-sm font-black text-[#1e40af] tracking-widest uppercase">
                            JULIACA
                        </span>
                        <!-- Número Correlativo en Rojo Oficial -->
                        <span id="${prefix}factura-nro-comprobante" class="text-lg sm:text-2xl font-mono font-bold text-red-600 tracking-wider">
                            0000801
                        </span>
                    </div>
                </div>

                <!-- Logo Cetpro a la derecha -->
                <div class="w-20 sm:w-28 flex-shrink-0 text-center">
                    <img src="/public/img/logo_institucion.jpg" alt="CETPRO Micaela Bastidas" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto object-contain">
                    <div class="text-[#1e40af] font-black text-[10px] sm:text-xs uppercase tracking-wider leading-none mt-1">CETPRO</div>
                    <div class="text-[#1e40af] font-bold text-[8px] sm:text-[9px] uppercase tracking-tight leading-none mt-0.5">"MICAELA BASTIDAS"</div>
                </div>
            </div>

            <!-- Línea horizontal divisoria -->
            <div class="border-t-2 border-[#1e40af] h-0.5 my-1"></div>

            <!-- Título Principal: INGRESOS DE RECURSOS PROPIOS -->
            <div class="text-center py-1">
                <h2 class="text-base sm:text-xl font-black text-[#1e40af] uppercase tracking-widest">
                    INGRESOS DE RECURSOS PROPIOS
                </h2>
            </div>

            <!-- ========================================== -->
            <!-- 2. RECUADRO AZUL EXTERIOR CON BORDES REDONDEADOS -->
            <!-- ========================================== -->
            <div class="border-2 border-[#1e40af] rounded-2xl p-3.5 sm:p-5 mt-1 bg-white relative">
                
                <!-- Datos del Alumno / Solicitante -->
                <div class="space-y-2 mb-3">
                    <!-- Fila 1: Señor (a) y DNI -->
                    <div class="flex items-baseline justify-between gap-3 text-xs sm:text-sm">
                        <div class="flex items-baseline flex-1 min-w-0 border-b border-dotted border-[#1e40af] pb-0.5">
                            <span class="text-[#1e40af] font-bold whitespace-nowrap mr-2">Señor (a):</span>
                            <span id="${prefix}factura-estudiante" class="font-bold text-slate-900 uppercase tracking-wide truncate">Julio Cesar Mamani Chambi</span>
                        </div>
                        <div class="flex items-baseline whitespace-nowrap border-b border-dotted border-[#1e40af] pb-0.5 min-w-[110px] sm:min-w-[130px] justify-end">
                            <span class="text-[#1e40af] font-bold mr-1.5 text-xs">DNI:</span>
                            <span id="${prefix}factura-dni" class="font-mono font-bold text-slate-900 tracking-wider">73477222</span>
                        </div>
                    </div>

                    <!-- Fila 2: Especialidad y Celular -->
                    <div class="flex items-baseline justify-between gap-3 text-xs sm:text-sm">
                        <div class="flex items-baseline flex-1 min-w-0 border-b border-dotted border-[#1e40af] pb-0.5">
                            <span class="text-[#1e40af] font-bold whitespace-nowrap mr-2">Especialidad:</span>
                            <span id="${prefix}factura-carrera" class="font-bold text-slate-900 uppercase tracking-wide truncate">Corte Ensamblaje</span>
                        </div>
                        <div class="flex items-baseline whitespace-nowrap border-b border-dotted border-[#1e40af] pb-0.5 min-w-[110px] sm:min-w-[130px] justify-end">
                            <span class="text-[#1e40af] font-bold mr-1.5 text-xs">Cel:</span>
                            <span id="${prefix}factura-telefono" class="font-mono font-bold text-slate-900 tracking-wider">981763281</span>
                        </div>
                    </div>
                </div>

                <!-- ========================================== -->
                <!-- 3. MARCO INTERIOR DE CONCEPTOS Y MONTOS    -->
                <!-- ========================================== -->
                <div class="border-2 border-[#1e40af] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch">
                    
                    <!-- Columna Izquierda: Conceptos Oficiales -->
                    <div class="flex-1 space-y-2.5 text-xs sm:text-sm font-semibold">
                        
                        <!-- 1. Aporte por Mantenimiento y 7 Casillas -->
                        <div class="flex items-center flex-wrap gap-2">
                            <span class="text-slate-800 font-bold whitespace-nowrap">1.- Aporte por Mantenimiento</span>
                            <!-- 7 Casillas de Módulo Cuota -->
                            <div class="flex items-center space-x-1">
                                <span id="${prefix}box-mod-1" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 1" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition">X</span>
                                <span id="${prefix}box-mod-2" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 2" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition"></span>
                                <span id="${prefix}box-mod-3" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 3" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition"></span>
                                <span id="${prefix}box-mod-4" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 4" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition"></span>
                                <span id="${prefix}box-mod-5" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 5" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition"></span>
                                <span id="${prefix}box-mod-6" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 6" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition"></span>
                                <span id="${prefix}box-mod-7" onclick="toggleVoucherBox(this, ${isCopia})" title="Módulo 7" class="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1e40af] rounded flex items-center justify-center font-black text-xs sm:text-sm text-[#1e40af] bg-white hover:bg-blue-50 transition"></span>
                            </div>
                        </div>

                        <!-- 2. Expedición de constancia de estudio -->
                        <div class="flex items-center space-x-2">
                            <span class="text-slate-800">2.- Expedición de constancia de estudio</span>
                            <span id="${prefix}check-constancia" onclick="toggleVoucherBox(this, ${isCopia})" class="cursor-pointer w-4 h-4 sm:w-5 sm:h-5 border border-[#1e40af] rounded flex items-center justify-center font-bold text-xs text-[#1e40af] hover:bg-blue-50"></span>
                            <div class="border-b border-[#1e40af] flex-1 max-w-[160px] sm:max-w-[200px]"></div>
                        </div>

                        <!-- 3. FUT -->
                        <div class="flex items-center space-x-2">
                            <span class="text-slate-800">3.- FUT</span>
                            <span id="${prefix}check-fut" onclick="toggleVoucherBox(this, ${isCopia})" class="cursor-pointer w-4 h-4 sm:w-5 sm:h-5 border border-[#1e40af] rounded flex items-center justify-center font-bold text-xs text-[#1e40af] hover:bg-blue-50"></span>
                            <div class="border-b border-[#1e40af] flex-1 max-w-[160px] sm:max-w-[200px]"></div>
                        </div>

                        <!-- 4. Otros y TOTAL -->
                        <div class="flex items-baseline justify-between pt-1">
                            <div class="flex items-baseline flex-1 mr-4 border-b border-dotted border-[#1e40af]">
                                <span class="text-slate-800 font-semibold mr-1 whitespace-nowrap">4.- Otros</span>
                                <span id="${prefix}factura-otros-texto" contenteditable="true" class="outline-none text-slate-700 italic px-1 flex-1 font-normal"></span>
                            </div>
                            <div class="text-right whitespace-nowrap">
                                <span class="text-[#1e40af] font-black text-xs sm:text-sm tracking-wider">TOTAL</span>
                            </div>
                        </div>

                    </div>

                    <!-- Columna Derecha: Casillero de Montos con borde azul -->
                    <div class="w-full md:w-36 flex-shrink-0 border-2 border-[#1e40af] rounded-lg overflow-hidden flex flex-col justify-between bg-white">
                        <div class="text-[11px] font-black text-[#1e40af] text-center border-b border-[#1e40af] bg-blue-50/50 py-0.5">
                            S/
                        </div>
                        <!-- Fila 1: Monto -->
                        <div class="flex items-center justify-center border-b-2 border-[#1e40af] h-8 sm:h-9 px-2">
                            <span id="${prefix}factura-monto-fila1" class="font-mono font-bold text-slate-900 text-sm sm:text-base">100.00</span>
                        </div>
                        <!-- Fila 2: Separador / vacío -->
                        <div class="flex items-center justify-center border-b-2 border-[#1e40af] h-7 sm:h-8 text-slate-400 font-bold text-xs">
                            /
                        </div>
                        <!-- Fila 3: Total -->
                        <div class="flex items-center justify-center h-8 sm:h-9 px-2 bg-blue-50/40">
                            <span id="${prefix}factura-monto-total" class="font-mono font-bold text-slate-900 text-sm sm:text-base">100.00</span>
                        </div>
                    </div>

                </div>

                <!-- ========================================== -->
                <!-- 4. PIE DEL VOUCHER: FECHA Y FIRMAS OFICIALES -->
                <!-- ========================================== -->
                <div class="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mt-3 sm:mt-4 pt-2">
                    
                    <!-- Fecha Juliaca: [ DÍA | MES | AÑO ] -->
                    <div class="flex items-center space-x-2">
                        <span class="text-[#1e40af] font-bold text-xs sm:text-sm">Juliaca:</span>
                        <table class="border-collapse border-2 border-[#1e40af] text-center text-xs font-bold rounded overflow-hidden">
                            <thead>
                                <tr class="bg-blue-50 text-[#1e40af] border-b-2 border-[#1e40af] text-[9.5px]">
                                    <th class="px-2 sm:px-3 py-0.5 border-r-2 border-[#1e40af]">DÍA</th>
                                    <th class="px-2 sm:px-3 py-0.5 border-r-2 border-[#1e40af]">MES</th>
                                    <th class="px-2 sm:px-3 py-0.5">AÑO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="text-slate-900 font-mono font-bold text-xs sm:text-sm">
                                    <td id="${prefix}factura-dia" class="px-2 py-0.5 sm:py-1 border-r-2 border-[#1e40af]">07</td>
                                    <td id="${prefix}factura-mes" class="px-2 py-0.5 sm:py-1 border-r-2 border-[#1e40af]">09</td>
                                    <td id="${prefix}factura-ano" class="px-2 py-0.5 sm:py-1">26</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Firmas Oficiales -->
                    <div class="flex items-end space-x-6 sm:space-x-10 text-center">
                        <!-- Sello y Firma del Tesorero -->
                        <div class="w-32 sm:w-44">
                            <div class="h-8 sm:h-9 flex items-center justify-center">
                                <span class="text-[#1e40af]/30 italic font-serif text-lg select-none">H.</span>
                            </div>
                            <div class="border-b border-dotted border-[#1e40af] mb-1"></div>
                            <p class="text-[8.5px] sm:text-[9.5px] font-bold text-[#1e40af] uppercase tracking-tight">Sello y Firma del Tesorero</p>
                        </div>

                        <!-- Sello y Firma del Recaudador -->
                        <div class="w-32 sm:w-44">
                            <div class="h-8 sm:h-9"></div>
                            <div class="border-b border-dotted border-[#1e40af] mb-1"></div>
                            <p class="text-[8.5px] sm:text-[9.5px] font-bold text-[#1e40af] uppercase tracking-tight">Sello y Firma del Recaudador</p>
                        </div>
                    </div>

                </div>

            </div>

            <!-- Elementos de Compatibilidad Ocultos -->
            <div class="hidden">
                <span id="${prefix}factura-inst-info"></span>
                <span id="${prefix}factura-contacto-row"></span>
                <span id="${prefix}factura-orden-ingreso"></span>
                <span id="${prefix}factura-fecha"></span>
                <span id="${prefix}factura-grupo"></span>
                <span id="${prefix}factura-docente"></span>
                <span id="${prefix}factura-forma-pago"></span>
                <span id="${prefix}factura-concepto"></span>
                <span id="${prefix}factura-precio-unit"></span>
                <span id="${prefix}factura-total-fila"></span>
                <span id="${prefix}factura-monto-letras"></span>
                <span id="${prefix}factura-inst-responsable"></span>
                <span id="${prefix}factura-inst-cargo"></span>
                <span id="${prefix}factura-inst-pie"></span>
            </div>

        </div>
    `;
}

const dualVouchersBlock = `
                <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    <!-- COLUMNA PRINCIPAL (xl:col-span-8): COMPROBANTE OFICIAL (VOUCHER TALONARIO) -->
                    <div class="xl:col-span-8 flex flex-col items-center w-full">
                        <div id="contenedor-impresion-factura" class="w-full max-w-3xl flex flex-col items-center space-y-4">
                            
                            ${buildVoucherHtml(false)}

                            <!-- ========================================================= -->
                            <!-- 2. LÍNEA DE CORTE EN MEDIA CARTA (TALONARIO OFICIAL)      -->
                            <!-- ========================================================= -->
                            <div id="separador-corte-talonario" class="w-full my-2 text-center border-t-2 border-dashed border-[#1e40af]/60 print:border-[#1e40af] relative">
                                <span class="bg-white dark:bg-slate-900 px-3 py-0.5 text-[10px] font-mono font-bold text-[#1e40af] uppercase tracking-widest -top-2.5 relative">
                                    ✂ - - - - - - - CORTE TALONARIO (MEDIA CARTA) - - - - - - - ✂
                                </span>
                            </div>

                            ${buildVoucherHtml(true)}

                        </div>
                    </div>
`;

// Locate replacement boundaries
const startMarker = `<!-- CONTENEDOR MAESTRO: COMPROBANTE OFICIAL + SECCIÓN INTEGRADA PARA EDITAR NOTAS -->`;
const endMarker = `<!-- COLUMNA LATERAL (xl:col-span-4): SECCIÓN AHÍ MISMO PARA EDITAR NOTAS -->`;

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error('Markers not found', startIdx, endIdx);
    process.exit(1);
}

const finalReplacement = startMarker + '\n' + dualVouchersBlock + '\n                ';
html = html.substring(0, startIdx) + finalReplacement + html.substring(endIdx);

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Restored and perfected voucher layout in templates/index.html!');
