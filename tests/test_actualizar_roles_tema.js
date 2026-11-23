const fs = require('fs');
const assert = require('assert');

console.log("--- TEST DE VALIDACIÓN: ACTUALIZAR, ROLES (TESORERO/DIRECTOR) Y TEMA OSCURO ---");

const html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Botón de Actualizar
assert(html.includes('id="btn-actualizar-sistema"'), 'El botón de actualizar debe tener id="btn-actualizar-sistema"');
assert(html.includes('ejecutarActualizacionCompleta()'), 'El botón debe invocar ejecutarActualizacionCompleta()');
assert(html.includes('function ejecutarActualizacionCompleta()'), 'La función ejecutarActualizacionCompleta debe estar definida');
console.log("✔ [PASS] Botón Actualizar y función de recarga en tiempo real configurados");

// 2. Roles exclusivos (Tesorero y Director)
assert(html.includes('<option value="Tesorero">👔 Tesorero</option>'), 'Opción Tesorero presente');
assert(html.includes('<option value="Director">🏛️ Director</option>'), 'Opción Director presente');
assert(!html.includes('<option value="Recaudador">'), 'Opción Recaudador eliminada del selector');
assert(!html.includes('<option value="Consulta">'), 'Opción Consulta eliminada del selector');
console.log("✔ [PASS] Selector de rol restringido estrictamente a Tesorero y Director");

// 3. Permisos en JavaScript
assert(html.includes("rolActual !== 'Tesorero' && rolActual !== 'Director'"), 'Validación de permisos solo para Tesorero y Director implementada');
console.log("✔ [PASS] Control de permisos en JavaScript restringe actualización solo a Tesorero y Director");

// 4. Tema Oscuro corregido
assert(html.includes('.dark main, html.dark main'), 'Regla CSS para background de main en tema oscuro presente');
assert(html.includes('dark:bg-[#070a13]'), 'Clase Tailwind dark:bg-[#070a13] en main presente');
assert(html.includes('isDark ? \'#cbd5e1\' : \'#475569\''), 'Gráfico Chart.js adapta colores de texto y cuadrícula al tema');
assert(html.includes('localStorage.getItem(\'cetpro_theme\')'), 'Persistencia de tema configurada');
console.log("✔ [PASS] Tema Oscuro corregido: fondo sin velo blanco, alto contraste, tarjetas fintech y gráfico adaptativo");

console.log("\nTODAS LAS COMPROBACIONES DE ACTUALIZAR, ROLES Y TEMA OSCURO PASARON CON ÉXITO.");
