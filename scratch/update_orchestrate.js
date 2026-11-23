const fs = require('fs');

let code = fs.readFileSync('orchestrate.js', 'utf8');

const target = "pass(\"Exportación PDF de Boleta Modal calibrada y centrada\", \"Sin desplazamiento horizontal ni recorte del Ministerio\");";
const targetAscii = "pass(\"Exportaci";

const idx = code.indexOf(targetAscii);
if (idx !== -1) {
    const endBlockIdx = code.indexOf("}", idx);
    const endBlockIdx2 = code.indexOf("}", endBlockIdx + 1); // closing else
    const insertPos = endBlockIdx2 + 1;
    
    const newCheck = `\n\n        // 7.3 Jalado automático de datos guardados a la Boleta desde Estudiantes\n` +
      `        const hasAutoPullBoleta = html.includes('async function imprimirBoletaDeEstudianteDirecto') &&\n` +
      `                                  html.includes('imprimirBoletaDeEstudianteDirecto(\${e.id})') &&\n` +
      `                                  html.includes('actualizarBoletaModalEnVivo');\n` +
      `        if (hasAutoPullBoleta) {\n` +
      `            pass("Jalado automático de datos guardados a Boleta Oficial", "Comprobante, DNI, monto, concepto, notas y casillas sincronizados");\n` +
      `        } else {\n` +
      `            fail("Jalado de datos de boleta no integrado", new Error("Falta imprimirBoletaDeEstudianteDirecto"));\n` +
      `        }`;

    code = code.slice(0, insertPos) + newCheck + code.slice(insertPos);
    fs.writeFileSync('orchestrate.js', code, 'utf8');
    console.log('Successfully added 7.3 check to orchestrate.js');
} else {
    console.log('Target not found');
}
