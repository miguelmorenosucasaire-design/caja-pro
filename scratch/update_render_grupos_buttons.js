const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const targetButtons = `<div class="pt-4 mt-4 border-t border-slate-100 space-y-2">
                            <div class="flex items-center space-x-2">
                                <button onclick="abrirModalNuevoMovimientoParaGrupo('\${encodeURIComponent(g.nombre)}', '\${encodeURIComponent(g.encargado)}', '\${encodeURIComponent(g.carrera)}')" class="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5" title="Registrar un ingreso o gasto e ingresar cantidad para este grupo">
                                    <i class="fa-solid fa-money-bill-wave"></i>
                                    <span>Ingresar Cantidad</span>
                                </button>
                                <button onclick="abrirModalDetalleGrupo(\${g.id})" class="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5" title="Ver alumnos de esta sección y sus movimientos">
                                    <i class="fa-solid fa-list-check"></i>
                                    <span>Ver Alumnos</span>
                                </button>
                                <button onclick="eliminarGrupo(\${g.id}, '\${encodeURIComponent(g.nombre)}')" class="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-slate-200" title="Eliminar sección">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>`;

const newButtons = `<div class="pt-3 mt-3 border-t border-slate-100 space-y-2">
                            <!-- Botón para Modificar Nombre y Turno de la Sección -->
                            <button onclick="abrirModalEditarGrupo(\${g.id})" class="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm" title="Modificar nombre, turno, encargado y aula">
                                <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                <span>✏️ Modificar Nombre y Turno</span>
                            </button>

                            <div class="flex items-center space-x-2">
                                <button onclick="verPlantillaSeccion(\${g.id})" class="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm" title="Ver plantilla oficial de esta sección">
                                    <i class="fa-solid fa-table-list"></i>
                                    <span>Plantilla</span>
                                </button>
                                <button onclick="abrirModalNuevoMovimientoParaGrupo('\${encodeURIComponent(g.nombre)}', '\${encodeURIComponent(g.encargado)}', '\${encodeURIComponent(g.carrera)}')" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm" title="Ingresar cantidad / movimiento">
                                    <i class="fa-solid fa-money-bill-wave"></i>
                                    <span>Ingresar S/</span>
                                </button>
                                <button onclick="eliminarGrupo(\${g.id}, '\${encodeURIComponent(g.nombre)}')" class="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-slate-200" title="Eliminar sección">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>`;

if (html.includes(targetButtons)) {
    html = html.replace(targetButtons, newButtons);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('[+] Botón de Modificar Nombre y Turno integrado en todas las tarjetas de grupos.');
} else {
    console.log('[-] targetButtons no encontrado exactamente');
}
