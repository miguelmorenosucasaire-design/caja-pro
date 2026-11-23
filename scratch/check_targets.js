const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const target1 = `<div id="contenedor-impresion-factura" class="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center space-y-4">`;
console.log('Target 1 found:', content.includes(target1));

const target2 = `                if (data.success) {
                    mostrarNotificacion(data.mensaje, 'exito');
                    cerrarModalNuevoEstudianteRecibo();

                    // Recargar datos del sistema
                    await cargarTodo();

                    // Seleccionar directamente el nuevo comprobante en la factura
                    if (data.movimiento_id) {
                        seleccionarFacturaRecibo(data.movimiento_id, true);
                    }
                }`;
// Normalize CRLF
const normalized = content.replace(/\r\n/g, '\n');
console.log('Target 2 found (normalized):', normalized.includes(target2.replace(/\r\n/g, '\n')));
