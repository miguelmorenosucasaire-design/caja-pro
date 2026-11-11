const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const startMarker = '<div class="xl:col-span-8 flex justify-center">\r\n                        <div id="contenedor-comprobante-oficial"';
const startMarkerUnix = '<div class="xl:col-span-8 flex justify-center">\n                        <div id="contenedor-comprobante-oficial"';

let startIdx = html.indexOf(startMarker);
if (startIdx === -1) startIdx = html.indexOf(startMarkerUnix);

if (startIdx === -1) {
    console.error('startMarker not found');
    process.exit(1);
}

const endMarker = '<!-- COLUMNA LATERAL (xl:col-span-4): SECCIÓN AHÍ MISMO PARA EDITAR NOTAS -->';
const endIdx = html.indexOf(endMarker, startIdx);

if (endIdx === -1) {
    console.error('endMarker not found');
    process.exit(1);
}

// Extract original voucher content
const originalBlock = html.substring(startIdx, endIdx);

// Build copia voucher by cloning and replacing IDs
// We need the inner content of contenedor-comprobante-oficial
const innerStart = originalBlock.indexOf('<div id="contenedor-comprobante-oficial"');
const closingDivIdx = originalBlock.lastIndexOf('</div>\r\n                    </div>') !== -1 ? 
                     originalBlock.lastIndexOf('</div>\r\n                    </div>') : 
                     originalBlock.lastIndexOf('</div>\n                    </div>');

const voucherInner = originalBlock.substring(originalBlock.indexOf('>', innerStart) + 1, closingDivIdx);

// Create copia inner by replacing IDs with copia- prefix
let copiaInner = voucherInner
    .replace(/id="factura-/g, 'id="copia-factura-')
    .replace(/id="box-mod-/g, 'id="copia-box-mod-')
    .replace(/id="check-constancia"/g, 'id="copia-check-constancia"')
    .replace(/id="check-fut"/g, 'id="copia-check-fut"')
    .replace(/toggleVoucherBox\(this\)/g, 'toggleVoucherBox(this, true)');

const replacement = `<div class="xl:col-span-8 flex flex-col items-center w-full">
                        <div id="contenedor-impresion-factura" class="w-full max-w-3xl flex flex-col items-center space-y-4">
                            
                            <!-- ========================================================= -->
                            <!-- 1. COMPROBANTE ORIGINAL: ALUMNO / USUARIO                 -->
                            <!-- ========================================================= -->
                            <div id="contenedor-comprobante-oficial" class="voucher-media-carta bg-white border-2 border-[#1e40af] p-5 sm:p-7 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800 font-sans print:shadow-none print:border-[#1e40af] print:p-3 print:max-w-none relative">
                                <div class="flex justify-end mb-1 no-print">
                                    <span class="text-[9.5px] font-black font-mono tracking-widest text-[#1e40af] bg-blue-50 px-2 py-0.5 rounded border border-[#1e40af]/30">
                                        ORIGINAL • ALUMNO / USUARIO
                                    </span>
                                </div>
                                ${voucherInner}
                            </div>

                            <!-- ========================================================= -->
                            <!-- 2. LÍNEA DE CORTE EN MEDIA CARTA (TALONARIO OFICIAL)      -->
                            <!-- ========================================================= -->
                            <div id="separador-corte-talonario" class="w-full my-2 text-center border-t-2 border-dashed border-[#1e40af]/60 print:border-[#1e40af] relative">
                                <span class="bg-white dark:bg-slate-900 px-3 py-0.5 text-[10px] font-mono font-bold text-[#1e40af] uppercase tracking-widest -top-2.5 relative">
                                    ✂ - - - - - - - CORTE TALONARIO (MEDIA CARTA) - - - - - - - ✂
                                </span>
                            </div>

                            <!-- ========================================================= -->
                            <!-- 3. COMPROBANTE COPIA: ARCHIVO DE TESORERÍA / TALONARIO    -->
                            <!-- ========================================================= -->
                            <div id="contenedor-comprobante-copia" class="voucher-media-carta bg-white border-2 border-[#1e40af] p-5 sm:p-7 rounded-2xl shadow-xl max-w-3xl w-full text-slate-800 font-sans print:shadow-none print:border-[#1e40af] print:p-3 print:max-w-none relative">
                                <div class="flex justify-end mb-1 no-print">
                                    <span class="text-[9.5px] font-black font-mono tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-300">
                                        COPIA • ARCHIVO DE TESORERÍA / TALONARIO
                                    </span>
                                </div>
                                ${copiaInner}
                            </div>

                        </div>
                    </div>
                </div>

                `;

html = html.substring(0, startIdx) + replacement + html.substring(endIdx);
fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Dual voucher successfully added into templates/index.html!');
