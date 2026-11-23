const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const newJS = `
        // =========================================================================
        // SINCRONIZACIÓN EN VIVO DE LA BOLETA "AL COSTADITO" EN EL MODAL
        // =========================================================================
        function actualizarBoletaModalEnVivo() {
            const nomVal = (document.getElementById('form-nombre')?.value || '').trim();
            const dniVal = (document.getElementById('form-dni')?.value || '').trim();
            const telVal = (document.getElementById('form-telefono')?.value || '').trim();
            const carrVal = document.getElementById('form-carrera')?.value || 'Computación e Informática';
            const turnoVal = document.getElementById('form-turno')?.value || 'Tarde';
            const compVal = (document.getElementById('form-comprobante')?.value || '').trim();
            const concVal = (document.getElementById('form-concepto')?.value || '').trim();
            const montoVal = parseFloat(document.getElementById('form-monto')?.value) || 0;
            const notasVal = (document.getElementById('form-notas')?.value || '').trim();
            const fechaVal = document.getElementById('form-fecha')?.value || new Date().toISOString().split('T')[0];

            // 1. Número correlativo
            const elNro = document.getElementById('modal-boleta-nro');
            if (elNro) {
                elNro.innerText = compVal ? compVal.padStart(7, '0') : '0000811';
            }

            // 2. Estudiante / Señor (a)
            const elEst = document.getElementById('modal-boleta-estudiante');
            if (elEst) {
                elEst.innerText = nomVal ? nomVal : '---------------------------------';
            }

            // 3. DNI y Celular
            const elDni = document.getElementById('modal-boleta-dni');
            if (elDni) elDni.innerText = dniVal || '--------';

            const elTel = document.getElementById('modal-boleta-telefono');
            if (elTel) elTel.innerText = telVal || '---------';

            // 4. Especialidad
            const elCarr = document.getElementById('modal-boleta-carrera');
            if (elCarr) {
                elCarr.innerText = turnoVal ? \`\${carrVal} - \${turnoVal}\` : carrVal;
            }

            // 5. Conceptos y casillas
            const boxAporte = document.getElementById('modal-boleta-check-aporte');
            const boxConst = document.getElementById('modal-boleta-check-constancia');
            const boxFut = document.getElementById('modal-boleta-check-fut');
            const mAporte = document.getElementById('modal-boleta-monto-aporte');
            const mConst = document.getElementById('modal-boleta-monto-constancia');
            const mFut = document.getElementById('modal-boleta-monto-fut');
            const mOtros = document.getElementById('modal-boleta-monto-otros');
            const nOtros = document.getElementById('modal-boleta-nota-otros');
            const elTotal = document.getElementById('modal-boleta-total');

            // Reset checks
            if (boxAporte) boxAporte.innerText = ' ';
            if (boxConst) boxConst.innerText = ' ';
            if (boxFut) boxFut.innerText = ' ';

            const fMoney = (val) => Number(val).toFixed(2);
            if (elTotal) elTotal.innerText = fMoney(montoVal);

            const concLow = concVal.toLowerCase();
            if (concLow.includes('constancia')) {
                if (boxConst) boxConst.innerText = 'X';
                if (mConst) mConst.innerText = fMoney(montoVal);
                if (mAporte) mAporte.innerText = '0.00';
            } else if (concLow.includes('fut')) {
                if (boxFut) boxFut.innerText = 'X';
                if (mFut) mFut.innerText = fMoney(montoVal);
                if (mAporte) mAporte.innerText = '0.00';
            } else if (concLow.includes('otros') || (concVal && !concLow.includes('aporte') && !concLow.includes('mantenimiento'))) {
                if (mOtros) mOtros.innerText = fMoney(montoVal);
                if (mAporte) mAporte.innerText = '0.00';
            } else {
                // Por defecto o Aporte por Mantenimiento
                if (boxAporte) boxAporte.innerText = 'X';
                if (mAporte) mAporte.innerText = fMoney(montoVal || 150);
            }

            // 6. Línea 4 Otros (Notas u observaciones)
            if (nOtros) {
                nOtros.innerText = notasVal || (concVal && !concLow.includes('aporte') ? concVal : 'Observaciones / notas');
            }

            // 7. Fecha
            const [y, m, d] = fechaVal.split('-');
            const elDia = document.getElementById('modal-boleta-dia');
            const elMes = document.getElementById('modal-boleta-mes');
            const elAno = document.getElementById('modal-boleta-ano');
            if (elDia) elDia.innerText = d || '16';
            if (elMes) elMes.innerText = m || '11';
            if (elAno) elAno.innerText = (y || '2026').slice(-2);
        }

        function setConceptoModal(conc) {
            const inp = document.getElementById('form-concepto');
            if (inp) {
                inp.value = conc;
                actualizarBoletaModalEnVivo();
            }
        }

        function setMontoModal(monto) {
            const inp = document.getElementById('form-monto');
            if (inp) {
                inp.value = monto > 0 ? monto.toFixed(2) : '';
                actualizarBoletaModalEnVivo();
            }
        }

        // =========================================================================
        // ACCIONES DIRECTAS EN LA BOLETA DEL MODAL (IMPRIMIR Y PDF AL INSTANTE)
        // =========================================================================
        function imprimirBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const printWin = window.open('', '_blank', 'width=800,height=600');
            printWin.document.write(\`
                <html>
                <head>
                    <title>Boleta CETPRO San Miguel</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @page { size: letter portrait; margin: 10mm; }
                        body { font-family: sans-serif; background: white; margin: 0; padding: 20px; }
                    </style>
                </head>
                <body>
                    <div style="max-width: 600px; margin: 0 auto; border: 2px solid #2258a8; border-radius: 16px; padding: 20px;">
                        \${cont.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
                </html>
            \`);
            printWin.document.close();
        }

        function descargarBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const nro = document.getElementById('modal-boleta-nro')?.innerText || '0000811';
            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: \`Boleta_Oficial_\${nro}_CETPRO.pdf\`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a5', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(cont).save();
            } else {
                imprimirBoletaModalDirecta();
            }
        }

        function reiniciarModalParaSiguiente() {
            const form = document.getElementById('form-nuevo-movimiento');
            if (form) form.reset();

            const bEdicion = document.getElementById('modal-boleta-banner-edicion');
            const bEmitido = document.getElementById('modal-boleta-banner-emitido');
            if (bEdicion) bEdicion.classList.remove('hidden');
            if (bEmitido) bEmitido.classList.add('hidden');

            // Cargar fecha de hoy
            const inpFecha = document.getElementById('form-fecha');
            if (inpFecha) inpFecha.value = new Date().toISOString().split('T')[0];

            // Consultar el próximo correlativo oficial
            fetch('/api/movimientos/proximo-comprobante')
                .then(r => r.json())
                .then(d => {
                    const inpComp = document.getElementById('form-comprobante');
                    if (inpComp && d.proximo_comprobante) {
                        inpComp.value = d.proximo_comprobante;
                    }
                    actualizarBoletaModalEnVivo();
                })
                .catch(() => {
                    actualizarBoletaModalEnVivo();
                });
        }
`;

