const fs = require('fs');

console.log('========================================================================');
console.log('  🧪 TEST ESPECÍFICO: JALADO DE DATOS GUARDADOS A LA BOLETA DE ESTUDIANTE ');
console.log('========================================================================\n');

const html = fs.readFileSync('templates/index.html', 'utf8');

let passed = 0;
let total = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    console.log(`  ✔ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
  }
}

// 1. Función principal
check('Función imprimirBoletaDeEstudianteDirecto implementada', html.includes('async function imprimirBoletaDeEstudianteDirecto'));
check('Pobla número de comprobante guardado (form-comprobante)', html.includes("compNum = String(m.comprobante).replace(/\\D/g, '').padStart(7, '0')"));
check('Pobla monto guardado (form-monto)', html.includes("montoFinal = m ? (m.monto_total || m.monto || 0) : (est.total_pagado || 0)"));
check('Pobla concepto guardado (form-concepto)', html.includes("conceptoFinal = (m ? m.concepto : '')"));
check('Pobla notas guardadas (form-notas)', html.includes("notasFinal = (m ? m.notas : '')"));
check('Configura casillas de módulos y conceptos oficiales según texto guardado', html.includes('modalCuadrosEstado.modulos[0] = true') && html.includes('modalCuadrosEstado.modulos[1] = true'));
check('Sincroniza en vivo la boleta modal dual con los datos recuperados', html.includes('actualizarBoletaModalEnVivo()'));

// 2. Ficha del estudiante
check('irAFacturaDesdeFichaEstudiante llama a imprimirBoletaDeEstudianteDirecto', html.includes('imprimirBoletaDeEstudianteDirecto(est.id, null)'));

// 3. Tarjeta de estudiante
check('Botón Imprimir Boleta Oficial presente en tarjeta de estudiante', html.includes('imprimirBoletaDeEstudianteDirecto(${e.id})') && html.includes('Imprimir Boleta Oficial (${nroBoletaReg})'));

// 4. Tabla de estudiante
check('Botón Boleta presente en fila de tabla de estudiante', html.includes('imprimirBoletaDeEstudianteDirecto(${e.id})') && html.includes('fa-receipt') && html.includes('Boleta'));

// 5. abrirModalConMovimiento actualizado
check('abrirModalConMovimiento populates form-notas y activa casillas', html.includes("if (document.getElementById('form-notas')) document.getElementById('form-notas').value = m.notas || '';"));

console.log(`\n========================================================================`);
console.log(`  📊 RESULTADO: ${passed} / ${total} PRUEBAS SUPERADAS`);
console.log(`========================================================================\n`);

if (passed !== total) {
  process.exit(1);
}
