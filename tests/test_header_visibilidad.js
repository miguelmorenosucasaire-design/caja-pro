const fs = require('fs');
const assert = require('assert');

console.log("--- TEST DE VALIDACIÓN: ENCABEZADO SUPERIOR EXCLUSIVO EN INICIO ---");

const html = fs.readFileSync('templates/index.html', 'utf8');

// 1. El header superior posee id="main-header"
assert(html.includes('id="main-header"'), 'Header superior posee id="main-header"');
console.log("✔ [PASS] 1. Header superior configurado con identificador 'main-header'");

// 2. En cambiarSeccion(seccion): se muestra en dashboard y se oculta en las demás secciones
assert(html.includes("if (seccion === 'dashboard') {\n                    mainHeader.classList.remove('hidden');\n                } else {\n                    mainHeader.classList.add('hidden');\n                }") ||
       html.includes("if (seccion === 'dashboard') {\r\n                    mainHeader.classList.remove('hidden');\r\n                } else {\r\n                    mainHeader.classList.add('hidden');\r\n                }"),
       'cambiarSeccion oculta mainHeader en todas las secciones excepto dashboard (INICIO)');
console.log("✔ [PASS] 2. Lógica reactiva en cambiarSeccion() configurada: SOLO visible en INICIO y oculto en todas las demás secciones");

console.log("\n🎉 TEST DE VISIBILIDAD DE ENCABEZADO SUPERIOR COMPLETADO CON ÉXITO.");
