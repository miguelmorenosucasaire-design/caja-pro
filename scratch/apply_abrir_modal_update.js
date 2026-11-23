const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalConMovimiento');
const nextFn = html.indexOf('function verBoletaDirecta', idx);

const updatedFn = `function abrirModalConMovimiento(reciboId) {
            const m = (movimientosGlobales || []).find(x => x.id == reciboId);
            if (!m) {
                mostrarNotificacion('Comprobante no encontrado', 'advertencia');
                return;
            }

            // 1. Abrir modal
            const modal = document.getElementById('modal-nuevo-movimiento');
            if (modal) modal.classList.remove('hidden');

            // 2. Poblar campos en el formulario de la izquierda con los datos guardados
            if (document.getElementById('form-tipo')) seleccionarTipoMovimiento(m.tipo || 'Ingreso');
            if (document.getElementById('form-rol-persona')) {
                document.getElementById('form-rol-persona').value = m.rol || 'Estudiante';
                seleccionarRolPersonaModal(m.rol || 'Estudiante');
            }
            if (document.getElementById('form-nombre')) document.getElementById('form-nombre').value = m.nombre || '';
            if (document.getElementById('form-dni')) document.getElementById('form-dni').value = m.dni || '';
            if (document.getElementById('form-telefono')) document.getElementById('form-telefono').value = m.telefono || '';
            if (document.getElementById('form-carrera')) document.getElementById('form-carrera').value = m.carrera || '';
            if (document.getElementById('form-turno')) document.getElementById('form-turno').value = m.turno || 'Tarde';
            if (document.getElementById('form-grupo')) document.getElementById('form-grupo').value = m.grupo || '';
            if (document.getElementById('form-docente')) document.getElementById('form-docente').value = m.docente || '';
            if (document.getElementById('form-comprobante')) {
                const nro = m.comprobante ? String(m.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
                document.getElementById('form-comprobante').value = nro;
            }
            if (document.getElementById('form-monto')) document.getElementById('form-monto').value = Number(m.monto_total || m.monto || 0).toFixed(2);
            if (document.getElementById('form-concepto')) document.getElementById('form-concepto').value = m.concepto || '';
            if (document.getElementById('form-notas')) document.getElementById('form-notas').value = m.notas || '';
            if (document.getElementById('form-fecha')) document.getElementById('form-fecha').value = m.fecha || new Date().toISOString().split('T')[0];
            if (document.getElementById('form-metodo')) document.getElementById('form-metodo').value = m.metodo_pago || m.metodo || 'Efectivo';
            if (document.getElementById('form-estado')) document.getElementById('form-estado').value = m.estado || 'Pagado';

            // Configurar casillas de módulos y conceptos oficiales según lo guardado
            modalCuadrosEstado.modulos = [false, false, false, false, false, false, false];
            modalCuadrosEstado.constancia = false;
            modalCuadrosEstado.fut = false;
            modalCuadrosEstado.otros = false;

            const txtComp = ((m.concepto || '') + ' ' + (m.notas || '')).toLowerCase();
            if (txtComp.includes('módulo 1') || txtComp.includes('modulo 1') || txtComp.includes('módulo i') || txtComp.includes('modulo i')) modalCuadrosEstado.modulos[0] = true;
            if (txtComp.includes('módulo 2') || txtComp.includes('modulo 2') || txtComp.includes('módulo ii') || txtComp.includes('modulo ii')) modalCuadrosEstado.modulos[1] = true;
            if (txtComp.includes('módulo 3') || txtComp.includes('modulo 3') || txtComp.includes('módulo iii') || txtComp.includes('modulo iii')) modalCuadrosEstado.modulos[2] = true;
            if (txtComp.includes('módulo 4') || txtComp.includes('modulo 4') || txtComp.includes('módulo iv') || txtComp.includes('modulo iv')) modalCuadrosEstado.modulos[3] = true;
            if (txtComp.includes('módulo 5') || txtComp.includes('modulo 5') || txtComp.includes('módulo v') || txtComp.includes('modulo v')) modalCuadrosEstado.modulos[4] = true;
            if (txtComp.includes('constancia')) modalCuadrosEstado.constancia = true;
            if (txtComp.includes('fut')) modalCuadrosEstado.fut = true;
            if (m.notas || txtComp.includes('otro') || (!modalCuadrosEstado.modulos[0] && !modalCuadrosEstado.constancia && !modalCuadrosEstado.fut)) modalCuadrosEstado.otros = true;

            // 3. Renderizar y sincronizar boleta oficial dual
            actualizarBoletaModalEnVivo();

            // 4. Activar banner de comprobante emitido listo para imprimir o descargar PDF
            const bEdicion = document.getElementById('modal-boleta-banner-edicion');
            const bEmitido = document.getElementById('modal-boleta-banner-emitido');
            if (bEdicion) bEdicion.classList.add('hidden');
            if (bEmitido) {
                bEmitido.classList.remove('hidden');
                const bSpan = bEmitido.querySelector('span');
                const compNum = m.comprobante ? String(m.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
                if (bSpan) bSpan.innerText = \`Comprobante Oficial N° \${compNum} cargado con datos guardados de \${m.nombre || 'Estudiante'}\`;
            }

            // 5. También sincronizar vista principal Factura
            if (typeof seleccionarFacturaRecibo === 'function') {
                try { seleccionarFacturaRecibo(m.id); } catch(e) {}
            }
        }

        `;

html = html.substring(0, idx) + updatedFn + html.substring(nextFn);
fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('abrirModalConMovimiento updated successfully!');
