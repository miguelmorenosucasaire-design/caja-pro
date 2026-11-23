const fs = require('fs');
const { execSync } = require('child_process');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Update button text for btn-actualizar-sistema
html = html.replace(
    '<button id="btn-actualizar-sistema" onclick="ejecutarActualizacionCompleta()" title="Actualizar datos y balances en tiempo real (Tesorero y Director)" class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-sky-400 border border-slate-200 dark:border-slate-700 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">\n                    <i class="fa-solid fa-arrows-rotate text-sky-600 dark:text-sky-400 text-sm"></i>\n                    <span class="hidden md:inline text-[11px] font-bold">Actualizar</span>\n                </button>',
    '<button id="btn-actualizar-sistema" onclick="ejecutarActualizacionCompleta()" title="Actualizar datos y balances en tiempo real (Tesorero y Director)" class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-sky-400 border border-slate-200 dark:border-slate-700 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm">\n                    <i class="fa-solid fa-arrows-rotate text-sky-600 dark:text-sky-400 text-sm"></i>\n                    <span class="text-[11px] font-bold">Actualizar</span>\n                </button>'
);

// 2. CSS Replacement
const startCSSMarker = '/* ========================================================================= */\r\n        /* ESTRUCTURA Y ESTILOS OFICIALES RECIBO INGRESO (MEDIA CARTA 8.5in x 5.5in) */';
const altStartCSSMarker = '/* ========================================================================= */\n        /* ESTRUCTURA Y ESTILOS OFICIALES RECIBO INGRESO (MEDIA CARTA 8.5in x 5.5in) */';

const endCSSMarker = '/* ========================================================================= */\r\n        /* ADAPTACIONES GENERALES DE TEMA OSCURO (OBSIDIAN FINTECH)                 */';
const altEndCSSMarker = '/* ========================================================================= */\n        /* ADAPTACIONES GENERALES DE TEMA OSCURO (OBSIDIAN FINTECH)                 */';

let startCSSIdx = html.indexOf(startCSSMarker);
if (startCSSIdx === -1) startCSSIdx = html.indexOf(altStartCSSMarker);

let endCSSIdx = html.indexOf(endCSSMarker);
if (endCSSIdx === -1) endCSSIdx = html.indexOf(altEndCSSMarker);

console.log('CSS indexes:', startCSSIdx, endCSSIdx);

