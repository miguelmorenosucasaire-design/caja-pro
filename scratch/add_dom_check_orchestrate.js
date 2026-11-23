const fs = require('fs');

let code = fs.readFileSync('orchestrate.js', 'utf8');

const targetStr = `        // 8. Recursos estáticos locales para funcionamiento offline`;
const newCheck = `        // 7.4 Integridad de Estructura DOM y Aislamiento de Secciones
        const secList = ['section-dashboard', 'section-resultados', 'section-caja', 'section-grupos', 'section-estudiantes', 'section-docentes', 'section-deudores', 'section-carreras', 'section-respaldos', 'section-control-pagos', 'section-diario', 'section-factura', 'section-configuracion'];
        let domOk = true;
        const mainOp = html.indexOf('<main');
        const mainCl = html.indexOf('</main>');
        if (mainOp === -1 || mainCl === -1 || mainCl <= mainOp) domOk = false;
        for (let sIdx = 0; sIdx < secList.length; sIdx++) {
            const sName = secList[sIdx];
            const idPos = html.indexOf('id="' + sName + '"');
            if (idPos === -1 || idPos < mainOp || idPos > mainCl) { domOk = false; break; }
            const sPos = html.lastIndexOf('<div', idPos);
            const nextPos = sIdx < secList.length - 1 ? html.lastIndexOf('<div', html.indexOf('id="' + secList[sIdx+1] + '"')) : mainCl;
            const sHtml = html.substring(sPos, nextPos);
            const o = (sHtml.match(/<div\\b/g) || []).length;
            const c = (sHtml.match(/<\\/div>/g) || []).length;
            if (o !== c) { domOk = false; break; }
        }
        if (domOk) {
            pass("Integridad estructural DOM y encapsulamiento de secciones", "13 secciones balanceadas y contenidas en <main>");
        } else {
            fail("Estructura DOM de secciones rota o desbalanceada", new Error("Verificar etiquetas <div> y <main>"));
        }

        // 8. Recursos estáticos locales para funcionamiento offline`;

code = code.replace(targetStr, newCheck);
fs.writeFileSync('orchestrate.js', code, 'utf8');
console.log('Added check 7.4 to orchestrate.js');
