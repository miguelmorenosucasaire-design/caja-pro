const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const target = `            if (document.getElementById('form-estado')) document.getElementById('form-estado').value = m.estado || 'Pagado';

            // 3. Renderizar y sincronizar boleta oficial dual
            actualizarBoletaModalEnVivo();`;

const replacement = `            if (document.getElementById('form-estado')) document.getElementById('form-estado').value = m.estado || 'Pagado';
            if (document.getElementById('form-notas')) document.getElementById('form-notas').value = m.notas || '';

            // Configurar casillas de módulos y conceptos oficiales según lo guardado
            modalCuadrosEstado.modulos = [false, false, false, false, false, false, false];
            modalCuadrosEstado.constancia = false;
            modalCuadrosEstado.fut = false;
            modalCuadrosEstado.otros = false;

            const txtComp = ((m.concepto || '') + ' ' + (m.notas || '')).toLowerCase();
            if (txtComp.includes('módulo 1') || txtComp.includes('modulo 1') || txtComp.includes('módulo i') || txtComp.includes('modulo i')) modalCuadrosEstado.modulos[0] = true;
            if (txtComp.includes('módulo 2') || txtComp.includes('modulo 2') || txtComp.includes('módulo ii') || txtComp.includes('modulo ii')) modalCuadrosEstado.modulos[1] = true;
            if (txtComp.includes('módulo 3') || txtComp.includes('modulo 3') || txtComp.includes('módulo iii') || txtComp.includes('modulo iii')) modalCuadrosEstado.modulos[2] = true;
            if (txtComp.includes('módulo 4') || txtComp.includes('modulo 4') || txtComp.includes('módulo iv') || txtComp.includes('modulo iv')) modalCuadrosEstado.modulos[3] = true;
            if (txtComp.includes('módulo 5') || txtComp.includes('modulo 5') || txtComp.includes('módulo v') || txtComp.includes('modulo v')) modalCuadrosEstado.modulos[4] = true;
            if (txtComp.includes('constancia')) modalCuadrosEstado.constancia = true;
            if (txtComp.includes('fut')) modalCuadrosEstado.fut = true;
            if (m.notas || txtComp.includes('otro') || (!modalCuadrosEstado.modulos[0] && !modalCuadrosEstado.constancia && !modalCuadrosEstado.fut)) modalCuadrosEstado.otros = true;

            // 3. Renderizar y sincronizar boleta oficial dual
            actualizarBoletaModalEnVivo();`;

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync('templates/index.html', html, 'utf8');
  console.log('abrirModalConMovimiento updated with form-notas and checkboxes!');
} else {
  console.error('Target not found in abrirModalConMovimiento');
}
