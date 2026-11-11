const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Inspect each section and ensure each section is a self-contained <div id="section-..."> ... </div>
const secciones = [
    'dashboard',
    'resultados',
    'caja',
    'grupos',
    'estudiantes',
    'docentes',
    'deudores',
    'carreras',
    'respaldos'
];

// Let's check where line 76 in section-dashboard was unclosed
// In Line 76: <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
// It contained:
//   Line 77: <div>
//   Line 119: </div>
//   Line 121: <button onclick="cambiarSeccion('docentes')">...</button>
// It needed </div> to close line 76 before line 128!
console.log('Searching for unclosed div in section-dashboard...');

// Let's find the exact text around line 124 in section-dashboard
const btnDocText = `<span>Ver Boletas y Plantilla Completa</span>
                    </button>`;

if (html.includes(btnDocText)) {
    console.log('Found button text in index.html');
    // Check if the closing </div> of card line 76 exists right after the button
    const targetIdx = html.indexOf(btnDocText) + btnDocText.length;
    const following = html.substring(targetIdx, targetIdx + 200);
    console.log('Following text:', following);
}
