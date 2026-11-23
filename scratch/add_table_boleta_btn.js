const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const target = `<td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <!-- Botón Cambiar / Asignar en Tabla -->
                            <button onclick="abrirModalAsignarCarrera(\${e.id}`;

const replacement = `<td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <!-- Botón Imprimir Boleta Oficial -->
                            <button onclick="imprimirBoletaDeEstudianteDirecto(\${e.id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm" title="Imprimir boleta oficial con datos ya guardados (\${nroBoletaReg})">
                                <i class="fa-solid fa-receipt mr-1"></i>Boleta
                            </button>
                            <!-- Botón Cambiar / Asignar en Tabla -->
                            <button onclick="abrirModalAsignarCarrera(\${e.id}`;

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync('templates/index.html', html, 'utf8');
  console.log('Button Boleta added to table successfully!');
} else {
  console.error('Target not found in table');
}
