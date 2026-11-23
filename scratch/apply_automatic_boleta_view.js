const fs = require('fs');

const path = 'templates/index.html';
const backupPath = 'templates/index.html.bak_boleta_auto';
let content = fs.readFileSync(path, 'utf8');

// Backup original file
fs.writeFileSync(backupPath, content, 'utf8');

// Detect line endings
const isCRLF = content.includes('\r\n');
const newline = isCRLF ? '\r\n' : '\n';
content = content.replace(/\r\n/g, '\n');

// 1. Insert banner HTML right above <div id="contenedor-impresion-factura"
const targetContainer = `<div id="contenedor-impresion-factura" class="w-full max-w-2xl sm:max-w-3xl flex flex-col items-center space-y-4">`;
if (!content.includes(targetContainer)) {
    console.error('Target container not found!');
    process.exit(1);
}

const bannerHTML = `<!-- BANNER FLOTANTE DE ACCIÓN INMEDIATA TRAS REGISTRAR ESTUDIANTE / EMITIR BOLETA -->
                        <div id="banner-accion-boleta-generada" class="hidden w-full max-w-2xl sm:max-w-3xl mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-emerald-400/40 no-print transition-all">
                            <div class="flex items-center space-x-3.5">
                                <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-black shadow-inner flex-shrink-0">
                                    <i class="fa-solid fa-receipt text-emerald-200"></i>
                                </div>
                                <div>
                                    <div class="flex items-center space-x-2 text-[11px] font-black uppercase tracking-wider text-emerald-100">
                                        <span class="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                                        <span>¡Estudiante Registrado con Éxito!</span>
                                    </div>
                                    <div class="text-xs font-bold text-white mt-0.5">
                                        Boleta Oficial <span id="banner-boleta-nro" class="font-extrabold text-amber-200 font-mono text-sm underline decoration-amber-300">N° 0000000</span> emitida para <span id="banner-boleta-nombre" class="font-extrabold">...</span> (<span id="banner-boleta-monto" class="text-emerald-100 font-mono font-bold">S/. 150.00</span>)
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2 flex-shrink-0">
                                <button type="button" onclick="imprimirFacturaVersion()" class="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer" title="Imprimir Comprobante Oficial">
                                    <i class="fa-solid fa-print text-emerald-600 text-sm"></i>
                                    <span>Imprimir Boleta</span>
                                </button>
                                <button type="button" onclick="exportarFacturaPDF()" class="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer" title="Descargar Comprobante en PDF">
                                    <i class="fa-solid fa-file-pdf text-rose-200 text-sm"></i>
                                    <span>Descargar PDF</span>
                                </button>
                                <button type="button" onclick="cerrarBannerAccionBoleta()" class="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer" title="Cerrar aviso">
                                    <i class="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                        </div>

                        ${targetContainer}`;

content = content.replace(targetContainer, bannerHTML);
console.log('Banner HTML inserted.');

// 2. Replace guardarNuevoEstudianteConRecibo block
const targetGuardarNuevoEst = `                if (data.success) {
                    mostrarNotificacion(data.mensaje, 'exito');
                    cerrarModalNuevoEstudianteRecibo();

                    // Recargar datos del sistema
                    await cargarTodo();

                    // Seleccionar directamente el nuevo comprobante en la factura
                    if (data.movimiento_id) {
                        seleccionarFacturaRecibo(data.movimiento_id, true);
                    }
                }`;

const replacementGuardarNuevoEst = `                if (data.success) {
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
                    const nroComp = data.comprobante ? String(data.comprobante).replace(/\\D/g, '').padStart(7, '0') : (data.movimiento_id ? String(data.movimiento_id).padStart(7, '0') : '');
                    mostrarBannerAccionBoleta({
                        estudiante: payload.nombre,
                        comprobante: nroComp,
                        monto: payload.monto,
                        carrera: payload.carrera,
                        turno: payload.turno,
                        movimiento_id: data.movimiento_id
                    });

                    mostrarNotificacion(\`✅ Alumno \${payload.nombre} registrado con éxito. Boleta N° \${nroComp} lista para imprimir o descargar.\`, 'exito');
                }`;

if (!content.includes(targetGuardarNuevoEst)) {
    console.error('Target guardarNuevoEst not found!');
    process.exit(1);
}
content = content.replace(targetGuardarNuevoEst, replacementGuardarNuevoEst);
console.log('guardarNuevoEstudianteConRecibo updated.');

// 3. Add helper functions mostrarBannerAccionBoleta and cerrarBannerAccionBoleta right after cerrarModalNuevoEstudianteRecibo
const targetCerrarModal = `        function cerrarModalNuevoEstudianteRecibo() {
            const modal = document.getElementById('modal-nuevo-estudiante-factura');
            if (modal) modal.classList.add('hidden');
        }`;

const helperFunctions = `        function cerrarModalNuevoEstudianteRecibo() {
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
            if (elNro) elNro.innerText = info.comprobante ? (info.comprobante.startsWith('N°') ? info.comprobante : \`N° \${info.comprobante}\`) : 'Oficial';
            if (elNom) elNom.innerText = info.estudiante || '';
            if (elMonto) elMonto.innerText = info.monto ? \`S/. \${Number(info.monto).toFixed(2)}\` : '';
            banner.classList.remove('hidden');
        }

        function cerrarBannerAccionBoleta() {
            const banner = document.getElementById('banner-accion-boleta-generada');
            if (banner) banner.classList.add('hidden');
        }`;

