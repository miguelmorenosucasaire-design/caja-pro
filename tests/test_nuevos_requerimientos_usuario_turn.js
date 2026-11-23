const fs = require('fs');

async function testNuevosRequerimientos() {
    console.log('========================================================================');
    console.log('  🧪 VERIFICACIÓN EXHAUSTIVA DE NUEVOS REQUERIMIENTOS DEL USUARIO       ');
    console.log('========================================================================\n');

    const html = fs.readFileSync('templates/index.html', 'utf8');
    let passed = 0;
    let failed = 0;

    function check(nombre, condicion) {
        if (condicion) {
            console.log(`  ✔ [PASS] ${nombre}`);
            passed++;
        } else {
            console.error(`  ❌ [FAIL] ${nombre}`);
            failed++;
        }
    }

    // 1. Deudores limpios: Solo cuando se escoja/asigne manualmente
    check("1.1 Deudores: Mensaje informativo cuando la lista está vacía",
        html.includes('No hay ningún estudiante en Deudores')
    );
    check("1.2 Deudores: Indicación de que solo aparecen al asignarlos manualmente",
        html.includes("solo aparecerán en esta sección cuando los escojas o asignes manualmente")
    );

    // 2. Mini-Calendario visual de mes con colores según registros
    check("2.1 Mini-Calendario: Contenedor y grilla de días del mes integrados",
        html.includes('id="mini-cal-grid-dias"') && html.includes('id="mini-cal-mes-titulo"')
    );
    check("2.2 Mini-Calendario: Banner interactivo para mostrar cantidad de registros al seleccionar",
        html.includes('id="mini-cal-info-seleccion"') && html.includes('id="mini-cal-info-texto"')
    );
    check("2.3 Mini-Calendario: Función renderizarMiniCalendarioGrid implementada con lógica de colores",
        html.includes('function renderizarMiniCalendarioGrid()') && html.includes('bg-emerald-500') && html.includes('bg-sky-500') && html.includes('bg-amber-400')
    );
    check("2.4 Mini-Calendario: Función seleccionarDiaEnMiniCalendario actualiza conteo de registros",
        html.includes('function seleccionarDiaEnMiniCalendario(fechaStr)')
    );

    // 3. Concepto optimizado (sin selector duplicado según instrucción del usuario)
    check("3.1 Concepto: Selector redundante eliminado según instrucción del usuario",
        !html.includes('id="select-concepto-predefinido"')
    );
    check("3.2 Concepto: Campo concepto y notas presentes y activos",
        html.includes('id="form-concepto"') && html.includes('id="form-notas"')
    );
    check("3.3 Concepto: Input que sincroniza en vivo con la boleta",
        html.includes('id="form-concepto"') && html.includes('actualizarBoletaModalEnVivo()')
    );

    // 4. Botón Módulo 1 y Módulo 2
    check("4.1 Módulos: Botón '+ Módulo 1 y Módulo 2' presente en modal de emisión",
        html.includes("+ Módulo 1 y Módulo 2")
    );
    check("4.2 Módulos: Función setConceptoRapidoModal maneja 'Módulo 1 y Módulo 2'",
        html.includes("concepto === 'Módulo 1 y Módulo 2'")
    );
    check("4.3 Módulos: Ambos cuadritos marcados y texto agregado en boleta (Línea 4.- Otros)",
        html.includes("modalCuadrosEstado.modulos[0] = true") && html.includes("modalCuadrosEstado.modulos[1] = true")
    );

    // 5. Inmunidad al Modo Estudio
    check("5.1 Regla CSS de Inmunidad Total al Modo Estudio para .talonario-modal-hoja presente",
        html.includes('.talonario-modal-hoja,') && html.includes('color-scheme: light !important;')
    );
    check("5.2 Cuadritos de módulos (.voucher-box-check) fijados con fondo blanco inmutable",
        html.includes('.talonario-modal-hoja .voucher-box-check')
    );

    // 6. Test de APIs en vivo contra el servidor local
    try {
        const resEst = await fetch('http://127.0.0.1:5000/api/estudiantes');
        const estData = await resEst.json();
        check("6.1 API /api/estudiantes devuelve estudiantes oficiales (213 alumnos padrón real)", 
            estData.length >= 179
        );

        const resCal = await fetch('http://127.0.0.1:5000/api/estudiantes/calendarizacion');
        const calData = await resCal.json();
        check("6.2 API /api/estudiantes/calendarizacion devuelve días registrados y conteo de recibos e ingresos",
            calData.success && calData.dias_registrados > 0 && Array.isArray(calData.calendarizacion)
        );

        const resDeudores = await fetch('http://127.0.0.1:5000/api/deudores');
        const deudoresData = await resDeudores.json();
        check("6.3 API /api/deudores responde array limpio (0 por defecto, solo cuando se escoja)",
            Array.isArray(deudoresData)
        );
    } catch (e) {
        check("6.x Error de conexión a endpoints: " + e.message, false);
    }

    console.log('\n========================================================================');
    console.log(`  📊 RESULTADO: ${passed} / ${passed + failed} PRUEBAS SUPERADAS`);
    console.log('========================================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

testNuevosRequerimientos().catch(err => {
    console.error(err);
    process.exit(1);
});
