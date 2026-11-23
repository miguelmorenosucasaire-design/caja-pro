const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all onclick="functionName(...)"
const handlerRegex = /on(?:click|change|input|submit)\s*=\s*["']([^"']+)["']/gi;
let m;
const handlers = new Set();
while ((m = handlerRegex.exec(html)) !== null) {
  const expr = m[1].trim();
  handlers.add(expr);
}

console.log(`Encontrados ${handlers.size} event handlers en HTML.`);

// Extract all defined function names in JS
const fnRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
const definedFns = new Set();
while ((m = fnRegex.exec(html)) !== null) {
  definedFns.add(m[1]);
}
console.log(`Encontradas ${definedFns.size} funciones JS definidas.`);

const missingHandlers = [];
for (const h of handlers) {
  // extract function name: e.g. "cambiarSeccion('caja')" -> "cambiarSeccion"
  const fnMatch = h.match(/^([a-zA-Z0-9_$]+)\s*\(/);
  if (fnMatch) {
    const fnName = fnMatch[1];
    if (!definedFns.has(fnName)) {
      missingHandlers.push({ expr: h, fn: fnName });
    }
  }
}

console.log('Handlers con funciones NO definidas:', missingHandlers);
