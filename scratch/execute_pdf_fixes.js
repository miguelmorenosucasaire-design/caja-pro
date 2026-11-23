const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Get Base64 data URIs
const b64Oficial = 'data:image/png;base64,' + fs.readFileSync('public/img/minedu_oficial_hd.png').toString('base64');
const b64Copia = 'data:image/png;base64,' + fs.readFileSync('public/img/minedu_copia_hd.png').toString('base64');

// Replace the 4 img tags
html = html.replace(
  '<img id="img-minedu-oficial" src="/public/img/minedu_oficial_hd.png"',
  `<img id="img-minedu-oficial" src="${b64Oficial}"`
);
html = html.replace(
  '<img id="img-minedu-copia" src="/public/img/minedu_copia_hd.png"',
  `<img id="img-minedu-copia" src="${b64Copia}"`
);
html = html.replace(
  '<img id="img-modal-minedu-oficial" src="/public/img/minedu_oficial_hd.png"',
  `<img id="img-modal-minedu-oficial" src="${b64Oficial}"`
);
html = html.replace(
  '<img id="img-modal-minedu-copia" src="/public/img/minedu_copia_hd.png"',
  `<img id="img-modal-minedu-copia" src="${b64Copia}"`
);
console.log('Images updated with inline base64!');

// 2. Replace CSS
const cssIdx = html.indexOf('.generando-pdf-oficial.recibo-hoja');
const nextCssIdx = html.indexOf('.custom-scrollbar', cssIdx);

const newPdfCss = `/* ========================================================================= */
        /* AJUSTES DE ALTA DEFINICIÓN PARA GENERACIÓN Y DESCARGA A PDF (1 HOJA CARTA) */
        /* ========================================================================= */
        .generando-pdf-oficial.recibo-hoja, .generando-pdf-oficial,
        .generando-pdf-talonario, #contenedor-boleta-modal-costado.generando-pdf-talonario {
          width: 8.10in !important;
          max-width: 8.10in !important;
          min-width: 8.10in !important;
          height: 10.65in !important;
          max-height: 10.65in !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-sizing: border-box !important;
        }
        .generando-pdf-oficial .recibo,
        .generando-pdf-talonario .recibo-mini-talonario {
          width: 100% !important;
          max-width: 100% !important;
          height: 5.20in !important;
          max-height: 5.20in !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          background: #ffffff !important;
          padding: 0.10in 0.22in 0.08in !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-sizing: border-box !important;
          border: 1.5px solid #1e3a8a !important;
          border-radius: 12px !important;
        }
        .generando-pdf-oficial .recibo.recibo--copia,
        .generando-pdf-talonario .recibo-mini-talonario.recibo--copia,
        .generando-pdf-talonario .recibo-mini-talonario.voucher-estilo-azul {
          border-color: #1e40af !important;
        }
        .generando-pdf-oficial .recibo__cab,
        .generando-pdf-talonario .recibo__cab {
          display: grid !important;
          grid-template-columns: 1.50in 1fr 1.20in !important;
          align-items: center !important;
          column-gap: 8px !important;
          width: 100% !important;
          visibility: visible !important;
          opacity: 1 !important;
          margin-bottom: 2px !important;
        }
        .generando-pdf-oficial .recibo__ministerio,
        .generando-pdf-talonario .recibo__ministerio {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 1.50in !important;
        }
        .generando-pdf-oficial .recibo__logo-minedu,
        .generando-pdf-talonario .recibo__logo-minedu,
        .logo-minedu-nitido {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 1.35in !important;
          max-width: 1.35in !important;
          height: auto !important;
          max-height: 60px !important;
          object-fit: contain !important;
        }
        .generando-pdf-oficial .recibo__titulos h1,
        .generando-pdf-talonario .recibo__titulos h1 {
          font-size: 22px !important;
          line-height: 1.1 !important;
          color: #1e3a8a !important;
          margin: 0 !important;
          font-weight: 900 !important;
        }
        .generando-pdf-oficial .recibo.recibo--copia .recibo__titulos h1,
        .generando-pdf-talonario .recibo-mini-talonario.recibo--copia .recibo__titulos h1 {
          color: #1e40af !important;
        }

        `;

html = html.substring(0, cssIdx) + newPdfCss + html.substring(nextCssIdx);
console.log('CSS updated successfully!');

// 3. Replace descargarBoletaModalDirecta
const fnIdx = html.indexOf('async function descargarBoletaModalDirecta');
const nextFnIdx = html.indexOf('function reiniciarModalParaSiguiente', fnIdx);

const newDescargarFn = `async function descargarBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const nro = (document.getElementById('modal-boleta-nro')?.innerText || '0000811').trim().replace(/[^a-zA-Z0-9]/g, '');
            const nom = (document.getElementById('modal-boleta-estudiante')?.innerText || 'ALUMNO').trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ -]/g, '').replace(/\\s+/g, '_');
            const filename = \`Boleta_Oficial_\${nro || '0000'}_\${nom || 'ALUMNO'}_Original_y_Copia.pdf\`;

            if (typeof html2pdf === 'undefined') {
                imprimirBoletaModalDirecta();
                return;
            }

            mostrarNotificacion('Generando Boleta Oficial en PDF (Original y Copia)...', 'info');

            // Asegurar que todas las imágenes estén 100% listas
            const imgs = cont.querySelectorAll('img');
            await Promise.all(Array.from(imgs).map(img => {
                if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
                return new Promise(res => {
                    img.onload = img.onerror = res;
                    setTimeout(res, 300);
                });
            }));

            // Aplicar clase especial para renderizado de alta resolución en 1 hoja carta exacta
            cont.classList.add('generando-pdf-talonario');

            const opt = {
                margin: [0.15, 0.20, 0.15, 0.20],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    logging: false
                },
                jsPDF: {
                    unit: 'in',
                    format: 'letter',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            try {
                await html2pdf().set(opt).from(cont).save();
                mostrarNotificacion('¡Boleta Oficial descargada en PDF con éxito!', 'exito');
            } catch (err) {
                console.error('Error generando PDF de boleta:', err);
                mostrarNotificacion('Error generando PDF: ' + err.message, 'error');
                // Respaldo de impresión directa si falla la descarga
                imprimirBoletaModalDirecta();
            } finally {
                cont.classList.remove('generando-pdf-talonario');
            }
        }

        `;

html = html.substring(0, fnIdx) + newDescargarFn + html.substring(nextFnIdx);
console.log('descargarBoletaModalDirecta updated successfully!');

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html written successfully!');
