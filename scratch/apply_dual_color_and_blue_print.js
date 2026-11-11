const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. UPDATE CSS FOR DUAL PRINT (1° COLOR + 2° AZUL IN A SINGLE LETTER PAGE)
const oldCssStart = `/* ESTILO AZUL TALONARIO INSTITUCIONAL (MONOCROMÁTICO OFICIAL) */`;
const oldCssEnd = `.voucher-media-carta {
                box-shadow: none !important;
                margin: 0 auto 3mm auto !important;
                width: 100% !important;
                max-width: 100% !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                padding: 3.5mm 5.5mm !important;
            }`;

const newPrintAndAzulCss = `/* ESTILO AZUL TALONARIO INSTITUCIONAL (MONOCROMÁTICO OFICIAL) */
        .voucher-estilo-azul {
            color: #1e40af !important;
            border-color: #1e40af !important;
        }
        .voucher-estilo-azul * {
            color: #1e40af !important;
            border-color: #1e40af !important;
        }
        .voucher-estilo-azul img {
            filter: brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3025%) hue-rotate(218deg) brightness(91%) contrast(98%) !important;
        }
        .voucher-estilo-azul #factura-nro-comprobante,
        .voucher-estilo-azul #copia-factura-nro-comprobante {
            color: #1e40af !important;
        }
        .voucher-estilo-azul .bg-blue-50,
        .voucher-estilo-azul .bg-blue-50\\/40,
        .voucher-estilo-azul .bg-indigo-50 {
            background-color: #eff6ff !important;
        }

        /* AJUSTE DE IMPRESIÓN OFICIAL: 2 RECIBOS EN UNA SOLA HOJA (1° COLOR + 2° AZUL) */
        @media print {
            @page {
                size: letter portrait;
                margin: 3mm 5mm !important;
            }
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                color: #0f172a !important;
                font-size: 8pt !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                height: 100% !important;
                overflow: hidden !important;
            }
            aside, header, #excel-sheet-tabs-bar, #filtro-top-bar, .no-print, button, form, .modal-backdrop, select, input {
                display: none !important;
            }
            main {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                overflow: visible !important;
            }
            #section-factura {
                display: block !important;
                visibility: visible !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #contenedor-impresion-factura {
                width: 100% !important;
                margin: 0 auto !important;
                padding: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                gap: 1.5mm !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .voucher-media-carta {
                box-shadow: none !important;
                margin: 0 auto !important;
                width: 100% !important;
                max-width: 100% !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                padding: 2.5mm 4.5mm !important;
                border-width: 1.5pt !important;
                border-radius: 6pt !important;
            }
            .voucher-media-carta h1 {
                font-size: 11pt !important;
                line-height: 1 !important;
            }
            .voucher-media-carta h2, .voucher-media-carta h3 {
                font-size: 7.5pt !important;
                line-height: 1.05 !important;
            }
            .voucher-media-carta img {
                max-height: 12mm !important;
                width: auto !important;
            }
            #separador-corte-talonario {
                margin: 1.5mm 0 !important;
                border-top-width: 1.5pt !important;
                border-top-style: dashed !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            #separador-corte-talonario span {
                font-size: 7.5pt !important;
                padding: 0 4mm !important;
            }
        }`;

const startIdxCss = html.indexOf(oldCssStart);
const endIdxCss = html.indexOf('}', html.indexOf(oldCssEnd));
if (startIdxCss !== -1 && endIdxCss !== -1) {
    html = html.substring(0, startIdxCss) + newPrintAndAzulCss + html.substring(endIdxCss + 1);
    console.log('1. Print and Azul CSS updated');
} else {
    console.log('1. Warning: CSS block markers not matched verbatim');
}

// 2. UPDATE HTML OF CONTENEDOR-COMPROBANTE-COPIA TO HAVE voucher-estilo-azul BY DEFAULT
const targetCopiaDiv = `<div id="contenedor-comprobante-copia" class="voucher-media-carta bg-white border-2 border-[#1e40af]`;
const newCopiaDiv = `<div id="contenedor-comprobante-copia" class="voucher-media-carta voucher-estilo-azul bg-white border-2 border-[#1e40af]`;

