const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8').replace(/\r\n/g, '\n');

const targetVerBoleta = `        function verBoletaDirecta(reciboId) {
            cambiarSeccion('factura');
            setTimeout(() => {
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = reciboId;
                seleccionarFacturaRecibo(reciboId);
            }, 300);
        }`;

console.log('Target verBoleta found:', content.includes(targetVerBoleta));

const targetGuardarMov = `                if (data.success) {
                    cerrarModalNuevoMovimiento();
                    document.getElementById('form-nuevo-movimiento').reset();
                    document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];
                    seleccionarTipoMovimiento('Ingreso');
                    toggleFechaVencimiento();
                    alert(\`✅ Movimiento registrado con éxito por la cantidad de S/. \${monto.toFixed(2)}.\`);
                    await cargarTodo();
                }`;

console.log('Target guardarMov found:', content.includes(targetGuardarMov));
