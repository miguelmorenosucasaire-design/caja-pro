const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

console.log('--- APLICANDO (DNI: -------- - Cel: ---------) EN FACTURA PRINCIPAL A COLOR ---');

// 1. Reemplazar HTML en sección factura original
const targetOriginal = `<span class="text-[11px] font-bold text-slate-800 ml-2 whitespace-nowrap" id="factura-contacto-row">(DNI: <span id="factura-dni"></span> - Cel: <span id="factura-telefono"></span>)</span>`;
const replacementOriginal = `<span class="text-[11px] font-bold text-slate-800 ml-2 whitespace-nowrap" id="factura-contacto-row">(DNI: <span id="factura-dni" class="font-mono font-bold">--------</span> - Cel: <span id="factura-telefono" class="font-mono font-bold">---------</span>)</span>`;

if (html.includes(targetOriginal)) {
    html = html.replace(targetOriginal, replacementOriginal);
    console.log('1. HTML factura original actualizado con (DNI: -------- - Cel: ---------)');
} else {
    console.log('1. Target original no encontrado directamente, buscando patrón...');
    html = html.replace(/id="factura-contacto-row">\(DNI:\s*<span id="factura-dni"[^>]*><\/span>\s*-\s*Cel:\s*<span id="factura-telefono"[^>]*><\/span>\)<\/span>/, replacementOriginal);
}

// 2. Reemplazar HTML en sección factura copia
const targetCopia = `<span class="text-[11px] font-bold text-slate-800 ml-2 whitespace-nowrap" id="copia-factura-contacto-row">(DNI: <span id="copia-factura-dni"></span> - Cel: <span id="copia-factura-telefono"></span>)</span>`;
const replacementCopia = `<span class="text-[11px] font-bold text-[#1e40af] ml-2 whitespace-nowrap" id="copia-factura-contacto-row">(DNI: <span id="copia-factura-dni" class="font-mono font-bold">--------</span> - Cel: <span id="copia-factura-telefono" class="font-mono font-bold">---------</span>)</span>`;

if (html.includes(targetCopia)) {
    html = html.replace(targetCopia, replacementCopia);
    console.log('2. HTML factura copia actualizado con (DNI: -------- - Cel: ---------)');
} else {
    console.log('2. Target copia no encontrado directamente, buscando patrón...');
    html = html.replace(/id="copia-factura-contacto-row">\(DNI:\s*<span id="copia-factura-dni"[^>]*><\/span>\s*-\s*Cel:\s*<span id="copia-factura-telefono"[^>]*><\/span>\)<\/span>/, replacementCopia);
}

// 3. Eliminar sobreescritura errónea en actualizarMembretesFactura()
const targetSobreescritura = `            const elContacto = document.getElementById('factura-contacto-row');
            if (elContacto) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(\`Teléfono: <strong class="text-slate-800">\${tel}</strong>\`);
                    if (email) parts.push(\`Correo: <strong class="text-slate-800">\${email}</strong>\`);
                    elContacto.innerHTML = parts.join(' · ');
                } else {
                    elContacto.innerHTML = \`<span class="text-slate-400 italic text-[10px]"><i class="fa-solid fa-circle-info mr-1"></i> (Teléfono y correo pendientes de configuración manual en la pestaña Configuración)</span>\`;
                }
            }`;

const replacementSobreescritura = `            // factura-contacto-row es exclusivo para los datos de la persona: (DNI: -------- - Cel: ---------)
            const elDni = document.getElementById('factura-dni');
            const elTel = document.getElementById('factura-telefono');
            if (elDni && (!elDni.innerText || elDni.innerText.trim() === '')) elDni.innerText = '--------';
            if (elTel && (!elTel.innerText || elTel.innerText.trim() === '')) elTel.innerText = '---------';

            const elCopiaDni = document.getElementById('copia-factura-dni');
            const elCopiaTel = document.getElementById('copia-factura-telefono');
            if (elCopiaDni && (!elCopiaDni.innerText || elCopiaDni.innerText.trim() === '')) elCopiaDni.innerText = '--------';
            if (elCopiaTel && (!elCopiaTel.innerText || elCopiaTel.innerText.trim() === '')) elCopiaTel.innerText = '---------';`;

const targetSobreescrituraLF = targetSobreescritura.replace(/\r\n/g, '\n');
const targetSobreescrituraCRLF = targetSobreescrituraLF.replace(/\n/g, '\r\n');

if (html.includes(targetSobreescrituraCRLF)) {
    html = html.replace(targetSobreescrituraCRLF, replacementSobreescritura.replace(/\n/g, '\r\n'));
    console.log('3. Sobreescritura de contacto corregida (CRLF).');
} else if (html.includes(targetSobreescrituraLF)) {
    html = html.replace(targetSobreescrituraLF, replacementSobreescritura);
    console.log('3. Sobreescritura de contacto corregida (LF).');
} else {
    console.error('3. No se encontró targetSobreescritura.');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('--- ACTUALIZACIÓN FINALIZADA CON ÉXITO ---');