if (html.includes(targetCopiaDiv) && !html.includes(newCopiaDiv)) {
    html = html.replace(targetCopiaDiv, newCopiaDiv);
    console.log('2. Contenedor copia set to voucher-estilo-azul by default');
}

// 3. UPDATE TOOLBAR BUTTONS FOR COLOR / AZUL / COMBINADO
const targetToolbarColor = `<button type="button" id="btn-estilo-color" onclick="setEstiloVoucher('color')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm">
                                🎨 Color Oficial
                            </button>
                            <button type="button" id="btn-estilo-azul" onclick="setEstiloVoucher('azul')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                📘 Tinta Azul Talonario
                            </button>`;

const newToolbarColor = `<button type="button" id="btn-estilo-combinado" onclick="setEstiloVoucher('combinado')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1">
                                <span>🌟 1° Color + 2° Azul (Original + Copia)</span>
                            </button>
                            <button type="button" id="btn-estilo-color" onclick="setEstiloVoucher('color')" class="px-2 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                🎨 Ambos Color
                            </button>
                            <button type="button" id="btn-estilo-azul" onclick="setEstiloVoucher('azul')" class="px-2 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                                📘 Ambos Azul
                            </button>`;

if (html.includes(targetToolbarColor)) {
    html = html.replace(targetToolbarColor, newToolbarColor);
    console.log('3. Toolbar buttons updated with combinado option');
}

// 4. UPDATE setEstiloVoucher IN JAVASCRIPT
const oldSetEstiloJs = `function setEstiloVoucher(estilo) {
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
        }`;

const newSetEstiloJs = `let currentVoucherEstilo = 'combinado'; // 'combinado' (1° color + 2° azul), 'color' o 'azul'

        function setEstiloVoucher(estilo) {
            currentVoucherEstilo = estilo;
            const btnComb = document.getElementById('btn-estilo-combinado');
            const btnColor = document.getElementById('btn-estilo-color');
            const btnAzul = document.getElementById('btn-estilo-azul');
            const vOficial = document.getElementById('contenedor-comprobante-oficial');
            const vCopia = document.getElementById('contenedor-comprobante-copia');
            const contenedor = document.getElementById('contenedor-impresion-factura');

            // Reset classes on buttons
            [btnComb, btnColor, btnAzul].forEach(btn => {
                if (btn) btn.className = 'px-2 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
            });

            if (contenedor) contenedor.classList.remove('voucher-estilo-azul');

            if (estilo === 'combinado') {
                // 1° Color Oficial y 2° Tinta Azul Talonario
                if (btnComb) btnComb.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (vOficial) vOficial.classList.remove('voucher-estilo-azul');
                if (vCopia) vCopia.classList.add('voucher-estilo-azul');
            } else if (estilo === 'color') {
                // Ambos a color oficial
                if (btnColor) btnColor.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                if (vOficial) vOficial.classList.remove('voucher-estilo-azul');
                if (vCopia) vCopia.classList.remove('voucher-estilo-azul');
            } else if (estilo === 'azul') {
                // Ambos en tinta azul monocromática
                if (btnAzul) btnAzul.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                if (vOficial) vOficial.classList.add('voucher-estilo-azul');
                if (vCopia) vCopia.classList.add('voucher-estilo-azul');
            }
        }`;

if (html.includes(oldSetEstiloJs)) {
    html = html.replace(oldSetEstiloJs, newSetEstiloJs);
    console.log('4. setEstiloVoucher updated with combinado support');
} else {
    // If let currentVoucherEstilo was already above, handle targeted replacement
    const targetFn = `function setEstiloVoucher(estilo) {`;
    const targetEnd = `if (contenedor) contenedor.classList.remove('voucher-estilo-azul');\n            }\n        }`;
    const sIdx = html.indexOf(targetFn);
    const eIdx = html.indexOf(targetEnd, sIdx);
    if (sIdx !== -1 && eIdx !== -1) {
        html = html.substring(0, sIdx) + newSetEstiloJs + html.substring(eIdx + targetEnd.length);
        console.log('4. setEstiloVoucher updated with combinado support (range replacement)');
    }
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html successfully updated for combined Color + Azul printing!');
