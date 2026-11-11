const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const targetCargarDoc = `                const url = carrera ? \`/api/docentes?carrera=\${encodeURIComponent(carrera)}\` : '/api/docentes';
                const res = await fetch(url);
                const docentes = await res.json();`;

const newCargarDoc = `                const url = carrera ? \`/api/docentes?carrera=\${encodeURIComponent(carrera)}\` : '/api/docentes';
                const res = await fetch(url);
                const docentes = await res.json();
                docentesGlobales = docentes;`;

if (html.includes(targetCargarDoc)) {
    html = html.replace(targetCargarDoc, newCargarDoc);
    console.log('[+] docentesGlobales asignado en cargarDocentes');
}

const targetDocBtn = `<button onclick="verBoletaDocente(\${d.id})" class="mt-5 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm">
                                <i class="fa-solid fa-file-invoice text-sky-400"></i>
                                <span>Ver Boleta y Liquidación Anual</span>
                            </button>`;

const newDocBtns = `<div class="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2">
                                <button onclick="abrirModalEditarDocente(\${d.id})" class="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm" title="Editar nombre, especialidad y teléfono del docente">
                                    <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                    <span>✏️ Editar Docente</span>
                                </button>
                                <button onclick="verBoletaDocente(\${d.id})" class="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition shadow-sm">
                                    <i class="fa-solid fa-file-invoice text-sky-400"></i>
                                    <span>Liquidación</span>
                                </button>
                            </div>`;

if (html.includes(targetDocBtn)) {
    html = html.replace(targetDocBtn, newDocBtns);
    console.log('[+] Botón de Editar Docente agregado a todas las tarjetas de docentes');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('[OK] index.html actualizado con edición de docentes.');
