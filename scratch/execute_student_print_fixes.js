const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Replace irAFacturaDesdeFichaEstudiante and insert imprimirBoletaDeEstudianteDirecto
const idx1 = html.indexOf('function irAFacturaDesdeFichaEstudiante');
const nextFn = html.indexOf('function cambiarVistaComprobante', idx1);

const newFns = `// Cargar boleta oficial con los datos que ya se guardaron del estudiante
        async function imprimirBoletaDeEstudianteDirecto(estId, reciboId = null) {
            try {
                if (typeof cerrarModalFichaEstudiante === 'function') cerrarModalFichaEstudiante();

                // 1. Localizar datos del estudiante
                let est = (typeof estudiantesGlobales !== 'undefined' ? estudiantesGlobales : []).find(x => x.id == estId);
                let movs = [];

                if (estId) {
                    try {
                        const res = await fetch('/api/estudiantes/' + estId + '/detalle');
                        if (res.ok) {
                            const data = await res.json();
                            if (data.estudiante) est = { ...est, ...data.estudiante };
                            if (data.movimientos) movs = data.movimientos;
                        }
                    } catch (e) {
                        console.warn('Error obteniendo detalle estudiante:', e);
                    }
                }

                if (!est) {
                    est = window.currentFichaEstudianteData || {};
                }

                // 2. Localizar el movimiento/boleta guardada del estudiante
                let m = null;
                const poolMovs = typeof movimientosGlobales !== 'undefined' ? movimientosGlobales : [];

                if (reciboId) {
                    m = poolMovs.find(x => x.id == reciboId) || (movs || []).find(x => x.id == reciboId);
                }

                if (!m && movs && movs.length > 0) {
                    m = movs[0];
                }

                if (!m && est) {
                    m = poolMovs.find(x => 
                        (x.estudiante_id && x.estudiante_id == est.id) ||
                        (est.dni && x.dni && String(x.dni).trim() === String(est.dni).trim()) ||
                        (est.nombre && x.nombre && x.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase())
                    );
                }

                // 3. Abrir el modal de emisión / comprobante oficial
                const modal = document.getElementById('modal-nuevo-movimiento');
                if (modal) modal.classList.remove('hidden');

                // 4. Poblar datos del estudiante y del comprobante guardado
                if (document.getElementById('form-tipo')) seleccionarTipoMovimiento('Ingreso');
                if (document.getElementById('form-rol-persona')) {
                    document.getElementById('form-rol-persona').value = 'Estudiante';
                    seleccionarRolPersonaModal('Estudiante');
                }

                const nombreFinal = (m ? m.nombre : est.nombre) || '';
                const dniFinal = (m ? m.dni : est.dni) || '';
                const telFinal = (m ? m.telefono : est.telefono) || '';
                const carrFinal = (m ? m.carrera : est.carrera) || 'Computación e Informática';
                const turnoFinal = (m ? m.turno : est.turno) || 'Tarde';
                const grupoFinal = (m ? m.grupo : est.grupo) || '';
                const docenteFinal = (m ? m.docente : '') || '';

                if (document.getElementById('form-nombre')) document.getElementById('form-nombre').value = nombreFinal;
                if (document.getElementById('form-dni')) document.getElementById('form-dni').value = dniFinal;
                if (document.getElementById('form-telefono')) document.getElementById('form-telefono').value = telFinal;
                if (document.getElementById('form-carrera')) document.getElementById('form-carrera').value = carrFinal;
                if (document.getElementById('form-turno')) document.getElementById('form-turno').value = turnoFinal;
                if (document.getElementById('form-grupo')) document.getElementById('form-grupo').value = grupoFinal;
                if (document.getElementById('form-docente')) document.getElementById('form-docente').value = docenteFinal;

                // N° Comprobante: Jalar el número correlativo que ya se guardó
                let compNum = '';
                if (m && m.comprobante) {
                    compNum = String(m.comprobante).replace(/\\D/g, '').padStart(7, '0');
                } else if (est && est.ultimo_comprobante) {
                    compNum = String(est.ultimo_comprobante).replace(/\\D/g, '').padStart(7, '0');
                } else if (m && m.id) {
                    compNum = String(m.id).padStart(7, '0');
                }
                if (document.getElementById('form-comprobante')) {
                    if (compNum) document.getElementById('form-comprobante').value = compNum;
                }

                // Monto y Concepto guardados
                const montoFinal = m ? (m.monto_total || m.monto || 0) : (est.total_pagado || 0);
                const conceptoFinal = (m ? m.concepto : '') || 'Aporte por Mantenimiento Módulo 1 y 2';
                const notasFinal = (m ? m.notas : '') || (conceptoFinal ? \`\${conceptoFinal} (\${carrFinal})\` : '');
                const fechaFinal = (m ? m.fecha : '') || new Date().toISOString().split('T')[0];
                const metodoFinal = (m ? (m.metodo_pago || m.metodo) : '') || 'Efectivo';
                const estadoFinal = (m ? m.estado : '') || 'Pagado';

                if (document.getElementById('form-monto')) document.getElementById('form-monto').value = Number(montoFinal).toFixed(2);
                if (document.getElementById('form-concepto')) document.getElementById('form-concepto').value = conceptoFinal;
                if (document.getElementById('form-notas')) document.getElementById('form-notas').value = notasFinal;
                if (document.getElementById('form-fecha')) document.getElementById('form-fecha').value = fechaFinal;
                if (document.getElementById('form-metodo')) document.getElementById('form-metodo').value = metodoFinal;
                if (document.getElementById('form-estado')) document.getElementById('form-estado').value = estadoFinal;

                // 5. Configurar casillas de módulos y conceptos oficiales según lo guardado
                modalCuadrosEstado.modulos = [false, false, false, false, false, false, false];
                modalCuadrosEstado.constancia = false;
                modalCuadrosEstado.fut = false;
                modalCuadrosEstado.otros = false;

                const textoCompleto = (conceptoFinal + ' ' + notasFinal).toLowerCase();
                if (textoCompleto.includes('módulo 1') || textoCompleto.includes('modulo 1') || textoCompleto.includes('módulo i') || textoCompleto.includes('modulo i')) {
                    modalCuadrosEstado.modulos[0] = true;
                }
                if (textoCompleto.includes('módulo 2') || textoCompleto.includes('modulo 2') || textoCompleto.includes('módulo ii') || textoCompleto.includes('modulo ii')) {
                    modalCuadrosEstado.modulos[1] = true;
                }
                if (textoCompleto.includes('módulo 3') || textoCompleto.includes('modulo 3') || textoCompleto.includes('módulo iii') || textoCompleto.includes('modulo iii')) {
                    modalCuadrosEstado.modulos[2] = true;
                }
                if (textoCompleto.includes('módulo 4') || textoCompleto.includes('modulo 4') || textoCompleto.includes('módulo iv') || textoCompleto.includes('modulo iv')) {
                    modalCuadrosEstado.modulos[3] = true;
                }
                if (textoCompleto.includes('módulo 5') || textoCompleto.includes('modulo 5') || textoCompleto.includes('módulo v') || textoCompleto.includes('modulo v')) {
                    modalCuadrosEstado.modulos[4] = true;
                }
                if (textoCompleto.includes('constancia')) {
                    modalCuadrosEstado.constancia = true;
                }
                if (textoCompleto.includes('fut')) {
                    modalCuadrosEstado.fut = true;
                }
                if (notasFinal || textoCompleto.includes('otro') || (!modalCuadrosEstado.modulos[0] && !modalCuadrosEstado.constancia && !modalCuadrosEstado.fut)) {
                    modalCuadrosEstado.otros = true;
                }

                // 6. Sincronizar en vivo la boleta dual (Original y Copia)
                actualizarBoletaModalEnVivo();

                // 7. Mostrar banner de boleta oficial emitida lista para imprimir
                const bEdicion = document.getElementById('modal-boleta-banner-edicion');
                const bEmitido = document.getElementById('modal-boleta-banner-emitido');
                if (bEdicion) bEdicion.classList.add('hidden');
                if (bEmitido) {
                    bEmitido.classList.remove('hidden');
                    const bSpan = bEmitido.querySelector('span');
                    if (bSpan) bSpan.innerText = \`Comprobante Oficial N° \${compNum || '0000000'} cargado con datos guardados de \${nombreFinal}\`;
                }

                // 8. Sincronizar también la vista principal Factura
                if (m && m.id && typeof seleccionarFacturaRecibo === 'function') {
                    try { seleccionarFacturaRecibo(m.id); } catch (e) {}
                }

                mostrarNotificacion(\`✅ Datos de la boleta N° \${compNum || 'Oficial'} de \${nombreFinal} cargados con éxito. Lista para imprimir o guardar a PDF.\`, 'exito');
            } catch (err) {
                console.error('Error cargando boleta guardada del estudiante:', err);
                mostrarNotificacion('Error cargando datos de la boleta: ' + err.message, 'error');
            }
        }

        // Navegación directa desde la Ficha del Estudiante a la Emisión de Boleta jalando sus datos guardados
        function irAFacturaDesdeFichaEstudiante(reciboId = null) {
            const est = window.currentFichaEstudianteData;
            cerrarModalFichaEstudiante();

            if (reciboId) {
                imprimirBoletaDeEstudianteDirecto(est ? est.id : null, reciboId);
                return;
            }

            if (est && est.id) {
                imprimirBoletaDeEstudianteDirecto(est.id, null);
            } else {
                abrirModalNuevoMovimiento();
            }
        }

        `;