if (startCSSIdx !== -1 && endCSSIdx !== -1) {
    const newCSS = `/* ========================================================================= */
        /* ESTRUCTURA Y ESTILOS OFICIALES RECIBO INGRESO (MEDIA CARTA 8.5in x 5.5in) */
        /* Basado en la estructura milimétrica exacta de ReciboIngresos.jsx           */
        /* ========================================================================= */
        :root {
          --rc-azul: #2258a8;
          --rc-rojo: #d6504a;
          --rc-linea: 1px solid var(--rc-azul);
          --azul: #2258a8;
          --tinta: #1b2a6b;
          --rojo: #d6504a;
        }

        @page { size: letter portrait; margin: 0; }

        .recibo-hoja {
          width: 8.5in;
          max-width: 100%;
          min-height: 10.98in;
          overflow: hidden;
          margin: 0 auto;
          background: #ffffff !important;
          color: var(--rc-azul);
          font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
        }

        .recibo-corte, #separador-corte-talonario {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 0.12in;
          margin: 0 0.2in;
          border-top: 1px dashed #9aa3b5;
          font: 8px/1 "Courier New", monospace;
          color: #6b7488;
          justify-content: center;
        }

        /* ---------- talonario ---------- */
        .recibo {
          width: 100%;
          max-width: 8.5in;
          height: 5.4in;
          padding: 0.2in 0.5in 0.1in;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          background: #ffffff !important;
          color: var(--rc-azul);
          font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* cabecera: logo azul | títulos | escudo a color */
        .recibo__cab {
          display: grid;
          grid-template-columns: 1.55in 1fr 1.2in;
          align-items: start;
          column-gap: 8px;
        }
        .recibo__logo-minedu { width: 1.5in; height: auto; display: block; }
        .recibo__escudo { text-align: center; line-height: 1.05; }
        .recibo__escudo img { width: 0.5in; height: auto; display: block; margin: 0 auto 2px; }
        .recibo__escudo b { display: block; font-size: 11px; }
        .recibo__escudo small { display: block; font-size: 6.5px; font-weight: 700; }

        .recibo__titulos { text-align: center; text-transform: uppercase; font-weight: 700; line-height: 1.15; }
        .recibo--copia .recibo__numero,
        .voucher-estilo-azul .recibo__numero { color: var(--rc-azul) !important; }
        .recibo__titulos h1 { margin: 0; font-size: 27px; letter-spacing: 1.5px; font-weight: 800; color: var(--rc-azul); }
        .recibo__titulos p { margin: 0; font-size: 10.5px; color: var(--rc-azul); }
        .recibo__titulos .recibo__ciudad { position: relative; font-size: 10.5px; color: var(--rc-azul); }
        .recibo__numero {
          color: var(--rc-rojo);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-left: 22px;
        }

        /* título de sección con doble línea arriba y línea abajo */
        .recibo__seccion {
          margin-top: 4px;
          border-top: 3px double var(--rc-azul);
          border-bottom: 2px solid var(--rc-azul);
          padding: 4px 0 2px 6px;
          font-size: 17px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--rc-azul);
        }

        /* caja externa */
        .recibo__marco {
          flex: 1;
          margin-top: 6px;
          border: var(--rc-linea);
          border-radius: 18px;
          padding: 10px 14px 8px;
          display: flex;
          flex-direction: column;
        }

        /* caja de datos (Señor / Especialidad / conceptos) */
        .recibo__datos {
          border: var(--rc-linea);
          border-radius: 12px;
          padding: 8px 14px 10px;
        }
        .recibo__campo {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          margin: 4px 0 8px;
          color: var(--rc-azul);
        }
        .recibo__campo .punteado { flex: 1; border-bottom: 1px dotted var(--rc-azul); min-height: 14px; color: #111; font-weight: 400; }

        /* conceptos + importes */
        .recibo__conceptos {
          border: var(--rc-linea);
          border-radius: 10px;
          padding: 6px 10px;
          display: grid;
          grid-template-columns: 1fr 1.2in;
          margin-top: 4px;
        }
        .recibo__items { display: flex; flex-direction: column; }
        .recibo__fila {
          height: 0.3in;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--rc-azul);
        }
        .recibo__fila .punteado { flex: 1; border-bottom: 1px dotted var(--rc-azul); height: 12px; margin-right: 14px; color: #111; font-weight: 400; }
        .recibo__fila .moneda,
        .recibo__fila .total-lbl { margin-left: auto; margin-right: 6px; color: var(--rc-azul); }

        .recibo__celdas { display: inline-flex; }
        .recibo__celdas i {
          width: 17px; height: 17px;
          border: var(--rc-linea);
          margin-left: -1px;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          font-style: normal;
          cursor: pointer;
          color: #111;
          background: #fff;
        }
        .recibo__celdas i:first-child { margin-left: 0; }
        .recibo__check {
          width: 17px; height: 17px;
          border: var(--rc-linea);
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
          color: #111;
          background: #fff;
        }

        .recibo__importes { display: flex; flex-direction: column; }
        .recibo__importes div {
          height: 0.3in;
          border: var(--rc-linea);
          margin-top: -1px;
          box-sizing: border-box;
          text-align: right;
          padding-right: 6px;
          display: flex; align-items: center; justify-content: flex-end;
          font-size: 12px; font-weight: 700; color: #111;
          position: relative;
        }
        .recibo__importes div:first-child { margin-top: 0; }
        .monto--tachado::after {
          content: "";
          position: absolute; left: 50%; top: 4px; bottom: 4px;
          width: 1.5px; background: #d6504a;
          transform: rotate(15deg);
        }

        /* pie: fecha + firmas */
        .recibo__pie {
          margin-top: auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-top: 8px;
        }
        .recibo__fecha { display: flex; align-items: flex-end; gap: 8px; font-size: 13px; font-weight: 700; color: var(--rc-azul); }
        .recibo__fecha table { border-collapse: collapse; text-align: center; font-size: 10px; }
        .recibo__fecha th { font-weight: 700; padding-bottom: 3px; color: var(--rc-azul); }
        .recibo__fecha td { width: 0.72in; height: 0.36in; border: var(--rc-linea); color: #111; font-size: 12px; text-align: center; vertical-align: middle; }
        .recibo__firmas { display: flex; gap: 22px; }
        .recibo__firma { width: 1.65in; text-align: center; font-size: 8.5px; font-weight: 700; text-transform: uppercase; line-height: 1.25; color: var(--rc-azul); }
        .recibo__firma::before { content: ""; display: block; border-top: 1px dotted var(--rc-azul); margin-bottom: 4px; }

        /* Ajustes modo oscuro y nitidez */
        .logo-cetpro-nitido { image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }
        .logo-minedu-nitido { image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }

        .dark .recibo-hoja, .dark .recibo {
          background-color: #ffffff !important;
        }
        .dark .recibo, .dark .recibo * {
          color: var(--rc-azul);
        }
        .dark .recibo .punteado,
        .dark .recibo__importes div,
        .dark .recibo__fecha td,
        .dark .recibo__celdas i,
        .dark .recibo__check {
          color: #111111 !important;
        }
        .dark .recibo .recibo__numero {
          color: var(--rc-rojo) !important;
        }
        .dark .recibo.recibo--copia .recibo__numero,
        .dark .voucher-estilo-azul .recibo__numero {
          color: var(--rc-azul) !important;
        }

        /* Impresión y PDF */
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, header, #excel-sheet-tabs-bar, #filtro-top-bar, .no-print, button, form, .modal-backdrop, select, input {
            display: none !important;
          }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; overflow: visible !important; }
          #section-factura { display: block !important; visibility: visible !important; margin: 0 !important; padding: 0 !important; }
          .recibo-hoja { width: 8.5in !important; height: 10.98in !important; margin: 0 auto !important; box-shadow: none !important; border: none !important; }
          .recibo { width: 100% !important; height: 5.4in !important; box-shadow: none !important; }
        }

        .generando-pdf-oficial.recibo-hoja, .generando-pdf-oficial {
          width: 8.5in !important;
          max-width: 8.5in !important;
          height: 10.98in !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .generando-pdf-oficial .recibo {
          width: 100% !important;
          height: 5.4in !important;
          box-shadow: none !important;
        }

        `;
    html = html.substring(0, startCSSIdx) + newCSS + html.substring(endCSSIdx);
}

