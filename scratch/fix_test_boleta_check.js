const fs = require('fs');

let testCode = fs.readFileSync('tests/test_estudiante_jalar_boleta.js', 'utf8');
testCode = testCode.replace(
  "html.includes('>Boleta</button>')",
  "html.includes('imprimirBoletaDeEstudianteDirecto(${e.id})') && html.includes('Boleta') && html.includes('fa-receipt')"
);
fs.writeFileSync('tests/test_estudiante_jalar_boleta.js', testCode, 'utf8');
console.log('Test updated');
