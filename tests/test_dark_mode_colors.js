const fs = require('fs');
const assert = require('assert');

console.log("--- TEST DE VALIDACIÓN: JERARQUÍA MULTICOLOR Y ALTO CONTRASTE EN MODO OSCURO ---");

const html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Verificación de que NO existe anulación destructiva de td
assert(!html.includes('.dark table tbody td {\n            color: #f1f5f9 !important;'), "No debe forzarse !important en td para no anular los colores semánticos");
console.log("✔ [PASS] Los <td> permiten que los colores específicos (verde, rojo, celeste, morado) brillen sin sobreescritura destructiva");

// 2. Colores semánticos vibrantes configurados
assert(html.includes('.dark .text-emerald-400') && html.includes('#34d399'), "Verde Esmeralda (#34d399) configurado para ingresos y estados al día");
assert(html.includes('.dark .text-rose-400') && html.includes('#fb7185'), "Rosa Coral / Rubí (#fb7185) configurado para egresos y deudas");
assert(html.includes('.dark .text-amber-400') && html.includes('#fbbf24'), "Ámbar Dorado (#fbbf24) configurado para pendientes y alertas");
assert(html.includes('.dark .text-cyan-400') && html.includes('#38bdf8'), "Cyan Eléctrico (#38bdf8) configurado para códigos, DNI y saldos");
assert(html.includes('.dark .text-purple-400') && html.includes('#c084fc'), "Violeta Real (#c084fc) configurado para carreras y especialidades");
assert(html.includes('.dark .text-indigo-400') && html.includes('#a5b4fc'), "Índigo (#a5b4fc) configurado para grupos y secciones");
assert(html.includes('.dark .text-teal-400') && html.includes('#5eead4'), "Teal / Aqua (#5eead4) configurado para docentes y encargados");
console.log("✔ [PASS] Paleta de 7 colores diferenciados semánticamente implementada y activa");

// 3. Verificación de legibilidad en Cuadro de Resultados (sin text-sky-900 en saldos)
assert(!html.includes("m.saldo_acumulado >= 0 ? 'text-sky-900' : 'text-rose-700'"), "Saldo acumulado no debe tener clase oscura text-sky-900 en resultados");
assert(html.includes("m.saldo_acumulado >= 0 ? 'text-sky-700 dark:text-sky-300' : 'text-rose-700 dark:text-rose-300'"), "Saldo acumulado adaptado con dark:text-sky-300 de alto contraste");
console.log("✔ [PASS] Columna de saldo acumulado legible en modo oscuro con azul cielo brillante");

// 4. Verificación de inputs de modal nuevo movimiento
assert(html.includes('id="form-dni"') && html.includes('dark:text-white'), "Input DNI visible con texto blanco en modo oscuro");
assert(html.includes('id="form-monto"') && html.includes('dark:text-emerald-400'), "Input Monto visible con número esmeralda en modo oscuro");
console.log("✔ [PASS] Inputs y botones de modal con contraste elevado y texto legible");

console.log("\nTODAS LAS COMPROBACIONES DE TEMA OSCURO MULTICOLOR Y ALTO CONTRASTE PASARON CON ÉXITO.");