// 3. Voucher HTML Replacement
const startVoucherMarker = '<div id="contenedor-impresion-factura" class="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center space-y-4">';
const endVoucherMarker = '<!-- CONTENEDOR DEL PREVISUALIZADOR PDF OFICIAL (INTEGRADO EN VIVO) -->';

const startVoucherIdx = html.indexOf(startVoucherMarker);
const endVoucherIdx = html.indexOf(endVoucherMarker);
console.log('Voucher indexes:', startVoucherIdx, endVoucherIdx);

if (startVoucherIdx !== -1 && endVoucherIdx !== -1) {
    const newVoucherHTML = `<div id="contenedor-impresion-factura" class="recibo-hoja w-full max-w-2xl sm:max-w-3xl flex flex-col items-center">
                            
        <!-- 1. COMPROBANTE ORIGINAL (COLOR) -->
        <section id="contenedor-comprobante-oficial" class="recibo relative">
            <header class="recibo__cab">
                <img class="recibo__logo-minedu logo-minedu-nitido" src="/public/img/minedu_azul.svg" alt="Ministerio de Educación" />
                <div class="recibo__titulos">
                    <h1>Ministerio de Educación</h1>
                    <p>Unidad de Gestión Educativa Local San Román</p>
                    <p id="factura-inst-nombre">Institución Educativa CETPRO Micaela Bastidas</p>
                    <p class="recibo__ciudad">
                        Juliaca <span class="recibo__numero" id="factura-nro-comprobante">0000000</span>
                    </p>
                </div>
                <div class="recibo__escudo">
                    <img id="img-escudo-oficial" src="/public/img/escudo_recibo_ingreso.png" alt="Escudo CETPRO" class="logo-cetpro-nitido" />
                    <b>CETPRO</b>
                    <small>“MICAELA BASTIDAS”</small>
                </div>
            </header>

            <h2 class="recibo__seccion">Ingresos de recursos propios</h2>

            <div class="recibo__marco">
                <div class="recibo__datos">
                    <div class="recibo__campo">Señor (a): <span class="punteado" id="factura-estudiante"></span></div>
                    <div class="recibo__campo">Especialidad: <span class="punteado" id="factura-carrera"></span><span id="factura-especialidad" class="hidden"></span></div>

                    <div class="recibo__conceptos">
                        <div class="recibo__items">
                            <div class="recibo__fila">
                                1.- Aporte por Mantenimiento
                                <span class="recibo__celdas">
                                    <i id="box-mod-1" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="box-mod-2" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="box-mod-3" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="box-mod-4" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="box-mod-5" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="box-mod-6" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="box-mod-7" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                </span>
                                <span class="moneda">S/</span>
                            </div>
                            <div class="recibo__fila">
                                2.- Expedición de constancia de estudio
                                <span class="recibo__check voucher-box-check" id="check-constancia" onclick="toggleVoucherBox(this)"></span>
                            </div>
                            <div class="recibo__fila">
                                3.- FUT
                                <span class="recibo__check voucher-box-check" id="check-fut" onclick="toggleVoucherBox(this)"></span>
                                <span class="punteado" id="factura-fut-linea"></span>
                            </div>
                            <div class="recibo__fila">
                                4.- Otros
                                <span class="punteado" id="factura-nota-otros"></span>
                                <span id="factura-otros-texto" class="hidden"></span>
                                <span class="total-lbl">TOTAL</span>
                            </div>
                        </div>
                        <div class="recibo__importes">
                            <div id="factura-monto-aporte"></div>
                            <div id="factura-monto-constancia"></div>
                            <div id="factura-monto-fut"></div>
                            <div id="factura-monto-total"></div>
                        </div>
                    </div>
                </div>

                <footer class="recibo__pie">
                    <div class="recibo__fecha">
                        <span>Juliaca:</span>
                        <table>
                            <thead><tr><th>DÍA</th><th>MES</th><th>AÑO</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td id="factura-dia"></td>
                                    <td id="factura-mes"></td>
                                    <td id="factura-ano"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="recibo__firmas">
                        <div class="recibo__firma">Sello y firma del tesorero</div>
                        <div class="recibo__firma">Sello y firma del recaudador</div>
                    </div>
                </footer>
            </div>

            <!-- Metadatos de compatibilidad y campos de soporte -->
            <div class="hidden">
                <span id="factura-precio-unit"></span>
                <span id="factura-monto-fila1"></span>
                <span id="factura-alumno-nombre"></span>
                <span id="factura-dni"></span>
                <span id="factura-telefono"></span>
                <span id="factura-inst-info"></span>
                <span id="factura-contacto-row"></span>
                <span id="factura-orden-ingreso"></span>
                <span id="factura-fecha"></span>
                <span id="factura-grupo"></span>
                <span id="factura-docente"></span>
                <span id="factura-forma-pago"></span>
                <span id="factura-concepto"></span>
                <span id="factura-total-fila"></span>
                <span id="factura-monto-letras"></span>
                <span id="factura-inst-responsable"></span>
                <span id="factura-inst-cargo"></span>
                <span id="factura-inst-pie"></span>
            </div>
        </section>

        <!-- SEPARADOR DE CORTE TALONARIO -->
        <div id="separador-corte-talonario" class="recibo-corte">
            ✂ - - - - - - CORTE TALONARIO (MEDIA CARTA) - - - - - - ✂
        </div>

        <!-- 2. COMPROBANTE COPIA (TALONARIO AZUL) -->
        <section id="contenedor-comprobante-copia" class="recibo recibo--copia relative">
            <header class="recibo__cab">
                <img class="recibo__logo-minedu logo-minedu-nitido" src="/public/img/minedu_azul.svg" alt="Ministerio de Educación" />
                <div class="recibo__titulos">
                    <h1>Ministerio de Educación</h1>
                    <p>Unidad de Gestión Educativa Local San Román</p>
                    <p id="copia-factura-inst-nombre">Institución Educativa CETPRO Micaela Bastidas</p>
                    <p class="recibo__ciudad">
                        Juliaca <span class="recibo__numero" id="copia-factura-nro-comprobante">0000000</span>
                    </p>
                </div>
                <div class="recibo__escudo">
                    <img id="img-escudo-copia" src="/public/img/escudo_recibo_azul.png" alt="Escudo CETPRO" class="logo-cetpro-nitido" />
                    <b>CETPRO</b>
                    <small>“MICAELA BASTIDAS”</small>
                </div>
            </header>

            <h2 class="recibo__seccion">Ingresos de recursos propios</h2>

            <div class="recibo__marco">
                <div class="recibo__datos">
                    <div class="recibo__campo">Señor (a): <span class="punteado" id="copia-factura-estudiante"></span></div>
                    <div class="recibo__campo">Especialidad: <span class="punteado" id="copia-factura-carrera"></span><span id="copia-factura-especialidad" class="hidden"></span></div>

                    <div class="recibo__conceptos">
                        <div class="recibo__items">
                            <div class="recibo__fila">
                                1.- Aporte por Mantenimiento
                                <span class="recibo__celdas">
                                    <i id="copia-box-mod-1" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="copia-box-mod-2" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="copia-box-mod-3" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="copia-box-mod-4" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="copia-box-mod-5" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="copia-box-mod-6" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                    <i id="copia-box-mod-7" class="voucher-box-check" onclick="toggleVoucherBox(this)"></i>
                                </span>
                                <span class="moneda">S/</span>
                            </div>
                            <div class="recibo__fila">
                                2.- Expedición de constancia de estudio
                                <span class="recibo__check voucher-box-check" id="copia-check-constancia" onclick="toggleVoucherBox(this)"></span>
                            </div>
                            <div class="recibo__fila">
                                3.- FUT
                                <span class="recibo__check voucher-box-check" id="copia-check-fut" onclick="toggleVoucherBox(this)"></span>
                                <span class="punteado" id="copia-factura-fut-linea"></span>
                            </div>
                            <div class="recibo__fila">
                                4.- Otros
                                <span class="punteado" id="copia-factura-nota-otros"></span>
                                <span id="copia-factura-otros-texto" class="hidden"></span>
                                <span class="total-lbl">TOTAL</span>
                            </div>
                        </div>
                        <div class="recibo__importes">
                            <div id="copia-factura-monto-aporte"></div>
                            <div id="copia-factura-monto-constancia"></div>
                            <div id="copia-factura-monto-fut"></div>
                            <div id="copia-factura-monto-total"></div>
                        </div>
                    </div>
                </div>

                <footer class="recibo__pie">
                    <div class="recibo__fecha">
                        <span>Juliaca:</span>
                        <table>
                            <thead><tr><th>DÍA</th><th>MES</th><th>AÑO</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td id="copia-factura-dia"></td>
                                    <td id="copia-factura-mes"></td>
                                    <td id="copia-factura-ano"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="recibo__firmas">
                        <div class="recibo__firma">Sello y firma del tesorero</div>
                        <div class="recibo__firma">Sello y firma del recaudador</div>
                    </div>
                </footer>
            </div>

            <!-- Metadatos de compatibilidad y campos de soporte -->
            <div class="hidden">
                <span id="copia-factura-precio-unit"></span>
                <span id="copia-factura-monto-fila1"></span>
                <span id="copia-factura-alumno-nombre"></span>
                <span id="copia-factura-dni"></span>
                <span id="copia-factura-telefono"></span>
                <span id="copia-factura-inst-info"></span>
                <span id="copia-factura-contacto-row"></span>
                <span id="copia-factura-orden-ingreso"></span>
                <span id="copia-factura-fecha"></span>
                <span id="copia-factura-grupo"></span>
                <span id="copia-factura-docente"></span>
                <span id="copia-factura-forma-pago"></span>
                <span id="copia-factura-concepto"></span>
                <span id="copia-factura-total-fila"></span>
                <span id="copia-factura-monto-letras"></span>
                <span id="copia-factura-inst-responsable"></span>
                <span id="copia-factura-inst-cargo"></span>
                <span id="copia-factura-inst-pie"></span>
            </div>
        </section>
    </div>

                        `;
    html = html.substring(0, startVoucherIdx) + newVoucherHTML + html.substring(endVoucherIdx);
}

