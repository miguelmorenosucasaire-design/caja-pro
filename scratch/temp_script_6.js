// =============================================================
        // CONTROL DE FORMATO Y ESTILO DEL VOUCHER Y PREVISUALIZADOR PDF
        // =============================================================
        let currentVoucherFormato = 'doble'; // 'doble' (media carta x2) o 'simple' (1 recibo)
        let currentVoucherEstilo = 'color';  // 'color' (oficial ambos color), 'combinado' o 'azul'
        let calendarizacionGlobal = [];

        // Estado del Previsualizador PDF
        let vistaActualComprobante = 'voucher'; // 'voucher' o 'pdf'
        let ultimoPdfBlob = null;
        let ultimoPdfBlobUrl = null;
        let ultimoPdfFilename = 'Comprobante_Pago.pdf';
        let isGeneratingPdf = false;

        // Navegación directa desde la Ficha del Estudiante a la Emisión de Boleta
        function irAFacturaDesdeFichaEstudiante(reciboId = null) {
            const est = window.currentFichaEstudianteData;
            cerrarModalFichaEstudiante();

            if (reciboId) {
                verBoletaDirecta(reciboId);
                return;
            }

            abrirModalNuevoMovimiento();
            setTimeout(() => {
                if (!est) return;
                if (document.getElementById('form-nombre')) document.getElementById('form-nombre').value = est.nombre || '';
                if (document.getElementById('form-dni')) document.getElementById('form-dni').value = est.dni || '';
                if (document.getElementById('form-telefono')) document.getElementById('form-telefono').value = est.telefono || '';
                if (document.getElementById('form-carrera')) document.getElementById('form-carrera').value = est.carrera || '';
                if (document.getElementById('form-grupo')) document.getElementById('form-grupo').value = est.grupo || '';
                actualizarBoletaModalEnVivo();
            }, 100);
        }

        // Alternar entre Vista Comprobante (Edición en vivo) y Previsualizador PDF Oficial
        function cambiarVistaComprobante(vista) {
            vistaActualComprobante = vista;
            const tabVoucher = document.getElementById('tab-vista-voucher');
            const tabPdf = document.getElementById('tab-vista-pdf');
            const contenedorVoucher = document.getElementById('contenedor-impresion-factura');
            const contenedorPdf = document.getElementById('contenedor-previsualizador-pdf');
            const actionsBarPdf = document.getElementById('pdf-preview-actions-bar');

            if (vista === 'pdf') {
                if (tabPdf) {
                    tabPdf.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2';
                }
                if (tabVoucher) {
                    tabVoucher.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2';
                }
                if (contenedorVoucher) contenedorVoucher.style.display = 'none';
                if (contenedorPdf) {
                    contenedorPdf.classList.remove('hidden');
                    contenedorPdf.style.display = 'flex';
                }

                // Generar o refrescar la previsualización del PDF
                actualizarPrevisualizadorPDF();
            } else {
                if (tabVoucher) {
                    tabVoucher.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-2';
                }
                if (tabPdf) {
                    tabPdf.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2';
                }
                if (contenedorPdf) {
                    contenedorPdf.classList.add('hidden');
                    contenedorPdf.style.display = 'none';
                }
                if (contenedorVoucher) contenedorVoucher.style.display = 'flex';
            }
        }

        // Abrir directamente el previsualizador configurando opcionalmente el formato ('simple' o 'doble')
        function abrirPrevisualizadorPDF(tipo = null) {
            if (tipo) {
                setFormatoVoucher(tipo);
            }
            cambiarVistaComprobante('pdf');
        }

        // Generador centralizado de Blob PDF usando html2pdf directamente sobre el DOM renderizado (Sin pantallas en blanco)
        async function generarBlobPDF(esDoble = true) {
            if (typeof html2pdf === 'undefined') {
                throw new Error('La librería html2pdf.js aún no está disponible');
            }

            const contenedor = document.getElementById('contenedor-impresion-factura');
            const copiaVoucher = document.getElementById('contenedor-comprobante-copia');
            const separadorCorte = document.getElementById('separador-corte-talonario');
            if (!contenedor) throw new Error('Contenedor del comprobante no encontrado');

            // Guardar estilos previos para restauración impecable
            const prevContenedorDisplay = contenedor.style.display;
            const prevCopiaDisplay = copiaVoucher ? copiaVoucher.style.display : '';
            const prevSeparadorDisplay = separadorCorte ? separadorCorte.style.display : '';

            // Ocultar elementos marcados con .no-print temporalmente para que no salgan en el PDF
            const noPrintElements = contenedor.querySelectorAll('.no-print');
            const savedNoPrintDisplays = [];
            noPrintElements.forEach(el => {
                savedNoPrintDisplays.push({ el, display: el.style.display });
                el.style.setProperty('display', 'none', 'important');
            });

            // Aplicar clase especial de ajuste milimétrico para 1 hoja Carta/A4
            contenedor.classList.add('generando-pdf-oficial');
            contenedor.style.display = 'flex';

            if (esDoble) {
                if (copiaVoucher) copiaVoucher.style.display = 'flex';
                if (separadorCorte) separadorCorte.style.display = 'block';
            } else {
                if (copiaVoucher) copiaVoucher.style.display = 'none';
                if (separadorCorte) separadorCorte.style.display = 'none';
            }

            // Extraer metadatos para nombre de archivo representativo
            const nroElem = document.getElementById('factura-nro-comprobante');
            const alumnoElem = document.getElementById('factura-alumno-nombre');
            const nro = (nroElem ? nroElem.innerText : '0000000').trim().replace(/[^a-zA-Z0-9]/g, '');
            const alumnoRaw = (alumnoElem ? alumnoElem.innerText : 'ALUMNO').trim();
            const alumnoClean = alumnoRaw.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ -]/g, '').replace(/\s+/g, '_');
            const filename = 'Comprobante_' + (nro || '0000') + '_' + (alumnoClean || 'ALUMNO') + '_' + (esDoble ? 'Doble' : 'Simple') + '.pdf';

            // Márgenes de hoja: 3.5mm arriba/abajo y 5mm a los lados para garantizar 1 sola hoja exacta
            const opt = {
                margin: [0.14, 0.20, 0.14, 0.20],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    logging: false
                },
                jsPDF: {
                    unit: 'in',
                    format: 'letter',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            try {
                // Asegurar que todas las imágenes del comprobante estén 100% listas antes del renderizado PDF
                const imagenesComprobante = contenedor.querySelectorAll('img');
                await Promise.all(Array.from(imagenesComprobante).map(img => {
                    if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                        setTimeout(resolve, 300);
                    });
                }));

                // Generar Blob PDF directamente
                const worker = html2pdf().set(opt).from(contenedor);
                const pdfBlob = await worker.outputPdf('blob');
                return { blob: pdfBlob, filename: filename };
            } finally {
                // Restaurar visibilidad previa y remover clase temporal
                contenedor.classList.remove('generando-pdf-oficial');
                contenedor.style.display = prevContenedorDisplay;
                if (copiaVoucher) copiaVoucher.style.display = prevCopiaDisplay;
                if (separadorCorte) separadorCorte.style.display = prevSeparadorDisplay;
                savedNoPrintDisplays.forEach(item => {
                    item.el.style.display = item.display;
                });
            }
        }

        async function actualizarPrevisualizadorPDF(force = false) {
            if (isGeneratingPdf && !force) return;
            isGeneratingPdf = true;

            const loading = document.getElementById('pdf-preview-loading');
            const frameContainer = document.getElementById('pdf-preview-frame-container');
            const iframe = document.getElementById('iframe-previsualizador-pdf');
            const badgeFormato = document.getElementById('badge-formato-preview');

            if (loading) {
                loading.classList.remove('hidden');
                loading.style.display = 'flex';
            }
            if (frameContainer) frameContainer.style.display = 'none';

            const esDoble = (currentVoucherFormato === 'doble');
            if (badgeFormato) {
                badgeFormato.innerText = esDoble ? '2 Versiones (Original + Copia)' : '1 Versión (Recibo Simple)';
            }

            try {
                const res = await generarBlobPDF(esDoble);
                ultimoPdfBlob = res.blob;
                ultimoPdfFilename = res.filename;

                if (ultimoPdfBlobUrl) {
                    URL.revokeObjectURL(ultimoPdfBlobUrl);
                }
                ultimoPdfBlobUrl = URL.createObjectURL(ultimoPdfBlob);

                if (iframe) {
                    // Cargar Blob en el iframe con toolbar para visualizar, imprimir y descargar con zoom nativo
                    iframe.src = ultimoPdfBlobUrl + '#toolbar=1&navpanes=0';
                }
            } catch (err) {
                console.error('Error generando previsualizador PDF:', err);
                mostrarNotificacion('No se pudo generar la previsualización del PDF: ' + err.message, 'error');
            } finally {
                if (loading) {
                    loading.classList.add('hidden');
                    loading.style.display = 'none';
                }
                if (frameContainer) frameContainer.style.display = 'block';
                isGeneratingPdf = false;
            }
        }

        // Descargar el PDF que se encuentra actualmente en el previsualizador
        function descargarPDFPrevisualizado() {
            if (ultimoPdfBlob) {
                const url = URL.createObjectURL(ultimoPdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = ultimoPdfFilename || 'Comprobante.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 4000);
                mostrarNotificacion('Comprobante PDF descargado exitosamente', 'exito');
            } else {
                exportarFacturaPDF(currentVoucherFormato);
            }
        }

        // Imprimir directamente desde el PDF renderizado en el previsualizador
        function imprimirPDFPrevisualizado() {
            const iframe = document.getElementById('iframe-previsualizador-pdf');
            if (iframe && iframe.contentWindow) {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    return;
                } catch (e) {
                    console.warn('Fallback a window.print():', e);
                }
            }
            window.print();
        }

        // Exportar / Descargar Factura en PDF (1 Versión Simple o 2 Versiones Doble)
        async function exportarFacturaPDF(tipo = null) {
            const esDoble = tipo ? (tipo === 'doble') : (currentVoucherFormato === 'doble');
            const btns = document.querySelectorAll('.btn-exportar-pdf-voucher');
            btns.forEach(b => { b.disabled = true; b.classList.add('opacity-50'); });

            mostrarNotificacion('Generando boleta en formato PDF de alta resolución...', 'info');

            try {
                const res = await generarBlobPDF(esDoble);
                const url = URL.createObjectURL(res.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 4000);

                mostrarNotificacion('¡Boleta PDF (' + (esDoble ? '2 Versiones' : '1 Versión') + ') descargada con éxito!', 'exito');
            } catch (err) {
                console.error('Error exportando factura a PDF:', err);
                mostrarNotificacion('Error al exportar la boleta a PDF: ' + err.message, 'error');
            } finally {
                btns.forEach(b => { b.disabled = false; b.classList.remove('opacity-50'); });
            }
        }

        // Imprimir Factura seleccionando la versión ('simple' o 'doble')
        function imprimirFacturaVersion(tipo = null) {
            if (tipo === 'doble') {
                setFormatoVoucher('doble');
            } else if (tipo === 'simple') {
                setFormatoVoucher('simple');
            }

            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                imprimirPDFPrevisualizado();
                return;
            }

            setTimeout(() => {
                window.print();
            }, 100);
        }

        function setFormatoVoucher(formato) {
            currentVoucherFormato = formato;
            const btnDoble = document.getElementById('btn-formato-doble');
            const btnSimple = document.getElementById('btn-formato-simple');
            const copiaVoucher = document.getElementById('contenedor-comprobante-copia');
            const separadorCorte = document.getElementById('separador-corte-talonario');

            if (formato === 'doble') {
                if (btnDoble) {
                    btnDoble.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                }
                if (btnSimple) {
                    btnSimple.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                }
                if (copiaVoucher) copiaVoucher.style.display = 'flex';
                if (separadorCorte) separadorCorte.style.display = 'block';
            } else {
                if (btnSimple) {
                    btnSimple.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                }
                if (btnDoble) {
                    btnDoble.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
                }
                if (copiaVoucher) copiaVoucher.style.display = 'none';
                if (separadorCorte) separadorCorte.style.display = 'none';
            }

            // Si el previsualizador PDF está activo, regenerar la vista previa automáticamente
            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                actualizarPrevisualizadorPDF();
            }
        }

        function setEstiloVoucher(estilo) {
            currentVoucherEstilo = estilo;
            const btnComb = document.getElementById('btn-estilo-combinado');
            const btnCombInv = document.getElementById('btn-estilo-combinado-inv');
            const btnColor = document.getElementById('btn-estilo-color');
            const btnAzul = document.getElementById('btn-estilo-azul');
            const vOficial = document.getElementById('contenedor-comprobante-oficial');
            const vCopia = document.getElementById('contenedor-comprobante-copia');
            const imgEscudoOficial = document.getElementById('img-escudo-oficial');
            const imgEscudoCopia = document.getElementById('img-escudo-copia');
            const imgMineduOficial = document.getElementById('img-minedu-oficial');
            const imgMineduCopia = document.getElementById('img-minedu-copia');

            // Reset classes on buttons
            [btnComb, btnCombInv, btnColor, btnAzul].forEach(btn => {
                if (btn) btn.className = 'px-2 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
            });

            if (estilo === 'combinado') {
                // 1° Color Oficial y 2° Tinta Azul Talonario
                if (btnComb) btnComb.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (vOficial) { vOficial.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_ingreso.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_azul.png';
                if (imgMineduOficial) imgMineduOficial.src = '/public/img/minedu_azul.svg';
                if (imgMineduCopia) imgMineduCopia.src = '/public/img/minedu_copia_azul.svg';
            } else if (estilo === 'combinado-inv') {
                // 1° Tinta Azul y 2° Color Oficial
                if (btnCombInv) btnCombInv.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1';
                if (vOficial) { vOficial.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_azul.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_ingreso.png';
                if (imgMineduOficial) imgMineduOficial.src = '/public/img/minedu_copia_azul.svg';
                if (imgMineduCopia) imgMineduCopia.src = '/public/img/minedu_azul.svg';
            } else if (estilo === 'color') {
                // Ambos a color oficial
                if (btnColor) btnColor.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                if (vOficial) { vOficial.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.remove('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_ingreso.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_ingreso.png';
                if (imgMineduOficial) imgMineduOficial.src = '/public/img/minedu_azul.svg';
                if (imgMineduCopia) imgMineduCopia.src = '/public/img/minedu_azul.svg';
            } else if (estilo === 'azul') {
                // Ambos en tinta azul monocromática
                if (btnAzul) btnAzul.className = 'px-2.5 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
                if (vOficial) { vOficial.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (vCopia) { vCopia.classList.add('recibo--copia', 'voucher-estilo-azul'); }
                if (imgEscudoOficial) imgEscudoOficial.src = '/public/img/escudo_recibo_azul.png';
                if (imgEscudoCopia) imgEscudoCopia.src = '/public/img/escudo_recibo_azul.png';
                if (imgMineduOficial) imgMineduOficial.src = '/public/img/minedu_copia_azul.svg';
                if (imgMineduCopia) imgMineduCopia.src = '/public/img/minedu_copia_azul.svg';
            }

            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                actualizarPrevisualizadorPDF();
            }
        }

        // Descargar recibo oficial directamente en formato Excel .xlsx
        function descargarReciboExcel() {
            if (!currentFacturaReciboId) {
                mostrarNotificacion('Seleccione primero un recibo para descargar', 'advertencia');
                return;
            }
            window.location.href = '/api/movimientos/' + currentFacturaReciboId + '/recibo-excel';
            mostrarNotificacion('Descargando recibo oficial en formato Excel...', 'exito');
        }

        // Modificar la fecha de emisión del recibo actual
        async function cambiarFechaEmisionFactura(nuevaFecha) {
            if (!currentFacturaReciboId) return;
            if (!nuevaFecha) return;

            try {
                const res = await fetch('/api/movimientos/' + currentFacturaReciboId + '/fecha', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fecha: nuevaFecha })
                });
                const data = await res.json();
                if (data.success) {
                    // Actualizar en el objeto global
                    const m = (movimientosGlobales || []).find(x => x.id == currentFacturaReciboId);
                    if (m) m.fecha = nuevaFecha;

                    // Actualizar las tablas de día / mes / año en el voucher
                    const parts = nuevaFecha.split('-');
                    if (parts.length === 3) {
                        const dia = parts[2].padStart(2, '0');
                        const mes = parts[1].padStart(2, '0');
                        const ano = parts[0].slice(-2);

                        const elDia = document.getElementById('factura-dia');
                        const elMes = document.getElementById('factura-mes');
                        const elAno = document.getElementById('factura-ano');
                        if (elDia) elDia.innerText = dia;
                        if (elMes) elMes.innerText = mes;
                        if (elAno) elAno.innerText = ano;

                        const copiaDia = document.getElementById('copia-factura-dia');
                        const copiaMes = document.getElementById('copia-factura-mes');
                        const copiaAno = document.getElementById('copia-factura-ano');
                        if (copiaDia) copiaDia.innerText = dia;
                        if (copiaMes) copiaMes.innerText = mes;
                        if (copiaAno) copiaAno.innerText = ano;
                    }

                    mostrarNotificacion('Fecha de emisión actualizada a ' + nuevaFecha + ' y guardada en Excel', 'exito');
                } else {
                    mostrarNotificacion(data.error || 'Error al actualizar fecha', 'error');
                }
            } catch (e) {
                console.error('Error actualizando fecha:', e);
                mostrarNotificacion('Error de conexión al actualizar fecha', 'error');
            }
        }

        function establecerFechaHoyFactura() {
            const hoy = new Date().toISOString().split('T')[0];
            const inp = document.getElementById('factura-fecha-emision-input');
            if (inp) {
                inp.value = hoy;
                cambiarFechaEmisionFactura(hoy);
            }
        }

        // =============================================================
        // MODAL Y EMISIÓN A NUEVO ESTUDIANTE HOY
        // =============================================================
        function abrirModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (!modal) return;
            const hoy = new Date().toISOString().split('T')[0];
            const inpFecha = document.getElementById('modal-nef-fecha');
            if (inpFecha) inpFecha.value = hoy;

            // Poblar y sincronizar barrita de docentes
            poblarSelectDocentesNuevoEstudiante();
            actualizarDocenteSugeridoNuevoEstudiante();

            modal.classList.remove('hidden');
        }

        function cerrarModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (modal) modal.classList.add('hidden');
        }

        // =============================================================
        // BANNER DE ACCIÓN RÁPIDA: VER BOLETA PARA IMPRIMIR O DESCARGAR
        // =============================================================
        function mostrarBannerAccionBoleta(info = {}) {
            const banner = document.getElementById('banner-accion-boleta-generada');
            if (!banner) return;
            const elNro = document.getElementById('banner-boleta-nro');
            const elNom = document.getElementById('banner-boleta-nombre');
            const elMonto = document.getElementById('banner-boleta-monto');
            if (elNro) elNro.innerText = info.comprobante ? (info.comprobante.startsWith('N°') ? info.comprobante : `N° ${info.comprobante}`) : 'Oficial';
            if (elNom) elNom.innerText = info.estudiante || '';
            if (elMonto) elMonto.innerText = info.monto ? `S/. ${Number(info.monto).toFixed(2)}` : '';
            banner.classList.remove('hidden');
        }

        function cerrarBannerAccionBoleta() {
            const banner = document.getElementById('banner-accion-boleta-generada');
            if (banner) banner.classList.add('hidden');
        }

        async function guardarNuevoEstudianteConRecibo(e) {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-nuevo-est-recibo');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Emitiendo Recibo...</span>';
            }

            const payload = {
                dni: document.getElementById('modal-nef-dni').value.trim(),
                nombre: document.getElementById('modal-nef-nombre').value.trim(),
                telefono: document.getElementById('modal-nef-telefono').value.trim(),
                carrera: document.getElementById('modal-nef-carrera').value,
                turno: document.getElementById('modal-nef-turno').value,
                docente: (document.getElementById('modal-nef-docente')?.value || '').trim(),
                fecha: document.getElementById('modal-nef-fecha').value,
                monto: parseFloat(document.getElementById('modal-nef-monto').value) || 150,
                concepto: document.getElementById('modal-nef-concepto').value.trim(),
                notas: document.getElementById('modal-nef-notas').value.trim()
            };

            try {
                const res = await fetch('/api/estudiantes/nuevo-con-recibo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success) {
                    cerrarModalNuevoEstudianteRecibo();

                    // Recargar datos del sistema
                    await cargarTodo();

                    // 1. Cambiar automáticamente a la sección FACTURA (Boleta Oficial)
                    cambiarSeccion('factura');

                    // Asegurar que las listas y selectores de estudiantes estén actualizados
                    if (typeof poblarSelectorEstudiantesOpciones === 'function') {
                        poblarSelectorEstudiantesOpciones('todos');
                    }

                    // 2. Seleccionar directamente el nuevo comprobante en la factura
                    if (data.movimiento_id) {
                        const selRec = document.getElementById('factura-recibo-select');
                        if (selRec) selRec.value = data.movimiento_id;
                        seleccionarFacturaRecibo(data.movimiento_id, true);
                    }

                    // 3. Asegurar vista de comprobante oficial (voucher listo para imprimir)
                    cambiarVistaComprobante('voucher');

                    // 4. Scroll suave directo al contenedor del comprobante oficial
                    const contBoleta = document.getElementById('contenedor-comprobante-oficial') || document.getElementById('contenedor-impresion-factura');
                    if (contBoleta) {
                        contBoleta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        contBoleta.classList.add('ring-4', 'ring-emerald-500', 'shadow-2xl', 'transition-all');
                        setTimeout(() => contBoleta.classList.remove('ring-4', 'ring-emerald-500', 'shadow-2xl'), 3500);
                    }

                    // 5. Mostrar banner flotante de acción inmediata para IMPRIMIR o DESCARGAR
                    const nroComp = data.comprobante ? String(data.comprobante).replace(/\D/g, '').padStart(7, '0') : (data.movimiento_id ? String(data.movimiento_id).padStart(7, '0') : '');
                    mostrarBannerAccionBoleta({
                        estudiante: payload.nombre,
                        comprobante: nroComp,
                        monto: payload.monto,
                        carrera: payload.carrera,
                        turno: payload.turno,
                        movimiento_id: data.movimiento_id
                    });

                    mostrarNotificacion(`✅ Alumno ${payload.nombre} registrado con éxito. Boleta N° ${nroComp} lista para imprimir o descargar.`, 'exito');
                } else {
                    mostrarNotificacion(data.error || 'Error al emitir comprobante', 'error');
                }
            } catch (err) {
                console.error(err);
                mostrarNotificacion('Error de conexión al emitir comprobante', 'error');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-receipt"></i><span>Emitir Recibo y Registrar Alumno</span>';
                }
            }
        }

        // =============================================================
        // MODAL Y CALENDARIZACIÓN DE INGRESOS
        // =============================================================
        function abrirModalCalendarizacion() {
            const modal = document.getElementById('modal-calendarizacion-ingresos');
            if (!modal) return;
            modal.classList.remove('hidden');
            cargarCalendarizacion();
        }

        function cerrarModalCalendarizacion() {
            const modal = document.getElementById('modal-calendarizacion-ingresos');
            if (modal) modal.classList.add('hidden');
        }

        // =============================================================
        // MONITOR DE SALUD E INTEGRIDAD DEL SISTEMA (FASE 1)
        // =============================================================
        async function abrirModalSaludSistema() {
            const modal = document.getElementById('modal-salud-sistema');
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            await cargarSaludSistema();
        }

        function cerrarModalSaludSistema() {
            const modal = document.getElementById('modal-salud-sistema');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        }

        async function cargarSaludSistema() {
            try {
                const res = await fetch('/api/sistema/salud-integridad');
                const data = await res.json();
                if (data.ok) {
                    const elHeadEstado = document.getElementById('header-salud-estado');
                    if (elHeadEstado) elHeadEstado.innerText = data.sqlite.estado || 'ÓPTIMO';

                    const elSqliteEstado = document.getElementById('salud-sqlite-estado');
                    if (elSqliteEstado) elSqliteEstado.innerText = data.sqlite.estado || 'OPTIMO';

                    const elCheck = document.getElementById('salud-sqlite-check');
                    if (elCheck) elCheck.innerText = data.sqlite.integrity_check || 'ok';

                    const elSha = document.getElementById('salud-sqlite-sha');
                    if (elSha) elSha.innerText = (data.sqlite.sha256 || '').slice(0, 16) + '...';

                    const elMovs = document.getElementById('salud-sqlite-movs');
                    if (elMovs) elMovs.innerText = (data.sqlite.registros && data.sqlite.registros.movimientos) || 0;

                    const elEst = document.getElementById('salud-sqlite-est');
                    if (elEst) elEst.innerText = (data.sqlite.registros && data.sqlite.registros.estudiantes) || 0;

                    const elExcelEstado = document.getElementById('salud-excel-estado');
                    if (elExcelEstado) elExcelEstado.innerText = data.excel.existe ? 'SINCRONIZADO' : 'NO DETECTADO';

                    const elTamano = document.getElementById('salud-excel-tamano');
                    if (elTamano) elTamano.innerText = Math.round((data.excel.tamano_bytes || 0) / 1024) + ' KB';

                    const elCola = document.getElementById('salud-excel-cola');
                    if (elCola) elCola.innerText = data.excel.cola_pendiente ? 'EN COLA' : 'AL DÍA (0 PENDIENTES)';

                    const elRespaldos = document.getElementById('salud-respaldos-total');
                    if (elRespaldos) elRespaldos.innerText = (data.respaldos && data.respaldos.total_snapshots) || 0;
                }
            } catch (e) {
                console.error('Error al cargar salud del sistema:', e);
            }
        }

        // =============================================================
        // ARQUEO DIARIO DE CAJA CHICA Y RECURSOS PROPIOS (FASE 3)
        // =============================================================
        let arqueoDataActual = null;

        async function abrirModalArqueoDiario(fecha = null) {
            const modal = document.getElementById('modal-arqueo-diario');
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.style.display = 'flex';

            const inpFecha = document.getElementById('arqueo-fecha-input');
            if (inpFecha && !inpFecha.value) {
                inpFecha.value = fecha || new Date().toISOString().split('T')[0];
            }
            await cargarArqueoDiario(inpFecha ? inpFecha.value : null);
        }

        function cerrarModalArqueoDiario() {
            const modal = document.getElementById('modal-arqueo-diario');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        }

        async function cargarArqueoDiario(fecha = null) {
            try {
                const url = fecha ? `/api/reportes/arqueo-diario?fecha=${fecha}` : '/api/reportes/arqueo-diario';
                const res = await fetch(url);
                const data = await res.json();
                if (!data.ok) return;
                arqueoDataActual = data;

                const elInst = document.getElementById('arqueo-inst-nombre');
                if (elInst) elInst.innerText = data.institucion || 'CETPRO MICAELA BASTIDAS PUYUCAMA';

                const elFechaDisp = document.getElementById('arqueo-fecha-display');
                if (elFechaDisp) elFechaDisp.innerText = data.fecha;

                const elSaldoAnt = document.getElementById('arqueo-saldo-anterior');
                if (elSaldoAnt) elSaldoAnt.innerText = 'S/. ' + Number(data.saldo_anterior || 0).toFixed(2);

                const elIngresos = document.getElementById('arqueo-ingresos-hoy');
                if (elIngresos) elIngresos.innerText = 'S/. ' + Number(data.ingresos_dia.total || 0).toFixed(2);

                const elRecibos = document.getElementById('arqueo-recibos-hoy');
                if (elRecibos) elRecibos.innerText = `${data.ingresos_dia.cantidad_recibos} comprobantes emitidos`;

                const elEgresos = document.getElementById('arqueo-egresos-hoy');
                if (elEgresos) elEgresos.innerText = 'S/. ' + Number(data.egresos_dia.total || 0).toFixed(2);

                const elSaldoCierre = document.getElementById('arqueo-saldo-cierre');
                if (elSaldoCierre) elSaldoCierre.innerText = 'S/. ' + Number(data.saldo_cierre_dia || 0).toFixed(2);

                // Desglose de billetes y monedas
                const tbody = document.getElementById('arqueo-tabla-desglose');
                if (tbody && data.desglose_efectivo_sugerido) {
                    tbody.innerHTML = data.desglose_efectivo_sugerido.map((item, idx) => {
                        return `
                            <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                <td class="py-1.5 px-3 font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                                    <i class="${item.valor >= 10 ? 'fa-solid fa-money-bill-wave text-emerald-600' : 'fa-solid fa-coins text-amber-500'}"></i>
                                    <span>${item.denominacion}</span>
                                </td>
                                <td class="py-1.5 px-3 text-right font-mono font-bold text-slate-600 dark:text-slate-300">
                                    S/. ${Number(item.valor).toFixed(2)}
                                </td>
                                <td class="py-1.5 px-3 text-center">
                                    <input type="number" min="0" value="${item.cantidad_sugerida}" 
                                        id="arqueo-qty-${idx}" data-val="${item.valor}"
                                        oninput="recalcularArqueoFisico()"
                                        class="w-16 text-center font-mono font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg py-1 px-1.5 text-xs focus:ring-2 focus:ring-indigo-500">
                                </td>
                                <td class="py-1.5 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white" id="arqueo-subtotal-${idx}">
                                    S/. ${Number(item.subtotal).toFixed(2)}
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
                recalcularArqueoFisico();
            } catch (e) {
                console.error('Error cargando arqueo:', e);
            }
        }

        function recalcularArqueoFisico() {
            if (!arqueoDataActual || !arqueoDataActual.desglose_efectivo_sugerido) return;
            let totalContado = 0;
            arqueoDataActual.desglose_efectivo_sugerido.forEach((item, idx) => {
                const inp = document.getElementById(`arqueo-qty-${idx}`);
                const qty = inp ? parseInt(inp.value, 10) || 0 : 0;
                const sub = qty * item.valor;
                totalContado += sub;
                const elSub = document.getElementById(`arqueo-subtotal-${idx}`);
                if (elSub) elSub.innerText = 'S/. ' + sub.toFixed(2);
            });

            const elTotalFisico = document.getElementById('arqueo-total-fisico');
            if (elTotalFisico) elTotalFisico.innerText = 'S/. ' + totalContado.toFixed(2);

            const saldoEsperado = Number(arqueoDataActual.saldo_cierre_dia || 0);
            const dif = totalContado - saldoEsperado;
            const elDif = document.getElementById('arqueo-diferencia');
            const elBadge = document.getElementById('arqueo-badge-cuadre');

            if (elDif) elDif.innerText = (dif >= 0 ? '+ S/. ' : '- S/. ') + Math.abs(dif).toFixed(2);
            if (elBadge) {
                if (Math.abs(dif) < 0.01) {
                    elBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                    elBadge.innerText = '✔ CAJA CUADRADA EXACTA';
                } else if (dif > 0) {
                    elBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
                    elBadge.innerText = '▲ SOBRANTE EN CAJA';
                } else {
                    elBadge.className = 'px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                    elBadge.innerText = '▼ FALTANTE EN CAJA';
                }
            }
        }

        function imprimirActaArqueo() {
            const printContent = document.getElementById('contenedor-impresion-arqueo');
            if (!printContent) return;
            const ventana = window.open('', '_blank');
            ventana.document.write(`
                <html>
                    <head>
                        <title>Acta de Arqueo Diario - CETPRO San Miguel</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <style>
                            body { font-family: "Arial Narrow", Arial, sans-serif; padding: 20px; color: #0f172a; margin: 0; }
                            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11pt; }
                            th { background: #f1f5f9; text-align: left; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .font-bold { font-weight: bold; }
                            .border-b { border-bottom: 1px solid #000; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>
                        ${printContent.innerHTML}
                    
    <!-- ======================================================== -->
    <!-- MODAL: ASIGNAR DEUDA / CUOTA FALTANTE A ESTUDIANTE       -->
    <!-- ======================================================== -->
    <div id="modal-asignar-deudor" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center hidden p-4 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all my-auto">
            <div class="p-4 sm:p-5 bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white flex items-center justify-between border-b border-amber-900/40">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-lg shadow-inner">
                        <i class="fa-solid fa-user-tag"></i>
                    </div>
                    <div>
                        <h3 class="font-extrabold text-base text-white">Asignar Cuota Pendiente / Deudor</h3>
                        <p class="text-[11px] text-amber-200">Selecciona al estudiante matriculado y define el saldo faltante de su cuota o módulo.</p>
                    </div>
                </div>
                <button type="button" onclick="cerrarModalAsignarDeudor()" class="text-slate-400 hover:text-white text-lg p-1.5 rounded-xl hover:bg-white/10 transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form id="form-asignar-deudor" onsubmit="guardarAsignacionDeudor(event)" class="p-5 space-y-4 text-xs">
                <!-- Filtros para ubicar al estudiante -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filtrar por Especialidad</label>
                        <select id="modal-deudor-filtro-carrera" onchange="alFiltrarEstudiantesParaDeudor()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white">
                            <option value="">Todas las Especialidades</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Filtrar por Grupo / Sección</label>
                        <select id="modal-deudor-filtro-grupo" onchange="alFiltrarEstudiantesParaDeudor()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white">
                            <option value="">Todos los Grupos</option>
                        </select>
                    </div>
                </div>

                <!-- Selector de Estudiante -->
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Seleccionar Estudiante Matriculado (*)
                    </label>
                    <select id="modal-deudor-select-estudiante" onchange="alSeleccionarEstudianteParaDeudor(this.value)" required class="w-full bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 shadow-sm">
                        <option value="">-- Elige un estudiante de la lista oficial --</option>
                    </select>
                </div>

                <!-- Datos del Estudiante Seleccionado -->
                <div id="modal-deudor-info-estudiante" class="hidden bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                    <div class="flex justify-between items-center text-[11px]">
                        <span class="text-slate-500 dark:text-slate-400">DNI: <strong id="deudor-info-dni" class="text-slate-800 dark:text-white">-</strong></span>
                        <span class="text-slate-500 dark:text-slate-400">Celular: <strong id="deudor-info-tel" class="text-slate-800 dark:text-white">-</strong></span>
                    </div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400">
                        Especialidad / Grupo: <strong id="deudor-info-carrera" class="text-indigo-600 dark:text-indigo-400">-</strong>
                    </div>
                    <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold" id="deudor-info-pagado-historial">
                        Total Pagado Históricamente en Caja: S/. 0.00
                    </div>
                </div>

                <!-- Concepto / Módulo -->
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto o Módulo Adeudado (*)</label>
                    <input type="text" id="modal-deudor-concepto" required placeholder="Ej: Cuota 2 - Saldo Módulo I" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white">
                    <div class="flex flex-wrap gap-1 mt-1.5">
                        <button type="button" onclick="setDeudorConcepto('Saldo Cuota Módulo I')" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">+ Módulo I</button>
                        <button type="button" onclick="setDeudorConcepto('Saldo Cuota Módulo II')" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">+ Módulo II</button>
                        <button type="button" onclick="setDeudorConcepto('Segunda Cuota Matrícula')" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">+ Cuota 2</button>
                        <button type="button" onclick="setDeudorConcepto('Saldo Pendiente de Pensión')" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-[10px] font-bold text-slate-700 dark:text-slate-300">+ Saldo Pensión</button>
                    </div>
                </div>

                <!-- Montos: Costo Total, Ya Abonado, y Monto que Falta (ej: S/ 70) -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Costo Total (S/.)</label>
                        <input type="number" id="modal-deudor-monto-total" step="0.50" min="0" value="150" oninput="recalcularSaldoDeudor()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 dark:text-white text-xs">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ya Abonó (S/.)</label>
                        <input type="number" id="modal-deudor-monto-abonado" step="0.50" min="0" value="80" oninput="recalcularSaldoDeudor()" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    </div>
                    <div>
                        <label class="block font-bold text-rose-600 dark:text-rose-400 mb-1">Cuota que Falta (*)</label>
                        <input type="number" id="modal-deudor-monto-pendiente" step="0.50" min="0.50" value="70" required class="w-full bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 rounded-xl px-3 py-2 font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                    </div>
                </div>

                <!-- Fecha Límite y Notas -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Límite / Vencimiento</label>
                        <input type="date" id="modal-deudor-fecha-limite" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones / Notas</label>
                        <input type="text" id="modal-deudor-notas" placeholder="Ej: Compromiso de pago a fin de mes" class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white">
                    </div>
                </div>

                <div class="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onclick="cerrarModalAsignarDeudor()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancelar</button>
                    <button type="submit" class="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-600/30 transition flex items-center space-x-2">
                        <i class="fa-solid fa-floppy-disk"></i>
                        <span>Asignar y Guardar en Deudores</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

</body>
                </html>
            `);
            ventana.document.write('<' + 'script' + '>window.onload = function() { window.print(); window.close(); };<' + '/script' + '>');
            ventana.document.close();
        }

        // =============================================================
        // PERFILES Y ROLES DE ACCESO OPERATIVO (EXCLUSIVO: TESORERO Y DIRECTOR)
        // =============================================================
        function cambiarRolOperativo(rol) {
            if (rol !== 'Tesorero' && rol !== 'Director') {
                rol = 'Director';
            }
            localStorage.setItem('educaja_rol_activo', rol);
            const sel = document.getElementById('select-rol-activo');
            if (sel && sel.value !== rol) sel.value = rol;

            const badgeMap = {
                'Tesorero': '👔 Rol Activo: Tesorero Institucional (Acceso Total a Caja, Emisión y Balances)',
                'Director': '🏛️ Rol Activo: Director General (Auditoría, Supervisión y Control Total)'
            };
            mostrarNotificacion(badgeMap[rol] || `Rol cambiado a: ${rol}`, 'exito');
        }

        // Botón de Actualizar: Exclusivo para Tesorero y Director con recarga en tiempo real y animación
        async function ejecutarActualizacionCompleta() {
            const rolActual = localStorage.getItem('educaja_rol_activo') || 'Director';
            if (rolActual !== 'Tesorero' && rolActual !== 'Director') {
                mostrarNotificacion('⛔ Acción restringida: Solo el Tesorero y el Director pueden actualizar los datos.', 'error');
                return;
            }

            const btn = document.getElementById('btn-actualizar-sistema');
            const icon = btn ? btn.querySelector('i') : null;
            if (icon) icon.classList.add('fa-spin');
            if (btn) btn.disabled = true;

            try {
                mostrarNotificacion('⏳ Sincronizando base de datos, Excel y balances en tiempo real...', 'info');
                await cargarTodo();
                if (typeof cargarResultadosMensuales === 'function') await cargarResultadosMensuales();
                if (typeof cargarSaludSistema === 'function') await cargarSaludSistema();
                if (typeof cargarCalendarizacion === 'function') await cargarCalendarizacion();

                if (typeof seccionActualGlobal !== 'undefined' && seccionActualGlobal) {
                    cambiarSeccion(seccionActualGlobal);
                }

                mostrarNotificacion('✅ Sistema y balances actualizados con éxito en tiempo real (Tesorero / Director)', 'exito');
            } catch (err) {
                console.error('Error al actualizar datos:', err);
                mostrarNotificacion('❌ Error al actualizar datos: ' + (err.message || 'Desconocido'), 'error');
            } finally {
                if (icon) icon.classList.remove('fa-spin');
                if (btn) btn.disabled = false;
            }
        }

        async function cargarCalendarizacion() {
            const container = document.getElementById('cal-dias-container');
            if (container) {
                container.innerHTML = '<div class="text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-indigo-500"></i><p>Cargando calendarización...</p></div>';
            }

            try {
                const res = await fetch('/api/estudiantes/calendarizacion');
                const data = await res.json();

                if (data.success) {
                    calendarizacionGlobal = data.calendarizacion || [];

                    // Actualizar métricas
                    const elDias = document.getElementById('cal-stat-dias');
                    const elEsts = document.getElementById('cal-stat-estudiantes');
                    const elMonto = document.getElementById('cal-stat-monto');

                    let totalEsts = 0;
                    let totalMonto = 0;
                    calendarizacionGlobal.forEach(d => {
                        totalEsts += (d.total_estudiantes || 0);
                        totalMonto += (d.total_monto || 0);
                    });

                    if (elDias) elDias.innerText = data.dias_registrados || calendarizacionGlobal.length;
                    if (elEsts) elEsts.innerText = totalEsts;
                    if (elMonto) elMonto.innerText = 'S/. ' + totalMonto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    renderizarCalendarizacion(calendarizacionGlobal);
                } else {
                    if (container) container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar calendarización</div>';
                }
            } catch (err) {
                console.error(err);
                if (container) container.innerHTML = '<div class="p-4 text-center text-red-500">Error de conexión</div>';
            }
        }

        function renderizarCalendarizacion(lista) {
            const container = document.getElementById('cal-dias-container');
            if (!container) return;

            if (lista.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-slate-400">No se encontraron registros de ingresos para la búsqueda.</div>';
                return;
            }

            let html = '';
            lista.forEach((item, index) => {
                const fechaFormat = item.fecha ? item.fecha.split('-').reverse().join('/') : 'Sin Fecha';
                const totalMontoStr = 'S/. ' + (item.total_monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

                html += `
                    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition hover:border-indigo-400 dark:hover:border-indigo-600">
                        <div class="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 cursor-pointer" onclick="toggleDetalleDia(${index})">
                            <div class="flex items-center space-x-3">
                                <span class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                    <i class="fa-regular fa-calendar"></i>
                                </span>
                                <div>
                                    <span class="font-mono font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">${fechaFormat}</span>
                                    <span class="text-[10px] text-slate-400 ml-1 font-mono">(${item.fecha})</span>
                                </div>
                            </div>

                            <div class="flex items-center space-x-3">
                                <span class="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold px-2.5 py-1 rounded-lg text-[11px] border border-indigo-200 dark:border-indigo-800">
                                    👥 ${item.total_estudiantes} alumnos
                                </span>
                                <span class="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold px-2.5 py-1 rounded-lg text-[11px] border border-emerald-200 dark:border-emerald-800">
                                    💰 ${totalMontoStr}
                                </span>
                                <i id="icon-chevron-${index}" class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform"></i>
                            </div>
                        </div>

                        <!-- Lista de Estudiantes / Recibos de ese Día -->
                        <div id="detalle-dia-${index}" class="p-3 bg-white dark:bg-slate-900 ${index === 0 ? '' : 'hidden'} border-t border-slate-100 dark:border-slate-800/80">
                            <div class="overflow-x-auto custom-scrollbar">
                                <table class="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr class="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                                            <th class="py-1.5 px-2">Recibo</th>
                                            <th class="py-1.5 px-2">Estudiante</th>
                                            <th class="py-1.5 px-2">DNI</th>
                                            <th class="py-1.5 px-2">Especialidad</th>
                                            <th class="py-1.5 px-2 text-right">Monto</th>
                                            <th class="py-1.5 px-2 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                `;

                (item.recibos || []).forEach(r => {
                    const nroRecibo = r.comprobante ? ('N° ' + String(r.comprobante).padStart(7, '0')) : ('N° ' + r.id);
                    const montoFmt = 'S/. ' + (parseFloat(r.monto) || 150).toFixed(2);
                    html += `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td class="py-1.5 px-2 font-mono font-bold text-red-600">${nroRecibo}</td>
                            <td class="py-1.5 px-2 font-bold text-slate-800 dark:text-slate-200 uppercase">${r.nombre}</td>
                            <td class="py-1.5 px-2 font-mono text-slate-600 dark:text-slate-400">${r.dni || '-'}</td>
                            <td class="py-1.5 px-2 text-slate-600 dark:text-slate-400">${r.carrera || 'General'}</td>
                            <td class="py-1.5 px-2 text-right font-mono font-bold text-emerald-600">${montoFmt}</td>
                            <td class="py-1.5 px-2 text-center">
                                <button onclick="seleccionarDesdeCalendarizacion(${r.id})" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition flex items-center space-x-1 mx-auto">
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>Ver Recibo</span>
                                </button>
                            </td>
                        </tr>
                    `;
                });

                html += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        function toggleDetalleDia(idx) {
            const el = document.getElementById('detalle-dia-' + idx);
            const ico = document.getElementById('icon-chevron-' + idx);
            if (!el) return;
            if (el.classList.contains('hidden')) {
                el.classList.remove('hidden');
                if (ico) ico.classList.add('rotate-180');
            } else {
                el.classList.add('hidden');
                if (ico) ico.classList.remove('rotate-180');
            }
        }

        function filtrarCalendarizacionEnVivo(query) {
            if (!query || !query.trim()) {
                renderizarCalendarizacion(calendarizacionGlobal);
                return;
            }
            const q = query.trim().toLowerCase();
            const filtrada = calendarizacionGlobal.filter(d => {
                if (d.fecha && d.fecha.toLowerCase().includes(q)) return true;
                const tieneRecibo = (d.recibos || []).some(r => 
                    (r.nombre && r.nombre.toLowerCase().includes(q)) ||
                    (r.comprobante && String(r.comprobante).includes(q)) ||
                    (r.dni && String(r.dni).includes(q))
                );
                return tieneRecibo;
            });
            renderizarCalendarizacion(filtrada);
        }

        function seleccionarDesdeCalendarizacion(reciboId) {
            cerrarModalCalendarizacion();
            mostrarSeccion('factura');
            seleccionarFacturaRecibo(reciboId, true);
        }

        // =============================================================
        // SINCRONIZACIÓN AUTOMÁTICA DEL VOUCHER COPIA CON EL ORIGINAL
        // =============================================================
        function sincronizarCopiaVoucher() {
            // Sincronizar número de comprobante
            const origNro = document.getElementById('factura-nro-comprobante');
            const copiaNro = document.getElementById('copia-factura-nro-comprobante');
            if (origNro && copiaNro) copiaNro.innerText = origNro.innerText;

            // Sincronizar estudiante
            const origEst = document.getElementById('factura-estudiante');
            const copiaEst = document.getElementById('copia-factura-estudiante');
            if (origEst && copiaEst) copiaEst.innerText = origEst.innerText;

            // Sincronizar DNI
            const origDni = document.getElementById('factura-dni');
            const copiaDni = document.getElementById('copia-factura-dni');
            if (origDni && copiaDni) copiaDni.innerText = origDni.innerText;

            // Sincronizar especialidad
            const origEsp = document.getElementById('factura-carrera');
            const copiaEsp = document.getElementById('copia-factura-carrera');
            if (origEsp && copiaEsp) copiaEsp.innerText = origEsp.innerText;

            // Sincronizar celular
            const origCel = document.getElementById('factura-telefono');
            const copiaCel = document.getElementById('copia-factura-telefono');
            if (origCel && copiaCel) copiaCel.innerText = origCel.innerText;

            // Sincronizar casillas
            for (let i = 1; i <= 7; i++) {
                const origBox = document.getElementById('box-mod-' + i);
                const copiaBox = document.getElementById('copia-box-mod-' + i);
                if (origBox && copiaBox) copiaBox.innerText = origBox.innerText;
            }

            // Sincronizar constancia, fut y otros
            const origConst = document.getElementById('check-constancia');
            const copiaConst = document.getElementById('copia-check-constancia');
            if (origConst && copiaConst) copiaConst.innerText = origConst.innerText;

            const origFut = document.getElementById('check-fut');
            const copiaFut = document.getElementById('copia-check-fut');
            if (origFut && copiaFut) copiaFut.innerText = origFut.innerText;

            const origOtros = document.getElementById('factura-otros-texto');
            const copiaOtros = document.getElementById('copia-factura-otros-texto');
            if (origOtros && copiaOtros) copiaOtros.innerText = origOtros.innerText;

            // Sincronizar montos
            const origPUnit = document.getElementById('factura-precio-unit');
            const copiaPUnit = document.getElementById('copia-factura-precio-unit');
            if (origPUnit && copiaPUnit) copiaPUnit.innerText = origPUnit.innerText;

            const origAporte = document.getElementById('factura-monto-aporte');
            const copiaAporte = document.getElementById('copia-factura-monto-aporte');
            if (origAporte && copiaAporte) copiaAporte.innerText = origAporte.innerText;

            const origF1 = document.getElementById('factura-monto-fila1');
            const copiaF1 = document.getElementById('copia-factura-monto-fila1');
            if (origF1 && copiaF1) copiaF1.innerText = origF1.innerText;

            const origTotal = document.getElementById('factura-monto-total');
            const copiaTotal = document.getElementById('copia-factura-monto-total');
            if (origTotal && copiaTotal) copiaTotal.innerText = origTotal.innerText;

            const origConstMonto = document.getElementById('factura-monto-constancia');
            const copiaConstMonto = document.getElementById('copia-factura-monto-constancia');
            if (origConstMonto && copiaConstMonto) {
                copiaConstMonto.innerText = origConstMonto.innerText;
                if (origConstMonto.classList.contains('monto--tachado')) {
                    copiaConstMonto.classList.add('monto--tachado');
                } else {
                    copiaConstMonto.classList.remove('monto--tachado');
                }
            }

            const origFutMonto = document.getElementById('factura-monto-fut');
            const copiaFutMonto = document.getElementById('copia-factura-monto-fut');
            if (origFutMonto && copiaFutMonto) {
                copiaFutMonto.innerText = origFutMonto.innerText;
                if (origFutMonto.classList.contains('monto--tachado')) {
                    copiaFutMonto.classList.add('monto--tachado');
                } else {
                    copiaFutMonto.classList.remove('monto--tachado');
                }
            }

            // Sincronizar fecha
            const origDia = document.getElementById('factura-dia');
            const copiaDia = document.getElementById('copia-factura-dia');
            if (origDia && copiaDia) copiaDia.innerText = origDia.innerText;

            const origMes = document.getElementById('factura-mes');
            const copiaMes = document.getElementById('copia-factura-mes');
            if (origMes && copiaMes) copiaMes.innerText = origMes.innerText;

            const origAno = document.getElementById('factura-ano');
            const copiaAno = document.getElementById('copia-factura-ano');
            if (origAno && copiaAno) copiaAno.innerText = origAno.innerText;
        }

        let myChart = null;
        let movimientosGlobales = [];
        let estudiantesGlobales = [];
        let respaldosGlobales = [];
        let gruposGlobales = [];
        let docentesGlobales = [];
        let modoVistaEstudiantes = 'grid';

        document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];

        // CAMBIO DE PESTAÑAS
        let seccionActivaActual = 'dashboard';
        let currentPlantillaGrupoId = null;

        function cambiarSeccion(seccion) {
            if (seccion === 'factura') {
                abrirModalNuevoMovimiento();
                return;
            }
            seccionActivaActual = seccion;

            // Header superior visible exclusivamente en el INICIO (dashboard)
            const mainHeader = document.getElementById('main-header');
            if (mainHeader) {
                if (seccion === 'dashboard') {
                    mainHeader.classList.remove('hidden');
                } else {
                    mainHeader.classList.add('hidden');
                }
            }

            const secciones = [
                'dashboard', 'resultados', 'grupos', 'estudiantes', 
                'control-pagos', 'deudores', 'caja', 'diario', 
                'docentes', 'factura', 'respaldos', 'configuracion', 'carreras'
            ];
            
            secciones.forEach(s => {
                const secEl = document.getElementById('section-' + s);
                const navEl = document.getElementById('nav-' + s);

                if (secEl) {
                    secEl.classList.add('hidden');
                    secEl.classList.remove('section-activa-print');
                }
                if (navEl) {
                    navEl.classList.remove('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/30', 'bg-slate-800');
                    navEl.classList.add('text-slate-300', 'hover:bg-slate-800/80', 'hover:text-white');
                }
            });

            const activeSec = document.getElementById('section-' + seccion);
            const activeNav = document.getElementById('nav-' + seccion);

            if (activeSec) {
                activeSec.classList.remove('hidden');
                activeSec.classList.add('section-activa-print');
            }

            // Cargas y sincronizaciones reactivas por sección
            if (seccion === 'diario') {
                const inputF = document.getElementById('diario-selector-fecha');
                if (inputF && !inputF.value) {
                    // Inicializar con la fecha de hoy por defecto
                    inputF.value = new Date().toISOString().split('T')[0];
                }
                if (typeof cargarDiario === 'function') {
                    cargarDiario(inputF ? inputF.value : '');
                }
                if (typeof cargarCalendarizacionDiario === 'function') {
                    cargarCalendarizacionDiario();
                }
            } else if (seccion === 'control-pagos') {
                if (typeof cargarControlPagos === 'function') {
                    cargarControlPagos();
                }
            } else if (seccion === 'deudores') {
                if (typeof cargarDeudores === 'function') {
                    cargarDeudores();
                }
            }
            if (activeNav) {
                activeNav.classList.remove('text-slate-300', 'hover:bg-slate-800/80', 'hover:text-white');
                activeNav.classList.add('bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-600/30');
            }

            const titulos = {
                dashboard: ['INICIO · Panel Financiero General', 'CETPRO San Miguel - Micaela Bastidas Puyucama'],
                resultados: ['RESUMEN ANUAL · Estado de Resultados Mes a Mes', 'Balance de ingresos, salidas y superávit consolidado de cada mes del año escolar'],
                caja: ['INGRESOS (CAJA) · Flujo de Operaciones', 'Registro oficial de todas las operaciones de entrada y salida'],
                estudiantes: ['ESTUDIANTES · Plantilla General y Saldos', 'Nómina oficial de 176 estudiantes, control de cuotas y estados de cuenta'],
                docentes: ['DOCENTES · Plantilla Profesional y Horas', 'Liquidación de honorarios y control de cobros generados por docente'],
                grupos: ['SECCIONES / GRUPOS · Plantillas y Encargados', 'Plantilla individual por cada sección con su docente'],
                deudores: ['DEUDORES · Control de Pagos Pendientes', 'Reporte consolidado de estudiantes con saldo pendiente de pago'],
                respaldos: ['BACKUP BD · Base de Datos Criptográfica', 'Gestión de copias de seguridad automáticas y hashes SHA-256'],
                'control-pagos': ['CONTROL PAGOS (MES A MES) · Matriz Anual', 'Cuadrícula oficial de aportes mensuales de cada estudiante'],
                diario: ['DIARIO & NOTAS · Registro Académico y Bitácora', 'Historial cronológico de eventos institucionales y caja diaria'],
                factura: ['FACTURA / BOLETA · Emisión de Comprobantes Oficiales', 'Generación e impresión de boletas, recibos y facturas oficiales'],
                configuracion: ['CONFIGURACIÓN · Sedes, RUC y Facturación', 'Gestión centralizada del campus, sedes, RUC, datos de contacto manual y comprobantes'],
                carreras: ['ESPECIALIDADES / CARRERAS · Oferta Educativa', 'Control y administración de especialidades técnicas activas']
            };

            if (titulos[seccion]) {
                const titleEl = document.getElementById('page-title');
                const subtitleEl = document.getElementById('page-subtitle');
                const activeSheetNameEl = document.getElementById('page-active-sheet-name');
                if (titleEl) titleEl.textContent = titulos[seccion][0];
                if (subtitleEl && activeSheetNameEl) {
                    activeSheetNameEl.textContent = 'Hoja Activa: ' + titulos[seccion][0].split(' · ')[0];
                }
            }

            if (seccion === 'carreras') {
                cargarCarreras();
            } else if (seccion === 'configuracion') {
                if (typeof cargarTarifasEnConfiguracion === 'function') cargarTarifasEnConfiguracion();
                cargarConfiguracion();
                cargarCarreras();
            } else if (seccion === 'respaldos') {
                cargarBackups();
            } else if (seccion === 'grupos') {
                cargarGrupos();
            }

            const mainEl = document.querySelector('main');
            if (mainEl) mainEl.scrollTop = 0;
        }

        // =========================================================================
        // EXPORTACIÓN A PDF Y EXCEL CONSERVANDO EL DISEÑO DE LA HOJA SELECCIONADA
        // =========================================================================
        function exportarHojaPDF() {
            const titulosArchivos = {
                dashboard: 'CETPRO_Micaela_Bastidas_INICIO_2026',
                resultados: 'CETPRO_Micaela_Bastidas_RESUMEN_ANUAL_2026',
                caja: 'CETPRO_Micaela_Bastidas_LIBRO_CAJA_2026',
                estudiantes: 'CETPRO_Micaela_Bastidas_ESTUDIANTES_2026',
                grupos: 'CETPRO_Micaela_Bastidas_SECCIONES_Y_GRUPOS_2026',
                docentes: 'CETPRO_Micaela_Bastidas_DOCENTES_2026',
                deudores: 'CETPRO_Micaela_Bastidas_DEUDORES_2026',
                'control-pagos': 'CETPRO_Micaela_Bastidas_CONTROL_PAGOS_2026',
                diario: 'CETPRO_Micaela_Bastidas_DIARIO_Y_NOTAS_2026',
                factura: 'CETPRO_Micaela_Bastidas_COMPROBANTE_PAGO_2026',
                respaldos: 'CETPRO_Micaela_Bastidas_RESPALDOS_2026'
            };

            const originalTitle = document.title;
            const pdfName = titulosArchivos[seccionActivaActual] || 'CETPRO_Micaela_Bastidas_Reporte_2026';
            document.title = pdfName;

            // Abrir diálogo de impresión nativo (permite Guardar como PDF de alta resolución)
            window.print();

            setTimeout(() => {
                document.title = originalTitle;
            }, 1000);
        }

        function exportarHojaExcel() {
            let sheetName = 'estudiantes';
            if (seccionActivaActual === 'grupos') sheetName = 'grupos';
            else if (seccionActivaActual === 'caja') sheetName = 'ingresos';
            else if (seccionActivaActual === 'deudores') sheetName = 'deudores';
            else if (seccionActivaActual === 'docentes') sheetName = 'docentes';
            else if (seccionActivaActual === 'resultados') {
                window.location.href = '/api/exportar/resultados';
                return;
            }

            window.location.href = `/api/exportar/hoja?sheet=${sheetName}`;
        }

        async function exportarYRespaldar() {
            try {
                const res = await fetch('/api/backups/crear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ motivo: 'Respaldo_Rapido' })
                });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ Respaldo de seguridad creado exitosamente: ${data.archivo}`);
                    await cargarRespaldos();
                } else {
                    alert(`Error al respaldar: ${data.error || 'Fallo desconocido'}`);
                }
            } catch (err) {
                alert('Error de conexión al generar el respaldo.');
            }
        }

        function filtrarCajaPorGrupo(nombreGrupo) {
            cambiarSeccion('caja');
            setTimeout(() => {
                const sel = document.getElementById('filtro-grupo');
                if (sel) {
                    sel.value = nombreGrupo;
                    filtrarMovimientos();
                }
            }, 100);
        }

        // =========================================================================
        // CONTROL Y NAVEGACIÓN DE PLANTILLAS POR SECCIÓN / GRUPO
        // =========================================================================
        function mostrarTodasLasSecciones() {
            document.getElementById('vista-todas-secciones')?.classList.remove('hidden');
            document.getElementById('vista-plantilla-seccion')?.classList.add('hidden');
            
            // Actualizar botones de pestaña de grupo
            document.querySelectorAll('.tab-grupo-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                btn.classList.add('text-slate-600', 'hover:bg-slate-100');
            });
            const btnTodas = document.getElementById('tab-grupo-todas');
            if (btnTodas) {
                btnTodas.classList.remove('text-slate-600', 'hover:bg-slate-100');
                btnTodas.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
            }
        }

        async function verPlantillaSeccion(grupoId) {
            currentPlantillaGrupoId = grupoId;
            try {
                const res = await fetch(`/api/grupos/${grupoId}/detalle`);
                const data = await res.json();
                if (data.error) {
                    alert("Error: " + data.error);
                    return;
                }

                const g = data.grupo;
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                // Mostrar plantilla y ocultar cuadrícula general
                document.getElementById('vista-todas-secciones')?.classList.add('hidden');
                document.getElementById('vista-plantilla-seccion')?.classList.remove('hidden');

                // Actualizar botones de pestaña
                document.querySelectorAll('.tab-grupo-btn').forEach(btn => {
                    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                    btn.classList.add('text-slate-600', 'hover:bg-slate-100');
                });
                const tabActivo = document.getElementById(`tab-grupo-${grupoId}`);
                if (tabActivo) {
                    tabActivo.classList.remove('text-slate-600', 'hover:bg-slate-100');
                    tabActivo.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
                }

                // Encabezados
                const cod = grupoId === 11 ? 'G01' : (grupoId === 7 ? 'G02' : (grupoId === 9 ? 'G03' : (grupoId === 10 ? 'G04' : (grupoId === 8 ? 'G05' : 'G06'))));
                document.getElementById('plantilla-seccion-codigo-badge').innerText = cod;
                document.getElementById('plantilla-seccion-nombre').innerText = `${cod} · ${g.nombre}`;
                document.getElementById('plantilla-seccion-subtitulo').innerText = `Especialidad: ${g.carrera} • Turno: ${g.turno} • Periodo Anual 2026`;
                document.getElementById('plantilla-seccion-encargado').innerText = g.encargado;
                document.getElementById('plantilla-seccion-horario').innerText = `${g.turno} • ${g.horario || 'Regular'}`;
                document.getElementById('plantilla-seccion-aula').innerText = g.aula_taller || 'Taller Principal';
                document.getElementById('plantilla-seccion-carrera').innerText = g.carrera;

                // KPIs
                document.getElementById('plantilla-kpi-alumnos').innerText = `${data.estudiantes.length} Estudiantes`;
                document.getElementById('plantilla-kpi-ingresos').innerText = fMoney(g.total_ingresos);
                document.getElementById('plantilla-kpi-deuda').innerText = fMoney(g.total_deudas || 0);

                // Configurar Formulario Directo
                document.getElementById('seccion-form-grupo-id').value = g.id;
                document.getElementById('seccion-form-grupo-nombre').value = g.nombre;
                document.getElementById('seccion-form-encargado').value = g.encargado;
                document.getElementById('seccion-form-fecha').value = new Date().toISOString().split('T')[0];
                document.getElementById('seccion-form-concepto').value = 'Cuota Mensual Módulo 1';

                // Poblar select de estudiantes de este grupo
                const estSelect = document.getElementById('seccion-form-estudiante-select');
                estSelect.innerHTML = '<option value="">-- Seleccione un estudiante del grupo --</option>' + 
                    data.estudiantes.map(e => `<option value="${encodeURIComponent(e.nombre)}">${e.codigo} - ${e.nombre} (Pagado: S/. ${e.total_pagado})</option>`).join('') +
                    '<option value="__NUEVO__">+ Registrar Otro / Estudiante Nuevo</option>';

                // Renderizar Tabla 1: Estudiantes
                const tbodyEst = document.getElementById('plantilla-tabla-alumnos-body');
                document.getElementById('plantilla-tabla-alumnos-count').innerText = `${data.estudiantes.length} Alumnos`;
                if (data.estudiantes.length === 0) {
                    tbodyEst.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-400">No hay alumnos asignados a este grupo aún.</td></tr>';
                } else {
                    tbodyEst.innerHTML = data.estudiantes.map((e, idx) => {
                        const tieneDeuda = (e.total_deuda || 0) > 0;
                        const badgeEstado = tieneDeuda 
                            ? '<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Con Deuda</span>'
                            : '<span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Al Día</span>';
                        return `
                            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                                <td class="py-2.5 px-4 text-slate-400 font-bold">${idx + 1}</td>
                                <td class="py-2.5 px-4 font-mono font-bold text-indigo-700 dark:text-indigo-400">${e.ultimo_comprobante || e.comprobante || (e.codigo ? e.codigo.replace(/\D/g, '').padStart(7, '0') : '---')}</td>
                                <td class="py-2.5 px-4 font-semibold text-slate-800 dark:text-white">${e.nombre}</td>
                                <td class="py-2.5 px-4 text-slate-500">${e.telefono || '-'}</td>
                                <td class="py-2.5 px-4 text-right font-bold text-emerald-600">${fMoney(e.total_pagado)}</td>
                                <td class="py-2.5 px-4 text-right font-bold ${tieneDeuda ? 'text-rose-600' : 'text-slate-400'}">${fMoney(e.total_deuda)}</td>
                                <td class="py-2.5 px-4 text-center">${badgeEstado}</td>
                                <td class="py-2.5 px-4 text-center no-print">
                                    <button onclick="prellenarAbonoParaEstudiante('${encodeURIComponent(e.nombre)}')" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold text-[10px] transition mr-1">
                                        + Abonar
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }

                // Renderizar Tabla 2: Movimientos / Recibos de la Sección
                const tbodyMov = document.getElementById('plantilla-tabla-movimientos-body');
                document.getElementById('plantilla-tabla-movimientos-count').innerText = `${data.movimientos.length} Recibos`;
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-400">No hay movimientos registrados para esta sección aún.</td></tr>';
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => {
                        const isIngreso = m.tipo === 'Ingreso';
                        return `
                            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                                <td class="py-2.5 px-4 font-bold text-slate-800">REC-${String(m.id).padStart(5, '0')}</td>
                                <td class="py-2.5 px-4 text-slate-600">${m.fecha}</td>
                                <td class="py-2.5 px-4 font-semibold text-slate-900">${m.nombre}</td>
                                <td class="py-2.5 px-4 text-slate-700 text-[11px]">${m.encargado || g.encargado}</td>
                                <td class="py-2.5 px-4 text-center">
                                    <span class="${isIngreso ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                        ${m.tipo}
                                    </span>
                                </td>
                                <td class="py-2.5 px-4 text-slate-700 font-medium">${m.concepto}</td>
                                <td class="py-2.5 px-4 text-right font-extrabold ${isIngreso ? 'text-emerald-600' : 'text-rose-600'}">${fMoney(m.monto)}</td>
                                <td class="py-2.5 px-4 text-center text-slate-500">${m.metodo_pago || 'Efectivo'}</td>
                                <td class="py-2.5 px-4 text-center no-print">
                                    <button onclick="verBoletaDirecta(${m.id})" title="Imprimir Boleta" class="text-sky-600 hover:text-sky-800 p-1 font-bold">
                                        <i class="fa-solid fa-receipt"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }

                // Scroll suave hacia la plantilla
                document.getElementById('vista-plantilla-seccion')?.scrollIntoView({ behavior: 'smooth' });

            } catch (err) {
                console.error("Error al cargar plantilla de sección:", err);
            }
        }

        function cambiarTipoMovimientoSeccion(tipo) {
            document.getElementById('seccion-form-tipo').value = tipo;
            const btnIng = document.getElementById('btn-seccion-tipo-ingreso');
            const btnEgr = document.getElementById('btn-seccion-tipo-egreso');
            if (tipo === 'Ingreso') {
                btnIng.className = 'py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnEgr.className = 'py-2.5 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50';
            } else {
                btnEgr.className = 'py-2.5 px-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnIng.className = 'py-2.5 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-emerald-50';
            }
        }

        function seleccionarEstudianteSeccion(val) {
            const inputCustom = document.getElementById('seccion-form-estudiante-custom');
            if (val === '__NUEVO__') {
                inputCustom.classList.remove('hidden');
                inputCustom.focus();
            } else {
                inputCustom.classList.add('hidden');
            }
        }

        function prellenarAbonoParaEstudiante(nombreEncoded) {
            const nombre = decodeURIComponent(nombreEncoded);
            const selectEst = document.getElementById('seccion-form-estudiante-select');
            for (let i = 0; i < selectEst.options.length; i++) {
                if (decodeURIComponent(selectEst.options[i].value) === nombre) {
                    selectEst.selectedIndex = i;
                    break;
                }
            }
            document.getElementById('seccion-form-concepto').value = 'Abono de Cuota Pendiente';
            document.getElementById('seccion-form-monto').focus();
        }

        // =========================================================================
        // GUARDAR MOVIMIENTO DIRECTO EN LA SECCIÓN ("QUE SE VEA LO QUE AÑADIMOS")
        // =========================================================================
        async function guardarMovimientoEnSeccion(e) {
            e.preventDefault();
            const monto = parseFloat(document.getElementById('seccion-form-monto').value);
            if (!monto || monto <= 0) {
                alert("Por favor ingrese una cantidad válida mayor a cero.");
                return;
            }

            const selectEst = document.getElementById('seccion-form-estudiante-select').value;
            const customEst = document.getElementById('seccion-form-estudiante-custom').value.trim();
            const nombreEst = (selectEst === '__NUEVO__' ? customEst : decodeURIComponent(selectEst)).trim();

            if (!nombreEst) {
                alert("Por favor seleccione un estudiante o escriba su nombre.");
                return;
            }

            const grupoNombre = document.getElementById('seccion-form-grupo-nombre').value;
            const encargado = document.getElementById('seccion-form-encargado').value;
            const tipo = document.getElementById('seccion-form-tipo').value;
            const concepto = document.getElementById('seccion-form-concepto').value.trim();
            const fecha = document.getElementById('seccion-form-fecha').value;
            const metodo = document.getElementById('seccion-form-metodo').value;

            const payload = {
                tipo: tipo,
                estado: 'Pagado',
                rol: 'Estudiante',
                nombre: nombreEst,
                grupo: grupoNombre,
                encargado: encargado,
                carrera: document.getElementById('plantilla-seccion-carrera').innerText,
                concepto: concepto,
                monto: monto,
                monto_total: monto,
                monto_abonado: monto,
                fecha: fecha,
                metodo_pago: metodo,
                notas: `Registrado directamente desde la plantilla de la sección ${grupoNombre}`
            };

            try {
                const res = await fetch('/api/movimientos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success) {
                    // Mostrar aviso verde de confirmación instantánea
                    const aviso = document.getElementById('aviso-movimiento-seccion');
                    const txt = document.getElementById('aviso-movimiento-texto');
                    if (aviso && txt) {
                        txt.innerHTML = `<span>¡Movimiento guardado con éxito! Se registró REC-${String(data.id || '').padStart(5, '0')} por S/. ${monto.toFixed(2)} a favor de ${nombreEst}.</span> <button type="button" onclick="verBoletaDirecta(${data.id})" class="ml-2 font-black underline hover:text-emerald-950 dark:hover:text-white cursor-pointer inline-flex items-center gap-1"><i class="fa-solid fa-receipt"></i> Ver e Imprimir Boleta</button>`;
                        aviso.classList.remove('hidden');
                        setTimeout(() => aviso.classList.add('hidden'), 7000);
                    }

                    // Limpiar campos para el siguiente
                    document.getElementById('seccion-form-monto').value = '';
                    document.getElementById('seccion-form-concepto').value = 'Cuota Mensual Módulo 1';

                    // ACTUALIZACIÓN INMEDIATA EN PANTALLA ("QUE SE VEA LO QUE AÑADIMOS")
                    await verPlantillaSeccion(currentPlantillaGrupoId);
                    await cargarStats();
                    await cargarGrupos();
                } else {
                    alert("Error: " + (data.error || "No se pudo registrar el movimiento"));
                }
            } catch (err) {
                alert("Error de conexión al registrar movimiento");
            }
        }

        // =========================================================================
        // CARGAR MATRIZ DE CONTROL DE PAGOS (MES A MES)
        // =========================================================================
        let controlPagosGlobal = [];

        async function cargarControlPagos() {
            try {
                const resEst = await fetch('/api/estudiantes');
                controlPagosGlobal = await resEst.json();
                renderControlPagos(controlPagosGlobal);
            } catch (err) {
                console.error("Error al cargar control de pagos:", err);
            }
        }

        let ordenControlPagosActual = 'registro';

        function ordenarControlPagos(criterio) {
            ordenControlPagosActual = criterio;
            filtrarControlPagos();
        }

        function filtrarControlPagos() {
            const rawVal = document.getElementById('filtro-control-pagos-buscar')?.value || '';
            const query = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(rawVal) : rawVal.toLowerCase().trim();
            const queryDigits = rawVal.replace(/\D/g, '');

            const filtrados = (controlPagosGlobal || []).filter(e => {
                if (!query) return true;
                const nombreNorm = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(e.nombre) : (e.nombre || '').toLowerCase();
                const dniNorm = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(e.dni) : (e.dni || '').toLowerCase();
                const celNorm = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(e.telefono) : (e.telefono || '').toLowerCase();
                const codNorm = (e.codigo || '').toLowerCase();
                const compNorm = (e.ultimo_comprobante || e.comprobante || '').toLowerCase();
                const grpNorm = (e.grupo || '').toLowerCase();

                const dniDigits = (e.dni || '').replace(/\D/g, '');
                const celDigits = (e.telefono || '').replace(/\D/g, '');

                return nombreNorm.includes(query) ||
                    dniNorm.includes(query) || (queryDigits.length >= 2 && dniDigits.includes(queryDigits)) ||
                    celNorm.includes(query) || (queryDigits.length >= 2 && celDigits.includes(queryDigits)) ||
                    codNorm.includes(query) ||
                    compNorm.includes(query) ||
                    grpNorm.includes(query);
            });

            // Aplicar ordenamiento
            let ordenados = filtrados.slice();
            if (ordenControlPagosActual === 'az') {
                ordenados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
            } else if (ordenControlPagosActual === 'za') {
                ordenados.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
            } else if (ordenControlPagosActual === 'boleta') {
                ordenados.sort((a, b) => {
                    const bNro = Number(String(b.ultimo_comprobante || b.codigo).replace(/\D/g, '')) || 0;
                    const aNro = Number(String(a.ultimo_comprobante || a.codigo).replace(/\D/g, '')) || 0;
                    return aNro - bNro;
                });
            } else if (ordenControlPagosActual === 'registro') {
                ordenados.sort((a, b) => (a.id || 0) - (b.id || 0));
            }

            renderControlPagos(ordenados);
        }

        function renderControlPagos(lista) {
            const tbody = document.getElementById('tabla-control-pagos-body');
            if (!tbody) return;

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="19" class="p-6 text-center text-slate-400">No se encontraron estudiantes para la matriz.</td></tr>';
                return;
            }

            const nombresMeses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            tbody.innerHTML = lista.map((e, idx) => {
                const pagado = e.total_pagado || 0;
                const deuda = e.total_deuda !== undefined ? e.total_deuda : (e.saldo_pendiente || 0);
                const boletaNro = e.ultimo_comprobante || e.comprobante || (e.codigo ? e.codigo.replace(/\D/g, '').padStart(7, '0') : null) || '---';
                const pagosMes = e.pagos_por_mes || {};

                // Generar cuotas mes a mes según pagos reales en base de datos
                const meses = [];
                for (let m = 1; m <= 12; m++) {
                    const montoMes = Number(pagosMes[m] || 0);
                    if (montoMes > 0) {
                        const txtMonto = montoMes % 1 === 0 ? `S/. ${montoMes}` : `S/. ${montoMes.toFixed(2)}`;
                        meses.push(`<td class="py-2 px-1 text-center font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 text-[10px]" title="${nombresMeses[m]}: Pago registrado de ${txtMonto}">${txtMonto}</td>`);
                    } else if (deuda > 0 && m <= 8) {
                        meses.push(`<td class="py-2 px-1 text-center text-slate-300 dark:text-slate-600 font-mono text-[10px]" title="${nombresMeses[m]}: Sin pago registrado">-</td>`);
                    } else {
                        meses.push(`<td class="py-2 px-1 text-center text-slate-300 dark:text-slate-600 font-mono text-[10px]">-</td>`);
                    }
                }

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-2 px-3 text-slate-400 dark:text-slate-500 font-bold">${idx + 1}</td>
                        <td class="py-2 px-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">${boletaNro}</td>
                        <td class="py-2 px-3 font-semibold text-slate-900 dark:text-white">${e.nombre}</td>
                        <td class="py-2 px-3 text-slate-600 dark:text-slate-300 text-[10px]">${e.grupo || 'General'}</td>
                        <td class="py-2 px-2 text-center text-teal-700 dark:text-teal-400 font-bold">✓</td>
                        ${meses.join('')}
                        <td class="py-2 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400">${fMoney(pagado)}</td>
                        <td class="py-2 px-3 text-right font-extrabold ${deuda > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}">${fMoney(deuda)}</td>
                    </tr>
                `;
            }).join('');
        }

        // =========================================================================
        // CARGAR HOJA DIARIO & NOTAS Y CALENDARIZACIÓN OFICIAL
        // =========================================================================
        async function cargarCalendarizacionDiario() {
            try {
                const res = await fetch('/api/estudiantes/calendarizacion');
                const data = await res.json();
                const calendarizacion = data.calendarizacion || [];
                calendarizacionGlobal = calendarizacion;
                if (typeof renderizarMiniCalendarioGrid === 'function') renderizarMiniCalendarioGrid();

                const elDias = document.getElementById('diario-cal-dias-registrados');
                const elTot = document.getElementById('diario-cal-total-ingresos');
                const container = document.getElementById('diario-cal-dias-container');
                if (!container) return;

                let sumTotal = 0;
                calendarizacion.forEach(d => { sumTotal += Number(d.total_monto || 0); });

                if (elDias) elDias.innerText = `${calendarizacion.length} Días Registrados`;
                if (elTot) elTot.innerText = `S/. ${Number(sumTotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })} Total`;

                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                const fechaSeleccionada = document.getElementById('diario-selector-fecha')?.value || '';

                if (calendarizacion.length === 0) {
                    container.innerHTML = '<span class="text-xs text-slate-400 py-1">No hay días calendarizados aún.</span>';
                    return;
                }

                container.innerHTML = calendarizacion.map(d => {
                    const esActivo = d.fecha === fechaSeleccionada;
                    const fPartes = d.fecha.split('-');
                    const fechaBonita = fPartes.length === 3 ? `${fPartes[2]}/${fPartes[1]}/${fPartes[0]}` : d.fecha;
                    const nRecibos = d.total_recibos || 0;

                    // Colores según los registros
                    let pillColorClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800';
                    let dotColor = 'bg-amber-500';

                    if (nRecibos >= 3) {
                        pillColorClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
                        dotColor = 'bg-emerald-500';
                    } else if (nRecibos === 2) {
                        pillColorClass = 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800';
                        dotColor = 'bg-sky-500';
                    }

                    if (esActivo) {
                        pillColorClass = 'bg-amber-500 text-slate-950 border-amber-600 font-black scale-105 shadow-md shadow-amber-500/30 ring-2 ring-amber-400';
                        dotColor = 'bg-slate-950';
                    }

                    return `
                        <button type="button" onclick="seleccionarDiaEnCalendarizacion('${d.fecha}')" class="flex-shrink-0 px-3.5 py-2 rounded-xl border text-left transition shadow-sm ${pillColorClass}">
                            <div class="flex items-center space-x-1.5 text-[11px] font-extrabold">
                                <span class="w-2 h-2 rounded-full ${dotColor} inline-block"></span>
                                <span>${fechaBonita}</span>
                            </div>
                            <div class="text-[10px] mt-0.5 font-bold">
                                ${d.total_recibos} ${d.total_recibos === 1 ? 'registro' : 'registros'} • ${fMoney(d.total_monto)}
                            </div>
                        </button>
                    `;
                }).join('');
            } catch (err) {
                console.error("Error al cargar calendarización en diario:", err);
            }
        }

        function seleccionarDiaEnCalendarizacion(fecha) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (inputF) inputF.value = fecha;
            cargarDiario(fecha);
            cargarCalendarizacionDiario();
        }

        async function cargarDiario(fecha) {
            try {
                if (!fecha) {
                    const inputF = document.getElementById('diario-selector-fecha');
                    fecha = inputF ? inputF.value : new Date().toISOString().split('T')[0];
                }

                const res = await fetch(`/api/diario?fecha=${encodeURIComponent(fecha)}`);
                const data = await res.json();
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('diario-ingresos').innerText = fMoney(data.ingresos || 0);
                document.getElementById('diario-pagos-count').innerText = `${data.pagos_count || 0} Recibos`;
                document.getElementById('diario-egresos').innerText = fMoney(data.egresos || 0);
                document.getElementById('diario-saldo').innerText = fMoney(data.saldo || 0);

                if (data.desglose_metodos) {
                    const elEf = document.getElementById('diario-metodo-efectivo');
                    if (elEf) elEf.innerText = fMoney(data.desglose_metodos.efectivo || 0);
                    const elYape = document.getElementById('diario-metodo-yape');
                    if (elYape) elYape.innerText = fMoney(data.desglose_metodos.yape || 0);
                    const elTr = document.getElementById('diario-metodo-transf');
                    if (elTr) elTr.innerText = fMoney(data.desglose_metodos.transferencia || 0);
                }

                const tbody = document.getElementById('diario-tabla-movimientos');
                document.getElementById('diario-movs-badge').innerText = `${data.movimientos.length} Registros`;

                if (data.movimientos.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">No se registraron movimientos en esta fecha. Puede elegir otra fecha arriba o en la calendarización.</td></tr>';
                } else {
                    tbody.innerHTML = data.movimientos.map(m => `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                            <td class="py-2.5 px-4 font-bold text-slate-800 dark:text-white font-mono">${m.comprobante ? m.comprobante : 'REC-' + String(m.id).padStart(5, '0')}</td>
                            <td class="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">${m.nombre}</td>
                            <td class="py-2.5 px-4 text-slate-600 dark:text-slate-300">${m.grupo || m.carrera || '-'}</td>
                            <td class="py-2.5 px-4 text-slate-600 dark:text-slate-300">${m.encargado || '-'}</td>
                            <td class="py-2.5 px-4 text-slate-700 dark:text-slate-200 font-medium">${m.concepto}</td>
                            <td class="py-2.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${fMoney(m.monto)}</td>
                            <td class="py-2.5 px-4 text-center text-slate-500 dark:text-slate-400">${m.metodo_pago || 'Efectivo'}</td>
                        </tr>
                    `).join('');
                }

                // Bitácora Oficial de Notas y Actividades Desarrolladas
                const tbodyNotas = document.getElementById('diario-tabla-notas');
                if (tbodyNotas) {
                    if (data.movimientos.length === 0) {
                        tbodyNotas.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-400">Sin notas pedagógicas registradas para esta fecha.</td></tr>';
                    } else {
                        tbodyNotas.innerHTML = data.movimientos.map((m, idx) => `
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                                <td class="p-3 font-bold text-indigo-700 dark:text-indigo-400 font-mono">G0${(idx % 6) + 1}</td>
                                <td class="p-3 font-semibold text-slate-800 dark:text-white">${m.carrera || m.grupo || 'Especialidad Técnica'}</td>
                                <td class="p-3 text-slate-700 dark:text-slate-300 font-medium">${m.encargado || 'Docente de Clase'}</td>
                                <td class="p-3 text-slate-600 dark:text-slate-300">${m.concepto || 'Actividades y prácticas del módulo'}</td>
                                <td class="p-3 text-emerald-700 dark:text-emerald-400 font-semibold">${m.notas ? m.notas : `Boleta N° ${m.comprobante || '---'} por ${fMoney(m.monto)} validada en caja oficial`}</td>
                            </tr>
                        `).join('');
                    }
                }
            } catch (err) {
                console.error("Error al cargar diario:", err);
            }
        }

        // =========================================================================
        // CARGAR COMPROBANTE DE PAGO (HOJA FACTURA)
        // =========================================================================
        let listaRecibosFactura = [];

        let currentFacturaReciboId = null;
        let currentFacturaEstudianteId = null;
        let currentFacturaGrupoFiltro = 'todos';
        let currentFacturaCarreraPill = 'todas';

        function matchCarreraPill(carreraStr, pillKey) {
            if (!pillKey || pillKey === 'todas') return true;
            if (!carreraStr) return false;
            const cEst = carreraStr.toLowerCase();
            const cPill = pillKey.toLowerCase();
            if (cEst === cPill) return true;
            if (cPill.includes('confecc') || cPill.includes('corte')) {
                return cEst.includes('confecc') || cEst.includes('corte') || cEst.includes('ensamb');
            }
            if (cPill.includes('computa')) {
                return cEst.includes('computa') || cEst.includes('inform');
            }
            if (cPill.includes('cosmeto') || cPill.includes('peluquer')) {
                return cEst.includes('cosmeto') || cEst.includes('peluquer') || cEst.includes('barber');
            }
            if (cPill.includes('gastro')) {
                return cEst.includes('gastro') || cEst.includes('pasteler');
            }
            if (cPill.includes('electri')) {
                return cEst.includes('electri') || cEst.includes('electr');
            }
            if (cPill.includes('motos')) {
                return cEst.includes('motos');
            }
            if (cPill.includes('mecanic') || cPill.includes('automot')) {
                return !cEst.includes('motos') && (cEst.includes('mecanic') || cEst.includes('automot') || cEst.includes('auto'));
            }
            if (cPill.includes('carpint')) {
                return cEst.includes('carpint');
            }
            return false;
        }

        function filtrarFacturaPillSeccion(carreraKey) {
            currentFacturaCarreraPill = carreraKey;

            // Actualizar estilo visual de las píldoras de sección en Factura
            document.querySelectorAll('.tab-fac-pill-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });

            const pillMap = {
                'todas': 'pill-fac-todas',
                'Confección Textil': 'pill-fac-corte',
                'Corte y Ensamblaje': 'pill-fac-corte',
                'Computación': 'pill-fac-computacion',
                'Computación e Informática': 'pill-fac-computacion',
                'Cosmetología': 'pill-fac-peluqueria',
                'Peluquería y Barbería': 'pill-fac-peluqueria',
                'Electricidad': 'pill-fac-electricidad',
                'Electricidad y Electrónica': 'pill-fac-electricidad',
                'Mecánica': 'pill-fac-mecanica',
                'Mecánica Automotriz': 'pill-fac-mecanica',
                'Mecánica de Motos': 'pill-fac-motos',
                'Carpintería Metálica': 'pill-fac-carpinteria'
            };

            const targetId = pillMap[carreraKey] || 'pill-fac-todas';
            const activePill = document.getElementById(targetId);
            if (activePill) {
                activePill.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                activePill.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }

            // Sincronizar selector de grupo
            const selectGrp = document.getElementById('factura-grupo-select');
            if (carreraKey === 'todas') {
                if (selectGrp) selectGrp.value = 'todos';
                currentFacturaGrupoFiltro = 'todos';
                poblarSelectorEstudiantesOpciones('todos');
            } else {
                const grpsCarrera = (gruposGlobales || []).filter(g => matchCarreraPill(g.carrera, carreraKey));
                if (grpsCarrera.length > 0 && selectGrp) {
                    selectGrp.value = grpsCarrera[0].nombre;
                    currentFacturaGrupoFiltro = grpsCarrera[0].nombre;
                }
                poblarSelectorEstudiantesPorCarrera(carreraKey);
            }
        }

        function poblarSelectorEstudiantesPorCarrera(carreraKey) {
            const selectEst = document.getElementById('factura-estudiante-select');
            if (!selectEst) return;

            const lista = (estudiantesGlobales || []).filter(e => matchCarreraPill(e.carrera, carreraKey));
            lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

            let html = `<option value="">-- Seleccionar Estudiante de ${carreraKey} (${lista.length} alumnos) --</option>`;
            
            const gruposMap = {};
            lista.forEach(e => {
                const g = e.grupo || e.turno || 'General';
                if (!gruposMap[g]) gruposMap[g] = [];
                gruposMap[g].push(e);
            });

            Object.keys(gruposMap).sort().forEach(grpName => {
                const arr = gruposMap[grpName];
                html += `<optgroup label="📂 ${grpName} (${arr.length} alumnos)">`;
                arr.forEach(e => {
                    const dniStr = e.dni && e.dni !== 'No registrado' ? ` [DNI: ${e.dni}]` : '';
                        const celStr = e.telefono && e.telefono !== 'No registrado' ? ` [Cel: ${e.telefono}]` : '';
                    html += `<option value="${e.id}">${e.nombre}${dniStr}${celStr}</option>`;
                });
                html += `</optgroup>`;
            });

            selectEst.innerHTML = html;

            const countEl = document.getElementById('factura-est-count');
            if (countEl) countEl.innerText = `${lista.length} en esta sección`;

            selectEst.value = "";
            limpiarPlantillaBoleta();
        }

        function sincronizarPillConCarrera(carreraKey) {
            document.querySelectorAll('.tab-fac-pill-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });

            let targetId = 'pill-fac-todas';
            if (carreraKey) {
                const c = carreraKey.toLowerCase();
                if (c.includes('corte') || c.includes('confecc')) targetId = 'pill-fac-corte';
                else if (c.includes('computa')) targetId = 'pill-fac-computacion';
                else if (c.includes('peluquer') || c.includes('cosmeto')) targetId = 'pill-fac-peluqueria';
                else if (c.includes('gastro')) targetId = 'pill-fac-gastronomia';
                else if (c.includes('motos')) targetId = 'pill-fac-motos';
                else if (c.includes('electri')) targetId = 'pill-fac-electricidad';
                else if (c.includes('automot') || (c.includes('mecanic') && !c.includes('motos'))) targetId = 'pill-fac-mecanica';
                else if (c.includes('carpint')) targetId = 'pill-fac-carpinteria';
            }

            const activePill = document.getElementById(targetId);
            if (activePill) {
                activePill.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                activePill.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }
        }

        function filtrarSeccionesPorCarreraPill(carreraKey, btnEl) {
            document.querySelectorAll('.tab-grupo-btn').forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
                btn.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
            });
            if (btnEl) {
                btnEl.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800', 'font-semibold');
                btnEl.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'font-bold');
            }

            document.getElementById('vista-todas-secciones')?.classList.remove('hidden');
            document.getElementById('vista-plantilla-seccion')?.classList.add('hidden');

            const filtrados = (gruposGlobales || []).filter(g => matchCarreraPill(g.carrera, carreraKey));
            renderGrupos(filtrados);
        }

        // CARGAR GRUPOS DE LA BASE DE DATOS
        async function cargarGrupos() {
            try {
                const carrera = document.getElementById('filtro-grupos-carrera')?.value || '';
                const turno = document.getElementById('filtro-grupos-turno')?.value || '';
                let url = '/api/grupos';
                const params = [];
                if (carrera) params.push(`carrera=${encodeURIComponent(carrera)}`);
                if (turno) params.push(`turno=${encodeURIComponent(turno)}`);
                if (params.length > 0) url += '?' + params.join('&');

                const res = await fetch(url);
                gruposGlobales = await res.json();
                
                renderGrupos(gruposGlobales);
                renderDashboardGrupos(gruposGlobales);
                poblarSelectsGrupos(gruposGlobales);
                poblarSelectorGruposFactura(gruposGlobales);
                renderTablaDocentesGruposConfig(gruposGlobales);
                if (typeof actualizarBadgesConteoSecciones === 'function') {
                    actualizarBadgesConteoSecciones();
                }
            } catch (err) {
                console.error("Error al cargar grupos:", err);
            }
        }

        let debouncePdfTimer = null;
        function debounceActualizarPDF() {
            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                clearTimeout(debouncePdfTimer);
                debouncePdfTimer = setTimeout(() => {
                    if (typeof actualizarPrevisualizadorPDF === 'function') {
                        actualizarPrevisualizadorPDF();
                    }
                }, 300);
            }
        }

        function toggleVoucherBox(el, isCopia = false) {
            if (!el) return;
            const currentVal = el.innerText.trim();
            const nextVal = currentVal === 'X' ? '' : 'X';
            el.innerText = nextVal;
            
            // Sincronización automática e idéntica entre Color y Azul
            if (el.id) {
                if (el.id.startsWith('copia-')) {
                    const origId = el.id.replace('copia-', '');
                    const origEl = document.getElementById(origId);
                    if (origEl) origEl.innerText = nextVal;
                } else {
                    const copiaId = 'copia-' + el.id;
                    const copiaEl = document.getElementById(copiaId);
                    if (copiaEl) copiaEl.innerText = nextVal;
                }
            }

            // Actualizar previsualizador si está activo
            debounceActualizarPDF();
        }

        async function poblarSelectorFactura() {
            try {
                if (!gruposGlobales || gruposGlobales.length === 0) {
                    const resG = await fetch('/api/grupos');
                    gruposGlobales = await resG.json();
                }
                if (!movimientosGlobales || movimientosGlobales.length === 0) {
                    const res = await fetch('/api/movimientos');
                    movimientosGlobales = await res.json();
                }
                if (!estudiantesGlobales || estudiantesGlobales.length === 0) {
                    const resE = await fetch('/api/estudiantes');
                    estudiantesGlobales = await resE.json();
                }

                // 1. Poblar Selector de Grupos en Factura
                poblarSelectorGruposFactura(gruposGlobales);

                // 2. Poblar Selector de Estudiantes (Inicialmente con todos los grupos organizados)
                poblarSelectorEstudiantesOpciones(currentFacturaGrupoFiltro);

                // 3. Poblar Selector de Recibos
                poblarSelectorRecibosOpciones(movimientosGlobales);

                // 4. Plantilla limpia en blanco por defecto (se llena únicamente al seleccionar un alumno)
                limpiarPlantillaBoleta();
            } catch (err) {
                console.error("Error al poblar selector factura:", err);
            }
        }

        function poblarSelectorGruposFactura(grupos) {
            const selectGrp = document.getElementById('factura-grupo-select');
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            if (!selectGrp && !selectCambiar) return;

            const totalEst = (estudiantesGlobales && estudiantesGlobales.length > 0) ? estudiantesGlobales.length : 176;

            let htmlOptions = '<option value="todos">⚡ Todos los Grupos (' + totalEst + ' Estudiantes)</option>';
            let htmlCambiar = '<option value="">-- Asignar a un Grupo Oficial --</option>';

            (grupos || []).forEach(g => {
                const count = (g.total_alumnos !== undefined && g.total_alumnos !== null) 
                    ? g.total_alumnos 
                    : (estudiantesGlobales || []).filter(e => e.grupo === g.nombre).length;
                htmlOptions += '<option value="' + g.nombre + '">📂 ' + g.nombre + ' (' + count + ' alumnos)</option>';
                htmlCambiar += '<option value="' + g.nombre + '">' + g.nombre + ' (' + count + ' alumnos - ' + g.encargado + ')</option>';
            });

            if (selectGrp) {
                selectGrp.innerHTML = htmlOptions;
                selectGrp.value = currentFacturaGrupoFiltro || 'todos';
            }
            if (selectCambiar) {
                selectCambiar.innerHTML = htmlCambiar;
            }

            const countBadge = document.getElementById('factura-grupo-count');
            if (countBadge) countBadge.innerText = (grupos || []).length + ' grupos • ' + totalEst + ' alumnos';

            actualizarBadgesConteoSecciones();
        }

        function actualizarBadgesConteoSecciones() {
            const estudiantes = estudiantesGlobales || [];
            const totalEst = estudiantes.length > 0 ? estudiantes.length : 176;

            const countMap = {
                'todas': totalEst,
                'corte': 0,
                'computacion': 0,
                'peluqueria': 0,
                'gastronomia': 0,
                'electricidad': 0,
                'mecanica': 0,
                'motos': 0,
                'carpinteria': 0
            };

            if (estudiantes.length > 0) {
                estudiantes.forEach(e => {
                    const c = (e.carrera || '').toLowerCase();
                    if (c.includes('corte') || c.includes('confecc')) countMap['corte']++;
                    else if (c.includes('computa')) countMap['computacion']++;
                    else if (c.includes('peluquer') || c.includes('cosmeto')) countMap['peluqueria']++;
                    else if (c.includes('gastro')) countMap['gastronomia']++;
                    else if (c.includes('electri')) countMap['electricidad']++;
                    else if (c.includes('motos')) countMap['motos']++;
                    else if (c.includes('automot') || c.includes('mecanic')) countMap['mecanica']++;
                    else if (c.includes('carpint')) countMap['carpinteria']++;
                });
            } else {
                countMap['corte'] = 33;
                countMap['computacion'] = 62;
                countMap['peluqueria'] = 51;
                countMap['gastronomia'] = 0;
                countMap['electricidad'] = 3;
                countMap['mecanica'] = 5;
                countMap['motos'] = 17;
                countMap['carpinteria'] = 2;
            }

            const setBadge = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            setBadge('badge-count-sec-todas', countMap['todas']);
            setBadge('badge-count-sec-corte', countMap['corte']);
            setBadge('badge-count-sec-computacion', countMap['computacion']);
            setBadge('badge-count-sec-peluqueria', countMap['peluqueria']);
            setBadge('badge-count-sec-gastronomia', countMap['gastronomia']);
            setBadge('badge-count-sec-electricidad', countMap['electricidad']);
            setBadge('badge-count-sec-mecanica', countMap['mecanica']);
            setBadge('badge-count-sec-motos', countMap['motos']);
            setBadge('badge-count-sec-carpinteria', countMap['carpinteria']);

            setBadge('badge-count-fac-todas', countMap['todas']);
            setBadge('badge-count-fac-corte', countMap['corte']);
            setBadge('badge-count-fac-computacion', countMap['computacion']);
            setBadge('badge-count-fac-peluqueria', countMap['peluqueria']);
            setBadge('badge-count-fac-gastronomia', countMap['gastronomia']);
            setBadge('badge-count-fac-electricidad', countMap['electricidad']);
            setBadge('badge-count-fac-mecanica', countMap['mecanica']);
            setBadge('badge-count-fac-motos', countMap['motos']);
            setBadge('badge-count-fac-carpinteria', countMap['carpinteria']);
        }

        function limpiarPlantillaBoleta() {
            currentFacturaEstudianteId = null;
            currentFacturaReciboId = null;

            // 1. Números correlativos en rojo: formato plantilla limpia 0000000
            const elNro = document.getElementById('factura-nro-comprobante');
            if (elNro) elNro.innerText = '0000000';
            const elCopiaNro = document.getElementById('copia-factura-nro-comprobante');
            if (elCopiaNro) elCopiaNro.innerText = '0000000';

            // 2. Estudiante / Señor (a)
            const elEst = document.getElementById('factura-estudiante');
            if (elEst) elEst.innerText = '';
            const elCopiaEst = document.getElementById('copia-factura-estudiante');
            if (elCopiaEst) elCopiaEst.innerText = '';

            // 3. Especialidad
            const elCar = document.getElementById('factura-carrera');
            if (elCar) elCar.innerText = '';
            const elCopiaCar = document.getElementById('copia-factura-carrera');
            if (elCopiaCar) elCopiaCar.innerText = '';

            // 4. Casillas de módulos (1 al 7) limpias
            for (let i = 1; i <= 7; i++) {
                const b = document.getElementById(`box-mod-${i}`);
                if (b) b.innerText = '';
                const cb = document.getElementById(`copia-box-mod-${i}`);
                if (cb) cb.innerText = '';
            }

            // 5. Constancia y FUT
            const cConst = document.getElementById('check-constancia');
            if (cConst) cConst.innerText = '';
            const cCopiaConst = document.getElementById('copia-check-constancia');
            if (cCopiaConst) cCopiaConst.innerText = '';

            const cFut = document.getElementById('check-fut');
            if (cFut) cFut.innerText = '';
            const cCopiaFut = document.getElementById('copia-check-fut');
            if (cCopiaFut) cCopiaFut.innerText = '';

            // 6. Otros
            const elOtros = document.getElementById('factura-nota-otros');
            if (elOtros) elOtros.innerText = '';
            const elCopiaOtros = document.getElementById('copia-factura-nota-otros');
            if (elCopiaOtros) elCopiaOtros.innerText = '';

            // 7. Montos limpios
            const elPUnit = document.getElementById('factura-precio-unit');
            if (elPUnit) elPUnit.innerText = '';
            const elCopiaPUnit = document.getElementById('copia-factura-precio-unit');
            if (elCopiaPUnit) elCopiaPUnit.innerText = '';

            const elAporte = document.getElementById('factura-monto-aporte');
            if (elAporte) elAporte.innerText = '';
            const elCopiaAporte = document.getElementById('copia-factura-monto-aporte');
            if (elCopiaAporte) elCopiaAporte.innerText = '';

            const elMontoConst = document.getElementById('factura-monto-constancia');
            if (elMontoConst) {
                elMontoConst.innerText = '';
                elMontoConst.classList.remove('monto--tachado');
            }
            const elCopiaMontoConst = document.getElementById('copia-factura-monto-constancia');
            if (elCopiaMontoConst) {
                elCopiaMontoConst.innerText = '';
                elCopiaMontoConst.classList.remove('monto--tachado');
            }

            const elMontoFut = document.getElementById('factura-monto-fut');
            if (elMontoFut) {
                elMontoFut.innerText = '';
                elMontoFut.classList.remove('monto--tachado');
            }
            const elCopiaMontoFut = document.getElementById('copia-factura-monto-fut');
            if (elCopiaMontoFut) {
                elCopiaMontoFut.innerText = '';
                elCopiaMontoFut.classList.remove('monto--tachado');
            }

            const elMTot = document.getElementById('factura-monto-total');
            if (elMTot) elMTot.innerText = '';
            const elCopiaMTot = document.getElementById('copia-factura-monto-total');
            if (elCopiaMTot) elCopiaMTot.innerText = '';

            // 8. Fecha limpia
            const elDia = document.getElementById('factura-dia');
            if (elDia) elDia.innerText = '';
            const elCopiaDia = document.getElementById('copia-factura-dia');
            if (elCopiaDia) elCopiaDia.innerText = '';

            const elMes = document.getElementById('factura-mes');
            if (elMes) elMes.innerText = '';
            const elCopiaMes = document.getElementById('copia-factura-mes');
            if (elCopiaMes) elCopiaMes.innerText = '';

            const elAno = document.getElementById('factura-ano');
            if (elAno) elAno.innerText = '';
            const elCopiaAno = document.getElementById('copia-factura-ano');
            if (elCopiaAno) elCopiaAno.innerText = '';

            // 9. Resumen lateral y notas
            const rAlu = document.getElementById('notas-resumen-alumno');
            if (rAlu) rAlu.innerText = '-- Seleccione un estudiante --';
            const rComp = document.getElementById('notas-resumen-comprobante');
            if (rComp) rComp.innerText = 'Plantilla en Blanco';
            const rMon = document.getElementById('notas-resumen-monto');
            if (rMon) rMon.innerText = 'S/. 0.00';
            const fNotas = document.getElementById('factura-notas-input');
            if (fNotas) fNotas.value = '';

            // 10. Selectores
            const selectEst = document.getElementById('factura-estudiante-select');
            if (selectEst && !currentFacturaEstudianteId) selectEst.value = '';
            const selectRec = document.getElementById('factura-recibo-select');
            if (selectRec) selectRec.innerHTML = '<option value="">-- Seleccione un estudiante primero --</option>';

            // 11. Mini historial de recibos
            const contMini = document.getElementById('mini-historial-recibos-lista');
            if (contMini) {
                contMini.innerHTML = '<p class="text-xs text-slate-400 italic text-center py-2">Seleccione un estudiante arriba para ver o emitir sus boletas.</p>';
            }
        }

        function poblarSelectorEstudiantesOpciones(grupoFiltro = 'todos') {
            const selectEst = document.getElementById('factura-estudiante-select');
            if (!selectEst) return;

            let lista = [...(estudiantesGlobales || [])];
            
            if (grupoFiltro && grupoFiltro !== 'todos') {
                lista = lista.filter(e => e.grupo === grupoFiltro);
            }

            lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

            let html = '';
            if (grupoFiltro === 'todos') {
                html = `<option value="">-- Seleccionar Estudiante (Todos los Grupos: ${lista.length} Alumnos) --</option>`;
                // Agrupar estudiantes por grupo con optgroup
                const gruposMap = {};
                lista.forEach(e => {
                    const g = e.grupo || 'Sin Grupo Asignado';
                    if (!gruposMap[g]) gruposMap[g] = [];
                    gruposMap[g].push(e);
                });

                Object.keys(gruposMap).sort().forEach(grpName => {
                    const arr = gruposMap[grpName];
                    html += `<optgroup label="📂 ${grpName} (${arr.length} alumnos)">`;
                    arr.forEach(e => {
                        const dniStr = e.dni && e.dni !== 'No registrado' ? ` [DNI: ${e.dni}]` : '';
                        html += `<option value="${e.id}">${e.nombre}${dniStr}</option>`;
                    });
                    html += `</optgroup>`;
                });
            } else {
                html = `<option value="">-- Seleccionar Estudiante de ${grupoFiltro} (${lista.length} alumnos) --</option>`;
                lista.forEach(e => {
                    const dniStr = e.dni && e.dni !== 'No registrado' ? ` [DNI: ${e.dni}]` : '';
                    html += `<option value="${e.id}">${e.nombre}${dniStr}</option>`;
                });
            }

            selectEst.innerHTML = html;

            const countEl = document.getElementById('factura-est-count');
            if (countEl) {
                countEl.innerText = grupoFiltro === 'todos' ? `${lista.length} alumnos` : `${lista.length} en este grupo`;
            }

            if (currentFacturaEstudianteId && lista.some(e => e.id == currentFacturaEstudianteId)) {
                selectEst.value = currentFacturaEstudianteId;
            }
        }

        function seleccionarGrupoFactura(grupoNombre) {
            currentFacturaGrupoFiltro = grupoNombre;
            poblarSelectorEstudiantesOpciones(grupoNombre);

            let lista = [...(estudiantesGlobales || [])];
            if (grupoNombre && grupoNombre !== 'todos') {
                lista = lista.filter(e => e.grupo === grupoNombre);
            }

            // Si el estudiante actual no pertenece al grupo seleccionado, mantener limpia la plantilla
            if (!currentFacturaEstudianteId || !lista.some(e => e.id == currentFacturaEstudianteId)) {
                limpiarPlantillaBoleta();
            }
        }

        function poblarSelectorRecibosOpciones(lista) {
            const select = document.getElementById('factura-recibo-select');
            if (!select) return;

            select.innerHTML = '<option value="">-- Elija un Recibo / Pago Registrado --</option>' +
                lista.map(m => {
                    const compStr = m.comprobante ? `N° ${m.comprobante}` : `REC-${String(m.id).padStart(5, '0')}`;
                    return `<option value="${m.id}">${compStr} | ${m.fecha} | ${m.nombre} | S/. ${Number(m.monto || 0).toFixed(2)} - ${m.carrera || m.concepto}</option>`;
                }).join('');
        }

        function mostrarTodosLosRecibos() {
            poblarSelectorRecibosOpciones(movimientosGlobales);
            if (currentFacturaReciboId) {
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = currentFacturaReciboId;
            }
        }

        function seleccionarEstudianteFactura(estId, syncGrupo = true) {
            if (!estId) {
                limpiarPlantillaBoleta();
                return;
            }
            currentFacturaEstudianteId = estId;
            const est = (estudiantesGlobales || []).find(x => x.id == estId);
            if (!est) return;

            // Sincronizar selector de estudiante en el DOM
            const selectEst = document.getElementById('factura-estudiante-select');
            if (selectEst && selectEst.value != estId) selectEst.value = estId;

            // Sincronizar selector de grupo si se solicitó o si el filtro actual es 'todos'
            if (syncGrupo && est.grupo) {
                const selectGrp = document.getElementById('factura-grupo-select');
                if (selectGrp && currentFacturaGrupoFiltro !== 'todos' && selectGrp.value !== est.grupo) {
                    selectGrp.value = est.grupo;
                    currentFacturaGrupoFiltro = est.grupo;
                }
            }

            // Sincronizar la barra de píldoras de sección horizontal
            if (est.carrera) {
                sincronizarPillConCarrera(est.carrera);
            }

            // Sincronizar campo de grupo en el panel de notas
            const resGrupo = document.getElementById('notas-resumen-grupo');
            if (resGrupo) {
                const grpObj = (gruposGlobales || []).find(g => g.nombre === est.grupo);
                const count = grpObj && grpObj.total_alumnos !== undefined ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === est.grupo).length || 0);
                resGrupo.innerText = (est.grupo || 'General') + (count > 0 ? ' (' + count + ' alumnos)' : '');
            }
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            if (selectCambiar && est.grupo) selectCambiar.value = est.grupo;

            // Buscar todos los movimientos del estudiante
            const movs = (movimientosGlobales || []).filter(m => m.nombre && est.nombre && m.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase());
            
            // Actualizar lista mini de recibos del estudiante
            actualizarListaRecibosMini(est, movs);

            if (movs.length > 0) {
                // Filtrar selector de recibos para mostrar los de este estudiante
                poblarSelectorRecibosOpciones(movs);
                const selRecibo = movs[0];
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = selRecibo.id;
                seleccionarFacturaRecibo(selRecibo.id, false); // no re-seleccionar estudiante para evitar bucle
            } else {
                // El estudiante no tiene recibos registrados: preparar voucher con sus datos para emisión
                currentFacturaReciboId = null;
                document.getElementById('factura-nro-comprobante').innerText = 'NUEVO';
                document.getElementById('factura-estudiante').innerText = est.nombre;
                document.getElementById('factura-dni').innerText = est.dni || '--------';
                
                const espStr = est.turno ? `${est.carrera} - ${est.turno}` : est.carrera;
                document.getElementById('factura-carrera').innerText = espStr;
                document.getElementById('factura-telefono').innerText = est.telefono || '---------';

                // Fecha actual
                const hoy = new Date();
                document.getElementById('factura-dia').innerText = String(hoy.getDate()).padStart(2, '0');
                document.getElementById('factura-mes').innerText = String(hoy.getMonth() + 1).padStart(2, '0');
                document.getElementById('factura-ano').innerText = String(hoy.getFullYear()).slice(-2);

                // Limpiar casillas y montos
                for (let i = 1; i <= 7; i++) {
                    const b = document.getElementById(`box-mod-${i}`);
                    if (b) b.innerText = i === 1 ? 'X' : '';
                }
                const elPUnit = document.getElementById('factura-precio-unit');
                if (elPUnit) elPUnit.innerText = '150.00';
                document.getElementById('factura-monto-fila1').innerText = '150.00';
                document.getElementById('factura-monto-total').innerText = '150.00';
                const elFutMonto = document.getElementById('factura-monto-fut');
                if (elFutMonto) elFutMonto.classList.add('monto--tachado');

                // Resumen lateral
                document.getElementById('notas-resumen-alumno').innerText = est.nombre;
                document.getElementById('notas-resumen-comprobante').innerText = 'Nuevo Recibo';
                document.getElementById('notas-resumen-monto').innerText = 'S/. 150.00';
                document.getElementById('factura-notas-input').value = est.notas || '';
                sincronizarNotaConVoucher(est.notas || '');
                sincronizarCopiaVoucher();
            }
        }

        async function cambiarGrupoEstudianteDesdeFactura(nuevoGrupo) {
            if (!currentFacturaEstudianteId || !nuevoGrupo) return;
            const est = (estudiantesGlobales || []).find(e => e.id == currentFacturaEstudianteId);
            if (!est) return;

            try {
                const res = await fetch(`/api/estudiantes/${currentFacturaEstudianteId}/editar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ grupo: nuevoGrupo })
                });
                const data = await res.json();
                if (data.success) {
                    est.grupo = nuevoGrupo;
                    const resGrupo = document.getElementById('notas-resumen-grupo');
                    if (resGrupo) {
                        const grpObj = (gruposGlobales || []).find(g => g.nombre === nuevoGrupo);
                        const count = grpObj && grpObj.total_alumnos !== undefined ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === nuevoGrupo).length || 0);
                        resGrupo.innerText = nuevoGrupo + (count > 0 ? ' (' + count + ' alumnos)' : '');
                    }
                    
                    // Actualizar en movimientosGlobales
                    (movimientosGlobales || []).forEach(m => {
                        if (m.nombre && est.nombre && m.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase()) {
                            m.grupo = nuevoGrupo;
                        }
                    });

                    // Recargar grupos y refrescar selectores
                    await cargarGrupos();
                    poblarSelectorEstudiantesOpciones(currentFacturaGrupoFiltro);
                    mostrarMensajeNotas(`✅ Alumno reasignado a: ${nuevoGrupo}`);
                } else {
                    alert("Error al actualizar grupo: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al reasignar grupo.");
            }
        }

        function actualizarListaRecibosMini(est, movs) {
            const cont = document.getElementById('lista-recibos-estudiante-mini');
            const badge = document.getElementById('badge-total-pagos-est');
            if (badge) badge.innerText = `${movs.length} recibo${movs.length === 1 ? '' : 's'}`;
            if (!cont) return;

            if (movs.length === 0) {
                cont.innerHTML = '<p class="text-[11px] text-slate-400 italic p-2 text-center">Este estudiante aún no registra recibos.</p>';
                return;
            }

            cont.innerHTML = movs.map(m => {
                const isActive = m.id == currentFacturaReciboId;
                const comp = m.comprobante ? `N° ${m.comprobante}` : `#${m.id}`;
                return `
                    <div onclick="seleccionarFacturaRecibo(${m.id})" class="p-2 rounded-xl cursor-pointer transition flex items-center justify-between border ${isActive ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700 font-bold' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                        <div>
                            <div class="text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span class="text-red-600 font-mono font-bold">${comp}</span>
                                <span class="text-slate-500">${m.fecha}</span>
                            </div>
                            <div class="text-[10px] text-slate-500 truncate max-w-[150px]">${m.concepto || 'Aporte'}</div>
                        </div>
                        <div class="text-right">
                            <span class="text-emerald-600 font-mono font-bold text-xs">S/. ${Number(m.monto || 0).toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function seleccionarFacturaRecibo(reciboId, syncEstudiante = true) {
            const m = movimientosGlobales.find(x => x.id == reciboId);
            if (!m) return;
            currentFacturaReciboId = reciboId;

            actualizarMembretesFactura();

            // 1. Número correlativo oficial en rojo (7 dígitos)
            let nroRec = m.comprobante ? String(m.comprobante).replace(/\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
            if (!nroRec || nroRec === '0000000') nroRec = String(m.id).padStart(7, '0');
            const elNro = document.getElementById('factura-nro-comprobante');
            if (elNro) elNro.innerText = nroRec;

            // 2. Estudiante / Señor (a)
            const elEst = document.getElementById('factura-estudiante');
            if (elEst) elEst.innerText = m.nombre || '---------------------------------';

            // 3. Lookup de estudiante para complementar DNI, celular y turno si faltan
            const est = (estudiantesGlobales || []).find(e => e.nombre && m.nombre && e.nombre.trim().toLowerCase() === m.nombre.trim().toLowerCase()) || {};
            if (est.id) currentFacturaEstudianteId = est.id;

            // Sincronizar selector de estudiante si corresponde
            if (syncEstudiante && est.id) {
                const selEst = document.getElementById('factura-estudiante-select');
                if (selEst) selEst.value = est.id;
            }

            // DNI
            const dniVal = m.dni || est.dni || est.codigo || '';
            const elDni = document.getElementById('factura-dni');
            if (elDni) elDni.innerText = dniVal || '--------';

            // Especialidad y Turno
            const carreraVal = m.carrera || est.carrera || 'General';
            const turnoVal = m.turno || est.turno || '';
            const espStr = turnoVal ? `${carreraVal} - ${turnoVal}` : carreraVal;
            const elEsp = document.getElementById('factura-carrera');
            if (elEsp) elEsp.innerText = espStr;

            // Celular
            const celVal = est.telefono || m.telefono || '';
            const elCel = document.getElementById('factura-telefono');
            if (elCel) elCel.innerText = celVal || '---------';

            // Sincronizar input de fecha de emisión superior
            const inpFechaEmision = document.getElementById('factura-fecha-emision-input');
            if (inpFechaEmision && m.fecha) {
                inpFechaEmision.value = m.fecha;
            }

            // 4. Fecha: DÍA | MES | AÑO
            let dia = '08', mes = '05', ano = '25';
            if (m.fecha) {
                if (m.fecha.includes('-')) {
                    const parts = m.fecha.split('-');
                    if (parts.length >= 3) {
                        ano = parts[0].slice(-2);
                        mes = parts[1].padStart(2, '0');
                        dia = parts[2].padStart(2, '0');
                    }
                } else if (m.fecha.includes('/')) {
                    const parts = m.fecha.split('/');
                    if (parts.length >= 3) {
                        dia = parts[0].padStart(2, '0');
                        mes = parts[1].padStart(2, '0');
                        ano = parts[2].slice(-2);
                    }
                }
            }
            const elDia = document.getElementById('factura-dia');
            const elMes = document.getElementById('factura-mes');
            const elAno = document.getElementById('factura-ano');
            if (elDia) elDia.innerText = dia;
            if (elMes) elMes.innerText = mes;
            if (elAno) elAno.innerText = ano;

            // 5. Casillas de Módulos (1 al 7) y Conceptos
            for (let i = 1; i <= 7; i++) {
                const b = document.getElementById(`box-mod-${i}`);
                if (b) b.innerText = '';
            }
            const elConst = document.getElementById('check-constancia');
            const elFut = document.getElementById('check-fut');
            const elOtrosTxt = document.getElementById('factura-otros-texto');
            if (elConst) elConst.innerText = '';
            if (elFut) elFut.innerText = '';
            if (elOtrosTxt) elOtrosTxt.innerText = '';

            const conc = (m.concepto || '').toLowerCase();
            const notas = (m.notas || '').toLowerCase();

            let targetMod = 0;
            const esDobleModulo = conc.includes('i-ii') || conc.includes('1-2') || conc.includes('i y ii') || notas.includes('i-ii');
            if (conc.includes('módulo 1') || conc.includes('modulo 1') || conc.includes('módulo i') || conc.includes('modulo i') || notas.includes('módulo i') || notas.includes('modulo i')) targetMod = 1;
            else if (conc.includes('módulo 2') || conc.includes('modulo 2') || conc.includes('módulo ii') || conc.includes('modulo ii') || notas.includes('módulo ii') || notas.includes('modulo ii')) targetMod = 2;
            else if (conc.includes('módulo 3') || conc.includes('modulo 3') || conc.includes('módulo iii') || conc.includes('modulo iii') || notas.includes('módulo iii') || notas.includes('modulo iii')) targetMod = 3;
            else if (conc.includes('módulo 4') || conc.includes('modulo 4') || conc.includes('módulo iv') || conc.includes('modulo iv')) targetMod = 4;
            else if (conc.includes('módulo 5') || conc.includes('modulo 5') || conc.includes('módulo v') || conc.includes('modulo v')) targetMod = 5;
            else if (conc.includes('módulo 6') || conc.includes('modulo 6') || conc.includes('módulo vi') || conc.includes('modulo vi')) targetMod = 6;
            else if (conc.includes('módulo 7') || conc.includes('modulo 7') || conc.includes('módulo vii') || conc.includes('modulo vii')) targetMod = 7;
            if (esDobleModulo) targetMod = 1;

            // 6. Montos en la tabla
            const montoVal = Number(m.monto || 0).toFixed(2);
            const elPUnit = document.getElementById('factura-precio-unit');
            const elMontoFila = document.getElementById('factura-monto-fila1');
            const elMontoTotal = document.getElementById('factura-monto-total');
            const elMontoAporte = document.getElementById('factura-monto-aporte');
            const elMontoConst = document.getElementById('factura-monto-constancia');
            const elMontoFut = document.getElementById('factura-monto-fut');
            const elNotaOtros = document.getElementById('factura-nota-otros');

            if (elMontoAporte) elMontoAporte.innerText = '';
            if (elMontoConst) { elMontoConst.innerText = ''; elMontoConst.classList.remove('monto--tachado'); }
            if (elMontoFut) { elMontoFut.innerText = ''; elMontoFut.classList.remove('monto--tachado'); }
            if (elNotaOtros) elNotaOtros.innerText = '';
            if (elPUnit) elPUnit.innerText = montoVal;
            if (elMontoFila) elMontoFila.innerText = montoVal;
            if (elMontoTotal) elMontoTotal.innerText = montoVal;

            if (targetMod > 0 || conc.includes('aporte') || conc.includes('mantenimiento') || conc.includes('mensualidad') || conc.includes('matr') || conc.includes('regular') || conc.includes('titulación')) {
                const boxActive = targetMod > 0 ? targetMod : 1;
                const b = document.getElementById(`box-mod-${boxActive}`);
                if (b) b.innerText = 'X';
                if (esDobleModulo) {
                    const b2 = document.getElementById('box-mod-2');
                    if (b2) b2.innerText = 'X';
                }
                if (elMontoAporte) elMontoAporte.innerText = montoVal;
                if (elMontoFut) elMontoFut.classList.add('monto--tachado');
            } else if (conc.includes('constancia')) {
                if (elConst) elConst.innerText = 'X';
                if (elMontoConst) elMontoConst.innerText = montoVal;
                if (elMontoFut) elMontoFut.classList.add('monto--tachado');
            } else if (conc.includes('fut')) {
                if (elFut) elFut.innerText = 'X';
                if (elMontoFut) elMontoFut.innerText = montoVal;
                if (elMontoConst) elMontoConst.classList.add('monto--tachado');
            } else {
                if (elOtrosTxt) elOtrosTxt.innerText = m.concepto || '';
                if (elNotaOtros) elNotaOtros.innerText = m.concepto || '';
                if (elMontoFut) elMontoFut.classList.add('monto--tachado');
            }

            // 7. Sincronizar Panel de Editar Notas
            const notaTexto = m.notas || '';
            const inputNotas = document.getElementById('factura-notas-input');
            if (inputNotas) inputNotas.value = notaTexto;
            sincronizarNotaConVoucher(notaTexto);
            sincronizarCopiaVoucher();

            const resAlumno = document.getElementById('notas-resumen-alumno');
            const resGrupo = document.getElementById('notas-resumen-grupo');
            const selectCambiar = document.getElementById('notas-cambiar-grupo-select');
            const resComp = document.getElementById('notas-resumen-comprobante');
            const resMonto = document.getElementById('notas-resumen-monto');
            if (resAlumno) resAlumno.innerText = m.nombre;
            if (resGrupo) {
                const grpNombre = m.grupo || est.grupo || 'General';
                const grpObj = (gruposGlobales || []).find(g => g.nombre === grpNombre);
                const count = grpObj && grpObj.total_alumnos !== undefined ? grpObj.total_alumnos : ((estudiantesGlobales || []).filter(e => e.grupo === grpNombre).length || 0);
                resGrupo.innerText = grpNombre + (count > 0 ? ' (' + count + ' alumnos)' : '');
            }
            if (selectCambiar && (m.grupo || est.grupo)) selectCambiar.value = m.grupo || est.grupo;
            if (resComp) resComp.innerText = `N° ${nroRec}`;
            if (resMonto) resMonto.innerText = `S/. ${montoVal}`;

            // Actualizar selector de recibo si difiere
            const selRec = document.getElementById('factura-recibo-select');
            if (selRec && selRec.value != reciboId) selRec.value = reciboId;

            // Actualizar lista mini de recibos del estudiante
            if (est.nombre) {
                const movsEst = (movimientosGlobales || []).filter(x => x.nombre && x.nombre.trim().toLowerCase() === est.nombre.trim().toLowerCase());
                actualizarListaRecibosMini(est, movsEst);
            }

            // Elementos de compatibilidad
            if (document.getElementById('factura-orden-ingreso')) document.getElementById('factura-orden-ingreso').innerText = 'Orden Ingreso N° ' + nroRec;
            if (document.getElementById('factura-fecha')) document.getElementById('factura-fecha').innerText = m.fecha;
            if (document.getElementById('factura-grupo')) document.getElementById('factura-grupo').innerText = m.grupo || 'General';
            if (document.getElementById('factura-docente')) document.getElementById('factura-docente').innerText = m.encargado || '';
            if (document.getElementById('factura-forma-pago')) document.getElementById('factura-forma-pago').innerText = m.metodo_pago || 'Efectivo en Caja';
            if (document.getElementById('factura-concepto')) document.getElementById('factura-concepto').innerText = m.concepto;
            if (document.getElementById('factura-precio-unit')) document.getElementById('factura-precio-unit').innerText = 'S/. ' + montoVal;
            if (document.getElementById('factura-total-fila')) document.getElementById('factura-total-fila').innerText = 'S/. ' + montoVal;
            if (document.getElementById('factura-monto-letras')) document.getElementById('factura-monto-letras').innerText = numeroALetras(m.monto || 0);

            // Refrescar el previsualizador de PDF si está en la pestaña de previsualización
            if (typeof vistaActualComprobante !== 'undefined' && vistaActualComprobante === 'pdf') {
                actualizarPrevisualizadorPDF();
            }
        }

        function sincronizarNotaConVoucher(texto) {
            const chk = document.getElementById('check-reflejar-nota');
            const val = (chk && !chk.checked) ? '' : (texto || '');
            const otrosEl1 = document.getElementById('factura-nota-otros');
            const otrosEl2 = document.getElementById('factura-otros-texto');
            const copiaOtrosEl1 = document.getElementById('copia-factura-nota-otros');
            const copiaOtrosEl2 = document.getElementById('copia-factura-otros-texto');
            if (otrosEl1) otrosEl1.innerText = val;
            if (otrosEl2) otrosEl2.innerText = val;
            if (copiaOtrosEl1) copiaOtrosEl1.innerText = val;
            if (copiaOtrosEl2) copiaOtrosEl2.innerText = val;
            debounceActualizarPDF();
        }

        function toggleReflejarNota(checked) {
            const inputNotas = document.getElementById('factura-notas-input');
            const val = checked && inputNotas ? inputNotas.value : '';
            const otrosEl1 = document.getElementById('factura-nota-otros');
            const otrosEl2 = document.getElementById('factura-otros-texto');
            const copiaOtrosEl1 = document.getElementById('copia-factura-nota-otros');
            const copiaOtrosEl2 = document.getElementById('copia-factura-otros-texto');
            if (otrosEl1) otrosEl1.innerText = val;
            if (otrosEl2) otrosEl2.innerText = val;
            if (copiaOtrosEl1) copiaOtrosEl1.innerText = val;
            if (copiaOtrosEl2) copiaOtrosEl2.innerText = val;
            debounceActualizarPDF();
        }

        function insertarNotaRapida(tag) {
            const input = document.getElementById('factura-notas-input');
            if (!input) return;
            if (input.value.trim() === '') {
                input.value = tag;
            } else {
                input.value += ` - ${tag}`;
            }
            sincronizarNotaConVoucher(input.value);
        }

        async function guardarNotasFactura() {
            const input = document.getElementById('factura-notas-input');
            const notas = input ? input.value.trim() : '';

            if (!currentFacturaReciboId) {
                // Guardar nota en estudiante si hay alumno activo
                if (currentFacturaEstudianteId) {
                    try {
                        const res = await fetch(`/api/estudiantes/${currentFacturaEstudianteId}/notas`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notas })
                        });
                        const data = await res.json();
                        if (data.success) {
                            const est = (estudiantesGlobales || []).find(e => e.id == currentFacturaEstudianteId);
                            if (est) est.notas = notas;
                            mostrarMensajeNotas("✅ Notas de estudiante guardadas correctamente.");
                        } else {
                            alert("Error al guardar notas: " + (data.error || 'Desconocido'));
                        }
                    } catch (e) {
                        alert("Error al guardar notas de estudiante.");
                    }
                } else {
                    alert("Seleccione un estudiante o comprobante para guardar notas.");
                }
                return;
            }

            try {
                const res = await fetch(`/api/movimientos/${currentFacturaReciboId}/notas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notas })
                });
                const data = await res.json();
                if (data.success) {
                    // Actualizar en memoria local
                    const m = (movimientosGlobales || []).find(x => x.id == currentFacturaReciboId);
                    if (m) m.notas = notas;

                    // Si también hay estudiante activo, actualizar nota
                    if (currentFacturaEstudianteId) {
                        const est = (estudiantesGlobales || []).find(e => e.id == currentFacturaEstudianteId);
                        if (est) est.notas = notas;
                    }

                    mostrarMensajeNotas("✅ Notas guardadas exitosamente y sincronizadas en Excel.");
                } else {
                    alert("Error al guardar notas: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                console.error("Error al guardar notas:", err);
                alert("Error de conexión al guardar notas.");
            }
        }

        function mostrarMensajeNotas(texto) {
            const statusMsg = document.getElementById('factura-notas-status');
            if (statusMsg) {
                statusMsg.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5"></i> ${texto}`;
                statusMsg.classList.remove('hidden');
                setTimeout(() => {
                    statusMsg.classList.add('hidden');
                }, 3500);
            }
        }

        function abrirModalConMovimiento(reciboId) {
            const m = (movimientosGlobales || []).find(x => x.id == reciboId);
            if (!m) {
                mostrarNotificacion('Comprobante no encontrado', 'advertencia');
                return;
            }

            // 1. Abrir modal
            const modal = document.getElementById('modal-nuevo-movimiento');
            if (modal) modal.classList.remove('hidden');

            // 2. Poblar campos en el formulario de la izquierda
            if (document.getElementById('form-tipo')) seleccionarTipoMovimiento(m.tipo || 'Ingreso');
            if (document.getElementById('form-rol-persona')) {
                document.getElementById('form-rol-persona').value = m.rol || 'Estudiante';
                seleccionarRolPersonaModal(m.rol || 'Estudiante');
            }
            if (document.getElementById('form-nombre')) document.getElementById('form-nombre').value = m.nombre || '';
            if (document.getElementById('form-dni')) document.getElementById('form-dni').value = m.dni || '';
            if (document.getElementById('form-telefono')) document.getElementById('form-telefono').value = m.telefono || '';
            if (document.getElementById('form-carrera')) document.getElementById('form-carrera').value = m.carrera || '';
            if (document.getElementById('form-grupo')) document.getElementById('form-grupo').value = m.grupo || '';
            if (document.getElementById('form-docente')) document.getElementById('form-docente').value = m.docente || '';
            if (document.getElementById('form-comprobante')) {
                const nro = m.comprobante ? String(m.comprobante).replace(/\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
                document.getElementById('form-comprobante').value = nro;
            }
            if (document.getElementById('form-monto')) document.getElementById('form-monto').value = Number(m.monto || 0).toFixed(2);
            if (document.getElementById('form-concepto')) document.getElementById('form-concepto').value = m.concepto || '';
            if (document.getElementById('form-fecha')) document.getElementById('form-fecha').value = m.fecha || new Date().toISOString().split('T')[0];
            if (document.getElementById('form-metodo')) document.getElementById('form-metodo').value = m.metodo || 'Efectivo';
            if (document.getElementById('form-estado')) document.getElementById('form-estado').value = m.estado || 'Pagado';

            // 3. Renderizar y sincronizar boleta oficial dual
            actualizarBoletaModalEnVivo();

            // 4. Activar banner de comprobante emitido listo para imprimir o descargar PDF
            const bEdicion = document.getElementById('modal-boleta-banner-edicion');
            const bEmitido = document.getElementById('modal-boleta-banner-emitido');
            if (bEdicion) bEdicion.classList.add('hidden');
            if (bEmitido) bEmitido.classList.remove('hidden');
        }

        function verBoletaDirecta(reciboId) {
            abrirModalConMovimiento(reciboId);
        }

        function irAFacturaConRecibo(reciboId) {
            verBoletaDirecta(reciboId);
        }

        function imprimirFactura() {
            window.print();
        }

        // Conversor oficial de cantidades numéricas a letras en Soles
        function numeroALetras(monto) {
            const enteros = Math.floor(monto);
            const centavos = Math.round((monto - enteros) * 100);
            const centavosStr = String(centavos).padStart(2, '0') + '/100 SOLES';

            const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
            const especiales = {
                10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
                20: 'VEINTE'
            };
            const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
            const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

            function convertirMenorMil(n) {
                if (n === 100) return 'CIEN';
                let res = '';
                const c = Math.floor(n / 100);
                const d = Math.floor((n % 100) / 10);
                const u = n % 10;

                if (c > 0) res += centenas[c] + ' ';
                const du = n % 100;
                if (du === 0) return res.trim();

                if (especiales[du]) {
                    res += especiales[du];
                } else if (du > 15 && du < 20) {
                    res += 'DIECI' + unidades[u];
                } else if (du > 20 && du < 30) {
                    res += 'VEINTI' + unidades[u];
                } else {
                    if (d > 0) res += decenas[d];
                    if (d > 0 && u > 0) res += ' Y ';
                    if (u > 0) res += unidades[u];
                }
                return res.trim();
            }

            let texto = '';
            if (enteros === 0) {
                texto = 'CERO';
            } else if (enteros === 1000) {
                texto = 'MIL';
            } else if (enteros > 1000) {
                const miles = Math.floor(enteros / 1000);
                const resto = enteros % 1000;
                const txtMiles = miles === 1 ? 'MIL' : (convertirMenorMil(miles) + ' MIL');
                texto = txtMiles + (resto > 0 ? (' ' + convertirMenorMil(resto)) : '');
            } else {
                texto = convertirMenorMil(enteros);
            }

            return `SON: ${texto} CON ${centavosStr}`;
        }

        


        // =========================================================================
        // CONFIGURACIÓN INSTITUCIONAL, SEDES Y FACTURACIÓN
        // =========================================================================
        let configuracionGlobal = {};

        async function cargarConfiguracion() {
            try {
                const res = await fetch('/api/configuracion');
                configuracionGlobal = await res.json();

                const mapFields = {
                    'cfg-nombre-institucion': 'nombre_institucion',
                    'cfg-ruc': 'ruc',
                    'cfg-campus': 'campus',
                    'cfg-direccion': 'direccion',
                    'cfg-telefono': 'telefono',
                    'cfg-email': 'email',
                    'cfg-serie-comprobante': 'serie_comprobante',
                    'cfg-correlativo': 'correlativo_inicio',
                    'cfg-moneda': 'moneda',
                    'cfg-responsable-nombre': 'responsable_nombre',
                    'cfg-responsable-cargo': 'responsable_cargo',
                    'cfg-mensaje-pie': 'mensaje_pie'
                };

                for (const [id, key] of Object.entries(mapFields)) {
                    const el = document.getElementById(id);
                    if (el) el.value = configuracionGlobal[key] || '';
                }

                actualizarVistaPreviaConfig();
                actualizarMembretesFactura();
            } catch (err) {
                console.error("Error al cargar configuración:", err);
            }
        }

        async function guardarConfiguracionForm(e) {
            if (e && e.preventDefault) e.preventDefault();
            const payload = {
                nombre_institucion: (document.getElementById('cfg-nombre-institucion')?.value || '').trim(),
                ruc: (document.getElementById('cfg-ruc')?.value || '').trim(),
                campus: (document.getElementById('cfg-campus')?.value || '').trim(),
                direccion: (document.getElementById('cfg-direccion')?.value || '').trim(),
                telefono: (document.getElementById('cfg-telefono')?.value || '').trim(),
                email: (document.getElementById('cfg-email')?.value || '').trim(),
                serie_comprobante: (document.getElementById('cfg-serie-comprobante')?.value || 'B001').trim(),
                correlativo_inicio: (document.getElementById('cfg-correlativo')?.value || '000203').trim(),
                moneda: (document.getElementById('cfg-moneda')?.value || 'S/.').trim(),
                responsable_nombre: (document.getElementById('cfg-responsable-nombre')?.value || '').trim(),
                responsable_cargo: (document.getElementById('cfg-responsable-cargo')?.value || '').trim(),
                mensaje_pie: (document.getElementById('cfg-mensaje-pie')?.value || '').trim()
            };

            try {
                const res = await fetch('/api/configuracion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    configuracionGlobal = data.configuracion || payload;
                    actualizarVistaPreviaConfig();
                    actualizarMembretesFactura();
                    
                    const msg = document.getElementById('config-status-msg');
                    if (msg) {
                        msg.classList.remove('hidden');
                        setTimeout(() => msg.classList.add('hidden'), 4000);
                    }
                    alert("✅ Configuración institucional guardada exitosamente y sincronizada en el libro Excel.");
                } else {
                    alert("Error al guardar configuración: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al guardar configuración.");
            }
        }

        function actualizarVistaPreviaConfig() {
            const nombre = document.getElementById('cfg-nombre-institucion')?.value || configuracionGlobal.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA';
            const ruc = document.getElementById('cfg-ruc')?.value || configuracionGlobal.ruc || '20485938210';
            const campus = document.getElementById('cfg-campus')?.value || configuracionGlobal.campus || 'Campus Central San Miguel';
            const direccion = document.getElementById('cfg-direccion')?.value || configuracionGlobal.direccion || 'Av. Costanera 1200, San Miguel, Lima';
            const tel = document.getElementById('cfg-telefono')?.value !== undefined ? document.getElementById('cfg-telefono').value.trim() : (configuracionGlobal.telefono || '');
            const email = document.getElementById('cfg-email')?.value !== undefined ? document.getElementById('cfg-email').value.trim() : (configuracionGlobal.email || '');
            const serie = document.getElementById('cfg-serie-comprobante')?.value || configuracionGlobal.serie_comprobante || 'B001';
            const correlativo = document.getElementById('cfg-correlativo')?.value || configuracionGlobal.correlativo_inicio || '000203';
            const moneda = document.getElementById('cfg-moneda')?.value || configuracionGlobal.moneda || 'S/.';
            const resp = document.getElementById('cfg-responsable-nombre')?.value || configuracionGlobal.responsable_nombre || 'Dirección General y Tesorería';
            const cargo = document.getElementById('cfg-responsable-cargo')?.value || configuracionGlobal.responsable_cargo || 'Administración de Caja Institucional';
            const pie = document.getElementById('cfg-mensaje-pie')?.value || configuracionGlobal.mensaje_pie || 'Comprobante oficial válido para control institucional interno.';

            if (document.getElementById('preview-cfg-nombre')) document.getElementById('preview-cfg-nombre').innerText = nombre;
            if (document.getElementById('preview-cfg-ruc')) document.getElementById('preview-cfg-ruc').innerText = ruc;
            if (document.getElementById('preview-cfg-campus')) document.getElementById('preview-cfg-campus').innerText = campus;
            if (document.getElementById('preview-cfg-direccion')) document.getElementById('preview-cfg-direccion').innerText = direccion;
            if (document.getElementById('preview-cfg-serie')) document.getElementById('preview-cfg-serie').innerText = `${serie}-${correlativo}`;
            if (document.getElementById('preview-cfg-monto')) document.getElementById('preview-cfg-monto').innerText = `${moneda} 150.00`;
            if (document.getElementById('preview-cfg-responsable')) document.getElementById('preview-cfg-responsable').innerText = resp;
            if (document.getElementById('preview-cfg-cargo')) document.getElementById('preview-cfg-cargo').innerText = cargo;
            if (document.getElementById('preview-cfg-pie')) document.getElementById('preview-cfg-pie').innerText = pie;

            const contactEl = document.getElementById('preview-cfg-contacto');
            if (contactEl) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(`Tel: ${tel}`);
                    if (email) parts.push(`Email: ${email}`);
                    contactEl.innerText = parts.join(' · ');
                    contactEl.className = 'text-[9px] text-slate-700 dark:text-slate-300 font-semibold mt-1';
                } else {
                    contactEl.innerText = '(Teléfono y correo pendientes de configuración manual)';
                    contactEl.className = 'text-[9px] text-slate-400 italic mt-1';
                }
            }
        }

        function actualizarMembretesFactura() {
            const nombreOficialVoucher = 'INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS';
            const nombre = configuracionGlobal.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA';
            const ruc = configuracionGlobal.ruc || '20485938210';
            const campus = configuracionGlobal.campus || 'Campus Central San Miguel';
            const direccion = configuracionGlobal.direccion || 'Av. Costanera 1200, San Miguel, Lima';
            const tel = configuracionGlobal.telefono ? configuracionGlobal.telefono.trim() : '';
            const email = configuracionGlobal.email ? configuracionGlobal.email.trim() : '';
            const resp = configuracionGlobal.responsable_nombre || 'Dirección General y Tesorería';
            const cargo = configuracionGlobal.responsable_cargo || 'Administración de Caja Institucional';
            const pie = configuracionGlobal.mensaje_pie || 'Comprobante oficial válido para control institucional interno.';

            const elNombre = document.getElementById('factura-inst-nombre');
            if (elNombre) elNombre.innerText = nombreOficialVoucher;
            const elCopiaNombre = document.getElementById('copia-factura-inst-nombre');
            if (elCopiaNombre) elCopiaNombre.innerText = nombreOficialVoucher;

            const elInfo = document.getElementById('factura-inst-info');
            if (elInfo) {
                elInfo.innerHTML = `RUC: ${ruc} · Campus: <strong class="text-slate-800">${campus}</strong> · Dirección: ${direccion}`;
            }

            const elContacto = document.getElementById('factura-contacto-row');
            if (elContacto) {
                if (tel || email) {
                    let parts = [];
                    if (tel) parts.push(`Teléfono: <strong class="text-slate-800">${tel}</strong>`);
                    if (email) parts.push(`Correo: <strong class="text-slate-800">${email}</strong>`);
                    elContacto.innerHTML = parts.join(' · ');
                } else {
                    elContacto.innerHTML = `<span class="text-slate-400 italic text-[10px]"><i class="fa-solid fa-circle-info mr-1"></i> (Teléfono y correo pendientes de configuración manual en la pestaña Configuración)</span>`;
                }
            }

            const elResp = document.getElementById('factura-inst-responsable');
            if (elResp) elResp.innerText = resp;

            const elCargo = document.getElementById('factura-inst-cargo');
            if (elCargo) elCargo.innerText = cargo;

            const elPie = document.getElementById('factura-inst-pie');
            if (elPie) elPie.innerText = pie;
        }

        async function eliminarSeccionActual() {
            if (!currentPlantillaGrupoId) return;
            const g = gruposGlobales.find(x => x.id == currentPlantillaGrupoId);
            const nombre = g ? g.nombre : 'esta sección';
            if (!confirm(`¿Está seguro de eliminar la sección "${nombre}"?\nLos estudiantes matriculados pasarán a la sección "General" y los datos se preservarán intactos.`)) {
                return;
            }
            try {
                const res = await fetch(`/api/grupos/${currentPlantillaGrupoId}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ Sección eliminada exitosamente.`);
                    currentPlantillaGrupoId = null;
                    await cargarGrupos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo eliminar la sección'}`);
                }
            } catch (err) {
                alert("Error de conexión al eliminar sección.");
            }
        }


        // =========================================================================
        // GESTIÓN DE TEMAS (DARK OBSIDIAN LUXURY FINTECH / LIGHT EXECUTIVE)
        // =========================================================================
        function initTheme() {
            const savedTheme = localStorage.getItem('cetpro_theme') || 'dark';
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('cetpro_theme', isDark ? 'dark' : 'light');

            if (typeof renderChart === 'function' && typeof window.chartDataGlobal !== 'undefined' && window.chartDataGlobal) {
                renderChart(window.chartDataGlobal);
            }

            mostrarNotificacion(isDark ? '🌙 Tema Oscuro Obsidian Activado' : '☀️ Tema Claro Ejecutivo Activado', 'info');
        }

        // =========================================================================
        // ASIGNAR O MODIFICAR / CAMBIAR CARRERA DE CUALQUIER ESTUDIANTE
        // =========================================================================
        async function abrirModalAsignarCarrera(id, nombre, carreraActual, grupoActual) {
            const modal = document.getElementById('modal-asignar-carrera-estudiante');
            if (!modal) return;

            document.getElementById('modal-asignar-estudiante-id').value = id;
            document.getElementById('modal-asignar-estudiante-nombre').innerText = nombre;

            const tituloEl = document.getElementById('modal-asignar-carrera-titulo');
            const badgeActual = document.getElementById('modal-asignar-carrera-actual-badge');
            const esSinAsignar = !carreraActual || carreraActual.trim() === '' || carreraActual === 'Sin Asignar' || carreraActual.includes('Pendiente');

            if (tituloEl) {
                tituloEl.innerText = esSinAsignar ? 'Asignar Carrera al Estudiante' : 'Modificar o Cambiar Carrera';
            }

            if (badgeActual) {
                badgeActual.innerText = esSinAsignar ? 'Sin Asignar (Pendiente)' : carreraActual;
                badgeActual.className = esSinAsignar
                    ? 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
            }

            // Poblar select de carreras dinámicamente con carrerasGlobales
            const selectCarrera = document.getElementById('modal-asignar-select-carrera');
            if (selectCarrera) {
                let opts = '<option value="Sin Asignar (Pendiente)">Sin Asignar (Pendiente)</option>';

                const carrerasLista = (typeof carrerasGlobales !== 'undefined' && carrerasGlobales && carrerasGlobales.length > 0)
                    ? carrerasGlobales.map(c => c.nombre)
                    : [
                        'Computación e Informática',
                        'Confección Textil',
                        'Peluquería y Barbería',
                        'Mecánica Automotriz',
                        'Electricidad y Electrónica',
                        'Hostelería y Turismo',
                        'Panadería y Pastelería',
                        'Carpintería y Ebanistería'
                    ];

                carrerasLista.forEach(nom => {
                    opts += `<option value="${nom}">${nom}</option>`;
                });
                selectCarrera.innerHTML = opts;

                // Preseleccionar carrera actual
                if (!esSinAsignar && carrerasLista.includes(carreraActual)) {
                    selectCarrera.value = carreraActual;
                } else if (esSinAsignar) {
                    selectCarrera.value = 'Sin Asignar (Pendiente)';
                } else {
                    selectCarrera.value = carreraActual;
                }
            }

            // Poblar grupos
            const selectGrupo = document.getElementById('modal-asignar-select-grupo');
            if (selectGrupo) {
                let gOpts = '<option value="Sin Asignar">Sin Asignar</option><option value="General">General</option>';
                if (typeof gruposGlobales !== 'undefined' && gruposGlobales && gruposGlobales.length > 0) {
                    gruposGlobales.forEach(g => {
                        gOpts += `<option value="${g.nombre}">${g.nombre} (${g.encargado})</option>`;
                    });
                }
                selectGrupo.innerHTML = gOpts;
                if (grupoActual) selectGrupo.value = grupoActual;
            }

            modal.classList.remove('hidden');
        }

        function cerrarModalAsignarCarrera() {
            const modal = document.getElementById('modal-asignar-carrera-estudiante');
            if (modal) modal.classList.add('hidden');
        }

        async function guardarAsignacionCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();

            const id = document.getElementById('modal-asignar-estudiante-id').value;
            const carrera = document.getElementById('modal-asignar-select-carrera').value;
            const grupo = document.getElementById('modal-asignar-select-grupo').value;

            try {
                const res = await fetch(`/api/estudiantes/${id}/asignar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ carrera, grupo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAsignarCarrera();
                    alert(`✅ Carrera actualizada a "${carrera}" correctamente y sincronizada en el libro Excel.`);
                    await cargarEstudiantes();
                    await cargarStats();
                    if (typeof cargarCarreras === 'function') await cargarCarreras();
                    if (typeof cargarGrupos === 'function') await cargarGrupos();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar la carrera'));
                }
            } catch (err) {
                alert('Error de conexión al asignar carrera.');
            }
        }

        // =========================================================================
        // CENTRO OFICIAL DE RESPALDO Y RESTABLECIMIENTO (BACKUP)
        // =========================================================================
        let archivoSeleccionadoParaRestablecer = null;

        async function cargarBackups() {
            try {
                const res = await fetch('/api/backups/estado-actual');
                const data = await res.json();

                const elDbSize = document.getElementById('respaldo-db-size');
                const elDbMtime = document.getElementById('respaldo-db-mtime');
                const elDbSha = document.getElementById('respaldo-db-sha');
                const badgeCount = document.getElementById('badge-backups-count');

                if (badgeCount) badgeCount.innerText = '2 Versiones';

                if (data.db) {
                    if (elDbSize) elDbSize.innerText = data.db.tamano;
                    if (elDbMtime) elDbMtime.innerText = data.db.fecha_modificacion;
                    if (elDbSha) {
                        elDbSha.innerText = data.db.sha256 ? data.db.sha256.substring(0, 24) + '...' : '--';
                        elDbSha.title = 'SHA-256 Completo: ' + (data.db.sha256 || '');
                    }
                }

                // Configurar Drag & Drop en el dropzone si no está configurado
                const dropzone = document.getElementById('dropzone-restablecer');
                if (dropzone && !dropzone.dataset.dragInit) {
                    dropzone.dataset.dragInit = 'true';
                    ['dragenter', 'dragover'].forEach(evtName => {
                        dropzone.addEventListener(evtName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropzone.classList.add('border-teal-400', 'bg-teal-500/10');
                        });
                    });
                    ['dragleave', 'drop'].forEach(evtName => {
                        dropzone.addEventListener(evtName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropzone.classList.remove('border-teal-400', 'bg-teal-500/10');
                        });
                    });
                    dropzone.addEventListener('drop', (e) => {
                        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
                            seleccionarArchivoParaRestablecer({ target: { files: e.dataTransfer.files } });
                        }
                    });
                }
            } catch (err) {
                console.error("Error al cargar estado del respaldo:", err);
            }
        }

        function seleccionarArchivoParaRestablecer(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            archivoSeleccionadoParaRestablecer = files[0];

            const infoEl = document.getElementById('info-archivo-seleccionado');
            const nameEl = document.getElementById('label-archivo-nombre');
            const sizeEl = document.getElementById('label-archivo-size');
            const btnEl = document.getElementById('btn-ejecutar-restablecer');

            if (infoEl) infoEl.classList.remove('hidden');
            if (nameEl) nameEl.innerText = archivoSeleccionadoParaRestablecer.name;
            if (sizeEl) {
                const kb = Math.round(archivoSeleccionadoParaRestablecer.size / 1024);
                sizeEl.innerText = kb > 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb + ' KB';
            }
            if (btnEl) btnEl.removeAttribute('disabled');
        }

        async function ejecutarRestablecimientoDesdeArchivo() {
            if (!archivoSeleccionadoParaRestablecer) {
                alert('Por favor selecciona primero un archivo de respaldo (.db o .zip).');
                return;
            }

            const fileName = archivoSeleccionadoParaRestablecer.name;
            const msgConfirm = 'ADVERTENCIA DE SEGURIDAD:\n\n' +
                '¿Está seguro de reestablecer el sistema con el archivo:\n"' + fileName + '"?\n\n' +
                '• Se restaurarán todos los datos contenidos en el archivo.\n' +
                '• El sistema creará automáticamente un respaldo preventivo de protección antes de aplicar los cambios.\n\n' +
                '¿Desea continuar?';

            if (!confirm(msgConfirm)) return;

            const btnEl = document.getElementById('btn-ejecutar-restablecer');
            if (btnEl) {
                btnEl.setAttribute('disabled', 'true');
                btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Reestableciendo sistema...</span>';
            }

            try {
                const reader = new FileReader();
                reader.onload = async function() {
                    try {
                        const base64Data = reader.result.split(',')[1];
                        const res = await fetch('/api/backups/restablecer-archivo', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileName: fileName,
                                fileBase64: base64Data
                            })
                        });

                        const data = await res.json();
                        if (data.success) {
                            alert('✅ ' + data.message + '\n\n' +
                                'Estadísticas del Sistema Reestablecido:\n' +
                                '• Alumnos: ' + (data.stats ? data.stats.estudiantes : '--') + '\n' +
                                '• Movimientos: ' + (data.stats ? data.stats.movimientos : '--') + '\n' +
                                '• Total Recaudado: S/. ' + (data.stats ? Number(data.stats.total_ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '--'));
                            
                            await cargarTodo();
                            await cargarBackups();
                        } else {
                            alert('❌ Error al reestablecer el sistema:\n' + (data.error || 'Archivo incompatible o dañado.'));
                        }
                    } catch (netErr) {
                        alert('Error de conexión al enviar el archivo.');
                    } finally {
                        if (btnEl) {
                            btnEl.removeAttribute('disabled');
                            btnEl.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>Reestablecer Sistema Ahora</span>';
                        }
                    }
                };
                reader.readAsDataURL(archivoSeleccionadoParaRestablecer);
            } catch (err) {
                alert('No se pudo leer el archivo seleccionado.');
                if (btnEl) {
                    btnEl.removeAttribute('disabled');
                    btnEl.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>Reestablecer Sistema Ahora</span>';
                }
            }
        }

        async function cargarTodo() {
            if (window.location.protocol === 'file:') {
                document.getElementById('banner-alerta-protocolo')?.classList.remove('hidden');
                console.warn('Ejecutando en protocolo file://. El servidor Node.js debe iniciarse en http://localhost:5000');
            }
            initTheme();
            await cargarConfiguracion();
            await cargarCarreras();
            await cargarStats();
            await cargarGrupos();
            await cargarMovimientos();
            await cargarEstudiantes();
            await cargarControlPagos();
            await cargarDocentes();
            await cargarDeudores();
            await cargarCalendarizacionDiario();
            await cargarRespaldos();
        }

        // 1. STATS Y DASHBOARD
        async function cargarStats() {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('kpi-saldo').innerText = fMoney(data.saldo_actual);
                document.getElementById('kpi-ingresos').innerText = fMoney(data.total_ingresos);
                document.getElementById('kpi-egresos').innerText = fMoney(data.total_egresos);
                document.getElementById('kpi-deudas').innerText = fMoney(data.total_deudas);

                document.getElementById('kpi-ingresos-mes').innerText = `Este mes: ${fMoney(data.ingresos_mes)}`;
                document.getElementById('kpi-egresos-mes').innerText = `Este mes: ${fMoney(data.egresos_mes)}`;

                document.getElementById('kpi-docentes-salidas').innerText = fMoney(data.docentes.total_salidas);
                document.getElementById('kpi-docentes-entradas').innerText = fMoney(data.docentes.total_entradas);
                document.getElementById('kpi-docentes-balance').innerText = fMoney(data.docentes.balance);

                if (data.estudiantes) {
                    document.getElementById('est-total-alumnos').innerText = data.estudiantes.total_alumnos;
                    document.getElementById('est-faltan-completar').innerText = `${data.estudiantes.faltan_completar} Alumnos`;
                    document.getElementById('est-deben-todo').innerText = `${data.estudiantes.deben_todo} Alumnos`;
                    document.getElementById('est-saldo-restante').innerText = fMoney(data.estudiantes.saldo_restante);
                    
                    const totalDeudores = data.estudiantes.faltan_completar + data.estudiantes.deben_todo;
                    document.getElementById('badge-faltan-completar').innerText = totalDeudores;
                }

                if (data.meses_detalle) {
                    renderTablaResultados(data.meses_detalle, data.año_actual);
                }

                renderChart(data.chart);
                renderReporteCarreras(data.carreras);
            } catch (err) {
                console.error("Error cargando estadísticas:", err);
            }
        }

        function renderTablaResultados(meses, año) {
            const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const anioLabel = document.getElementById('label-ano-resultados');
            if (anioLabel) anioLabel.innerText = año || 2026;

            let totalIngresos = 0;
            let totalEgresos = 0;
            let mejorMes = { nombre: '--', monto: 0 };
            let mayorGasto = { nombre: '--', monto: 0 };
            let mesesConMov = 0;

            const htmlRows = meses.map(m => {
                totalIngresos += m.ingresos;
                totalEgresos += m.egresos;

                if (m.ingresos > mejorMes.monto) {
                    mejorMes = { nombre: m.mes_nombre, monto: m.ingresos };
                }
                if (m.egresos > mayorGasto.monto) {
                    mayorGasto = { nombre: m.mes_nombre, monto: m.egresos };
                }
                if (m.ingresos > 0 || m.egresos > 0) mesesConMov++;

                let badgeEstado = '<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">Sin Movimiento</span>';
                if (m.estado === 'Superávit') {
                    badgeEstado = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Superávit</span>';
                } else if (m.estado === 'Déficit') {
                    badgeEstado = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Déficit</span>';
                } else if (m.estado === 'Equilibrado') {
                    badgeEstado = '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">En Equilibrio</span>';
                }

                let badgeNeto = `<span class="text-slate-400 font-bold">S/. 0.00</span>`;
                if (m.neto > 0) {
                    badgeNeto = `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i> +S/. ${fMoney(m.neto)}</span>`;
                } else if (m.neto < 0) {
                    badgeNeto = `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-arrow-trend-down mr-1 text-[10px]"></i> -S/. ${fMoney(Math.abs(m.neto))}</span>`;
                }

                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3 px-4 font-bold text-slate-800 flex items-center">
                            <i class="fa-regular fa-calendar text-sky-600 mr-2"></i>
                            <span>${m.mes_nombre}</span>
                            ${m.movimientos_count > 0 ? `<span class="ml-2 bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-semibold">${m.movimientos_count} movs</span>` : ''}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-emerald-600">
                            ${m.ingresos > 0 ? `+ S/. ${fMoney(m.ingresos)}` : '<span class="text-slate-400 font-normal">S/. 0.00</span>'}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600">
                            ${m.egresos > 0 ? `- S/. ${fMoney(m.egresos)}` : '<span class="text-slate-400 font-normal">S/. 0.00</span>'}
                        </td>
                        <td class="py-3 px-4 text-right">
                            ${badgeNeto}
                        </td>
                        <td class="py-3 px-4 text-center font-bold text-slate-600 dark:text-cyan-400">
                            ${m.margen}
                        </td>
                        <td class="py-3 px-4 text-center">
                            ${badgeEstado}
                        </td>
                        <td class="py-3 px-4 text-right font-black ${m.saldo_acumulado >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-rose-700 dark:text-rose-300'}">
                            S/. ${fMoney(m.saldo_acumulado)}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="filtrarCajaPorMes('${m.mes_str}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 font-bold text-[10px] transition" title="Ver movimientos de ${m.mes_nombre} en la caja">
                                <i class="fa-solid fa-arrow-right-to-bracket mr-1"></i>Ver en Caja
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            const saldoFinal = totalIngresos - totalEgresos;
            const margenAnual = totalIngresos > 0 ? `${((saldoFinal / totalIngresos) * 100).toFixed(1)}%` : '-';
            const estadoAnual = saldoFinal >= 0 ? 'SUPERÁVIT ANUAL' : 'DÉFICIT ANUAL';

            const htmlFoot = `
                <tr class="bg-slate-900 text-white font-extrabold text-xs">
                    <td class="py-4 px-4 uppercase tracking-wider text-amber-300 flex items-center">
                        <i class="fa-solid fa-award text-amber-400 mr-2 text-base"></i>
                        <span>TOTALES ANUALES ACUMULADOS (${año || 2026})</span>
                    </td>
                    <td class="py-4 px-4 text-right text-emerald-400 font-black text-sm">+ S/. ${fMoney(totalIngresos)}</td>
                    <td class="py-4 px-4 text-right text-rose-400 font-black text-sm">- S/. ${fMoney(totalEgresos)}</td>
                    <td class="py-4 px-4 text-right font-black text-sm">
                        <span class="inline-flex items-center px-3 py-1 rounded-lg ${saldoFinal >= 0 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/30 text-rose-300 border border-rose-400/40'}">
                            ${saldoFinal >= 0 ? '+' : '-'} S/. ${fMoney(Math.abs(saldoFinal))}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-center text-cyan-300 font-bold">${margenAnual}</td>
                    <td class="py-4 px-4 text-center">
                        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide ${saldoFinal >= 0 ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-300 border border-rose-400/30'}">
                            ${estadoAnual}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-right text-sky-300 font-black text-base">S/. ${fMoney(saldoFinal)}</td>
                    <td class="py-4 px-4 text-center">
                        <span class="text-slate-400 font-bold text-xs">—</span>
                    </td>
                </tr>
            `;

            // Insertar en tabla del Dashboard
            const tbodyDash = document.getElementById('tabla-resultados-dashboard');
            const tfootDash = document.getElementById('totales-resultados-dashboard');
            if (tbodyDash) tbodyDash.innerHTML = htmlRows;
            if (tfootDash) tfootDash.innerHTML = htmlFoot;

            // Insertar en sección dedicada
            const tbodyDed = document.getElementById('tabla-resultados-dedicada');
            const tfootDed = document.getElementById('totales-resultados-dedicada');
            if (tbodyDed) tbodyDed.innerHTML = htmlRows;
            if (tfootDed) tfootDed.innerHTML = htmlFoot;

            // Tarjetas de la sección dedicada
            const elMejorNom = document.getElementById('res-mejor-mes-nombre');
            const elMejorMon = document.getElementById('res-mejor-mes-monto');
            const elMayorNom = document.getElementById('res-mayor-gasto-nombre');
            const elMayorMon = document.getElementById('res-mayor-gasto-monto');
            const elPromIng = document.getElementById('res-promedio-ingreso');
            const elMargen = document.getElementById('res-margen-anual');
            const elEstGlobal = document.getElementById('res-estado-global');

            if (elMejorNom) elMejorNom.innerText = mejorMes.nombre;
            if (elMejorMon) elMejorMon.innerText = `S/. ${fMoney(mejorMes.monto)}`;
            if (elMayorNom) elMayorNom.innerText = mayorGasto.nombre;
            if (elMayorMon) elMayorMon.innerText = `S/. ${fMoney(mayorGasto.monto)}`;

            const prom = mesesConMov > 0 ? (totalIngresos / mesesConMov) : 0;
            if (elPromIng) elPromIng.innerText = `S/. ${fMoney(prom)}`;
            if (elMargen) elMargen.innerText = margenAnual;
            if (elEstGlobal) {
                elEstGlobal.innerText = saldoFinal >= 0 ? 'Superávit Institucional' : 'Déficit Institucional';
                elEstGlobal.className = `text-xs font-bold ${saldoFinal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
            }

            // Preparar tabla de impresión
            const printTbody = document.getElementById('print-tabla-resultados');
            const printTfoot = document.getElementById('print-totales-resultados');
            const printFecha = document.getElementById('print-res-fecha');
            if (printFecha) printFecha.innerText = new Date().toLocaleDateString('es-PE', { dateStyle: 'long' });

            if (printTbody) {
                printTbody.innerHTML = meses.map(m => `
                    <tr class="border-b border-slate-200">
                        <td class="border border-slate-300 py-1.5 px-3 font-semibold text-slate-800">${m.mes_nombre}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right text-emerald-700 font-bold">S/. ${fMoney(m.ingresos)}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right text-rose-700 font-bold">S/. ${fMoney(m.egresos)}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right font-black ${m.neto >= 0 ? 'text-emerald-800' : 'text-rose-800'}">
                            ${m.neto >= 0 ? '+' : '-'} S/. ${fMoney(Math.abs(m.neto))}
                        </td>
                        <td class="border border-slate-300 py-1.5 px-3 text-center">${m.margen}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-center font-bold">${m.estado}</td>
                        <td class="border border-slate-300 py-1.5 px-3 text-right font-bold">S/. ${fMoney(m.saldo_acumulado)}</td>
                    </tr>
                `).join('');
            }

            if (printTfoot) {
                printTfoot.innerHTML = `
                    <tr class="bg-slate-200 text-slate-900 font-black">
                        <td class="border border-slate-300 py-2.5 px-3">TOTAL ANUAL ${año || 2026}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right text-emerald-800">S/. ${fMoney(totalIngresos)}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right text-rose-800">S/. ${fMoney(totalEgresos)}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right">S/. ${fMoney(saldoFinal)}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-center">${margenAnual}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-center uppercase">${estadoAnual}</td>
                        <td class="border border-slate-300 py-2.5 px-3 text-right font-black">S/. ${fMoney(saldoFinal)}</td>
                    </tr>
                `;
            }
        }

        function exportarResultadosExcel() {
            window.location.href = '/api/exportar/resultados';
        }

        function abrirModalImprimirResultados() {
            document.getElementById('modal-imprimir-resultados').classList.remove('hidden');
        }

        function cerrarModalImprimirResultados() {
            document.getElementById('modal-imprimir-resultados').classList.add('hidden');
        }

        function imprimirResultados() {
            abrirModalImprimirResultados();
            setTimeout(() => {
                window.print();
            }, 300);
        }

        function filtrarCajaPorMes(mesStr) {
            cambiarSeccion('caja');
            const anio = 2026;
            const prefijo = `${anio}-${mesStr}`;
            const filtrados = movimientosGlobales.filter(m => m.fecha && m.fecha.startsWith(prefijo));
            renderTablaMovimientos(filtrados);
            const inputBuscar = document.getElementById('filtro-buscar');
            if (inputBuscar) inputBuscar.value = '';
            alert(`Filtrando caja: se encontraron ${filtrados.length} movimientos en el mes ${mesStr}/${anio}.`);
        }

        function renderChart(chartData) {
            if (!chartData) return;
            window.chartDataGlobal = chartData;
            const canvas = document.getElementById('chart-mensual');
            if (!canvas) return;
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js no disponible o modo sin conexion.');
                return;
            }
            const ctx = canvas.getContext('2d');
            if (myChart) myChart.destroy();

            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#cbd5e1' : '#475569';
            const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : '#f1f5f9';

            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.meses,
                    datasets: [
                        {
                            label: 'Ingresos (Entradas)',
                            data: chartData.ingresos,
                            backgroundColor: 'rgba(16, 185, 129, 0.85)',
                            borderRadius: 6
                        },
                        {
                            label: 'Egresos (Salidas)',
                            data: chartData.egresos,
                            backgroundColor: 'rgba(244, 63, 94, 0.85)',
                            borderRadius: 6
                        },
                        {
                            label: 'Saldo Neto',
                            data: chartData.saldos,
                            type: 'line',
                            borderColor: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            borderWidth: 2.5,
                            tension: 0.3,
                            fill: false,
                            pointBackgroundColor: '#38bdf8'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { color: textColor, boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } },
                        tooltip: {
                            callbacks: {
                                label: (item) => `${item.dataset.label}: S/. ${Number(item.raw).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: gridColor },
                            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
                        }
                    }
                }
            });
        }

        // 2. CAJA DE MOVIMIENTOS
        async function cargarMovimientos() {
            try {
                const res = await fetch('/api/movimientos');
                movimientosGlobales = await res.json();
                renderTablaMovimientos(movimientosGlobales);
            } catch (err) {
                console.error("Error al cargar movimientos:", err);
            }
        }

        function renderTablaMovimientos(lista) {
            const tbody = document.getElementById('tabla-movimientos');
            if (lista.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-slate-400">No se encontraron movimientos registrados con los filtros aplicados.</td></tr>`;
                return;
            }

            tbody.innerHTML = lista.map(m => {
                const isIngreso = m.tipo === 'Ingreso';
                const isPagado = m.estado === 'Pagado';
                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                        <td class="py-3 px-4 font-semibold text-slate-600">${m.fecha}</td>
                        <td class="py-3 px-4">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isIngreso ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                <i class="fa-solid ${isIngreso ? 'fa-arrow-down' : 'fa-arrow-up'} mr-1"></i>
                                ${m.tipo}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-800">${m.nombre}</div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase">${m.rol}</span>
                        </td>
                        <td class="py-3 px-4">
                            ${m.grupo && m.grupo !== 'General' ? `<span class="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">${m.grupo}</span>` : '<span class="text-slate-400 text-[10px]">General</span>'}
                            ${m.encargado ? `<div class="text-[10px] text-slate-500 font-medium truncate mt-0.5 flex items-center"><i class="fa-solid fa-chalkboard-user mr-1 text-slate-400"></i>${m.encargado}</div>` : ''}
                        </td>
                        <td class="py-3 px-4 text-slate-600">${m.carrera || 'General'}</td>
                        <td class="py-3 px-4">
                            <span class="text-slate-800 font-medium">${m.concepto}</span>
                            ${m.notas ? `<div class="text-[10px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 inline-block border border-amber-200/60 font-medium"><i class="fa-regular fa-note-sticky mr-1 text-amber-500"></i>${m.notas}</div>` : ''}
                            ${m.comprobante ? `<span class="block text-[10px] text-slate-400">Comp: ${m.comprobante}</span>` : ''}
                        </td>
                        <td class="py-3 px-4 text-right font-black ${isIngreso ? 'text-emerald-600' : 'text-rose-600'} text-xs">
                            ${isIngreso ? '+' : '-'} S/. ${Number(m.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">${m.metodo_pago || 'Efectivo'}</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isPagado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                                ${isPagado ? '● Pagado' : '⏱ Pendiente'}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <button onclick="eliminarMovimiento(${m.id})" class="text-slate-400 hover:text-rose-600 p-1 transition" title="Eliminar movimiento">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function filtrarMovimientos() {
            const buscar = (document.getElementById('filtro-buscar')?.value || '').toLowerCase();
            const tipo = document.getElementById('filtro-tipo')?.value || '';
            const rol = document.getElementById('filtro-rol')?.value || '';
            const estado = document.getElementById('filtro-estado')?.value || '';
            const carrera = document.getElementById('filtro-carrera')?.value || '';
            const grupo = document.getElementById('filtro-grupo')?.value || '';
            const encargado = document.getElementById('filtro-encargado')?.value || '';

            const filtrados = movimientosGlobales.filter(m => {
                const matchBuscar = !buscar || 
                    (m.nombre && m.nombre.toLowerCase().includes(buscar)) || 
                    (m.concepto && m.concepto.toLowerCase().includes(buscar)) ||
                    (m.notas && m.notas.toLowerCase().includes(buscar)) ||
                    (m.encargado && m.encargado.toLowerCase().includes(buscar));
                const matchTipo = !tipo || m.tipo === tipo;
                const matchRol = !rol || m.rol === rol;
                const matchEstado = !estado || m.estado === estado;
                const matchCarrera = !carrera || m.carrera === carrera;
                const matchGrupo = !grupo || m.grupo === grupo;
                const matchEncargado = !encargado || m.encargado === encargado;
                return matchBuscar && matchTipo && matchRol && matchEstado && matchCarrera && matchGrupo && matchEncargado;
            });
            renderTablaMovimientos(filtrados);
        }

        // =====================================================================
        // 3. PLANTILLA DE ESTUDIANTES: DEBEN Y FALTAN COMPLETAR
        // =====================================================================
        async function cargarEstudiantes() {
            try {
                const carrera = document.getElementById('filtro-estudiantes-carrera').value;
                const estado = document.getElementById('filtro-estudiantes-estado').value;
                let url = '/api/estudiantes?';
                if (carrera) url += `carrera=${encodeURIComponent(carrera)}&`;
                if (estado) url += `estado=${encodeURIComponent(estado)}&`;

                const res = await fetch(url);
                estudiantesGlobales = await res.json();
                renderEstudiantes(estudiantesGlobales);
            } catch (err) {
                console.error("Error al cargar estudiantes:", err);
            }
        }

        function setModoVistaEstudiantes(modo) {
            modoVistaEstudiantes = modo;
            const grid = document.getElementById('grid-estudiantes');
            const tabla = document.getElementById('tabla-estudiantes-container');
            const btnGrid = document.getElementById('btn-vista-grid');
            const btnTable = document.getElementById('btn-vista-table');

            if (modo === 'grid') {
                grid.classList.remove('hidden');
                tabla.classList.add('hidden');
                btnGrid.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-sm';
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800';
            } else {
                grid.classList.add('hidden');
                tabla.classList.remove('hidden');
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-sm';
                btnGrid.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800';
            }
        }

        // Helper universal para normalizar cadenas ignorando mayúsculas, minúsculas, espacios y tildes
        function normalizarTextoBusqueda(txt) {
            if (!txt) return '';
            return String(txt)
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos/tildes
                .toLowerCase()
                .trim();
        }

        // Búsqueda instantánea multi-criterio: DNI, Celular, Nombres y Apellidos (Insensible a mayúsculas/minúsculas)
        function filtrarEstudiantesFrontend() {
            const inputElem = document.getElementById('filtro-estudiantes-buscar');
            const rawVal = inputElem ? inputElem.value : '';
            const query = normalizarTextoBusqueda(rawVal);
            const queryDigits = rawVal.replace(/\D/g, ''); // Para búsqueda de números de DNI o celular sin guiones

            const filtroCarrera = document.getElementById('filtro-estudiantes-carrera')?.value || 'todas';
            const filtroEstado = document.getElementById('filtro-estudiantes-estado')?.value || 'todos';

            const filtrados = (estudiantesGlobales || []).filter(e => {
                // Filtro por Carrera
                if (filtroCarrera !== 'todas') {
                    if (filtroCarrera === 'sin_asignar' || filtroCarrera === 'Sin Asignar') {
                        if (e.carrera && e.carrera !== 'Sin Asignar' && !e.carrera.includes('Pendiente')) return false;
                    } else if (e.carrera !== filtroCarrera) {
                        return false;
                    }
                }

                // Filtro por Estado Financiero
                if (filtroEstado !== 'todos' && e.estado_financiero !== filtroEstado) {
                    return false;
                }

                // Si no hay término de búsqueda, pasa
                if (!query) return true;

                // Criterios normalizados
                const nombreNorm = normalizarTextoBusqueda(e.nombre);
                const dniNorm = normalizarTextoBusqueda(e.dni);
                const celNorm = normalizarTextoBusqueda(e.telefono);
                const codNorm = normalizarTextoBusqueda(e.codigo);
                const carreraNorm = normalizarTextoBusqueda(e.carrera);
                const grupoNorm = normalizarTextoBusqueda(e.grupo);

                // DNI numérico y Celular numérico limpio
                const dniDigits = (e.dni || '').replace(/\D/g, '');
                const celDigits = (e.telefono || '').replace(/\D/g, '');

                const matchNombre = nombreNorm.includes(query);
                const matchDNI = dniNorm.includes(query) || (queryDigits.length >= 2 && dniDigits.includes(queryDigits));
                const matchCel = celNorm.includes(query) || (queryDigits.length >= 2 && celDigits.includes(queryDigits));
                const matchCod = codNorm.includes(query);
                const matchCarrera = carreraNorm.includes(query);
                const matchGrupo = grupoNorm.includes(query);

                return matchNombre || matchDNI || matchCel || matchCod || matchCarrera || matchGrupo;
            });

            const orden = document.getElementById('filtro-estudiantes-orden')?.value || 'reciente';
            const ordenados = typeof ordenarEstudiantesLista === 'function' ? ordenarEstudiantesLista(filtrados, orden) : filtrados;
            renderEstudiantes(ordenados);
        }

        function renderEstudiantes(lista) {
            const grid = document.getElementById('grid-estudiantes');
            const tbody = document.getElementById('tbody-estudiantes');

            if (lista.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">No se encontraron estudiantes para los filtros seleccionados.</div>`;
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron estudiantes con los filtros aplicados.</td></tr>`;
                return;
            }

            grid.innerHTML = lista.map((e, idx) => {
                const iniciales = (e.nombre || '').split(' ').slice(0, 2).map(n => n[0]).join('');
                let barColor = 'from-rose-500 to-rose-600';
                if (e.estado_financiero === 'al_dia') barColor = 'from-emerald-500 to-teal-500';
                else if (e.estado_financiero === 'faltan_completar') barColor = 'from-amber-400 to-orange-500';

                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.trim() === '' || e.carrera === 'Sin Asignar' || e.carrera.includes('Pendiente');
                const safeNombre = (e.nombre || '').replace(/'/g, "\\'");
                const safeCarrera = (e.carrera || '').replace(/'/g, "\\'");
                const safeGrupo = (e.grupo || '').replace(/'/g, "\\'");
                const nroBoletaReg = e.ultimo_comprobante || e.comprobante || '---';

                return `
                    <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                        <div>
                            <!-- Header de Tarjeta Estudiante -->
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${esSinAsignar ? 'from-amber-500 to-orange-500' : 'from-indigo-600 to-cyan-500'} text-white font-extrabold flex items-center justify-center text-sm shadow-md ${esSinAsignar ? 'shadow-amber-500/30' : 'shadow-indigo-500/25'} flex-shrink-0">
                                    ${iniciales}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between gap-1">
                                        <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 font-mono">Fila #${idx + 1} • Boleta: ${nroBoletaReg}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${e.clase_estado}">
                                            ${e.estado_financiero === 'faltan_completar' ? 'Falta Completar' : (e.estado_financiero === 'deben_todo' ? 'Debe Total' : 'Al Día')}
                                        </span>
                                    </div>
                                    <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate mt-1" title="${e.nombre}">${e.nombre}</h4>
                                    <!-- Datos de Contacto DNI y Celular para visibilidad inmediata -->
                                    <div class="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                        <span class="inline-flex items-center" title="Documento Nacional de Identidad">
                                            <i class="fa-solid fa-id-card text-indigo-500 mr-1 text-[10px]"></i>
                                            ${e.dni && e.dni !== 'No registrado' ? e.dni : '<span class="text-slate-400 font-sans text-[10px]">Sin DNI</span>'}
                                        </span>
                                        <span class="inline-flex items-center" title="Número de Teléfono / Celular">
                                            <i class="fa-solid fa-phone text-emerald-500 mr-1 text-[10px]"></i>
                                            ${e.telefono && e.telefono !== 'No registrado' ? e.telefono : '<span class="text-slate-400 font-sans text-[10px]">Sin Cel.</span>'}
                                        </span>
                                    </div>
                                    
                                    <!-- Carrera Badge interactivo -->
                                    <div class="mt-1 flex items-center flex-wrap gap-1.5">
                                        ${esSinAsignar ? `
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                                <i class="fa-solid fa-triangle-exclamation mr-1"></i> Carrera Pendiente
                                            </span>
                                        ` : `
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                <i class="fa-solid fa-graduation-cap mr-1"></i> ${e.carrera}
                                            </span>
                                        `}
                                        <span class="text-[10px] text-slate-400 font-medium">• ${e.ciclo || 'Ciclo I'}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <span class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${e.urgencia_global === 'vencido' ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 animate-pulse border border-rose-300 dark:border-rose-800' : (e.urgencia_global === 'vence_hoy' || e.urgencia_global === 'urgente' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    ${e.msg_urgencia}
                                </span>
                            </div>

                            <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center mb-3">
                                <div>
                                    <span class="text-[9px] font-bold text-slate-400 uppercase">Total Cuota</span>
                                    <p class="font-extrabold text-slate-700 dark:text-slate-200 text-xs mt-0.5">S/. ${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Abonado</span>
                                    <p class="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">S/. ${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                                    <span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">Falta Completar</span>
                                    <p class="font-extrabold text-rose-600 dark:text-rose-400 text-xs mt-0.5">S/. ${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Progreso de Pago</span>
                                    <span class="text-slate-800 dark:text-slate-200 font-extrabold">${e.porcentaje_avance}%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div class="bg-gradient-to-r ${barColor} h-2 rounded-full" style="width: ${e.porcentaje_avance}%"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción: ASIGNAR O MODIFICAR CARRERA + Ficha + Abono -->
                        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            <!-- BOTÓN MODIFICAR / ASIGNAR CARRERA DISPONIBLE PARA CUALQUIER ESTUDIANTE -->
                            <button onclick="abrirModalAsignarCarrera(${e.id}, '${safeNombre}', '${safeCarrera}', '${safeGrupo}')" class="w-full py-2 px-3 ${esSinAsignar ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black shadow-md shadow-amber-500/25' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black shadow-md shadow-indigo-600/25'} rounded-xl text-xs flex items-center justify-center space-x-1.5 transition transform active:scale-95">
                                <i class="fa-solid ${esSinAsignar ? 'fa-user-plus' : 'fa-pen-to-square'}"></i>
                                <span>${esSinAsignar ? 'Asignar Carrera' : 'Modificar / Cambiar Carrera'}</span>
                            </button>

                            ${e.saldo_pendiente > 0 && primerPendiente ? `
                                <button onclick="abrirModalAbonar(${primerPendiente.id}, '${safeNombre}', '${primerPendiente.concepto}', ${primerPendiente.monto}, ${primerPendiente.monto_total || primerPendiente.monto}, ${primerPendiente.monto_abonado || 0})" class="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20 transition">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>${e.estado_financiero === 'faltan_completar' ? 'Completar / Abonar Saldo' : 'Registrar Abono o Pago'}</span>
                                </button>
                            ` : ''}

                            <button onclick="verFichaEstudiante(${e.id})" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">
                                <i class="fa-solid fa-file-invoice text-cyan-600 dark:text-cyan-400"></i>
                                <span>Ver Ficha / Plantilla Oficial</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            tbody.innerHTML = lista.map((e, idx) => {
                const primerPendiente = e.conceptos_pendientes && e.conceptos_pendientes.length > 0 ? e.conceptos_pendientes[0] : null;
                const esSinAsignar = !e.carrera || e.carrera.trim() === '' || e.carrera === 'Sin Asignar' || e.carrera.includes('Pendiente');
                const safeNombre = (e.nombre || '').replace(/'/g, "\\'");
                const safeCarrera = (e.carrera || '').replace(/'/g, "\\'");
                const safeGrupo = (e.grupo || '').replace(/'/g, "\\'");
                const nroBoletaReg = e.ultimo_comprobante || e.comprobante || '---';

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                        <td class="py-3 px-4">
                            <div class="font-bold text-slate-900 dark:text-white">${e.nombre}</div>
                            <span class="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold font-mono">Fila #${idx + 1} • Boleta: ${nroBoletaReg}</span>
                        </td>
                        <td class="py-3 px-4">
                            ${esSinAsignar ? `
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                    Sin Asignar
                                </span>
                            ` : `
                                <span class="text-slate-700 dark:text-slate-200 font-bold">${e.carrera}</span>
                                <span class="block text-[10px] text-slate-400">${e.ciclo || 'Ciclo I'} • Grupo: ${e.grupo || 'Sin Asignar'}</span>
                            `}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200">
                            S/. ${Number(e.total_comprometido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            S/. ${Number(e.total_pagado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                            S/. ${Number(e.saldo_pendiente).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="font-bold text-slate-700 dark:text-slate-300">${e.porcentaje_avance}%</span>
                        </td>
                        <td class="py-3 px-4 text-center">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${e.clase_estado}">
                                ${e.estado_financiero === 'faltan_completar' ? 'Falta Completar' : (e.estado_financiero === 'deben_todo' ? 'Debe Total' : 'Al Día')}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                            <!-- Botón Cambiar / Asignar en Tabla -->
                            <button onclick="abrirModalAsignarCarrera(${e.id}, '${safeNombre}', '${safeCarrera}', '${safeGrupo}')" class="px-2.5 py-1 ${esSinAsignar ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-lg text-xs font-bold transition shadow-sm" title="${esSinAsignar ? 'Asignar Carrera' : 'Modificar o Cambiar Carrera'}">
                                <i class="fa-solid ${esSinAsignar ? 'fa-plus' : 'fa-pen-to-square'} mr-1"></i>${esSinAsignar ? 'Asignar' : 'Cambiar'}
                            </button>

                            ${e.saldo_pendiente > 0 && primerPendiente ? `
                                <button onclick="abrirModalAbonar(${primerPendiente.id}, '${safeNombre}', '${primerPendiente.concepto}', ${primerPendiente.monto}, ${primerPendiente.monto_total || primerPendiente.monto}, ${primerPendiente.monto_abonado || 0})" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition">
                                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i>Abonar
                                </button>
                            ` : ''}
                            <button onclick="verFichaEstudiante(${e.id})" class="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition">
                                <i class="fa-solid fa-file-invoice mr-1"></i>Ficha
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        async function verFichaEstudiante(estId) {
            try {
                const res = await fetch(`/api/estudiantes/${estId}/detalle`);
                const data = await res.json();
                const est = data.estudiante;
                window.currentFichaEstudianteData = est;
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('recibo-est-nombre').innerText = est.nombre;
                document.getElementById('recibo-est-codigo').innerText = `Boleta N°: ${est.ultimo_comprobante || est.comprobante || (est.codigo ? est.codigo.replace(/\D/g, '').padStart(7, '0') : '0000811')}`;
                document.getElementById('recibo-est-carrera').innerText = `Especialidad: ${est.carrera}`;
                document.getElementById('recibo-est-ciclo').innerText = `Módulo: ${est.ciclo || 'Ciclo Regular'}`;
                document.getElementById('recibo-est-email').innerText = `Correo: ${est.email || est.nombre.toLowerCase().replace(/ /g, '.') + '@institucion.edu'}`;
                document.getElementById('recibo-est-telefono').innerText = `Teléfono: ${est.telefono || 'No registrado'}`;
                document.getElementById('recibo-est-fecha-emision').innerText = 'Emisión: ' + new Date().toLocaleDateString('es-PE');

                document.getElementById('recibo-est-total-comprometido').innerText = fMoney(data.total_comprometido);
                document.getElementById('recibo-est-total-pagado').innerText = fMoney(data.total_pagado);
                document.getElementById('recibo-est-saldo-pendiente').innerText = fMoney(data.saldo_pendiente);

                document.getElementById('recibo-est-porcentaje-label').innerText = `${data.porcentaje_avance}% completado`;
                document.getElementById('recibo-est-porcentaje-bar').style.width = `${data.porcentaje_avance}%`;

                const tbodyMov = document.getElementById('recibo-est-tabla-movimientos');
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-400">Sin cuotas ni compromisos registrados aún.</td></tr>`;
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => {
                        const mTot = m.monto_total || m.monto;
                        const mAbo = m.monto_abonado || 0;
                        const mSal = m.estado === 'Pendiente' ? m.monto : 0;
                        return `
                            <tr>
                                <td class="p-2.5 font-bold text-slate-800">${m.concepto}</td>
                                <td class="p-2.5 text-right font-medium">${fMoney(mTot)}</td>
                                <td class="p-2.5 text-right font-medium text-emerald-600">${fMoney(mAbo)}</td>
                                <td class="p-2.5 text-right font-extrabold ${mSal > 0 ? 'text-rose-600' : 'text-slate-400'}">${fMoney(mSal)}</td>
                                <td class="p-2.5 text-center font-medium">${m.fecha_vencimiento || 'Sin límite'}</td>
                                <td class="p-2.5 text-center">
                                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${m.estado === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : (mAbo > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}">
                                        ${m.estado === 'Pagado' ? 'Completado' : (mAbo > 0 ? 'Abonado Parcial' : 'Pendiente Total')}
                                    </span>
                                    <button type="button" onclick="irAFacturaDesdeFichaEstudiante(${m.id})" class="ml-1.5 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold inline-flex items-center space-x-1 transition shadow-sm" title="Ir a la boleta oficial para visualizarla e imprimirla">
                                        <i class="fa-solid fa-receipt"></i>
                                        <span>Boleta</span>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }

                const tbodyAbo = document.getElementById('recibo-est-tabla-abonos');
                if (data.abonos.length === 0) {
                    tbodyAbo.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-400">Aún no se han registrado abonos parciales directos en esta cuenta.</td></tr>`;
                } else {
                    tbodyAbo.innerHTML = data.abonos.map(a => `
                        <tr>
                            <td class="p-2.5">${a.fecha}</td>
                            <td class="p-2.5 font-medium">${a.concepto_original || 'Abono a Cuota'}</td>
                            <td class="p-2.5 font-mono">
                                <button type="button" onclick="irAFacturaDesdeFichaEstudiante(${a.movimiento_id || a.id})" class="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center space-x-1" title="Ver comprobante oficial">
                                    <i class="fa-solid fa-receipt text-xs"></i>
                                    <span>${a.comprobante || 'N° ' + String(a.id).padStart(7, '0')}</span>
                                </button>
                            </td>
                            <td class="p-2.5">${a.metodo_pago || 'Efectivo'}</td>
                            <td class="p-2.5 text-right font-extrabold text-emerald-600">${fMoney(a.monto)}</td>
                        </tr>
                    `).join('');
                }

                document.getElementById('modal-ficha-estudiante').classList.remove('hidden');
            } catch (err) {
                console.error("Error al ver ficha de estudiante:", err);
            }
        }

        function cerrarModalFichaEstudiante() {
            document.getElementById('modal-ficha-estudiante').classList.add('hidden');
        }

        // MODAL DE ABONAR O COMPLETAR PAGO
        function abrirModalAbonar(movId, nombreEst, concepto, saldoRestante, montoTotal, montoAbonado) {
            document.getElementById('abono-mov-id').value = movId;
            document.getElementById('abono-saldo-max').value = saldoRestante;
            document.getElementById('abono-est-nombre').innerText = nombreEst;
            document.getElementById('abono-concepto-nombre').innerText = `Concepto: ${concepto}`;
            document.getElementById('abono-ya-abonado').innerText = 'S/. ' + Number(montoAbonado).toFixed(2);
            document.getElementById('abono-falta-completar').innerText = 'S/. ' + Number(saldoRestante).toFixed(2);
            
            document.getElementById('abono-monto-input').value = Number(saldoRestante).toFixed(2);
            document.getElementById('abono-monto-input').max = saldoRestante;
            document.getElementById('abono-comprobante-input').value = `ABO-${Math.floor(1000 + Math.random() * 9000)}`;
            document.getElementById('abono-notas-input').value = `Abono a ${concepto}`;

            document.getElementById('modal-abonar-estudiante').classList.remove('hidden');
        }

        function cerrarModalAbonar() {
            document.getElementById('modal-abonar-estudiante').classList.add('hidden');
        }

        function setMontoAbonoCompleto() {
            const max = parseFloat(document.getElementById('abono-saldo-max').value);
            document.getElementById('abono-monto-input').value = max.toFixed(2);
        }

        function setMontoAbonoMitad() {
            const max = parseFloat(document.getElementById('abono-saldo-max').value);
            document.getElementById('abono-monto-input').value = (max / 2).toFixed(2);
        }

        async function procesarAbono(e) {
            e.preventDefault();
            const movId = document.getElementById('abono-mov-id').value;
            const monto = parseFloat(document.getElementById('abono-monto-input').value);
            const metodo = document.getElementById('abono-metodo-select').value;
            const comp = document.getElementById('abono-comprobante-input').value;
            const notas = document.getElementById('abono-notas-input').value;

            if (!movId || monto <= 0) {
                alert("Por favor ingresa un monto válido a abonar.");
                return;
            }

            try {
                const res = await fetch('/api/estudiantes/abonar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        movimiento_id: parseInt(movId),
                        monto_abono: monto,
                        metodo_pago: metodo,
                        comprobante: comp,
                        notas: notas
                    })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalAbonar();
                    alert(`✅ ${data.message}`);
                    await cargarTodo();
                } else {
                    alert(`Error: ${data.error || 'No se pudo procesar el abono'}`);
                }
            } catch (err) {
                alert("Error de conexión al procesar el abono");
            }
        }

        // 4. DOCENTES
        async function cargarDocentes() {
            try {
                const carrera = document.getElementById('filtro-docentes-carrera').value;
                const url = carrera ? `/api/docentes?carrera=${encodeURIComponent(carrera)}` : '/api/docentes';
                const res = await fetch(url);
                const docentes = await res.json();
                docentesGlobales = docentes;
                poblarSelectDocentesNuevoEstudiante();

                const grid = document.getElementById('grid-docentes');
                if (docentes.length === 0) {
                    grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400">No se encontraron docentes para la especialidad seleccionada.</div>`;
                    return;
                }

                grid.innerHTML = docentes.map(d => {
                    const partes = (d.nombre || '').split(', ');
                    const apellidos = partes[0] || d.nombre;
                    const nombres = partes[1] || '';
                    const iniciales = ((nombres ? nombres[0] : '') + (apellidos ? apellidos[0] : '')).toUpperCase();

                    const badgeTurno = d.turno === 'Mañana' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' :
                                       (d.turno === 'Tarde' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300' :
                                       (d.turno === 'Noche' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300' :
                                       'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'));

                    const badgeCargo = d.cargo === 'DIRECTOR' ? 'bg-amber-500 text-slate-950 font-black' :
                                      (d.cargo === 'Docente' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300');

                    return `
                        <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                            <div>
                                <div class="flex items-center space-x-3 mb-4">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${d.cargo === 'DIRECTOR' ? 'from-amber-500 to-yellow-400 text-slate-950 font-black' : 'from-indigo-600 to-sky-500 text-white font-extrabold'} flex items-center justify-center text-sm shadow-md flex-shrink-0">
                                        ${iniciales || 'DOC'}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center justify-between gap-1 mb-1">
                                            <span class="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${badgeCargo}">
                                                ${d.cargo || 'Docente'}
                                            </span>
                                            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeTurno}">
                                                <i class="fa-solid fa-clock mr-1"></i>${d.turno || 'Mañana'}
                                            </span>
                                        </div>
                                        <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate" title="${d.nombre}">${d.nombre}</h4>
                                        <p class="text-xs text-sky-700 dark:text-sky-400 font-semibold truncate">${d.carrera}</p>
                                        <p class="text-[10px] text-slate-400 truncate mt-0.5"><i class="fa-solid fa-chalkboard-user mr-1 text-slate-400"></i>${d.especialidad || 'Especialidad Oficial'}</p>
                                    </div>
                                </div>

                                <div class="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500 font-medium">Salidas (Honorarios Pagados):</span>
                                        <span class="font-extrabold text-rose-600">S/. ${Number(d.total_salidas).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500 font-medium">Ingresos Generados (Módulos):</span>
                                        <span class="font-extrabold text-emerald-600">S/. ${Number(d.total_ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 font-bold">
                                        <span class="text-slate-700">Balance Neto:</span>
                                        <span class="${d.balance_neto >= 0 ? 'text-emerald-700' : 'text-slate-800'}">
                                            S/. ${Number(d.balance_neto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button onclick="verBoletaDocente(${d.id})" class="mt-5 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm">
                                <i class="fa-solid fa-file-invoice text-sky-400"></i>
                                <span>Ver Ficha / Boleta Oficial</span>
                            </button>
                        </div>
                    `;
                }).join('');
            } catch (err) {
                console.error("Error al cargar docentes:", err);
            }
        }

        async function verBoletaDocente(docId) {
            try {
                const res = await fetch(`/api/docentes/${docId}/detalle`);
                const data = await res.json();
                const d = data.docente;

                document.getElementById('recibo-docente-nombre').innerText = d.nombre;
                document.getElementById('recibo-docente-carrera').innerText = `Especialidad: ${d.carrera}`;
                document.getElementById('recibo-docente-especialidad').innerText = d.especialidad || 'Cátedra Regular';
                document.getElementById('recibo-docente-contacto').innerText = d.email || 'institucion@edu.pe';
                document.getElementById('recibo-fecha-emision').innerText = 'Emisión: ' + new Date().toLocaleDateString('es-PE');

                document.getElementById('recibo-total-salidas').innerText = 'S/. ' + Number(data.total_salidas).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                document.getElementById('recibo-total-entradas').innerText = 'S/. ' + Number(data.total_ingresos).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                document.getElementById('recibo-total-balance').innerText = 'S/. ' + Number(data.balance_neto).toLocaleString('es-PE', { minimumFractionDigits: 2 });

                const tbody = document.getElementById('recibo-tabla-movimientos');
                if (data.movimientos.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-400">Sin movimientos registrados aún para este docente.</td></tr>`;
                } else {
                    tbody.innerHTML = data.movimientos.map(m => `
                        <tr>
                            <td class="p-2.5">${m.fecha}</td>
                            <td class="p-2.5">
                                <span class="font-bold ${m.tipo === 'Egreso' ? 'text-rose-600' : 'text-emerald-600'}">${m.tipo}</span>
                            </td>
                            <td class="p-2.5 font-medium">${m.concepto}</td>
                            <td class="p-2.5 text-slate-400">${m.comprobante || '-'}</td>
                            <td class="p-2.5 text-right font-extrabold ${m.tipo === 'Egreso' ? 'text-rose-600' : 'text-emerald-600'}">
                                S/. ${Number(m.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `).join('');
                }

                document.getElementById('modal-recibo-docente').classList.remove('hidden');
            } catch (err) {
                console.error("Error al ver boleta de docente:", err);
            }
        }

        function cerrarModalReciboDocente() {
            document.getElementById('modal-recibo-docente').classList.add('hidden');
        }

        // 5. CONTROL DE VENCIMIENTOS / DEUDORES
        async function cargarDeudores() {
            try {
                const carrera = document.getElementById('filtro-deudores-carrera').value;
                const url = carrera ? `/api/deudores?carrera=${encodeURIComponent(carrera)}` : '/api/deudores';
                const res = await fetch(url);
                const deudores = await res.json();

                deudoresGlobalesCache = deudores;
                document.getElementById('badge-deudores-count').innerText = deudores.length;

                filtrarDeudoresEnTabla();
                return;

                const tbody = document.getElementById('tabla-deudores');
                if (deudores.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">¡Excelente! No hay estudiantes con deudas pendientes en esta categoría.</td></tr>`;
                    return;
                }

                tbody.innerHTML = deudores.map(d => {
                    let badgeColor = 'bg-slate-100 text-slate-700';
                    let alertaIcon = 'fa-calendar';

                    if (d.urgencia === 'vencido') {
                        badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse';
                        alertaIcon = 'fa-circle-xmark';
                    } else if (d.urgencia === 'vence_hoy' || d.urgencia === 'urgente') {
                        badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                        alertaIcon = 'fa-triangle-exclamation';
                    } else if (d.urgencia === 'alerta') {
                        badgeColor = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
                        alertaIcon = 'fa-clock';
                    } else {
                        badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                        alertaIcon = 'fa-circle-check';
                    }

                    return `
                        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                            <td class="py-3.5 px-4 font-bold text-slate-900">${d.nombre}</td>
                            <td class="py-3.5 px-4 text-slate-600">${d.carrera}</td>
                            <td class="py-3.5 px-4 font-medium text-slate-800">
                                ${d.concepto}
                                ${d.falta_completar ? `<span class="block text-[10px] text-amber-600 font-bold">Abonado: S/. ${Number(d.monto_abonado).toFixed(2)}</span>` : ''}
                            </td>
                            <td class="py-3.5 px-4 text-right font-extrabold text-rose-600">
                                S/. ${Number(d.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </td>
                            <td class="py-3.5 px-4 text-center font-semibold text-slate-700">${d.fecha_vencimiento || 'Sin límite'}</td>
                            <td class="py-3.5 px-4 text-center">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}">
                                    <i class="fa-solid ${alertaIcon} mr-1.5"></i>
                                    ${d.mensaje_urgencia}
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-center">
                                <button onclick="abrirModalAbonar(${d.id}, '${d.nombre}', '${d.concepto}', ${d.monto}, ${d.monto_total || d.monto}, ${d.monto_abonado || 0})" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm shadow-cyan-600/30 transition flex items-center space-x-1.5 mx-auto">
                                    <i class="fa-solid fa-hand-holding-dollar"></i>
                                    <span>Cobrar / Abonar</span>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            } catch (err) {
                console.error("Error al cargar deudores:", err);
            }
        }

        // 6. REPORTE POR ESPECIALIDADES
        // =========================================================================
        // GESTIÓN DINÁMICA DE CARRERAS Y ESPECIALIDADES
        // =========================================================================
        let carrerasGlobales = [];

        async function cargarCarreras() {
            try {
                const res = await fetch('/api/carreras');
                carrerasGlobales = await res.json();
                if (document.getElementById('badge-carreras-count')) {
                    document.getElementById('badge-carreras-count').innerText = carrerasGlobales.length;
                }
                renderReporteCarreras(carrerasGlobales);
                renderTablaCarrerasConfig(carrerasGlobales);
                poblarSelectsCarreras(carrerasGlobales);
            } catch (err) {
                console.error("Error al cargar carreras:", err);
            }
        }

        function renderReporteCarreras(carreras) {
            const grid = document.getElementById('grid-carreras-reporte');
            if (!grid) return;
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;
            if (!lista || lista.length === 0) {
                grid.innerHTML = '<div class="col-span-3 p-8 text-center text-slate-400">No hay carreras registradas.</div>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            grid.innerHTML = lista.map(c => {
                const nom = c.nombre || c.carrera;
                const ing = c.total_ingreso || 0;
                const egr = c.total_egreso || 0;
                const neto = ing - egr;
                const alumnos = c.total_alumnos || 0;
                const docentes = c.total_docentes || 0;

                // Nombres de los docentes asignados a la carrera técnica
                const docentesStr = c.docentes_nombres || c.grupos_encargados || '';
                const listaDocentes = docentesStr 
                    ? docentesStr.split(',').map(d => d.trim()).filter(Boolean)
                    : [];

                return `
                    <div class="cyber-card bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg border border-purple-200 dark:border-purple-800">
                                    <i class="fa-solid fa-graduation-cap"></i>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-900 dark:text-white text-sm">${nom}</h4>
                                    <p class="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">${c.codigo || 'PROGRAMA OFICIAL'}</p>
                                </div>
                            </div>
                            <button onclick="abrirModalEditarCarrera(${c.id}, '${nom.replace(/'/g, "\\'")}')" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Modificar nombre de carrera">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <div><i class="fa-solid fa-user-graduate mr-1.5 text-indigo-400"></i> Matriculados: <strong class="text-slate-800 dark:text-slate-200">${alumnos}</strong></div>
                            <div><i class="fa-solid fa-chalkboard-user mr-1.5 text-purple-400"></i> Docentes: <strong class="text-slate-800 dark:text-slate-200">${docentes}</strong></div>
                        </div>

                        <!-- DOCENTES ENCARGADOS DE LA CARRERA TÉCNICA -->
                        <div class="mt-3 p-2.5 bg-indigo-50/70 dark:bg-slate-800/80 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
                            <div class="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-300 font-extrabold mb-1.5">
                                <i class="fa-solid fa-chalkboard-user text-xs"></i>
                                <span>Docentes / Responsables de la Especialidad:</span>
                            </div>
                            ${listaDocentes.length > 0 ? `
                                <div class="flex flex-wrap gap-1">
                                    ${listaDocentes.map(d => `
                                        <span class="inline-flex items-center space-x-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                                            <i class="fa-solid fa-user-tie text-[9px] text-indigo-500"></i>
                                            <span>${d}</span>
                                        </span>
                                    `).join('')}
                                </div>
                            ` : `
                                <p class="text-[10px] text-slate-400 italic">Docente por asignar en configuración</p>
                            `}
                        </div>

                        <div class="space-y-1.5 text-xs pt-3">
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Ingresos Totales:</span>
                                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${fMoney(ing)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Egresos / Gastos:</span>
                                <span class="font-extrabold text-rose-600 dark:text-rose-400">${fMoney(egr)}</span>
                            </div>
                            <div class="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span class="text-slate-700 dark:text-slate-300 font-bold">Balance Neto:</span>
                                <span class="font-black ${neto >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}">${fMoney(neto)}</span>
                            </div>
                        </div>

                        <div class="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button onclick="abrirModalEditarCarrera(${c.id}, '${nom.replace(/'/g, "\\'")}')" class="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center space-x-1 transition">
                                <i class="fa-solid fa-pen"></i>
                                <span>Editar Nombre</span>
                            </button>
                            <button onclick="cambiarSeccion('configuracion')" class="text-[11px] font-semibold text-slate-400 hover:text-indigo-500 flex items-center space-x-1 transition">
                                <span>Configurar Docentes</span>
                                <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderTablaCarrerasConfig(carreras) {
            const tbody = document.getElementById('tabla-carreras-config-body');
            if (!tbody) return;
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;

            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">No hay carreras registradas.</td></tr>';
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            tbody.innerHTML = lista.map(c => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3">
                        <span class="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            ${c.codigo || 'ESP'}
                        </span>
                    </td>
                    <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                        ${c.nombre || c.carrera}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        ${c.total_alumnos || 0}
                    </td>
                    <td class="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-bold">
                        ${c.total_docentes || 0}
                    </td>
                    <td class="py-2.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        ${fMoney(c.total_ingreso || 0)}
                    </td>
                    <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button type="button" onclick="abrirModalEditarCarrera(${c.id}, '${(c.nombre || c.carrera).replace(/'/g, "\\'")}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-[11px] shadow-sm transition" title="Modificar nombre de la carrera">
                            <i class="fa-solid fa-pen-to-square"></i> <span>Editar Nombre</span>
                        </button>
                        <button type="button" onclick="eliminarCarrera(${c.id}, '${(c.nombre || c.carrera).replace(/'/g, "\\'")}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[11px] border border-rose-200 transition" title="Eliminar carrera">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        function poblarSelectsCarreras(carreras) {
            const lista = (carreras && carreras.length > 0) ? carreras : carrerasGlobales;
            if (!lista || lista.length === 0) return;

            const filtros = [
                { id: 'filtro-carrera', defaultLabel: 'Todas las Especialidades' },
                { id: 'filtro-estudiantes-carrera', defaultLabel: 'Todas las Especialidades' },
                { id: 'filtro-docentes-carrera', defaultLabel: 'Filtrar por Especialidad (Todas)' },
                { id: 'filtro-deudores-carrera', defaultLabel: 'Todas las Especialidades' }
            ];

            filtros.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                let html = `<option value="">${f.defaultLabel}</option>`;
                if (f.id === 'filtro-estudiantes-carrera') {
                    html += `<option value="sin_asignar">Sin Asignar (Pendientes)</option>`;
                }
                lista.forEach(c => {
                    const nom = c.nombre || c.carrera;
                    html += `<option value="${nom}">${nom}</option>`;
                });
                el.innerHTML = html;
                if (currentVal) el.value = currentVal;
            });

            const forms = [
                { id: 'form-carrera', defaultLabel: '-- Seleccionar Especialidad --' },
                { id: 'nuevo-grupo-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'editar-grupo-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'editar-docente-carrera', defaultLabel: '-- Seleccionar Carrera / Especialidad --' },
                { id: 'asignar-carrera-select', defaultLabel: '-- Seleccionar Especialidad --' }
            ];

            forms.forEach(f => {
                const el = document.getElementById(f.id);
                if (!el) return;
                const currentVal = el.value;
                let html = `<option value="">${f.defaultLabel}</option>`;
                lista.forEach(c => {
                    const nom = c.nombre || c.carrera;
                    html += `<option value="${nom}">${nom}</option>`;
                });
                el.innerHTML = html;
                if (currentVal) el.value = currentVal;
            });
        }

        function abrirModalEditarCarrera(id, nombreActual) {
            document.getElementById('editar-carrera-id').value = id;
            document.getElementById('editar-carrera-nombre-actual').value = nombreActual;
            document.getElementById('editar-carrera-nombre-nuevo').value = nombreActual;
            document.getElementById('modal-editar-carrera').classList.remove('hidden');
            setTimeout(() => document.getElementById('editar-carrera-nombre-nuevo')?.focus(), 100);
        }

        function cerrarModalEditarCarrera() {
            document.getElementById('modal-editar-carrera').classList.add('hidden');
        }

        async function guardarEdicionCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();
            const id = document.getElementById('editar-carrera-id').value;
            const nombreNuevo = document.getElementById('editar-carrera-nombre-nuevo').value.trim();

            if (!nombreNuevo) {
                alert("Por favor ingrese el nuevo nombre de la carrera.");
                return;
            }

            try {
                const res = await fetch(`/api/carreras/${id}/editar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nombreNuevo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarCarrera();
                    alert(`✅ Nombre de la carrera actualizado a "${nombreNuevo}" exitosamente en todo el sistema.`);
                    await cargarCarreras();
                    await cargarStats();
                    await cargarEstudiantes();
                    await cargarDocentes();
                    await cargarMovimientos();
                    await cargarGrupos();
                } else {
                    alert("Error al actualizar carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al actualizar carrera.");
            }
        }

        function abrirModalNuevaCarrera() {
            document.getElementById('nueva-carrera-nombre').value = '';
            document.getElementById('nueva-carrera-codigo').value = '';
            document.getElementById('modal-nueva-carrera').classList.remove('hidden');
            setTimeout(() => document.getElementById('nueva-carrera-nombre')?.focus(), 100);
        }

        function cerrarModalNuevaCarrera() {
            document.getElementById('modal-nueva-carrera').classList.add('hidden');
        }

        async function guardarNuevaCarrera(e) {
            if (e && e.preventDefault) e.preventDefault();
            const nombre = document.getElementById('nueva-carrera-nombre').value.trim();
            const codigo = document.getElementById('nueva-carrera-codigo').value.trim();

            if (!nombre) {
                alert("El nombre de la carrera es obligatorio.");
                return;
            }

            try {
                const res = await fetch('/api/carreras', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, codigo })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalNuevaCarrera();
                    alert(`✅ Carrera "${nombre}" creada exitosamente.`);
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert("Error al crear carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al crear carrera.");
            }
        }

        async function eliminarCarrera(id, nombre) {
            if (!confirm(`¿Está seguro de eliminar la carrera "${nombre}" del catálogo oficial?\n(Los estudiantes y movimientos permanecerán en el sistema).`)) {
                return;
            }
            try {
                const res = await fetch(`/api/carreras/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ Carrera eliminada exitosamente.`);
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert("Error al eliminar carrera: " + (data.error || 'Desconocido'));
                }
            } catch (err) {
                alert("Error de conexión al eliminar carrera.");
            }
        }

        function poblarSelectsGrupos(grupos) {
            const selectModal = document.getElementById('form-grupo');
            const selectEncargadoModal = document.getElementById('form-encargado');
            const selectDocentePersona = document.getElementById('select-docente-persona-modal');
            const selectEstudianteModal = document.getElementById('select-estudiante-modal');
            const selectFiltroCaja = document.getElementById('filtro-grupo');
            const selectEncargadoCaja = document.getElementById('filtro-encargado');

            // 1. Selector de Grupo en Modal: Nombre + (Docente Encargado)
            if (selectModal) {
                const prevVal = selectModal.value;
                let opts = `<option value="General">General / Institucional</option>`;
                grupos.forEach(g => {
                    const enc = g.encargado ? ` (${g.encargado})` : '';
                    opts += `<option value="${g.nombre}" data-encargado="${g.encargado || ''}" data-carrera="${g.carrera || ''}">${g.nombre}${enc}</option>`;
                });
                selectModal.innerHTML = opts;
                if (prevVal) selectModal.value = prevVal;
            }

            // 2. Selector de Docente / Encargado en Modal
            if (selectEncargadoModal) {
                const prevVal = selectEncargadoModal.value;
                let opts = `<option value="General">General / Institucional</option>`;
                // Usar docentesGlobales o lista de encargados
                const listaDocentes = (typeof docentesGlobales !== 'undefined' && docentesGlobales.length > 0)
                    ? docentesGlobales.map(d => d.nombre)
                    : [...new Set(grupos.map(g => g.encargado).filter(Boolean))];
                const unicos = [...new Set(listaDocentes)].sort();
                unicos.forEach(doc => {
                    opts += `<option value="${doc}">${doc}</option>`;
                });
                selectEncargadoModal.innerHTML = opts;
                if (prevVal) selectEncargadoModal.value = prevVal;
            }

            // 3. Selector de Docente como Persona en Modal
            if (selectDocentePersona) {
                const prevVal = selectDocentePersona.value;
                let opts = `<option value="">-- Seleccionar Docente de la Institución --</option>`;
                const listaDocentes = (typeof docentesGlobales !== 'undefined' && docentesGlobales.length > 0)
                    ? docentesGlobales
                    : grupos.map(g => ({ nombre: g.encargado, carrera: g.carrera, turno: g.turno }));
                const unicosDoc = [];
                const nombresVistos = new Set();
                listaDocentes.forEach(d => {
                    if (d.nombre && !nombresVistos.has(d.nombre)) {
                        nombresVistos.add(d.nombre);
                        unicosDoc.push(d);
                    }
                });
                unicosDoc.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(doc => {
                    opts += `<option value="${doc.nombre}">👨‍🏫 ${doc.nombre} - ${doc.carrera || 'CETPRO'}</option>`;
                });
                selectDocentePersona.innerHTML = opts;
                if (prevVal) selectDocentePersona.value = prevVal;
            }

            // 4. Selector de Estudiante como Persona en Modal
            if (selectEstudianteModal && typeof estudiantesGlobales !== 'undefined') {
                const prevVal = selectEstudianteModal.value;
                let opts = `<option value="">-- Seleccionar Estudiante Registrado o Escribir Manual Abajo --</option>`;
                estudiantesGlobales.slice().sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(e => {
                    const dni = e.dni ? ` - DNI: ${e.dni}` : '';
                    const cel = e.telefono ? ` - Cel: ${e.telefono}` : '';
                    opts += `<option value="${e.id}">🎓 ${e.nombre}${dni}${cel} (${e.carrera || 'General'})</option>`;
                });
                selectEstudianteModal.innerHTML = opts;
                if (prevVal) selectEstudianteModal.value = prevVal;
            }

            // 5. Filtros en la tabla de caja
            if (selectFiltroCaja) {
                const prevVal = selectFiltroCaja.value;
                let opts = `<option value="">Todos los Grupos / Secciones</option><option value="General">General / Institucional</option>`;
                grupos.forEach(g => {
                    opts += `<option value="${g.nombre}">${g.nombre}</option>`;
                });
                selectFiltroCaja.innerHTML = opts;
                if (prevVal) selectFiltroCaja.value = prevVal;
            }

            if (selectEncargadoCaja) {
                const prevVal = selectEncargadoCaja.value;
                const encargadosUnicos = [...new Set(grupos.map(g => g.encargado).filter(Boolean))].sort();
                let opts = `<option value="">Todos los Encargados</option>`;
                encargadosUnicos.forEach(enc => {
                    opts += `<option value="${enc}">${enc}</option>`;
                });
                selectEncargadoCaja.innerHTML = opts;
                if (prevVal) selectEncargadoCaja.value = prevVal;
            }
        }

        function filtrarGrupos() {
            const buscar = (document.getElementById('filtro-grupos-buscar')?.value || '').toLowerCase();
            const carrera = document.getElementById('filtro-grupos-carrera')?.value || '';
            const turno = document.getElementById('filtro-grupos-turno')?.value || '';

            const filtrados = gruposGlobales.filter(g => {
                const matchBuscar = !buscar || 
                    g.nombre.toLowerCase().includes(buscar) || 
                    g.encargado.toLowerCase().includes(buscar) || 
                    (g.aula_taller && g.aula_taller.toLowerCase().includes(buscar));
                const matchCarrera = !carrera || g.carrera === carrera;
                const matchTurno = !turno || g.turno === turno;
                return matchBuscar && matchCarrera && matchTurno;
            });
            renderGrupos(filtrados);
        }

        
        function renderDashboardGrupos(lista) {
            const container = document.getElementById('dashboard-grid-grupos');
            if (!container) return;

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            container.innerHTML = lista.map(g => {
                let badgeTurnoColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

                return `
                    <div class="bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 p-4 transition-all hover:shadow-md flex flex-col justify-between">
                        <div>
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <span class="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                                    ${g.carrera}
                                </span>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeTurnoColor}">
                                    ${g.turno}
                                </span>
                            </div>

                            <h4 class="font-extrabold text-slate-800 text-sm leading-tight mb-2.5">${g.nombre}</h4>

                            <!-- Encargado -->
                            <div class="bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3 flex items-center space-x-2.5">
                                <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    <i class="fa-solid fa-chalkboard-user"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="text-[10px] text-slate-400 font-bold uppercase">Encargado(a) de Clase</p>
                                    <p class="text-xs font-bold text-slate-800 truncate">${g.encargado || 'Sin Asignar'}</p>
                                </div>
                            </div>

                            <!-- Métricas de sección -->
                            <div class="grid grid-cols-2 gap-2 text-center mb-3">
                                <div class="bg-white p-2 rounded-lg border border-slate-100">
                                    <p class="text-[10px] text-slate-400 font-semibold">Alumnos</p>
                                    <p class="text-xs font-black text-slate-800">${g.total_alumnos || 0} matriculados</p>
                                </div>
                                <div class="bg-white p-2 rounded-lg border border-slate-100">
                                    <p class="text-[10px] text-slate-400 font-semibold">Recaudado</p>
                                    <p class="text-xs font-black text-emerald-600">${fMoney(g.total_ingresos || 0)}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span class="text-[11px] text-slate-500 font-medium">
                                <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${g.aula_taller || 'Aula Principal'}
                            </span>
                            <button onclick="filtrarCajaPorGrupo('${g.nombre.replace(/'/g, "\\'")}')" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 transition">
                                <span>Ver Caja</span>
                                <i class="fa-solid fa-angle-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderTabsSecciones(grupos) {
            const container = document.getElementById('contenedor-tabs-secciones-dinamicas');
            if (!container) return;

            if (grupos.length === 0) {
                container.innerHTML = '<span class="text-xs text-slate-400 italic py-1 px-3">0 Secciones Registradas (añadir manualmente)</span>';
                return;
            }

            let htmlTabs = `
                <button onclick="mostrarTodasLasSecciones()" id="tab-grupo-todas" class="tab-grupo-btn px-4 py-2 rounded-xl text-xs font-black transition bg-indigo-600 text-white shadow-sm flex-shrink-0">
                    Todas las Secciones (${grupos.length})
                </button>
            `;

            grupos.forEach(g => {
                let badgeTurnoBg = 'bg-sky-500';
                if (g.turno === 'Tarde') badgeTurnoBg = 'bg-amber-500';
                if (g.turno === 'Noche') badgeTurnoBg = 'bg-purple-600';
                if (g.turno.includes('Sábado') || g.turno.includes('S/D')) badgeTurnoBg = 'bg-rose-500';

                const shortName = g.nombre.split(' - ')[0];
                htmlTabs += `
                    <button onclick="verPlantillaSeccion(${g.id})" id="tab-grupo-${g.id}" class="tab-grupo-btn px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1.5 flex-shrink-0 border border-slate-200/90 bg-white">
                        <span class="w-2.5 h-2.5 rounded-full ${badgeTurnoBg} flex-shrink-0"></span>
                        <span class="truncate max-w-[150px]">${shortName}</span>
                        <span class="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">${g.turno}</span>
                    </button>
                `;
            });

            container.innerHTML = htmlTabs;
        }

        function abrirModalEditarGrupo(grupoId) {
            const g = gruposGlobales.find(x => x.id == grupoId);
            if (!g) return;

            document.getElementById('editar-grupo-id').value = g.id;
            document.getElementById('editar-grupo-nombre').value = g.nombre;
            document.getElementById('editar-grupo-carrera').value = g.carrera;
            document.getElementById('editar-grupo-turno').value = g.turno || 'Mañana';
            document.getElementById('editar-grupo-encargado').value = g.encargado || '';
            document.getElementById('editar-grupo-horario').value = g.horario || '';
            document.getElementById('editar-grupo-aula').value = g.aula_taller || '';
            document.getElementById('editar-grupo-desc').value = g.descripcion || '';

            document.getElementById('modal-editar-grupo').classList.remove('hidden');
        }

        function cerrarModalEditarGrupo() {
            document.getElementById('modal-editar-grupo').classList.add('hidden');
        }

        async function guardarEdicionGrupo(e) {
            e.preventDefault();
            const grupoId = document.getElementById('editar-grupo-id').value;
            const payload = {
                nombre: document.getElementById('editar-grupo-nombre').value.trim(),
                carrera: document.getElementById('editar-grupo-carrera').value,
                turno: document.getElementById('editar-grupo-turno').value,
                encargado: document.getElementById('editar-grupo-encargado').value.trim(),
                horario: document.getElementById('editar-grupo-horario').value.trim(),
                aula_taller: document.getElementById('editar-grupo-aula').value.trim(),
                descripcion: document.getElementById('editar-grupo-desc').value.trim()
            };

            try {
                const res = await fetch(`/api/grupos/${grupoId}/editar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarGrupo();
                    alert("✅ Sección y turno modificados exitosamente.");
                    await cargarGrupos();
                    if (!document.getElementById('vista-plantilla-seccion').classList.contains('hidden')) {
                        await verPlantillaSeccion(grupoId);
                    }
                } else {
                    alert("Error: " + (data.error || "No se pudo actualizar"));
                }
            } catch (err) {
                alert("Error de conexión al actualizar la sección");
            }
        }

        function abrirModalEditarDocente(docId) {
            const d = docentesGlobales.find(x => x.id == docId);
            if (!d) return;

            document.getElementById('editar-docente-id').value = d.id;
            document.getElementById('editar-docente-nombre').value = d.nombre;
            document.getElementById('editar-docente-carrera').value = d.carrera || 'Corte y Ensamblaje';
            document.getElementById('editar-docente-telefono').value = d.telefono || '';
            document.getElementById('editar-docente-especialidad').value = d.especialidad || '';
            document.getElementById('editar-docente-email').value = d.email || '';

            document.getElementById('modal-editar-docente').classList.remove('hidden');
        }

        function cerrarModalEditarDocente() {
            document.getElementById('modal-editar-docente').classList.add('hidden');
        }

        async function guardarEdicionDocente(e) {
            e.preventDefault();
            const docId = document.getElementById('editar-docente-id').value;
            const payload = {
                nombre: document.getElementById('editar-docente-nombre').value.trim(),
                carrera: document.getElementById('editar-docente-carrera').value,
                telefono: document.getElementById('editar-docente-telefono').value.trim(),
                especialidad: document.getElementById('editar-docente-especialidad').value.trim(),
                email: document.getElementById('editar-docente-email').value.trim()
            };

            try {
                const res = await fetch(`/api/docentes/${docId}/editar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalEditarDocente();
                    alert("✅ Datos del docente modificados exitosamente.");
                    await cargarDocentes();
                    await cargarGrupos();
                } else {
                    alert("Error: " + (data.error || "No se pudo actualizar"));
                }
            } catch (err) {
                alert("Error de conexión al actualizar docente");
            }
        }

        function renderGrupos(lista) {
            const grid = document.getElementById('grid-grupos');
            if (!grid) return;

            // Actualizar tarjetas de métricas superiores con la cantidad exacta de estudiantes
            const totalAlumnos = (lista || []).reduce((acc, g) => acc + (g.total_alumnos || 0), 0);
            const totalIng = (lista || []).reduce((acc, g) => acc + (g.total_ingresos || 0), 0);
            const totalEgr = (lista || []).reduce((acc, g) => acc + (g.total_egresos || 0), 0);

            const fMoneyCalc = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const countEl = document.getElementById('grupos-total-count');
            if (countEl) countEl.innerText = (lista || []).length + ' Activos';
            const aluEl = document.getElementById('grupos-total-alumnos');
            if (aluEl) aluEl.innerText = totalAlumnos + ' Alumnos';
            const ingEl = document.getElementById('grupos-total-ingresos');
            if (ingEl) ingEl.innerText = 'S/. ' + fMoneyCalc(totalIng);
            const egrEl = document.getElementById('grupos-total-egresos');
            if (egrEl) egrEl.innerText = 'S/. ' + fMoneyCalc(totalEgr);

            if (lista.length === 0) {
                grid.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">No se encontraron secciones o grupos registrados con los filtros aplicados. Haz clic en "Crear Nueva Sección / Grupo" para registrar una.</div>`;
                return;
            }

            const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            
            const tbodyGrupos = document.getElementById('tabla-grupos-body');
            if (tbodyGrupos) {
                if (lista.length === 0) {
                    tbodyGrupos.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400">No se encontraron grupos registrados.</td></tr>';
                } else {
                    tbodyGrupos.innerHTML = lista.map((g, idx) => `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition">
                            <td class="py-3 px-4 font-mono font-bold text-slate-500">${idx + 1}</td>
                            <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${g.nombre}</td>
                            <td class="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">${g.carrera}</td>
                            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">${g.turno || 'General'}</span></td>
                            <td class="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">${g.encargado || g.docente_nombre || 'Docente Institucional'}</td>
                            <td class="py-3 px-4 text-center"><span class="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-indigo-200 dark:border-indigo-800">${g.total_alumnos || 0}</span></td>
                            <td class="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">S/. ${fMoney(g.total_ingresos || 0)}</td>
                            <td class="py-3 px-4 text-center">
                                <button type="button" onclick="verPlantillaSeccion('${g.nombre}')" class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-[11px] transition">Ver Alumnos</button>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            grid.innerHTML = lista.map(g => {
                const iniciales = g.encargado ? g.encargado.replace(/^(Dr\.|Mg\.|Lic\.|Ing\.|Prof\.|C\.P\.C\.|Chef)\s*/i, '').split(' ').slice(0, 2).map(n => n[0]).join('') : 'CET';
                const balanceNeto = (g.total_ingresos || 0) - (g.total_egresos || 0);

                let badgeTurnoColor = 'bg-sky-50 text-sky-700 border-sky-200';
                if (g.turno === 'Tarde') badgeTurnoColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if (g.turno === 'Noche') badgeTurnoColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';

                return `
                    <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <!-- Header de la tarjeta del grupo -->
                            <div class="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <span class="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mb-1">
                                        ${g.carrera}
                                    </span>
                                    <h4 class="font-extrabold text-slate-900 text-base leading-tight">${g.nombre}</h4>
                                </div>
                                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg border ${badgeTurnoColor}">
                                        <i class="fa-regular fa-clock mr-1"></i>${g.turno}
                                    </span>
                                    <span class="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm flex items-center">
                                        <i class="fa-solid fa-users mr-1.5 text-indigo-500"></i>${g.total_alumnos || 0} Alumnos
                                    </span>
                                </div>
                            </div>

                            <!-- Encargado de la clase -->
                            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3 mb-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white font-black flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                                    ${iniciales}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encargado de la Clase</p>
                                    <p class="font-bold text-slate-900 text-xs truncate" title="${g.encargado}">${g.encargado}</p>
                                    <p class="text-[10px] text-slate-500 truncate">${g.horario || 'Horario regular'} • ${g.aula_taller || 'Aula general'}</p>
                                </div>
                            </div>

                            <!-- Resumen Financiero y Alumnos -->
                            <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-500 font-medium">Estudiantes Inscritos:</span>
                                    <span class="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">${g.total_alumnos || 0} Alumnos</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-500 font-medium">Dinero Ingresado:</span>
                                    <span class="font-extrabold text-emerald-600">+S/. ${fMoney(g.total_ingresos || 0)}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-500 font-medium">Dinero Salido (Egresos):</span>
                                    <span class="font-extrabold text-rose-600">-S/. ${fMoney(g.total_egresos || 0)}</span>
                                </div>
                                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 font-bold mt-1">
                                    <span class="text-slate-700">Balance del Grupo:</span>
                                    <span class="${balanceNeto >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-black">
                                        ${balanceNeto >= 0 ? '+' : '-'} S/. ${fMoney(Math.abs(balanceNeto))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div class="pt-4 mt-4 border-t border-slate-100 space-y-2">
                            <div class="flex items-center space-x-2">
                                <button onclick="abrirModalNuevoMovimientoParaGrupo('${encodeURIComponent(g.nombre)}', '${encodeURIComponent(g.encargado)}', '${encodeURIComponent(g.carrera)}')" class="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5" title="Registrar un ingreso o gasto e ingresar cantidad para este grupo">
                                    <i class="fa-solid fa-money-bill-wave"></i>
                                    <span>Ingresar Cantidad</span>
                                </button>
                                <button onclick="abrirModalDetalleGrupo(${g.id})" class="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5" title="Ver alumnos de esta sección y sus movimientos">
                                    <i class="fa-solid fa-list-check"></i>
                                    <span>Ver Alumnos</span>
                                </button>
                                <button onclick="eliminarGrupo(${g.id}, '${encodeURIComponent(g.nombre)}')" class="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-slate-200" title="Eliminar sección">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Acciones de Grupo
        function abrirModalNuevoGrupo() {
            document.getElementById('form-nuevo-grupo').reset();
            document.getElementById('modal-nuevo-grupo').classList.remove('hidden');
        }

        function cerrarModalNuevoGrupo() {
            document.getElementById('modal-nuevo-grupo').classList.add('hidden');
        }

        async function guardarNuevoGrupo(e) {
            e.preventDefault();
            const payload = {
                nombre: document.getElementById('nuevo-grupo-nombre').value.trim(),
                carrera: document.getElementById('nuevo-grupo-carrera').value,
                encargado: document.getElementById('nuevo-grupo-encargado').value.trim(),
                turno: document.getElementById('nuevo-grupo-turno').value,
                horario: document.getElementById('nuevo-grupo-horario').value.trim(),
                aula_taller: document.getElementById('nuevo-grupo-aula').value.trim(),
                descripcion: document.getElementById('nuevo-grupo-descripcion').value.trim()
            };

            if (!payload.nombre || !payload.encargado) {
                alert("Por favor completa el nombre de la sección y el encargado de la clase.");
                return;
            }

            try {
                const res = await fetch('/api/grupos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalNuevoGrupo();
                    alert(`✅ Sección "${payload.nombre}" creada con éxito.`);
                    await cargarGrupos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo crear la sección'}`);
                }
            } catch (err) {
                alert("Error de conexión al guardar la sección");
            }
        }

        async function eliminarGrupo(id, nombreEncoded) {
            const nombre = decodeURIComponent(nombreEncoded);
            if (!confirm(`¿Estás seguro de que deseas eliminar la sección "${nombre}"?\n\nLos estudiantes asignados a este grupo pasarán a la sección 'General'.`)) {
                return;
            }

            try {
                const res = await fetch(`/api/grupos/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    alert(`✅ ${data.message}`);
                    await cargarGrupos();
                    await cargarMovimientos();
                } else {
                    alert(`Error: ${data.error || 'No se pudo eliminar el grupo'}`);
                }
            } catch (err) {
                alert("Error al intentar eliminar el grupo");
            }
        }

        async function abrirModalDetalleGrupo(id) {
            try {
                const res = await fetch(`/api/grupos/${id}/detalle`);
                const data = await res.json();
                const g = data.grupo;
                const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                document.getElementById('detalle-grupo-nombre').innerText = g.nombre;
                document.getElementById('detalle-grupo-subtitulo').innerText = `${g.carrera} • Turno ${g.turno} • Aula: ${g.aula_taller || 'General'}`;
                document.getElementById('detalle-grupo-encargado').innerText = g.encargado;
                document.getElementById('detalle-grupo-turno').innerText = `${g.turno} | ${g.horario || 'Horario regular'}`;
                document.getElementById('detalle-grupo-ingresos').innerText = fMoney(data.total_ingresos);
                document.getElementById('detalle-grupo-egresos').innerText = fMoney(data.total_egresos);
                document.getElementById('detalle-grupo-alumnos-count').innerText = data.estudiantes.length;

                // Configurar botón para registrar en este grupo directamente
                const btnReg = document.getElementById('btn-registrar-en-este-grupo');
                if (btnReg) {
                    btnReg.onclick = () => {
                        cerrarModalDetalleGrupo();
                        abrirModalNuevoMovimientoParaGrupo(encodeURIComponent(g.nombre), encodeURIComponent(g.encargado), encodeURIComponent(g.carrera));
                    };
                }

                // Render lista estudiantes
                const tbodyEst = document.getElementById('detalle-grupo-tabla-alumnos');
                if (data.estudiantes.length === 0) {
                    tbodyEst.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-slate-400">No hay estudiantes asignados directamente a este grupo todavía.</td></tr>`;
                } else {
                    tbodyEst.innerHTML = data.estudiantes.map((e, idx) => `
                        <tr>
                            <td class="p-2 font-mono font-bold text-indigo-700 dark:text-indigo-400">Fila #${idx + 1} • Boleta: ${e.ultimo_comprobante || e.comprobante || (e.codigo ? e.codigo.replace(/\D/g, '').padStart(7, '0') : '---')}</td>
                            <td class="p-2 font-semibold text-slate-800 dark:text-white">${e.nombre}</td>
                            <td class="p-2 text-slate-600 dark:text-slate-300">${e.ciclo || 'Regular'}</td>
                            <td class="p-2 text-slate-500 dark:text-slate-400">${e.telefono || '-'}</td>
                        </tr>
                    `).join('');
                }

                // Render lista movimientos
                const tbodyMov = document.getElementById('detalle-grupo-tabla-movimientos');
                if (data.movimientos.length === 0) {
                    tbodyMov.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-400">Sin movimientos registrados aún para esta sección. Haz clic en '+ Registrar Movimiento en este Grupo'.</td></tr>`;
                } else {
                    tbodyMov.innerHTML = data.movimientos.map(m => `
                        <tr>
                            <td class="p-2 font-semibold text-slate-600">${m.fecha}</td>
                            <td class="p-2">
                                <span class="font-bold text-[10px] px-2 py-0.5 rounded-full ${m.tipo === 'Ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                    ${m.tipo}
                                </span>
                            </td>
                            <td class="p-2 font-medium text-slate-800">${m.nombre}</td>
                            <td class="p-2">
                                <span class="text-slate-800">${m.concepto}</span>
                                ${m.notas ? `<div class="text-[10px] text-amber-700 font-medium">${m.notas}</div>` : ''}
                            </td>
                            <td class="p-2 text-right font-black ${m.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-rose-600'}">
                                S/. ${Number(m.monto).toFixed(2)}
                            </td>
                            <td class="p-2 text-center">
                                <span class="text-[10px] font-bold ${m.estado === 'Pagado' ? 'text-emerald-700' : 'text-amber-700'}">
                                    ${m.estado}
                                </span>
                            </td>
                        </tr>
                    `).join('');
                }

                document.getElementById('modal-detalle-grupo').classList.remove('hidden');
            } catch (err) {
                console.error("Error al ver detalle del grupo:", err);
            }
        }

        function cerrarModalDetalleGrupo() {
            document.getElementById('modal-detalle-grupo').classList.add('hidden');
        }

        function abrirModalNuevoMovimientoParaGrupo(nombreEncoded, encargadoEncoded, carreraEncoded) {
            const nombre = decodeURIComponent(nombreEncoded);
            const encargado = decodeURIComponent(encargadoEncoded);
            const carrera = decodeURIComponent(carreraEncoded);

            abrirModalNuevoMovimiento();
            const selectGrupo = document.getElementById('form-grupo');
            if (selectGrupo) selectGrupo.value = nombre;

            const inputEncargado = document.getElementById('form-encargado');
            if (inputEncargado) inputEncargado.value = encargado;

            const selectCarrera = document.getElementById('form-carrera');
            if (selectCarrera && carrera) selectCarrera.value = carrera;
        }

        // GESTIÓN DE ROLES EN MODAL (ESTUDIANTE / DOCENTE / INSTITUCIÓN)
        function seleccionarRolPersonaModal(rol) {
            const inpRol = document.getElementById('form-rol');
            if (inpRol) inpRol.value = rol;

            const tabEst = document.getElementById('tab-rol-estudiante');
            const tabDoc = document.getElementById('tab-rol-docente');
            const tabGen = document.getElementById('tab-rol-general');

            const contEst = document.getElementById('contenedor-seleccion-estudiante');
            const contDoc = document.getElementById('contenedor-seleccion-docente');

            // Reset tab styles
            [tabEst, tabDoc, tabGen].forEach(t => {
                if (t) {
                    t.className = "px-3 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center space-x-1";
                }
            });

            if (rol === 'Estudiante') {
                if (tabEst) tabEst.className = "px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1";
                if (contEst) contEst.classList.remove('hidden');
                if (contDoc) contDoc.classList.add('hidden');
            } else if (rol === 'Docente') {
                if (tabDoc) tabDoc.className = "px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1";
                if (contEst) contEst.classList.add('hidden');
                if (contDoc) contDoc.classList.remove('hidden');

                const selDoc = document.getElementById('select-docente-persona-modal');
                if (selDoc && selDoc.value) {
                    alSeleccionarDocentePersonaEnModal(selDoc.value);
                }
            } else {
                // General / Institución
                if (tabGen) tabGen.className = "px-3 py-1 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1";
                if (contEst) contEst.classList.add('hidden');
                if (contDoc) contDoc.classList.add('hidden');

                const inpNom = document.getElementById('form-nombre');
                if (inpNom) inpNom.value = 'Institución CETPRO Micaela Bastidas';
                const selCarr = document.getElementById('form-carrera');
                if (selCarr) selCarr.value = 'General';
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = 'General';
                const selEnc = document.getElementById('form-encargado');
                if (selEnc) selEnc.value = 'General';
            }
        }

        function alSeleccionarEstudianteEnModal(estId) {
            if (!estId) return;
            const est = (estudiantesGlobales || []).find(e => e.id == estId || e.nombre == estId);
            if (!est) return;

            const inpNom = document.getElementById('form-nombre');
            if (inpNom) inpNom.value = est.nombre || '';

            const inpDni = document.getElementById('form-dni');
            if (inpDni && est.dni) inpDni.value = est.dni;

            const inpTel = document.getElementById('form-telefono');
            if (inpTel && est.telefono) inpTel.value = est.telefono;

            const selCarr = document.getElementById('form-carrera');
            if (selCarr && est.carrera) selCarr.value = est.carrera;

            const selTurno = document.getElementById('form-turno');
            if (selTurno && est.turno) selTurno.value = est.turno;

            const selGrp = document.getElementById('form-grupo');
            if (selGrp && est.grupo) {
                selGrp.value = est.grupo;
                alCambiarGrupoEnModal();
            }
        }

        function alSeleccionarDocentePersonaEnModal(docNombre) {
            if (!docNombre) return;
            const doc = (docentesGlobales || []).find(d => d.nombre === docNombre);
            if (!doc) return;

            const inpNom = document.getElementById('form-nombre');
            if (inpNom) inpNom.value = doc.nombre;

            const selCarr = document.getElementById('form-carrera');
            if (selCarr && doc.carrera) selCarr.value = doc.carrera;

            const selTurno = document.getElementById('form-turno');
            if (selTurno && doc.turno) selTurno.value = doc.turno;

            const selEnc = document.getElementById('form-encargado');
            if (selEnc) selEnc.value = doc.nombre;

            // Auto-seleccionar grupo a cargo de este docente
            const grp = (gruposGlobales || []).find(g => g.encargado === doc.nombre || (doc.carrera && g.carrera === doc.carrera));
            if (grp) {
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = grp.nombre;
            }
        }

        function alCambiarDocenteEncargadoEnModal() {
            const selEnc = document.getElementById('form-encargado');
            if (!selEnc) return;
            const docNombre = selEnc.value;
            if (docNombre === 'General') {
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = 'General';
                return;
            }

            const grp = (gruposGlobales || []).find(g => g.encargado === docNombre);
            if (grp) {
                const selGrp = document.getElementById('form-grupo');
                if (selGrp) selGrp.value = grp.nombre;

                const selCarr = document.getElementById('form-carrera');
                if (selCarr && grp.carrera) selCarr.value = grp.carrera;

                const selTurno = document.getElementById('form-turno');
                if (selTurno && grp.turno) selTurno.value = grp.turno;
            }

            const inpRol = document.getElementById('form-rol');
            if (inpRol && inpRol.value === 'Docente') {
                const inpNom = document.getElementById('form-nombre');
                if (inpNom) inpNom.value = docNombre;
            }
        }

        function alCambiarGrupoEnModal() {
            const selectGrupo = document.getElementById('form-grupo');
            const grupoNombre = selectGrupo ? selectGrupo.value : 'General';
            const selectEncargado = document.getElementById('form-encargado');
            const selectCarrera = document.getElementById('form-carrera');
            const selectTurno = document.getElementById('form-turno');

            if (grupoNombre === 'General') {
                if (selectEncargado) selectEncargado.value = 'General';
                return;
            }

            const grupo = (gruposGlobales || []).find(g => g.nombre === grupoNombre);
            if (grupo) {
                if (selectEncargado) selectEncargado.value = grupo.encargado || 'General';
                if (selectCarrera && grupo.carrera) selectCarrera.value = grupo.carrera;
                if (selectTurno && grupo.turno) selectTurno.value = grupo.turno;
            }
        }

        // Tipo de Movimiento Selector Visual
        function seleccionarTipoMovimiento(tipo) {
            document.getElementById('form-tipo').value = tipo;
            const btnIngreso = document.getElementById('btn-tipo-ingreso');
            const btnEgreso = document.getElementById('btn-tipo-egreso');

            if (tipo === 'Ingreso') {
                btnIngreso.className = 'py-3 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnEgreso.className = 'py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-rose-50 hover:text-rose-700';
            } else {
                btnEgreso.className = 'py-3 px-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-extrabold flex items-center justify-center space-x-2 transition shadow-sm';
                btnIngreso.className = 'py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold flex items-center justify-center space-x-2 transition hover:bg-emerald-50 hover:text-emerald-700';
            }
        }

        // Botones de incremento rápido de cantidad
        function setCantidadRapida(val, sumar = false) {
            const inputMonto = document.getElementById('form-monto');
            if (!inputMonto) return;

            if (sumar) {
                const actual = parseFloat(inputMonto.value) || 0;
                inputMonto.value = (actual + val).toFixed(2);
            } else {
                inputMonto.value = val === 0 ? '' : Number(val).toFixed(2);
            }
            inputMonto.focus();
        }

        // MODAL NUEVO MOVIMIENTO
        function abrirModalNuevoMovimiento(rolPreseleccionado = '') {
            if (typeof cargarConceptosPersonalizadosEnSelector === 'function') cargarConceptosPersonalizadosEnSelector();
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
                });

            // Poblar datalist de sugerencias con estudiantes globales
            const dl = document.getElementById('lista-estudiantes-sugerencias');
            if (dl && estudiantesGlobales && estudiantesGlobales.length > 0) {
                dl.innerHTML = estudiantesGlobales.map(e => `<option value="${e.nombre}">${e.dni ? 'DNI: ' + e.dni + ' - ' : ''}${e.carrera || ''}</option>`).join('');
            }

            // Sugerir el siguiente número correlativo oficial de comprobante
            const inpComp = document.getElementById('form-comprobante');
            if (inpComp) {
                let maxNro = 807;
                if (movimientosGlobales && movimientosGlobales.length > 0) {
                    movimientosGlobales.forEach(m => {
                        if (m.comprobante) {
                            const n = parseInt(String(m.comprobante).replace(/\D/g, ''), 10);
                            if (!isNaN(n) && n > maxNro) maxNro = n;
                        }
                    });
                }
                inpComp.value = String(maxNro + 1).padStart(7, '0');
            }

            document.getElementById('modal-nuevo-movimiento').classList.remove('hidden');
        }

        function alEscribirNombreEnModal() {
            const nomInput = document.getElementById('form-nombre');
            if (!nomInput) return;
            const nom = nomInput.value.trim().toLowerCase();
            if (!nom || !estudiantesGlobales) return;

            const est = estudiantesGlobales.find(e => e.nombre && e.nombre.trim().toLowerCase() === nom);
            if (est) {
                const inpDni = document.getElementById('form-dni');
                if (inpDni && est.dni) inpDni.value = est.dni;

                const selCarr = document.getElementById('form-carrera');
                if (selCarr && est.carrera) selCarr.value = est.carrera;

                const selGrup = document.getElementById('form-grupo');
                if (selGrup && est.grupo) {
                    selGrup.value = est.grupo;
                    alCambiarGrupoEnModal();
                }

                const selTurno = document.getElementById('form-turno');
                if (selTurno && est.turno) selTurno.value = est.turno;
            }
        }

        function cerrarModalNuevoMovimiento() {
            document.getElementById('modal-nuevo-movimiento').classList.add('hidden');
        }

        function toggleFechaVencimiento() {
            const estado = document.getElementById('form-estado').value;
            const div = document.getElementById('div-vencimiento');
            if (estado === 'Pendiente') {
                div.classList.remove('hidden');
            } else {
                div.classList.add('hidden');
            }
        }

        async function guardarMovimiento(e) {
            e.preventDefault();
            const monto = parseFloat(document.getElementById('form-monto').value);
            if (!monto || monto <= 0) {
                alert("Por favor ingresa una cantidad válida mayor a cero.");
                return;
            }

            const payload = {
                tipo: document.getElementById('form-tipo').value,
                estado: document.getElementById('form-estado').value,
                rol: document.getElementById('form-rol').value,
                nombre: document.getElementById('form-nombre').value.trim(),
                comprobante: (document.getElementById('form-comprobante')?.value || '').trim(),
                dni: (document.getElementById('form-dni')?.value || '').trim(),
                telefono: (document.getElementById('form-telefono')?.value || '').trim(),
                turno: (document.getElementById('form-turno')?.value || 'Tarde').trim(),
                grupo: (document.getElementById('form-grupo')?.value || 'General').trim(),
                encargado: (document.getElementById('form-encargado')?.value || 'General').trim(),
                carrera: document.getElementById('form-carrera').value,
                concepto: document.getElementById('form-concepto').value.trim(),
                monto: monto,
                monto_total: monto,
                monto_abonado: 0,
                fecha: document.getElementById('form-fecha').value,
                metodo_pago: document.getElementById('form-metodo').value,
                fecha_vencimiento: document.getElementById('form-vencimiento').value,
                notas: (document.getElementById('form-notas')?.value || '').trim()
            };

            try {
                const res = await fetch('/api/movimientos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
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
            } catch (err) {
                alert("Error al guardar el movimiento");
            }
        }

        async function eliminarMovimiento(id) {
            if (!confirm("¿Estás seguro de que deseas eliminar este movimiento de la caja?")) return;
            try {
                await fetch(`/api/movimientos/${id}`, { method: 'DELETE' });
                await cargarTodo();
            } catch (err) {
                alert("Error al eliminar");
            }
        }


        // =========================================================================
        // GESTIÓN DE DOCENTES ENCARGADOS DE GRUPOS Y BARRITA DE NUEVO ESTUDIANTE
        // =========================================================================
        function poblarSelectDocentesNuevoEstudiante() {
            const sel = document.getElementById('modal-nef-docente');
            if (!sel) return;

            const listaDocentes = new Map();
            if (Array.isArray(docentesGlobales)) {
                docentesGlobales.forEach(d => {
                    if (d && d.nombre && d.nombre.trim()) {
                        listaDocentes.set(d.nombre.trim(), {
                            nombre: d.nombre.trim(),
                            carrera: d.carrera || '',
                            turno: d.turno || ''
                        });
                    }
                });
            }
            if (Array.isArray(gruposGlobales)) {
                gruposGlobales.forEach(g => {
                    if (g && g.encargado && g.encargado.trim() && g.encargado !== 'General' && g.encargado !== 'Por Asignar') {
                        const nom = g.encargado.trim();
                        if (!listaDocentes.has(nom)) {
                            listaDocentes.set(nom, {
                                nombre: nom,
                                carrera: g.carrera || '',
                                turno: g.turno || ''
                            });
                        }
                    }
                });
            }

            const currentVal = sel.value;
            sel.innerHTML = '<option value="">-- Seleccionar Docente Encargado --</option>' +
                Array.from(listaDocentes.values())
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map(d => `<option value="${d.nombre}">${d.nombre} (${d.carrera ? d.carrera + ' - ' : ''}${d.turno || 'General'})</option>`)
                    .join('');

            if (currentVal && Array.from(sel.options).some(o => o.value === currentVal)) {
                sel.value = currentVal;
            } else {
                actualizarDocenteSugeridoNuevoEstudiante();
            }
        }

        function actualizarDocenteSugeridoNuevoEstudiante() {
            const selDoc = document.getElementById('modal-nef-docente');
            const selCarr = document.getElementById('modal-nef-carrera');
            const selTurno = document.getElementById('modal-nef-turno');
            if (!selDoc || !selCarr) return;

            const carreraSeleccionada = (selCarr.value || '').trim().toLowerCase();
            const turnoSeleccionado = (selTurno?.value || '').trim().toLowerCase();

            // 1. Buscar en gruposGlobales coincidencia por carrera y turno
            let docenteEncontrado = '';
            if (Array.isArray(gruposGlobales)) {
                const matchExacto = gruposGlobales.find(g => 
                    g.carrera && g.carrera.trim().toLowerCase() === carreraSeleccionada &&
                    g.turno && g.turno.trim().toLowerCase() === turnoSeleccionado &&
                    g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar'
                );
                if (matchExacto) {
                    docenteEncontrado = matchExacto.encargado;
                } else {
                    const matchCarrera = gruposGlobales.find(g => 
                        g.carrera && g.carrera.trim().toLowerCase() === carreraSeleccionada &&
                        g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar'
                    );
                    if (matchCarrera) docenteEncontrado = matchCarrera.encargado;
                }
            }

            // 2. Si no, buscar en docentesGlobales
            if (!docenteEncontrado && Array.isArray(docentesGlobales)) {
                const dMatch = docentesGlobales.find(d => 
                    d.carrera && d.carrera.trim().toLowerCase() === carreraSeleccionada
                );
                if (dMatch) docenteEncontrado = dMatch.nombre;
            }

            if (docenteEncontrado) {
                for (let i = 0; i < selDoc.options.length; i++) {
                    if (selDoc.options[i].value.trim().toLowerCase() === docenteEncontrado.trim().toLowerCase()) {
                        selDoc.selectedIndex = i;
                        return;
                    }
                }
                const opt = document.createElement('option');
                opt.value = docenteEncontrado;
                opt.text = docenteEncontrado + ' (Docente Asignado)';
                selDoc.add(opt);
                selDoc.value = docenteEncontrado;
            }
        }

        function renderTablaDocentesGruposConfig(grupos) {
            const tbody = document.getElementById('tabla-docentes-grupos-config-body');
            if (!tbody) return;

            const lista = (grupos && grupos.length > 0) ? grupos : (gruposGlobales || []);
            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400">No hay grupos o secciones registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = lista.map(g => {
                const badgeTurno = g.turno === 'Mañana' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                   (g.turno === 'Tarde' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' :
                                   (g.turno === 'Noche' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                   'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'));

                const docente = g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar' 
                    ? g.encargado 
                    : '<span class="text-amber-500 italic font-semibold">Sin docente asignado</span>';

                const safeNom = (g.nombre || '').replace(/'/g, "\\'");
                const safeCarr = (g.carrera || '').replace(/'/g, "\\'");
                const safeEnc = (g.encargado || '').replace(/'/g, "\\'");

                return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-3 px-3">
                            <span class="font-bold text-slate-900 dark:text-white">${g.nombre}</span>
                            ${g.aula_taller ? `<div class="text-[10px] text-slate-400"><i class="fa-solid fa-door-open mr-1"></i>${g.aula_taller}</div>` : ''}
                        </td>
                        <td class="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            <span class="inline-flex items-center space-x-1">
                                <i class="fa-solid fa-graduation-cap text-indigo-500 text-[10px]"></i>
                                <span>${g.carrera || 'General'}</span>
                            </span>
                        </td>
                        <td class="py-3 px-3 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeTurno}">
                                ${g.turno || 'General'}
                            </span>
                        </td>
                        <td class="py-3 px-3">
                            <div class="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                                <i class="fa-solid fa-chalkboard-user text-indigo-500 text-xs"></i>
                                <span>${docente}</span>
                            </div>
                        </td>
                        <td class="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                            ${g.total_alumnos !== undefined ? g.total_alumnos : '-'}
                        </td>
                        <td class="py-3 px-3 text-right">
                            <button type="button" onclick="abrirModalModificarDocenteGrupo(${g.id}, '${safeNom}', '${safeCarr}', '${safeEnc}')" class="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] shadow-sm transition">
                                <i class="fa-solid fa-user-pen"></i>
                                <span>Modificar Docente</span>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function abrirModalModificarDocenteGrupo(grupoId, grupoNombre, carrera, encargadoActual) {
            document.getElementById('cfg-editar-grupo-id').value = grupoId;
            document.getElementById('cfg-editar-grupo-nombre').value = grupoNombre;
            document.getElementById('cfg-editar-grupo-carrera').value = carrera;
            
            const inpEnc = document.getElementById('cfg-editar-grupo-encargado');
            inpEnc.value = (encargadoActual && encargadoActual !== 'Por Asignar' && encargadoActual !== 'General') ? encargadoActual : '';
            
            const dl = document.getElementById('lista-sugerencias-docentes-cfg');
            if (dl) {
                const nombresUnicos = new Set();
                if (Array.isArray(docentesGlobales)) {
                    docentesGlobales.forEach(d => d.nombre && nombresUnicos.add(d.nombre.trim()));
                }
                if (Array.isArray(gruposGlobales)) {
                    gruposGlobales.forEach(g => g.encargado && g.encargado !== 'General' && g.encargado !== 'Por Asignar' && nombresUnicos.add(g.encargado.trim()));
                }
                dl.innerHTML = Array.from(nombresUnicos).sort().map(nom => `<option value="${nom}">`).join('');
            }

            document.getElementById('modal-editar-docente-grupo').classList.remove('hidden');
            setTimeout(() => inpEnc.focus(), 100);
        }

        function cerrarModalModificarDocenteGrupo() {
            document.getElementById('modal-editar-docente-grupo').classList.add('hidden');
        }

        async function guardarModificacionDocenteGrupo(e) {
            e.preventDefault();
            const grupoId = document.getElementById('cfg-editar-grupo-id').value;
            const nuevoEncargado = document.getElementById('cfg-editar-grupo-encargado').value.trim();
            if (!nuevoEncargado) {
                alert("Por favor ingrese el nombre del docente encargado.");
                return;
            }
            const btn = document.getElementById('btn-guardar-docente-grupo-cfg');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Guardando...';
            }

            try {
                const res = await fetch(`/api/grupos/${grupoId}/encargado`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encargado: nuevoEncargado })
                });
                const data = await res.json();
                if (data.success) {
                    cerrarModalModificarDocenteGrupo();
                    if (typeof mostrarNotificacion === 'function') {
                        mostrarNotificacion(data.message || 'Docente actualizado correctamente', 'exito');
                    } else {
                        alert(data.message);
                    }
                    await cargarGrupos();
                    await cargarCarreras();
                    await cargarStats();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo actualizar el docente'));
                }
            } catch (err) {
                alert('Error de conexión al actualizar el docente: ' + err.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Docente';
                }
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            initTheme();
            // Asegurar rol válido exclusivo (Tesorero o Director)
            let rol = localStorage.getItem('educaja_rol_activo');
            if (rol !== 'Tesorero' && rol !== 'Director') {
                rol = 'Director';
                localStorage.setItem('educaja_rol_activo', rol);
            }
            const selRol = document.getElementById('select-rol-activo');
            if (selRol) selRol.value = rol;

            cargarTodo();
        });
    

        // =========================================================================
        // GESTIÓN DE LIMPIEZA Y REINICIO DE BOLETA (SELECCIONAR NUEVO ESTUDIANTE)
        // =========================================================================
        function limpiarSeleccionBoleta() {
            const selEst = document.getElementById('factura-estudiante-select');
            if (selEst) selEst.value = '';

            const selRec = document.getElementById('factura-recibo-select');
            if (selRec) {
                selRec.innerHTML = '<option value="">-- Seleccionar Recibo o Crear Nuevo --</option>';
            }

            // Reiniciar campos visuales del Comprobante Original
            const elNro = document.getElementById('factura-nro-comprobante');
            if (elNro) {
                // Sugerir nuevo correlativo si existe sugerencia
                const sug = document.getElementById('form-comprobante')?.placeholder?.replace(/[^0-9]/g, '') || '0000812';
                elNro.innerText = sug.padStart(7, '0');
            }

            const elEst = document.getElementById('factura-estudiante');
            if (elEst) elEst.innerText = '____________________________________________';

            const elDni = document.getElementById('factura-dni');
            if (elDni) elDni.innerText = '--------';

            const elCel = document.getElementById('factura-telefono');
            if (elCel) elCel.innerText = '---------';

            const elEsp = document.getElementById('factura-carrera');
            if (elEsp) elEsp.innerText = '____________________________________________';

            const elPrecio = document.getElementById('factura-precio-unit');
            if (elPrecio) elPrecio.innerText = '0.00';

            const elTotal = document.getElementById('factura-monto-total');
            if (elTotal) elTotal.innerText = '0.00';

            const elNota = document.getElementById('factura-nota-otros');
            if (elNota) elNota.innerText = '';

            // Desmarcar todas las casillas de módulos y constancia
            for (let i = 1; i <= 7; i++) {
                const box = document.getElementById('box-mod-' + i);
                if (box) box.innerText = '';
            }
            const chkConst = document.getElementById('check-constancia');
            if (chkConst) chkConst.innerText = '';
            const chkFut = document.getElementById('check-fut');
            if (chkFut) chkFut.innerText = '';

            // Fecha a hoy
            const hoy = new Date();
            const elDia = document.getElementById('factura-dia');
            if (elDia) elDia.innerText = String(hoy.getDate()).padStart(2, '0');
            const elMes = document.getElementById('factura-mes');
            if (elMes) elMes.innerText = String(hoy.getMonth() + 1).padStart(2, '0');
            const elAno = document.getElementById('factura-ano');
            if (elAno) elAno.innerText = String(hoy.getFullYear()).slice(-2);

            // Sincronizar comprobante copia (azul)
            if (typeof sincronizarCopiaVoucher === 'function') {
                sincronizarCopiaVoucher();
            }

            // Notificación visual rápida
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 text-xs font-bold flex items-center space-x-2 animate-bounce';
            toast.innerHTML = '<i class="fa-solid fa-eraser text-amber-400"></i><span>Boleta reiniciada. Selecciona un nuevo estudiante arriba para llenarla automáticamente.</span>';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
        }

        function actualizarBoletaSeleccionada() {
            const selRec = document.getElementById('factura-recibo-select');
            if (selRec && selRec.value) {
                seleccionarFacturaRecibo(selRec.value);
            } else {
                const selEst = document.getElementById('factura-estudiante-select');
                if (selEst && selEst.value) {
                    seleccionarEstudianteFactura(selEst.value);
                } else {
                    limpiarSeleccionBoleta();
                }
            }
        }

        // =========================================================================
        // FILTRADO Y ORDENAMIENTO AVANZADO DE ESTUDIANTES (MÁS RECIENTES PRIMERO)
        // =========================================================================
        function ordenarEstudiantesLista(lista, orden) {
            const copia = lista.slice();
            if (orden === 'reciente') {
                // Mayor ID o mayor número de boleta primero (los nuevos estudiantes van arriba)
                return copia.sort((a, b) => (b.id || 0) - (a.id || 0));
            } else if (orden === 'antiguo') {
                // Menor ID primero (primero al último)
                return copia.sort((a, b) => (a.id || 0) - (b.id || 0));
            } else if (orden === 'boleta_desc') {
                return copia.sort((a, b) => {
                    const bNro = Number(String(b.codigo || b.id).replace(/\D/g, '')) || 0;
                    const aNro = Number(String(a.codigo || a.id).replace(/\D/g, '')) || 0;
                    return bNro - aNro;
                });
            } else if (orden === 'boleta_asc') {
                return copia.sort((a, b) => {
                    const bNro = Number(String(b.codigo || b.id).replace(/\D/g, '')) || 0;
                    const aNro = Number(String(a.codigo || a.id).replace(/\D/g, '')) || 0;
                    return aNro - bNro;
                });
            } else if (orden === 'nombre_asc') {
                return copia.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
            } else if (orden === 'nombre_desc') {
                return copia.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
            }
            return copia;
        }

        // =========================================================================
        // FILTRADO DINÁMICO DE DEUDORES POR NOMBRE O DNI
        // =========================================================================
        let deudoresGlobalesCache = [];

        function filtrarDeudoresEnTabla() {
            const rawVal = document.getElementById('filtro-deudores-buscar')?.value || '';
            const query = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(rawVal) : rawVal.toLowerCase().trim();
            const queryDigits = rawVal.replace(/\D/g, '');
            const carreraFiltro = document.getElementById('filtro-deudores-carrera')?.value || '';

            const filtrados = (deudoresGlobalesCache || []).filter(d => {
                // Filtro carrera
                if (carreraFiltro && d.carrera !== carreraFiltro) return false;

                if (!query) return true;
                const nombreNorm = typeof normalizarTextoBusqueda === 'function' ? normalizarTextoBusqueda(d.nombre) : (d.nombre || '').toLowerCase();
                const dniNorm = (d.dni || d.codigo || '').toLowerCase();
                const dniDigits = (d.dni || d.codigo || '').replace(/\D/g, '');

                return nombreNorm.includes(query) ||
                       dniNorm.includes(query) ||
                       (queryDigits.length >= 2 && dniDigits.includes(queryDigits));
            });

            const badge = document.getElementById('badge-deudores-count');
            if (badge) badge.innerText = filtrados.length;

            renderDeudoresRows(filtrados);
        }

        let vistaDeudoresActual = 'tarjetas';

        function cambiarVistaDeudores(vista) {
            vistaDeudoresActual = vista;
            const btnTarjetas = document.getElementById('btn-deudores-vista-tarjetas');
            const btnTabla = document.getElementById('btn-deudores-vista-tabla');
            const gridCards = document.getElementById('grid-deudores-cards');
            const contTabla = document.getElementById('contenedor-deudores-tabla');

            if (vista === 'tarjetas') {
                if (btnTarjetas) btnTarjetas.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm bg-amber-500 text-slate-950 flex items-center space-x-1.5';
                if (btnTabla) btnTabla.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:text-amber-500 flex items-center space-x-1.5';
                if (gridCards) gridCards.classList.remove('hidden');
                if (contTabla) contTabla.classList.add('hidden');
            } else {
                if (btnTarjetas) btnTarjetas.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:text-amber-500 flex items-center space-x-1.5';
                if (btnTabla) btnTabla.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm bg-amber-500 text-slate-950 flex items-center space-x-1.5';
                if (gridCards) gridCards.classList.add('hidden');
                if (contTabla) contTabla.classList.remove('hidden');
            }
        }

        function renderDeudoresRows(deudores) {
            const tbody = document.getElementById('tabla-deudores');
            const grid = document.getElementById('grid-deudores-cards');
            if (!tbody && !grid) return;

            if (deudores.length === 0) {
                if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400 font-medium">¡Excelente! No se encontraron estudiantes con deudas pendientes para esta búsqueda.</td></tr>';
                if (grid) grid.innerHTML = `<div class="col-span-12 p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-xl mb-2">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">No hay ningún estudiante en Deudores</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Los estudiantes solo aparecerán en esta sección cuando los escojas o asignes manualmente usando el botón naranja <strong>'+ Asignar Deudor / Cuota Pendiente'</strong> arriba.
                    </p>
                </div>`;
                return;
            }

            const fMoney = (val) => 'S/. ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // 1. Render en Tabla
            if (tbody) {
                tbody.innerHTML = deudores.map((d, idx) => {
                    let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    let alertaIcon = 'fa-calendar';

                    if (d.urgencia === 'vencido') {
                        badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse';
                        alertaIcon = 'fa-circle-xmark';
                    } else if (d.urgencia === 'vence_hoy' || d.urgencia === 'urgente') {
                        badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                        alertaIcon = 'fa-triangle-exclamation';
                    } else if (d.urgencia === 'alerta') {
                        badgeColor = 'bg-yellow-50 text-yellow-800 border border-yellow-200';
                        alertaIcon = 'fa-clock';
                    } else {
                        badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                        alertaIcon = 'fa-circle-check';
                    }

                    const saldoCobrar = d.monto !== undefined ? d.monto : (d.deuda || d.saldo_pendiente || 150);
                    const nroBoleta = d.comprobante || '---';

                    return `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-b border-slate-100 dark:border-slate-800">
                            <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                                <span class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                    ${(d.nombre || '').charAt(0)}
                                </span>
                                <div>
                                    <span class="block">${d.nombre}</span>
                                    <span class="text-[10px] text-slate-400 font-mono">DNI: ${d.dni || '-'} • Fila #${idx + 1}</span>
                                </div>
                            </td>
                            <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                                <div>${d.carrera || d.grupo || '-'}</div>
                                <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Boleta: ${nroBoleta}</span>
                            </td>
                            <td class="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                                ${d.concepto || 'Cuota Mantenimiento'}
                                ${d.falta_completar ? `<span class="block text-[10px] text-amber-600 font-bold">Abonado: ${fMoney(d.monto_abonado || 0)}</span>` : ''}
                            </td>
                            <td class="py-3.5 px-4 text-right font-extrabold text-rose-600 dark:text-rose-400 font-mono">${fMoney(saldoCobrar)}</td>
                            <td class="py-3.5 px-4 text-center text-slate-500 font-medium">${d.fecha_vencimiento || '2026-11-30'}</td>
                            <td class="py-3.5 px-4 text-center">
                                <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badgeColor}">
                                    <i class="fa-solid ${alertaIcon}"></i>
                                    <span>${d.mensaje_urgencia || (d.urgencia || 'pendiente').toUpperCase()}</span>
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-center">
                                <button type="button" onclick="abrirModalConEstudianteDeuda('${(d.nombre || '').replace(/'/g, "\\'")}', '${(d.carrera || '').replace(/'/g, "\\'")}', ${saldoCobrar})" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1 mx-auto" title="Cobrar y Emitir Boleta">
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>Cobrar / Boleta</span>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

            // 2. Render en Tarjetas (Cards)
            if (grid) {
                grid.innerHTML = deudores.map((d, idx) => {
                    let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    let alertaIcon = 'fa-calendar';

                    if (d.urgencia === 'vencido') {
                        badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse';
                        alertaIcon = 'fa-circle-xmark';
                    } else if (d.urgencia === 'vence_hoy' || d.urgencia === 'urgente') {
                        badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700';
                        alertaIcon = 'fa-triangle-exclamation';
                    } else if (d.urgencia === 'alerta') {
                        badgeColor = 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
                        alertaIcon = 'fa-clock';
                    } else {
                        badgeColor = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
                        alertaIcon = 'fa-circle-check';
                    }

                    const saldoCobrar = d.monto !== undefined ? d.monto : (d.deuda || d.saldo_pendiente || 150);
                    const nroBoleta = d.comprobante || '---';
                    const iniciales = (d.nombre || '').split(' ').slice(0, 2).map(n => n[0]).join('');

                    return `
                        <div class="cyber-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl transition flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between mb-3">
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeColor}">
                                        <i class="fa-solid ${alertaIcon} mr-1.5"></i>
                                        ${d.mensaje_urgencia || (d.urgencia || 'pendiente').toUpperCase()}
                                    </span>
                                    <span class="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        Fila #${idx + 1} • Boleta: ${nroBoleta}
                                    </span>
                                </div>
                                <div class="flex items-center space-x-3 mb-3">
                                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md flex-shrink-0">
                                        ${iniciales}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate" title="${d.nombre}">${d.nombre}</h4>
                                        <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${d.carrera || d.grupo || 'General'}</p>
                                        <div class="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                            <span>DNI: ${d.dni || 'Sin DNI'}</span>
                                            <span>•</span>
                                            <span>Cel: ${d.telefono || 'Sin Cel.'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-3">
                                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Concepto Pendiente:</div>
                                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200">${d.concepto || 'Cuota Mantenimiento y Talleres'}</div>
                                    ${d.falta_completar ? `<div class="text-[10px] text-amber-600 font-semibold mt-0.5">Abonado hasta ahora: ${fMoney(d.monto_abonado || 0)}</div>` : ''}
                                </div>
                                <div class="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Saldo a Cobrar:</span>
                                    <span class="text-base font-black text-rose-600 dark:text-rose-400 font-mono">${fMoney(saldoCobrar)}</span>
                                </div>
                            </div>
                            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 flex gap-2">
                                <button type="button" onclick="abrirModalConEstudianteDeuda('${(d.nombre || '').replace(/'/g, "\\'")}', '${(d.carrera || '').replace(/'/g, "\\'")}', ${saldoCobrar})" class="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5">
                                    <i class="fa-solid fa-receipt"></i>
                                    <span>Cobrar / Emitir Boleta</span>
                                </button>
                                <button type="button" onclick="irAFacturaConEstudiante('${d.id || d.nombre}')" class="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold py-2 px-3 rounded-xl text-xs transition border border-indigo-200 dark:border-indigo-800" title="Ver comprobante y notas">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        function abrirModalConEstudianteDeuda(nombre, carrera, monto) {
            abrirModalNuevoMovimiento();
            setTimeout(() => {
                const inpNombre = document.getElementById('form-nombre');
                if (inpNombre) {
                    inpNombre.value = nombre;
                    if (typeof alCambiarNombreEstudiante === 'function') alCambiarNombreEstudiante(nombre);
                }
                const inpCarr = document.getElementById('form-carrera');
                if (inpCarr && carrera) inpCarr.value = carrera;
                const inpMonto = document.getElementById('form-monto');
                if (inpMonto && monto) inpMonto.value = monto;
                if (typeof actualizarBoletaModalEnVivo === 'function') actualizarBoletaModalEnVivo();
            }, 100);
        }

        // =========================================================================
        // CONTROL DINÁMICO DE FECHAS EN DIARIO Y NOTAS
        // =========================================================================
        function irAFechaDiario(tipo) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (!inputF) return;

            if (tipo === 'hoy') {
                inputF.value = new Date().toISOString().split('T')[0];
            } else if (tipo === 'ultimo') {
                if (typeof movimientosGlobales !== 'undefined' && movimientosGlobales.length > 0) {
                    const sortedMovs = movimientosGlobales.slice().sort((a,b) => (b.fecha || '').localeCompare(a.fecha || ''));
                    if (sortedMovs[0] && sortedMovs[0].fecha) {
                        inputF.value = sortedMovs[0].fecha;
                    }
                }
            }
            cargarDiario(inputF.value);
        }

        function cambiarDiaDiario(delta) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (!inputF) return;
            const curVal = inputF.value || new Date().toISOString().split('T')[0];
            const d = new Date(curVal + 'T12:00:00');
            d.setDate(d.getDate() + delta);
            inputF.value = d.toISOString().split('T')[0];
            cargarDiario(inputF.value);
        }

        // =========================================================================
        // EXPORTACIÓN AISLADA DE CADA SECCIÓN (SIN MEZCLAR CON OTRAS SECCIONES)
        // =========================================================================
        function exportarDiarioPDF() {
            const inputF = document.getElementById('diario-selector-fecha');
            const fStr = inputF ? inputF.value : new Date().toISOString().split('T')[0];
            const originalTitle = document.title;
            document.title = `CETPRO_Micaela_Bastidas_DIARIO_Y_NOTAS_${fStr}`;

            const elem = document.getElementById('section-diario');
            if (!elem) { window.print(); return; }

            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: `CETPRO_Micaela_Bastidas_DIARIO_${fStr}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(elem).save().then(() => {
                    document.title = originalTitle;
                });
            } else {
                window.print();
                setTimeout(() => { document.title = originalTitle; }, 1000);
            }
        }

        function exportarDiarioExcel() {
            const inputF = document.getElementById('diario-selector-fecha');
            const fStr = inputF ? inputF.value : new Date().toISOString().split('T')[0];
            window.location.href = `/api/exportar/hoja?sheet=diario&fecha=${encodeURIComponent(fStr)}`;
        }

        
                function exportarControlPagosPDF() {
            /* Botón retirado según solicitud */
        }
        function exportarControlPagosExcel() {
            /* Botón retirado según solicitud */
        }

        /* exportarControlPagosExcel retirado según solicitud */

        function irAFacturaConEstudiante(estId) {
            abrirModalNuevoMovimiento();
            setTimeout(() => {
                const est = (estudiantesGlobales || []).find(e => e.id == estId || (e.nombre && e.nombre.toLowerCase() === String(estId).toLowerCase()));
                if (est) {
                    if (document.getElementById('form-nombre')) document.getElementById('form-nombre').value = est.nombre || '';
                    if (document.getElementById('form-dni')) document.getElementById('form-dni').value = est.dni || '';
                    if (document.getElementById('form-telefono')) document.getElementById('form-telefono').value = est.telefono || '';
                    if (document.getElementById('form-carrera')) document.getElementById('form-carrera').value = est.carrera || '';
                    if (document.getElementById('form-grupo')) document.getElementById('form-grupo').value = est.grupo || '';
                    actualizarBoletaModalEnVivo();
                }
            }, 100);
        }



        // =========================================================================
        // DETECCIÓN INTELIGENTE DE ESTUDIANTES YA REGISTRADOS EN MODAL
        // =========================================================================
        function verificarDuplicadoEstudianteEnModal() {
            const dniVal = (document.getElementById('form-dni')?.value || '').trim();
            const alertBox = document.getElementById('alerta-duplicado-dni');
            const alertText = document.getElementById('alerta-duplicado-texto');
            const btnLoad = document.getElementById('btn-autollenar-duplicado');

            if (!dniVal || dniVal.length < 6 || typeof estudiantesGlobales === 'undefined') {
                if (alertBox) alertBox.classList.add('hidden');
                return;
            }

            const est = estudiantesGlobales.find(e => (e.dni && e.dni === dniVal) || (e.codigo && e.codigo === dniVal));
            if (est) {
                if (alertBox) alertBox.classList.remove('hidden');
                if (alertText) alertText.innerText = `¡Ya registrado! ${est.nombre} (${est.carrera || 'CETPRO'})`;
                if (btnLoad) {
                    btnLoad.onclick = () => {
                        alSeleccionarEstudianteEnModal(est.id);
                        alertBox.classList.add('hidden');
                    };
                }
            } else {
                if (alertBox) alertBox.classList.add('hidden');
            }
        }

        // =========================================================================
        // ATAJOS DE TECLADO EJECUTIVOS (HOTKEYS) PARA TESORERÍA
        // =========================================================================
        document.addEventListener('keydown', function(e) {
            // F2 o Ctrl+M: Nuevo Movimiento
            if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm')) {
                e.preventDefault();
                abrirModalNuevoMovimiento();
            }
            // Esc: Cerrar Modales
            if (e.key === 'Escape') {
                cerrarModalNuevoMovimiento();
            }
        });



        // =========================================================================
        // SINCRONIZACIÓN EN VIVO DE LA BOLETA DUAL (ORIGINAL + COPIA) EN EL MODAL
        // =========================================================================
        let modalCuadrosEstado = {
            modulos: [true, false, false, false, false, false, false],
            constancia: false,
            fut: false,
            otros: true
        };

        function toggleCuadroModal(tipo, val) {
            if (tipo === 'mod') {
                const idx = Number(val) - 1;
                if (idx >= 0 && idx < 7) {
                    modalCuadrosEstado.modulos[idx] = !modalCuadrosEstado.modulos[idx];
                }
            } else if (tipo === 'constancia') {
                modalCuadrosEstado.constancia = (typeof val === 'boolean') ? val : !modalCuadrosEstado.constancia;
            } else if (tipo === 'fut') {
                modalCuadrosEstado.fut = (typeof val === 'boolean') ? val : !modalCuadrosEstado.fut;
            } else if (tipo === 'otros') {
                modalCuadrosEstado.otros = (typeof val === 'boolean') ? val : !modalCuadrosEstado.otros;
            }
            actualizarBoletaModalEnVivo();
        }

        function toggleModalCuadroDirecto(tipo, val) {
            toggleCuadroModal(tipo, val);
        }

        function marcarTodosModulosModal(todos) {
            modalCuadrosEstado.modulos = [todos, todos, todos, todos, todos, todos, todos];
            actualizarBoletaModalEnVivo();
        }

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

            // 1. Número correlativo oficial (rojo en Original, azul en Copia)
            const compTexto = compVal ? compVal.padStart(7, '0') : '0000811';
            const elNro = document.getElementById('modal-boleta-nro');
            const elCopiaNro = document.getElementById('copia-modal-boleta-nro');
            if (elNro) elNro.innerText = compTexto;
            if (elCopiaNro) elCopiaNro.innerText = compTexto;

            // 2. Estudiante / Señor (a)
            const nombreMostrado = nomVal ? nomVal : '---------------------------------';
            const elEst = document.getElementById('modal-boleta-estudiante');
            const elCopiaEst = document.getElementById('copia-modal-boleta-estudiante');
            if (elEst) elEst.innerText = nombreMostrado;
            if (elCopiaEst) elCopiaEst.innerText = nombreMostrado;

            // 3. DNI y Celular
            const elDni = document.getElementById('modal-boleta-dni');
            const elCopiaDni = document.getElementById('copia-modal-boleta-dni');
            if (elDni) elDni.innerText = dniVal || '--------';
            if (elCopiaDni) elCopiaDni.innerText = dniVal || '--------';

            const elTel = document.getElementById('modal-boleta-telefono');
            const elCopiaTel = document.getElementById('copia-modal-boleta-telefono');
            if (elTel) elTel.innerText = telVal || '---------';
            if (elCopiaTel) elCopiaTel.innerText = telVal || '---------';

            // 4. Especialidad
            const especialidadTexto = turnoVal ? `${carrVal} - ${turnoVal}` : carrVal;
            const elCarr = document.getElementById('modal-boleta-carrera');
            const elCopiaCarr = document.getElementById('copia-modal-boleta-carrera');
            if (elCarr) elCarr.innerText = especialidadTexto;
            if (elCopiaCarr) elCopiaCarr.innerText = especialidadTexto;

            // 5. Módulos 1 al 7
            for (let i = 1; i <= 7; i++) {
                const activo = !!modalCuadrosEstado.modulos[i - 1];
                const boxOrig = document.getElementById(`modal-box-mod-${i}`);
                const boxCopia = document.getElementById(`copia-modal-box-mod-${i}`);
                const btnToggle = document.getElementById(`btn-toggle-mod-${i}`);
                const mark = activo ? 'X' : '';

                if (boxOrig) boxOrig.innerText = mark;
                if (boxCopia) boxCopia.innerText = mark;

                if (btnToggle) {
                    const romanos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
                    btnToggle.innerText = `${romanos[i - 1]} [${mark || ' '}]`;
                    if (activo) {
                        btnToggle.className = 'btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-indigo-500 bg-indigo-600 text-white font-black text-xs text-center shadow-sm transition hover:scale-105';
                    } else {
                        btnToggle.className = 'btn-cuadro-mod py-1.5 px-0.5 rounded-lg border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs text-center transition hover:border-indigo-400';
                    }
                }
            }

            // 6. Constancia y FUT
            const boxConst = document.getElementById('modal-check-constancia');
            const boxCopiaConst = document.getElementById('copia-modal-check-constancia');
            const chkConst = document.getElementById('chk-modal-constancia');
            const markConst = modalCuadrosEstado.constancia ? 'X' : '';
            if (boxConst) boxConst.innerText = markConst;
            if (boxCopiaConst) boxCopiaConst.innerText = markConst;
            if (chkConst) chkConst.checked = !!modalCuadrosEstado.constancia;

            const boxFut = document.getElementById('modal-check-fut');
            const boxCopiaFut = document.getElementById('copia-modal-check-fut');
            const chkFut = document.getElementById('chk-modal-fut');
            const markFut = modalCuadrosEstado.fut ? 'X' : '';
            if (boxFut) boxFut.innerText = markFut;
            if (boxCopiaFut) boxCopiaFut.innerText = markFut;
            if (chkFut) chkFut.checked = !!modalCuadrosEstado.fut;

            const chkOtros = document.getElementById('chk-modal-otros');
            if (chkOtros) chkOtros.checked = !!modalCuadrosEstado.otros;

            // 7. Línea 4 Otros (Notas u observaciones)
            const textoNota = modalCuadrosEstado.otros ? (notasVal || concVal || 'Módulo I (Computación e Informática)') : '';
            const nOtros = document.getElementById('modal-boleta-nota-otros');
            const nCopiaOtros = document.getElementById('copia-modal-boleta-nota-otros');
            if (nOtros) nOtros.innerText = textoNota;
            if (nCopiaOtros) nCopiaOtros.innerText = textoNota;

            // 8. Importes
            const fMoney = (val) => Number(val).toFixed(2);
            const montoStr = fMoney(montoVal);
            const anyModActive = modalCuadrosEstado.modulos.some(Boolean);

            const mAporte = document.getElementById('modal-monto-aporte');
            const mCopiaAporte = document.getElementById('copia-modal-monto-aporte');
            const mConst = document.getElementById('modal-monto-constancia');
            const mCopiaConst = document.getElementById('copia-modal-monto-constancia');
            const mFut = document.getElementById('modal-monto-fut');
            const mCopiaFut = document.getElementById('copia-modal-monto-fut');
            const elTotal = document.getElementById('modal-boleta-total');
            const elCopiaTotal = document.getElementById('copia-modal-boleta-total');

            if (elTotal) elTotal.innerText = montoStr;
            if (elCopiaTotal) elCopiaTotal.innerText = montoStr;

            if (modalCuadrosEstado.constancia && !anyModActive) {
                if (mConst) mConst.innerText = montoStr;
                if (mCopiaConst) mCopiaConst.innerText = montoStr;
                if (mAporte) mAporte.innerText = '/';
                if (mCopiaAporte) mCopiaAporte.innerText = '/';
            } else if (modalCuadrosEstado.fut && !anyModActive) {
                if (mFut) mFut.innerText = montoStr;
                if (mCopiaFut) mCopiaFut.innerText = montoStr;
                if (mAporte) mAporte.innerText = '/';
                if (mCopiaAporte) mCopiaAporte.innerText = '/';
            } else {
                if (mAporte) mAporte.innerText = montoStr;
                if (mCopiaAporte) mCopiaAporte.innerText = montoStr;
                if (mConst) mConst.innerText = '/';
                if (mCopiaConst) mCopiaConst.innerText = '/';
                if (mFut) mFut.innerText = '/';
                if (mCopiaFut) mCopiaFut.innerText = '/';
            }

            // 9. Fecha
            const [y, m, d] = fechaVal.split('-');
            const diaStr = d || '16';
            const mesStr = m || '11';
            const anoStr = (y || '2026').slice(-2);

            const elDia = document.getElementById('modal-boleta-dia');
            const elMes = document.getElementById('modal-boleta-mes');
            const elAno = document.getElementById('modal-boleta-ano');
            if (elDia) elDia.innerText = diaStr;
            if (elMes) elMes.innerText = mesStr;
            if (elAno) elAno.innerText = anoStr;

            const elCopiaDia = document.getElementById('copia-modal-boleta-dia');
            const elCopiaMes = document.getElementById('copia-modal-boleta-mes');
            const elCopiaAno = document.getElementById('copia-modal-boleta-ano');
            if (elCopiaDia) elCopiaDia.innerText = diaStr;
            if (elCopiaMes) elCopiaMes.innerText = mesStr;
            if (elCopiaAno) elCopiaAno.innerText = anoStr;
        }

        function setConceptoModal(conc) {
            const inp = document.getElementById('form-concepto');
            if (inp) {
                inp.value = conc;
                const concLow = conc.toLowerCase();
                if (concLow.includes('constancia')) {
                    modalCuadrosEstado.constancia = true;
                    modalCuadrosEstado.fut = false;
                } else if (concLow.includes('fut')) {
                    modalCuadrosEstado.fut = true;
                    modalCuadrosEstado.constancia = false;
                } else if (concLow.includes('aporte')) {
                    modalCuadrosEstado.modulos[0] = true;
                }
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
        // ACCIONES DIRECTAS EN EL TALONARIO DUAL (GUARDAR E IMPRIMIR, PRINT Y PDF)
        // =========================================================================
        async function guardarEImprimirDirectoModal() {
            const form = document.getElementById('form-nuevo-movimiento');
            if (form && !form.reportValidity()) return;

            // Ejecutar guardado estándar
            await guardarMovimiento(new Event('submit', { cancelable: true }));

            // Inmediatamente abrir impresión dual en 1 sola hoja
            setTimeout(() => {
                imprimirBoletaModalDirecta();
            }, 350);
        }

        function imprimirBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const nro = document.getElementById('modal-boleta-nro')?.innerText || '0000811';
            const printWin = window.open('', '_blank', 'width=880,height=850');
            if (!printWin) {
                window.print();
                return;
            }

            printWin.document.write('<!DOCTYPE html><html><head>');
            printWin.document.write('<meta charset="UTF-8">');
            printWin.document.write('<title>Boleta Oficial CETPRO San Miguel N° ' + nro + ' - Original y Copia</title>');
            printWin.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">');
            printWin.document.write('<style>');
            printWin.document.write('@page { size: letter portrait; margin: 4mm 6mm !important; }');
            printWin.document.write('* { box-sizing: border-box !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }');
            printWin.document.write('body { font-family: "Arial Narrow", Arial, Helvetica, sans-serif !important; background: #ffffff !important; margin: 0 !important; padding: 0 !important; color: #1e3a8a !important; }');
            printWin.document.write('.talonario-modal-hoja { width: 8.2in !important; max-width: 8.2in !important; height: 10.6in !important; max-height: 10.6in !important; margin: 0 auto !important; padding: 0 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; page-break-after: avoid !important; page-break-inside: avoid !important; border: none !important; box-shadow: none !important; background: #ffffff !important; }');
            printWin.document.write('.recibo-mini-talonario { width: 100% !important; height: 5.15in !important; max-height: 5.15in !important; padding: 0.12in 0.35in 0.08in !important; display: flex !important; flex-direction: column !important; page-break-inside: avoid !important; overflow: hidden !important; background: #ffffff !important; border: 1.5px solid #1e3a8a !important; border-radius: 12px !important; }');
            printWin.document.write('.recibo-corte { height: 0.22in !important; line-height: 0.22in !important; text-align: center !important; font-size: 9.5px !important; font-weight: 800 !important; color: #475569 !important; border-top: 1px dashed #64748b !important; border-bottom: 1px dashed #64748b !important; margin: 2px 0 !important; page-break-inside: avoid !important; }');
            printWin.document.write('.recibo__cab { display: grid !important; grid-template-columns: 1.35in 1fr 1.15in !important; align-items: center !important; column-gap: 6px !important; }');
            printWin.document.write('.recibo__logo-minedu { width: 1.15in !important; max-width: 100% !important; height: auto !important; display: block !important; margin: 0 auto !important; }');
            printWin.document.write('.recibo__ministerio { display: flex !important; align-items: center !important; justify-content: center !important; }');
            printWin.document.write('.recibo__titulos h1 { margin: 0 !important; font-size: 20px !important; letter-spacing: 1px !important; font-weight: 800 !important; color: #1e3a8a !important; text-align: center !important; }');
            printWin.document.write('.recibo__titulos p { margin: 0 !important; font-size: 9px !important; text-align: center !important; }');
            printWin.document.write('.recibo__seccion { border-top: 2px double #1e3a8a !important; border-bottom: 1.5px solid #1e3a8a !important; padding: 2px 0 !important; font-size: 13px !important; font-weight: 800 !important; text-align: center !important; }');
            printWin.document.write('.recibo__marco { border: 1.5px solid #1e3a8a !important; border-radius: 10px !important; padding: 6px 10px !important; flex: 1 !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }');
            printWin.document.write('.recibo__datos { border: 1px solid #1e3a8a !important; border-radius: 8px !important; padding: 4px 8px !important; }');
            printWin.document.write('.voucher-estilo-azul, .voucher-estilo-azul * { color: #1e40af !important; border-color: #1e40af !important; }');
            printWin.document.write('.voucher-estilo-azul .recibo__numero { color: #1e40af !important; }');
            printWin.document.write('</style>');
            printWin.document.write('</head><body>');
            printWin.document.write('<div class="talonario-modal-hoja">');
            printWin.document.write(cont.innerHTML);
            printWin.document.write('</div>');
            printWin.document.write('<' + 'script' + '>');
            printWin.document.write('window.onload = function() { setTimeout(function() { window.focus(); window.print(); window.close(); }, 350); };');
            printWin.document.write('<' + '/script' + '>');
            printWin.document.write('</body></html>');
            printWin.document.close();
        }

        function descargarBoletaModalDirecta() {
            const cont = document.getElementById('contenedor-boleta-modal-costado');
            if (!cont) return;

            const nro = document.getElementById('modal-boleta-nro')?.innerText || '0000811';
            const nom = (document.getElementById('modal-boleta-estudiante')?.innerText || 'ALUMNO').trim().replace(/[^a-zA-Z0-9]/g, '_');
            
            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: [0.12, 0.20, 0.12, 0.20],
                    filename: `Boleta_Oficial_${nro}_${nom}_Original_y_Copia.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };
                html2pdf().set(opt).from(cont).save();
            } else {
                imprimirBoletaModalDirecta();
            }
        }

        function reiniciarModalParaSiguiente() {
            const form = document.getElementById('form-nuevo-movimiento');
            if (form) form.reset();

            // Reiniciar cuadritos a estado inicial
            modalCuadrosEstado = {
                modulos: [true, false, false, false, false, false, false],
                constancia: false,
                fut: false,
                otros: true
            };

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


        // =========================================================================
        // FUNCIONES NUEVAS: ASIGNACIÓN DE DEUDORES, TARIFAS Y VISTA DE GRUPOS
        // =========================================================================

        // =========================================================================
        // CONTROL DE CONCEPTOS EDITABLES Y PERSONALIZADOS
        // =========================================================================
        function alSeleccionarConceptoPredefinido(val) {
            if (!val) return;
            const inp = document.getElementById('form-concepto');
            const inpNotas = document.getElementById('form-notas');
            if (inp) {
                inp.value = val;
            }
            if (inpNotas && (!inpNotas.value || inpNotas.value.startsWith('1.-') || inpNotas.value.startsWith('2.-') || inpNotas.value.startsWith('3.-'))) {
                inpNotas.value = val;
            }
            actualizarBoletaModalEnVivo();
        }

        function agregarNuevoConceptoPersonalizado() {
            const nuevo = prompt("Escribe el nuevo concepto que deseas agregar a la lista de opciones:");
            if (!nuevo || !nuevo.trim()) return;
            const conceptoTrim = nuevo.trim();

            // Guardar en localStorage
            try {
                let guardados = JSON.parse(localStorage.getItem('cetpro_conceptos_personalizados') || '[]');
                if (!guardados.includes(conceptoTrim)) {
                    guardados.push(conceptoTrim);
                    localStorage.setItem('cetpro_conceptos_personalizados', JSON.stringify(guardados));
                }
            } catch(e) {}

            cargarConceptosPersonalizadosEnSelector(conceptoTrim);

            const inp = document.getElementById('form-concepto');
            if (inp) inp.value = conceptoTrim;
            actualizarBoletaModalEnVivo();
            alert(`Concepto "${conceptoTrim}" agregado a tus opciones exitosamente.`);
        }

        function cargarConceptosPersonalizadosEnSelector(seleccionado = null) {
            const select = document.getElementById('select-concepto-predefinido');
            const datalist = document.getElementById('lista-conceptos-datalist');
            if (!select) return;

            try {
                const guardados = JSON.parse(localStorage.getItem('cetpro_conceptos_personalizados') || '[]');
                guardados.forEach(c => {
                    // Verificar si ya existe en el select
                    let exists = false;
                    for (let i = 0; i < select.options.length; i++) {
                        if (select.options[i].value === c) { exists = true; break; }
                    }
                    if (!exists) {
                        const opt = document.createElement('option');
                        opt.value = c;
                        opt.innerText = `⭐ ${c}`;
                        select.appendChild(opt);
                    }
                    if (datalist) {
                        let dExists = false;
                        for (let j = 0; j < datalist.options.length; j++) {
                            if (datalist.options[j].value === c) { dExists = true; break; }
                        }
                        if (!dExists) {
                            const dOpt = document.createElement('option');
                            dOpt.value = c;
                            datalist.appendChild(dOpt);
                        }
                    }
                });
            } catch(e) {}

            if (seleccionado) {
                select.value = seleccionado;
            }
        }

        // =========================================================================
        // MINI-CALENDARIO INTERACTIVO CON COLORES SEGÚN REGISTROS
        // =========================================================================
        let miniCalAnoActual = 2026;
        let miniCalMesActual = 7; // Agosto (0-indexed: 7 = Agosto)

        function inicializarMiniCalendario() {
            cargarMiniCalendario();
        }

        function cambiarMesMiniCalendario(delta) {
            miniCalMesActual += delta;
            if (miniCalMesActual < 0) {
                miniCalMesActual = 11;
                miniCalAnoActual--;
            } else if (miniCalMesActual > 11) {
                miniCalMesActual = 0;
                miniCalAnoActual++;
            }
            renderizarMiniCalendarioGrid();
        }

        function irAMesActualMiniCalendario() {
            const hoy = new Date();
            // Si hay movimientos en el año 2026, enfocar en el mes del último movimiento
            const ultimoDia = (calendarizacionGlobal && calendarizacionGlobal.length > 0) ? calendarizacionGlobal[0].fecha : '';
            if (ultimoDia) {
                const partes = ultimoDia.split('-');
                miniCalAnoActual = parseInt(partes[0], 10);
                miniCalMesActual = parseInt(partes[1], 10) - 1;
            } else {
                miniCalAnoActual = hoy.getFullYear();
                miniCalMesActual = hoy.getMonth();
            }
            renderizarMiniCalendarioGrid();
        }

        function renderizarMiniCalendarioGrid() {
            const grid = document.getElementById('mini-cal-grid-dias');
            const tituloMes = document.getElementById('mini-cal-mes-titulo');
            if (!grid || !tituloMes) return;

            const mesesNombres = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];

            tituloMes.innerText = `${mesesNombres[miniCalMesActual]} ${miniCalAnoActual}`;

            // Mapa de fechas a datos de registros
            const mapaDias = {};
            (calendarizacionGlobal || []).forEach(d => {
                if (d.fecha) mapaDias[d.fecha] = d;
            });

            // Primer día del mes y total de días
            const primerDia = new Date(miniCalAnoActual, miniCalMesActual, 1);
            const totalDias = new Date(miniCalAnoActual, miniCalMesActual + 1, 0).getDate();

            // Día de la semana en formato lunes = 0 ... domingo = 6
            let diaSemanaInicio = primerDia.getDay() - 1;
            if (diaSemanaInicio === -1) diaSemanaInicio = 6;

            const fechaSeleccionada = document.getElementById('diario-selector-fecha')?.value || '';

            let htmlCells = '';

            // Celdas vacías previas
            for (let i = 0; i < diaSemanaInicio; i++) {
                htmlCells += '<div class="h-9 rounded-lg opacity-20"></div>';
            }

            // Días del mes
            for (let dia = 1; dia <= totalDias; dia++) {
                const mesStr = String(miniCalMesActual + 1).padStart(2, '0');
                const diaStr = String(dia).padStart(2, '0');
                const fechaStr = `${miniCalAnoActual}-${mesStr}-${diaStr}`;

                const registroDia = mapaDias[fechaStr];
                const esActivo = fechaStr === fechaSeleccionada;
                const totalRecibos = registroDia ? registroDia.total_recibos : 0;
                const totalMonto = registroDia ? Number(registroDia.total_monto || 0) : 0;

                // Color según la cantidad de registros
                let bgClass = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
                let badgeDot = '';

                if (totalRecibos >= 3) {
                    // Verde Intenso (Alta actividad de registros)
                    bgClass = 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/30 border-emerald-600';
                    badgeDot = `<span class="w-1.5 h-1.5 rounded-full bg-white inline-block mt-0.5"></span>`;
                } else if (totalRecibos === 2) {
                    // Azul / Celeste (2 registros)
                    bgClass = 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/20 border-sky-600';
                    badgeDot = `<span class="w-1.5 h-1.5 rounded-full bg-white inline-block mt-0.5"></span>`;
                } else if (totalRecibos === 1) {
                    // Ámbar (1 registro)
                    bgClass = 'bg-amber-400 text-slate-950 font-bold shadow-sm border-amber-500';
                    badgeDot = `<span class="w-1.5 h-1.5 rounded-full bg-slate-900 inline-block mt-0.5"></span>`;
                }

                if (esActivo) {
                    bgClass += ' ring-2 ring-indigo-500 scale-105 z-10';
                }

                htmlCells += `
                    <button type="button" onclick="seleccionarDiaEnMiniCalendario('${fechaStr}')" class="h-9 rounded-xl flex flex-col items-center justify-center text-xs transition transform hover:scale-110 ${bgClass}" title="${dia} de ${mesesNombres[miniCalMesActual]}: ${totalRecibos} registros (S/. ${totalMonto.toFixed(2)})">
                        <span class="leading-none">${dia}</span>
                        ${badgeDot}
                    </button>
                `;
            }

            grid.innerHTML = htmlCells;
        }

        function seleccionarDiaEnMiniCalendario(fechaStr) {
            const inputF = document.getElementById('diario-selector-fecha');
            if (inputF) inputF.value = fechaStr;

            // Actualizar banner informativo con la cantidad de registros
            const mapaDias = {};
            (calendarizacionGlobal || []).forEach(d => {
                if (d.fecha) mapaDias[d.fecha] = d;
            });
            const reg = mapaDias[fechaStr];
            const infoTexto = document.getElementById('mini-cal-info-texto');
            const infoMonto = document.getElementById('mini-cal-info-monto');

            if (reg && reg.total_recibos > 0) {
                const fPartes = fechaStr.split('-');
                const fechaBonita = `${fPartes[2]}/${fPartes[1]}/${fPartes[0]}`;
                if (infoTexto) {
                    infoTexto.innerHTML = `<span class="text-amber-500 font-extrabold">${fechaBonita}</span>: <strong>${reg.total_recibos} ${reg.total_recibos === 1 ? 'registro recibido' : 'registros recibidos'}</strong> en este día.`;
                }
                if (infoMonto) {
                    infoMonto.innerText = 'S/. ' + Number(reg.total_monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
                }
            } else {
                const fPartes = fechaStr.split('-');
                const fechaBonita = `${fPartes[2]}/${fPartes[1]}/${fPartes[0]}`;
                if (infoTexto) {
                    infoTexto.innerHTML = `<span class="text-slate-500 font-extrabold">${fechaBonita}</span>: Sin registros de ingresos para esta fecha.`;
                }
                if (infoMonto) infoMonto.innerText = 'S/. 0.00';
            }

            renderizarMiniCalendarioGrid();
            cargarDiario(fechaStr);
            cargarCalendarizacionDiario();
        }

        // =========================================================================
        // CONTROL MEJORADO DE CONCEPTOS Y MÓDULOS EN BOLETA
        // =========================================================================
        function setConceptoRapidoModal(concepto) {
            const inp = document.getElementById('form-concepto');
            const inpNotas = document.getElementById('form-notas');
            const carrVal = document.getElementById('form-carrera')?.value || '';

            if (concepto === 'Módulo 1 y Módulo 2' || concepto === 'Módulo I y Módulo II') {
                const textoFinal = `Módulo 1 y Módulo 2${carrVal ? ' (' + carrVal + ')' : ''}`;
                if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1 y 2';
                if (inpNotas) inpNotas.value = textoFinal;

                // Marcar ambos cuadritos 1 y 2
                modalCuadrosEstado.modulos[0] = true;
                modalCuadrosEstado.modulos[1] = true;
            } else if (concepto === 'Módulo I') {
                if (inpNotas && (inpNotas.value.includes('Módulo II') || inpNotas.value.includes('Módulo 2'))) {
                    inpNotas.value = `Módulo 1 y Módulo 2${carrVal ? ' (' + carrVal + ')' : ''}`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1 y 2';
                    modalCuadrosEstado.modulos[0] = true;
                    modalCuadrosEstado.modulos[1] = true;
                } else {
                    const textoFinal = `Módulo I${carrVal ? ' (' + carrVal + ')' : ''}`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1';
                    if (inpNotas) inpNotas.value = textoFinal;
                    modalCuadrosEstado.modulos[0] = true;
                }
            } else if (concepto === 'Módulo II') {
                if (inpNotas && (inpNotas.value.includes('Módulo I') || inpNotas.value.includes('Módulo 1'))) {
                    inpNotas.value = `Módulo 1 y Módulo 2${carrVal ? ' (' + carrVal + ')' : ''}`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 1 y 2';
                    modalCuadrosEstado.modulos[0] = true;
                    modalCuadrosEstado.modulos[1] = true;
                } else {
                    const textoFinal = `Módulo II${carrVal ? ' (' + carrVal + ')' : ''}`;
                    if (inp) inp.value = 'Aporte por Mantenimiento Módulo 2';
                    if (inpNotas) inpNotas.value = textoFinal;
                    modalCuadrosEstado.modulos[1] = true;
                }
            } else {
                if (inp) inp.value = concepto;
                if (inpNotas) inpNotas.value = concepto;
            }

            actualizarBoletaModalEnVivo();
        }

        // Function original redefinida arriba
        function _old_setConceptoRapidoModal(concepto) {
            const inp = document.getElementById('form-concepto');
            const inpNotas = document.getElementById('form-notas');
            if (inp) inp.value = concepto;
            if (inpNotas && !inpNotas.value) inpNotas.value = concepto;
            actualizarBoletaModalEnVivo();
        }

        function limpiarConceptoModal() {
            const inp = document.getElementById('form-concepto');
            const inpNotas = document.getElementById('form-notas');
            if (inp) inp.value = '';
            if (inpNotas) inpNotas.value = '';
            actualizarBoletaModalEnVivo();
        }

        function cambiarVistaGrupos(vista) {
            const grid = document.getElementById('grid-grupos');
            const tableCont = document.getElementById('contenedor-grupos-tabla');
            const btnTarjetas = document.getElementById('btn-grupos-vista-tarjetas');
            const btnTabla = document.getElementById('btn-grupos-vista-tabla');

            if (vista === 'tarjetas') {
                if (grid) grid.classList.remove('hidden');
                if (tableCont) tableCont.classList.add('hidden');
                if (btnTarjetas) {
                    btnTarjetas.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1.5";
                }
                if (btnTabla) {
                    btnTabla.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white flex items-center space-x-1.5";
                }
            } else {
                if (grid) grid.classList.add('hidden');
                if (tableCont) tableCont.classList.remove('hidden');
                if (btnTabla) {
                    btnTabla.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-sm flex items-center space-x-1.5";
                }
                if (btnTarjetas) {
                    btnTarjetas.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-300 hover:text-white flex items-center space-x-1.5";
                }
            }
        }

        let estudiantesPobladosParaDeudoresCache = [];

        async function abrirModalAsignarDeudor() {
            const modal = document.getElementById('modal-asignar-deudor');
            if (!modal) return;
            modal.classList.remove('hidden');

            try {
                // Cargar especialidades y grupos en los filtros
                const [rEst, rCarr, rGrup] = await Promise.all([
                    fetch('/api/estudiantes'),
                    fetch('/api/carreras'),
                    fetch('/api/grupos')
                ]);
                const estudiantes = await rEst.json();
                const carreras = await rCarr.json();
                const grupos = await rGrup.json();

                estudiantesPobladosParaDeudoresCache = estudiantes;

                const selCarr = document.getElementById('modal-deudor-filtro-carrera');
                if (selCarr) {
                    selCarr.innerHTML = '<option value="">Todas las Especialidades</option>' +
                        carreras.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
                }

                const selGrup = document.getElementById('modal-deudor-filtro-grupo');
                if (selGrup) {
                    selGrup.innerHTML = '<option value="">Todos los Grupos</option>' +
                        grupos.map(g => `<option value="${g.nombre}">${g.nombre} (${g.total_alumnos || 0} alumnos)</option>`).join('');
                }

                alFiltrarEstudiantesParaDeudor();
            } catch (e) {
                console.error('Error al cargar datos para asignar deudor:', e);
            }
        }

        function cerrarModalAsignarDeudor() {
            const modal = document.getElementById('modal-asignar-deudor');
            if (modal) modal.classList.add('hidden');
        }

        function alFiltrarEstudiantesParaDeudor() {
            const carrVal = document.getElementById('modal-deudor-filtro-carrera')?.value || '';
            const grupVal = document.getElementById('modal-deudor-filtro-grupo')?.value || '';

            const filtrados = (estudiantesPobladosParaDeudoresCache || []).filter(e => {
                if (carrVal && e.carrera !== carrVal) return false;
                if (grupVal && e.grupo !== grupVal) return false;
                return true;
            });

            const sel = document.getElementById('modal-deudor-select-estudiante');
            if (sel) {
                sel.innerHTML = '<option value="">-- Seleccionar Estudiante (' + filtrados.length + ' matriculados) --</option>' +
                    filtrados.map(e => `<option value="${e.id}">${e.nombre} - DNI: ${e.dni || 'Sin DNI'} (${e.carrera || 'General'})</option>`).join('');
            }
        }

        async function alSeleccionarEstudianteParaDeudor(idStr) {
            const infoBox = document.getElementById('modal-deudor-info-estudiante');
            if (!idStr) {
                if (infoBox) infoBox.classList.add('hidden');
                return;
            }
            const id = parseInt(idStr, 10);
            const est = (estudiantesPobladosParaDeudoresCache || []).find(e => e.id === id);
            if (!est) return;

            if (infoBox) infoBox.classList.remove('hidden');
            const elDni = document.getElementById('deudor-info-dni');
            if (elDni) elDni.innerText = est.dni || 'No registrado';
            const elTel = document.getElementById('deudor-info-tel');
            if (elTel) elTel.innerText = est.telefono || 'No registrado';
            const elCarr = document.getElementById('deudor-info-carrera');
            if (elCarr) elCarr.innerText = (est.carrera || 'General') + ' · ' + (est.grupo || 'Sin grupo');

            // Cargar historial de pagos para calcular abonado y cuota faltante
            try {
                const res = await fetch('/api/movimientos?search=' + encodeURIComponent(est.nombre));
                const movs = await res.json();
                const totalPagado = movs.filter(m => m.tipo === 'Ingreso' && m.estado === 'Pagado').reduce((acc, m) => acc + (m.monto || 0), 0);
                
                const elHist = document.getElementById('deudor-info-pagado-historial');
                if (elHist) elHist.innerText = `Total Pagado Históricamente en Caja: S/. ${totalPagado.toFixed(2)}`;

                // Consultar tarifa oficial sugerida
                let costoOficial = 150;
                try {
                    const rTar = await fetch('/api/tarifas');
                    const tarifas = await rTar.json();
                    const tEncontrada = tarifas.find(t => t.carrera === est.carrera && t.modulo === 'Módulo I');
                    if (tEncontrada && tEncontrada.costo) costoOficial = tEncontrada.costo;
                } catch(err){}

                const inpTotal = document.getElementById('modal-deudor-monto-total');
                if (inpTotal) inpTotal.value = costoOficial;

                const inpAbonado = document.getElementById('modal-deudor-monto-abonado');
                if (inpAbonado) inpAbonado.value = totalPagado;

                const inpPendiente = document.getElementById('modal-deudor-monto-pendiente');
                if (inpPendiente) inpPendiente.value = Math.max(0, costoOficial - totalPagado) || 70;

                const inpConcepto = document.getElementById('modal-deudor-concepto');
                if (inpConcepto && !inpConcepto.value) {
                    inpConcepto.value = `Cuota 2 - Saldo Módulo I (${est.carrera || ''})`;
                }
            } catch (e) {
                console.error('Error calculando pagos de deudor:', e);
            }
        }

        function recalcularSaldoDeudor() {
            const tot = parseFloat(document.getElementById('modal-deudor-monto-total')?.value || 0);
            const abo = parseFloat(document.getElementById('modal-deudor-monto-abonado')?.value || 0);
            const inpPend = document.getElementById('modal-deudor-monto-pendiente');
            if (inpPend) {
                inpPend.value = Math.max(0, tot - abo).toFixed(2);
            }
        }

        function setDeudorConcepto(conc) {
            const inp = document.getElementById('modal-deudor-concepto');
            if (inp) inp.value = conc;
        }

        async function guardarAsignacionDeudor(event) {
            event.preventDefault();
            const estId = parseInt(document.getElementById('modal-deudor-select-estudiante')?.value || 0, 10);
            const est = (estudiantesPobladosParaDeudoresCache || []).find(e => e.id === estId);
            if (!est) {
                alert('Por favor selecciona un estudiante válido de la lista.');
                return;
            }

            const concepto = document.getElementById('modal-deudor-concepto')?.value || 'Cuota Pendiente';
            const montoTotal = parseFloat(document.getElementById('modal-deudor-monto-total')?.value || 150);
            const montoAbonado = parseFloat(document.getElementById('modal-deudor-monto-abonado')?.value || 0);
            const montoPendiente = parseFloat(document.getElementById('modal-deudor-monto-pendiente')?.value || 70);
            const fechaLimite = document.getElementById('modal-deudor-fecha-limite')?.value || '';
            const notas = document.getElementById('modal-deudor-notas')?.value || '';

            try {
                const res = await fetch('/api/deudores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        estudiante_id: est.id,
                        nombre: est.nombre,
                        dni: est.dni || '',
                        telefono: est.telefono || '',
                        carrera: est.carrera || '',
                        grupo: est.grupo || '',
                        concepto: concepto,
                        monto_total: montoTotal,
                        monto_abonado: montoAbonado,
                        monto_pendiente: montoPendiente,
                        fecha_limite: fechaLimite,
                        notas: notas
                    })
                });

                const data = await res.json();
                if (data.success) {
                    cerrarModalAsignarDeudor();
                    await cargarDeudores();
                    alert(`Estudiante ${est.nombre} asignado a deudores correctamente (Saldo: S/. ${montoPendiente.toFixed(2)}).`);
                } else {
                    alert('Error al asignar deudor: ' + (data.error || 'Ocurrió un error'));
                }
            } catch (e) {
                console.error(e);
                alert('Error de conexión al guardar deudor');
            }
        }

        function abrirModalCobrarDeudor(deudaId) {
            const d = (deudoresGlobalesCache || []).find(item => item.id === deudaId || item.deuda_id === deudaId);
            if (!d) return;

            abrirModalNuevoMovimiento();

            const inpNom = document.getElementById('form-nombre');
            if (inpNom) inpNom.value = d.nombre;

            const inpDni = document.getElementById('form-dni');
            if (inpDni) inpDni.value = d.dni && d.dni !== 'Sin DNI' ? d.dni : '';

            const inpTel = document.getElementById('form-telefono');
            if (inpTel) inpTel.value = d.telefono && d.telefono !== 'Sin Celular' ? d.telefono : '';

            const selCarrera = document.getElementById('form-carrera');
            if (selCarrera && d.carrera) selCarrera.value = d.carrera;

            const selGrupo = document.getElementById('form-grupo');
            if (selGrupo && d.grupo) selGrupo.value = d.grupo;

            const inpMonto = document.getElementById('form-monto');
            if (inpMonto) inpMonto.value = d.monto_pendiente || d.monto || 70;

            const inpConcepto = document.getElementById('form-concepto');
            if (inpConcepto) inpConcepto.value = 'Cobranza Cuota: ' + (d.concepto || 'Saldo Módulo I');

            const inpNotas = document.getElementById('form-notas');
            if (inpNotas) inpNotas.value = 'Cancelación de cuota deudor. ' + (d.notas || '');

            const inpDeudaId = document.getElementById('form-deuda-id');
            if (inpDeudaId) inpDeudaId.value = d.deuda_id || d.id;

            actualizarBoletaModalEnVivo();
        }

        async function eliminarDeudor(deudaId) {
            if (!confirm('¿Estás seguro de quitar este estudiante de la lista de deudores?')) return;
            try {
                const res = await fetch('/api/deudores/' + deudaId, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    await cargarDeudores();
                } else {
                    alert('Error: ' + (d.error || 'No se pudo eliminar'));
                }
            } catch (e) {
                console.error(e);
            }
        }

        async function cargarTarifasEnConfiguracion() {
            const tbody = document.getElementById('tabla-tarifas-body');
            if (!tbody) return;
            try {
                const res = await fetch('/api/tarifas');
                const tarifas = await res.json();
                if (tarifas.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-slate-400">No hay tarifas configuradas</td></tr>';
                    return;
                }
                tbody.innerHTML = tarifas.map((t, idx) => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                        <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${t.carrera}</td>
                        <td class="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">${t.modulo}</td>
                        <td class="py-2.5 px-3 text-right">
                            <input type="number" step="0.50" min="0" value="${t.costo}" data-tarifa-id="${t.id}" class="tarifa-input-costo w-24 text-right py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-amber-600 dark:text-amber-400">
                        </td>
                        <td class="py-2.5 px-3">
                            <input type="text" value="${t.descripcion || ''}" data-tarifa-desc-id="${t.id}" class="tarifa-input-desc w-full py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs">
                        </td>
                    </tr>
                `).join('');
            } catch (e) {
                console.error('Error al cargar tarifas:', e);
            }
        }

        async function guardarTarifasForm() {
            const inputs = document.querySelectorAll('.tarifa-input-costo');
            const dataToSave = [];
            inputs.forEach(inp => {
                const id = parseInt(inp.getAttribute('data-tarifa-id'), 10);
                const costo = parseFloat(inp.value) || 0;
                const descInp = document.querySelector(`[data-tarifa-desc-id="${id}"]`);
                const desc = descInp ? descInp.value : '';
                dataToSave.push({ id, costo, descripcion: desc });
            });

            try {
                const res = await fetch('/api/tarifas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSave)
                });
                const d = await res.json();
                if (d.success) {
                    alert('¡Tarifas y costos oficiales guardados exitosamente!');
                    cargarTarifasEnConfiguracion();
                } else {
                    alert('Error al guardar tarifas');
                }
            } catch (e) {
                console.error(e);
                alert('Error al conectar con el servidor para guardar tarifas');
            }
        }