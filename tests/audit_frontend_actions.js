// =====================================================================
// EDUCAJA PRO - AUDITORÍA DE ACCIONES Y HANDLERS ONCLICK EN EL FRONTEND
// =====================================================================
const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('--- AUDITORÍA DE EVENT HANDLERS EN INDEX.HTML ---');

// Extract all onclick="..." attributes
const onclickMatches = [...html.matchAll(/onclick="([^"]+)"/g)].map(m => m[1]);
console.log(`Total de atributos onclick encontrados: ${onclickMatches.length}`);

// Extract all function definitions from scripts
const funcDefRegex = /(?:function\s+([a-zA-Z0-9_$]+)|(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g;
const declaredFuncs = new Set();
let match;
while ((match = funcDefRegex.exec(html)) !== null) {
    declaredFuncs.add(match[1] || match[2]);
}

console.log(`Total de funciones declaradas en el script: ${declaredFuncs.size}`);

const missingHandlers = new Set();
onclickMatches.forEach(expr => {
    // Extract root function name e.g. "cambiarSeccion('caja')" -> "cambiarSeccion"
    const cleanExpr = expr.trim();
    const funcNameMatch = cleanExpr.match(/^([a-zA-Z0-9_$]+)\s*\(/);
    if (funcNameMatch) {
        const fnName = funcNameMatch[1];
        if (!declaredFuncs.has(fnName)) {
            missingHandlers.add({ fn: fnName, expr: cleanExpr });
        }
    }
});

if (missingHandlers.size === 0) {
    console.log('✔ Todos los onclick apuntan a funciones que SI existen en el script.');
} else {
    console.warn(`❌ Se encontraron ${missingHandlers.size} llamadas onclick a funciones NO declaradas:`);
    console.log([...missingHandlers]);
}
