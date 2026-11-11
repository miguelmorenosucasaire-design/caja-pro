const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const target = `function toggleVoucherBox(el) {
            if (!el) return;
            el.innerText = el.innerText === 'X' ? '' : 'X';
        }`;

const replacement = `function toggleVoucherBox(el, isCopia = false) {
            if (!el) return;
            el.innerText = el.innerText === 'X' ? '' : 'X';
            if (isCopia) {
                const origId = el.id.replace('copia-', '');
                const origEl = document.getElementById(origId);
                if (origEl) origEl.innerText = el.innerText;
            } else {
                const copiaId = 'copia-' + el.id;
                const copiaEl = document.getElementById(copiaId);
                if (copiaEl) copiaEl.innerText = el.innerText;
            }
        }`;

if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('toggleVoucherBox updated!');
} else {
    console.log('Target not matched');
}
