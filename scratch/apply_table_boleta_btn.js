const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const pos = html.indexOf("<!-- Botón Cambiar / Asignar en Tabla -->");
console.log('Found at pos:', pos);
console.log(JSON.stringify(html.substring(pos, pos + 150)));

const btnBoleta = `<!-- Botón Imprimir Boleta Oficial -->
                            <button onclick="imprimirBoletaDeEstudianteDirecto(\${e.id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm" title="Imprimir boleta oficial con datos ya guardados (\${nroBoletaReg})">
                                <i class="fa-solid fa-receipt mr-1"></i>Boleta
                            </button>
                            `;

html = html.substring(0, pos) + btnBoleta + html.substring(pos);
fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('Button Boleta added to table successfully!');