const scriptEndIdx = html.lastIndexOf('</script>');
if (scriptEndIdx !== -1) {
    html = html.slice(0, scriptEndIdx) + '\n' + newJS + '\n' + html.slice(scriptEndIdx);
    console.log('Supporting modal JavaScript functions inserted successfully!');
}

// Update abrirModalNuevoMovimiento to fetch next correlative and init live voucher
const targetAbrirModal = `function abrirModalNuevoMovimiento(rolPreseleccionado = '') {
            if (rolPreseleccionado) {
                document.getElementById('form-rol').value = rolPreseleccionado;
            }
            seleccionarTipoMovimiento('Ingreso');`;

const newAbrirModal = `function abrirModalNuevoMovimiento(rolPreseleccionado = '') {
            if (rolPreseleccionado) {
                seleccionarRolPersonaModal(rolPreseleccionado);
            } else {
                seleccionarRolPersonaModal('Estudiante');
            }
            seleccionarTipoMovimiento('Ingreso');

            // Resetear banners de boleta en vivo
            const bEdicion = document.getElementById('modal-boleta-banner-edicion');
            const bEmitido = document.getElementById('modal-boleta-banner-emitido');
            if (bEdicion) bEdicion.classList.remove('hidden');
            if (bEmitido) bEmitido.classList.add('hidden');

            const fFecha = document.getElementById('form-fecha');
            if (fFecha && !fFecha.value) {
                fFecha.value = new Date().toISOString().split('T')[0];
            }

            // Consultar el próximo correlativo oficial exacto del backend
            fetch('/api/movimientos/proximo-comprobante')
                .then(r => r.json())
                .then(d => {
                    const inpComp = document.getElementById('form-comprobante');
                    if (inpComp && d.proximo_comprobante) {
                        inpComp.value = d.proximo_comprobante;
                    }
                    actualizarBoletaModalEnVivo();
                })
                .catch(() => {
                    actualizarBoletaModalEnVivo();
                });`;

