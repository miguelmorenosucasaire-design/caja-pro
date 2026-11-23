const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const targetStr = `        function exportarControlPagosPDF() {
            /* Botón retirado de la interfaz por requerimiento del usuario */
        }
        function exportarControlPagosExcel() {
            /* Botón retirado de la interfaz por requerimiento del usuario */
        }


            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [8, 8, 8, 8],
                    filename: 'CETPRO_Micaela_Bastidas_CONTROL_PAGOS_2026.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(elem).save().then(() => {
                    document.title = originalTitle;
                });
            } else {
                window.print();
                setTimeout(() => { document.title = originalTitle; }, 1000);
            }
        }`;

// Try LF and CRLF
const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');

const replacementStr = `        function exportarControlPagosPDF() {
            /* Botón retirado según solicitud */
        }
        function exportarControlPagosExcel() {
            /* Botón retirado según solicitud */
        }`;

let matched = false;
if (html.includes(targetStr)) {
  html = html.replace(targetStr, replacementStr);
  matched = true;
} else if (html.includes(targetStrCRLF)) {
  html = html.replace(targetStrCRLF, replacementStr.replace(/\n/g, '\r\n'));
  matched = true;
} else {
  // Regex approach
  const regex = /function\s+exportarControlPagosPDF[\s\S]*?setTimeout\(\(\)\s*=>\s*\{\s*document\.title\s*=\s*originalTitle;\s*\}\s*,\s*1000\);\s*\}\s*\}/;
  if (regex.test(html)) {
    html = html.replace(regex, replacementStr);
    matched = true;
  }
}

console.log('Matched and replaced:', matched);
if (matched) {
  fs.writeFileSync('templates/index.html', html, 'utf8');
}
