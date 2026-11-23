const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const targetGuardar = `                if (data.success) {
                    cerrarModalNuevoMovimiento();
                    document.getElementById('form-nuevo-movimiento').reset();
                    document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];
                    seleccionarTipoMovimiento('Ingreso');
                    toggleFechaVencimiento();
                    await cargarTodo();

                    if (payload.rol === 'Estudiante' && payload.tipo === 'Ingreso' && data.id) {
                        cambiarSeccion('factura');
                        if (typeof poblarSelectorEstudiantesOpciones === 'function') {
                            poblarSelectorEstudiantesOpciones('todos');
                        }
                        const selRec = document.getElementById('factura-recibo-select');
                        if (selRec) selRec.value = data.id;
                        seleccionarFacturaRecibo(data.id, true);
                        cambiarVistaComprobante('voucher');
                        const contBoleta = document.getElementById('contenedor-comprobante-oficial');
                        if (contBoleta) {
                            contBoleta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }`;

const newGuardar = `                if (data.success) {
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
                }`;

if (html.includes(targetGuardar)) {
    html = html.replace(targetGuardar, newGuardar);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('guardarMovimiento successfully updated with instant dual-pane voucher emission!');
} else {
    console.log('Trying normalized CRLF replacement...');
    const normHtml = html.replace(/\r\n/g, '\n');
    const normTarget = targetGuardar.replace(/\r\n/g, '\n');
    if (normHtml.includes(normTarget)) {
        html = normHtml.replace(normTarget, newGuardar);
        fs.writeFileSync('templates/index.html', html, 'utf8');
        console.log('guardarMovimiento updated with normalized replacement!');
    } else {
        console.error('Target guardar block NOT found in templates/index.html');
    }
}