if (html.includes(targetAbrirModal)) {
    html = html.replace(targetAbrirModal, newAbrirModal);
    console.log('abrirModalNuevoMovimiento updated with dynamic correlative fetch and banner resets');
} else {
    console.log('targetAbrirModal not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetAbrirModal.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newAbrirModal);
        console.log('abrirModalNuevoMovimiento updated with normalized newlines');
    }
}

// Update guardarMovimiento to stamp the voucher in the modal and reveal print/PDF buttons
const targetGuardarSuccess = `if (data.success) {
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

const newGuardarSuccess = `if (data.success) {
                    await cargarTodo();

                    // 1. Actualizar el N° de Comprobante definitivo en la boleta del modal al costadito
                    const compDefinitivo = data.comprobante || (payload.comprobante ? payload.comprobante.padStart(7, '0') : '0000811');
                    const elNro = document.getElementById('modal-boleta-nro');
                    if (elNro) elNro.innerText = compDefinitivo;

                    const elBadgeNro = document.getElementById('modal-badge-emitido-nro');
                    if (elBadgeNro) elBadgeNro.innerText = compDefinitivo;

                    // 2. Activar banner verde de éxito y botones de Imprimir / Descargar PDF directos
                    const bEdicion = document.getElementById('modal-boleta-banner-edicion');
                    const bEmitido = document.getElementById('modal-boleta-banner-emitido');
                    if (bEdicion) bEdicion.classList.add('hidden');
                    if (bEmitido) bEmitido.classList.remove('hidden');

                    // 3. Sincronizar también la sección de factura de fondo
                    if (typeof poblarSelectorEstudiantesOpciones === 'function') {
                        poblarSelectorEstudiantesOpciones('todos');
                    }
                    if (data.id) {
                        seleccionarFacturaRecibo(data.id, true);
                    }
                }`;

if (html.includes(targetGuardarSuccess)) {
    html = html.replace(targetGuardarSuccess, newGuardarSuccess);
    console.log('guardarMovimiento updated to activate live modal voucher and direct print/PDF');
} else {
    console.log('targetGuardarSuccess not found directly, checking normalized');
    const norm = html.replace(/\r\n/g, '\n');
    const normTarget = targetGuardarSuccess.replace(/\r\n/g, '\n');
    if (norm.includes(normTarget)) {
        html = norm.replace(normTarget, newGuardarSuccess);
        console.log('guardarMovimiento updated with normalized newlines');
    }
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('templates/index.html fully updated with live split modal!');
