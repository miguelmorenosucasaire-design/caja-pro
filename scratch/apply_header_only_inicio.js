const fs = require('fs');

let raw = fs.readFileSync('templates/index.html', 'utf8');
const isCRLF = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

// 1. Asignar id="main-header" al <header> superior si no lo tiene
const targetHeader = `        <!-- HEADER SUPERIOR -->
        <header class="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shadow-sm z-10 flex-shrink-0 no-print">`;

const repHeader = `        <!-- HEADER SUPERIOR (Visible exclusivamente en sección INICIO) -->
        <header id="main-header" class="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-sm z-10 flex-shrink-0 no-print">`;

if (html.includes(targetHeader)) {
    html = html.replace(targetHeader, repHeader);
    console.log('✔ id="main-header" asignado');
} else {
    console.warn('⚠ Target header no encontrado exacto');
}

// 2. En cambiarSeccion(seccion): mostrar header SOLO en 'dashboard' (INICIO) y ocultar en las demás
const targetCambiarSeccion = `        function cambiarSeccion(seccion) {
            seccionActivaActual = seccion;
            const secciones = [`;

const repCambiarSeccion = `        function cambiarSeccion(seccion) {
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

            const secciones = [`;

if (html.includes(targetCambiarSeccion)) {
    html = html.replace(targetCambiarSeccion, repCambiarSeccion);
    console.log('✔ Control de visibilidad del header agregado a cambiarSeccion');
} else {
    console.warn('⚠ Target cambiarSeccion no encontrado');
}

if (isCRLF) {
    html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
console.log('🎉 Modificación completada exitosamente.');