html = html.substring(0, idx1) + newFns + html.substring(nextFn);
console.log('irAFacturaDesdeFichaEstudiante and imprimirBoletaDeEstudianteDirecto replaced successfully!');

// 2. Add Imprimir Boleta in Card
const cardTarget = `<button onclick="verFichaEstudiante(\${e.id})" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">`;

const cardReplacement = `<button onclick="imprimirBoletaDeEstudianteDirecto(\${e.id})" class="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/25 transition transform active:scale-95" title="Abrir boleta oficial con datos ya guardados para imprimir o descargar PDF">
                                <i class="fa-solid fa-receipt"></i>
                                <span>Imprimir Boleta Oficial (\${nroBoletaReg})</span>
                            </button>

                            <button onclick="verFichaEstudiante(\${e.id})" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">`;

if (html.includes(cardTarget)) {
  html = html.replace(cardTarget, cardReplacement);
  console.log('Card button Imprimir Boleta Oficial added!');
} else {
  console.error('Could not find cardTarget');
}

// 3. Add Imprimir Boleta in Table Row
const tableTarget = `<button onclick="verFichaEstudiante(\${e.id})" class="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition">`;

const tableReplacement = `<button onclick="imprimirBoletaDeEstudianteDirecto(\${e.id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm" title="Imprimir boleta oficial con datos ya guardados (\${nroBoletaReg})">
                                <i class="fa-solid fa-receipt mr-1"></i>Boleta
                            </button>
                            <button onclick="verFichaEstudiante(\${e.id})" class="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition">`;

if (html.includes(tableTarget)) {
  html = html.replace(tableTarget, tableReplacement);
  console.log('Table button Boleta added!');
} else {
  console.error('Could not find tableTarget');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('File saved successfully!');