// 4. Update setEstiloVoucher in JS
const estiloFuncOld = `        function setEstiloVoucher(estilo) {
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

const estiloFuncNew = `        function setEstiloVoucher(estilo) {
            currentVoucherEstilo = estilo;
            const btnComb = document.getElementById('btn-estilo-combinado');
            const btnCombInv = document.getElementById('btn-estilo-combinado-inv');
            const btnColor = document.getElementById('btn-estilo-color');
            const btnAzul = document.getElementById('btn-estilo-azul');
            const vOficial = document.getElementById('contenedor-comprobante-oficial');
            const vCopia = document.getElementById('contenedor-comprobante-copia');
            const imgEscudoOficial = document.getElementById('img-escudo-oficial');
            const imgEscudoCopia = document.getElementById('img-escudo-copia');

            // Reset classes on buttons
            [btnComb, btnCombInv, btnColor, btnAzul].forEach(btn => {
                if (btn) btn.className = 'px-2 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
            });

            if (estilo === 'combinado') {
                // 1° Color Oficial y 2° Tinta Azul Talonario
                if (btnComb) btnComb.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (vOficial) { vOficial.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_ingreso.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_azul.png';
            } else if (estilo === 'combinado-inv') {
                // 1° Tinta Azul y 2° Color Oficial
                if (btnCombInv) btnCombInv.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (vOficial) { vOficial.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_azul.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_ingreso.png';
            } else if (estilo === 'color') {
                // Ambos a color oficial
                if (btnColor) btnColor.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                if (vOficial) { vOficial.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_ingreso.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_ingreso.png';
            } else if (estilo === 'azul') {
                // Ambos en tinta azul monocromática
                if (btnAzul) btnAzul.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                if (vOficial) { vOficial.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_azul.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_azul.png';
            }

            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                actualizarPrevisualizadorPDF();
            }
        }`;

if (html.includes(estiloFuncOld)) {
    html = html.replace(estiloFuncOld, estiloFuncNew);
    console.log('estiloFunc replaced successfully');
} else {
    console.log('Warning: estiloFuncOld not exact match, checking normalized');
    const idxFunc = html.indexOf('function setEstiloVoucher');
    console.log('Found function setEstiloVoucher at index', idxFunc);
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html updated successfully!');