if (!content.includes(targetCerrarModal)) {
    console.error('Target cerrarModal not found!');
    process.exit(1);
}
content = content.replace(targetCerrarModal, helperFunctions);
console.log('Banner helper functions added.');

// 4. Update verBoletaDirecta
const targetVerBoleta = `        function verBoletaDirecta(reciboId) {
            cambiarSeccion('factura');
            setTimeout(() => {
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = reciboId;
                seleccionarFacturaRecibo(reciboId);
            }, 300);
        }`;

const replacementVerBoleta = `        function verBoletaDirecta(reciboId) {
            cambiarSeccion('factura');
            setTimeout(() => {
                const select = document.getElementById('factura-recibo-select');
                if (select) select.value = reciboId;
                seleccionarFacturaRecibo(reciboId);
                cambiarVistaComprobante('voucher');
                const contBoleta = document.getElementById('contenedor-comprobante-oficial') || document.getElementById('contenedor-impresion-factura');
                if (contBoleta) {
                    contBoleta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    contBoleta.classList.add('ring-4', 'ring-emerald-500', 'shadow-2xl', 'transition-all');
                    setTimeout(() => contBoleta.classList.remove('ring-4', 'ring-emerald-500', 'shadow-2xl'), 3500);
                }
                const m = (movimientosGlobales || []).find(x => x.id == reciboId);
                if (m) {
                    const nroComp = m.comprobante ? String(m.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(m.id).padStart(7, '0');
                    mostrarBannerAccionBoleta({
                        estudiante: m.nombre,
                        comprobante: nroComp,
                        monto: m.monto,
                        carrera: m.carrera,
                        turno: m.turno,
                        movimiento_id: m.id
                    });
                }
            }, 300);
        }

        function irAFacturaConRecibo(reciboId) {
            verBoletaDirecta(reciboId);
        }`;

if (!content.includes(targetVerBoleta)) {
    console.error('Target verBoleta not found!');
    process.exit(1);
}
content = content.replace(targetVerBoleta, replacementVerBoleta);
console.log('verBoletaDirecta updated.');

// 5. Update guardarMovimiento for student income
const targetGuardarMov = `                if (data.success) {
                    cerrarModalNuevoMovimiento();
                    document.getElementById('form-nuevo-movimiento').reset();
                    document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];
                    seleccionarTipoMovimiento('Ingreso');
                    toggleFechaVencimiento();
                    alert(\`✅ Movimiento registrado con éxito por la cantidad de S/. \${monto.toFixed(2)}.\`);
                    await cargarTodo();
                }`;

const replacementGuardarMov = `                if (data.success) {
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
                            contBoleta.classList.add('ring-4', 'ring-emerald-500', 'shadow-2xl', 'transition-all');
                            setTimeout(() => contBoleta.classList.remove('ring-4', 'ring-emerald-500', 'shadow-2xl'), 3500);
                        }
                        const nroComp = data.comprobante ? String(data.comprobante).replace(/\\D/g, '').padStart(7, '0') : String(data.id).padStart(7, '0');
                        mostrarBannerAccionBoleta({
                            estudiante: payload.nombre,
                            comprobante: nroComp,
                            monto: monto,
                            carrera: payload.carrera,
                            turno: payload.turno,
                            movimiento_id: data.id
                        });
                        mostrarNotificacion(\`✅ Pago de \${payload.nombre} registrado con éxito. Boleta N° \${nroComp} lista para imprimir o descargar.\`, 'exito');
                    } else {
                        mostrarNotificacion(\`✅ Movimiento registrado con éxito por S/. \${monto.toFixed(2)}.\`, 'exito');
                    }
                }`;

if (!content.includes(targetGuardarMov)) {
    console.error('Target guardarMov not found!');
    process.exit(1);
}
content = content.replace(targetGuardarMov, replacementGuardarMov);
console.log('guardarMovimiento updated.');

// 6. Update guardarMovimientoEnSeccion notification with action button
const targetSeccionAviso = `                    const aviso = document.getElementById('aviso-movimiento-seccion');
                    const txt = document.getElementById('aviso-movimiento-texto');
                    if (aviso && txt) {
                        txt.innerText = \`¡Movimiento guardado con éxito! Se registró REC-\${String(data.id || '').padStart(5, '0')} por S/. \${monto.toFixed(2)} a favor de \${nombreEst}.\`;
                        aviso.classList.remove('hidden');
                        setTimeout(() => aviso.classList.add('hidden'), 5000);
                    }`;

const replacementSeccionAviso = `                    const aviso = document.getElementById('aviso-movimiento-seccion');
                    const txt = document.getElementById('aviso-movimiento-texto');
                    if (aviso && txt) {
                        txt.innerHTML = \`<span>¡Movimiento guardado con éxito! Se registró REC-\${String(data.id || '').padStart(5, '0')} por S/. \${monto.toFixed(2)} a favor de \${nombreEst}.</span> <button type="button" onclick="verBoletaDirecta(\${data.id})" class="ml-2 font-black underline hover:text-emerald-950 dark:hover:text-white cursor-pointer inline-flex items-center gap-1"><i class="fa-solid fa-receipt"></i> Ver e Imprimir Boleta</button>\`;
                        aviso.classList.remove('hidden');
                        setTimeout(() => aviso.classList.add('hidden'), 7000);
                    }`;

if (content.includes(targetSeccionAviso)) {
    content = content.replace(targetSeccionAviso, replacementSeccionAviso);
    console.log('guardarMovimientoEnSeccion aviso updated.');
}

// Convert back to original line endings if needed
if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated templates/index.html with automatic boleta view!');
