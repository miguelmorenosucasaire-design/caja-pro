const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const markerStart = 'if (data.success) {\n                    cerrarModalNuevoMovimiento();';
const idxStart = html.indexOf(markerStart);
const idxCatch = html.indexOf('} catch (err) {', idxStart);
console.log('idxStart:', idxStart, 'idxCatch:', idxCatch);

if (idxStart !== -1 && idxCatch !== -1) {
    const replacement = `if (data.success) {
                    await cargarTodo();

                    // 1. Asignar el número de comprobante definitivo oficial a la boleta al costadito
                    const compDefinitivo = data.comprobante || (payload.comprobante ? payload.comprobante.padStart(7, '0') : '0000811');
                    const elNro = document.getElementById('modal-boleta-nro');
                    if (elNro) elNro.innerText = compDefinitivo;

                    const elBadgeNro = document.getElementById('modal-badge-emitido-nro');
                    if (elBadgeNro) elBadgeNro.innerText = compDefinitivo;

                    // 2. Activar banner de emisión completada con botones de Imprimir y PDF directos al costadito
                    const bEdicion = document.getElementById('modal-boleta-banner-edicion');
                    const bEmitido = document.getElementById('modal-boleta-banner-emitido');
                    if (bEdicion) bEdicion.classList.add('hidden');
                    if (bEmitido) bEmitido.classList.remove('hidden');

                    // 3. Sincronizar en segundo plano la sección de facturas
                    if (typeof poblarSelectorEstudiantesOpciones === 'function') {
                        poblarSelectorEstudiantesOpciones('todos');
                    }
                    if (data.id && typeof seleccionarFacturaRecibo === 'function') {
                        seleccionarFacturaRecibo(data.id, true);
                    }

                    // Notificación en pantalla
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center space-x-2 animate-bounce border-2 border-white';
                    toast.innerHTML = '<i class="fa-solid fa-circle-check text-base"></i><span>¡Boleta N° ' + compDefinitivo + ' generada al costadito! Lista para Imprimir o Descargar PDF.</span>';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 4000);
                }
            `;

    html = html.slice(0, idxStart) + replacement + html.slice(idxCatch);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('SUCCESS! guardarMovimiento replaced cleanly.');
}
