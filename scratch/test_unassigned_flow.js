const http = require('http');

async function testApiEstudiantes() {
    const res = await fetch('http://127.0.0.1:5000/api/estudiantes');
    const estudiantes = await res.json();
    console.log('Total estudiantes from API:', estudiantes.length);
    const unassigned = estudiantes.filter(e => !e.carrera || e.carrera.includes('Sin Asignar') || e.carrera.includes('Pendiente'));
    console.log('Total unassigned from API:', unassigned.length);

    // Test filter ?carrera=sin_asignar
    const resFilter = await fetch('http://127.0.0.1:5000/api/estudiantes?carrera=sin_asignar');
    const filtered = await resFilter.json();
    console.log('Total with filter carrera=sin_asignar:', filtered.length);

    // Test asignacion of a student (ID 1)
    const est1 = estudiantes[0];
    console.log(`\nProbando asignación de estudiante ${est1.id} (${est1.nombre})...`);
    const resAsig = await fetch(`http://127.0.0.1:5000/api/estudiantes/${est1.id}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            carrera: 'Computación e Informática',
            grupo: 'Sin Asignar'
        })
    });
    const asigJson = await resAsig.json();
    console.log('Respuesta asignación:', asigJson);

    // Check student 1 after assignment
    const resCheck = await fetch(`http://127.0.0.1:5000/api/estudiantes`);
    const listAfter = await resCheck.json();
    const est1After = listAfter.find(e => e.id === est1.id);
    console.log(`Estudiante ${est1.id} carrera ahora:`, est1After.carrera);

    // Revert student 1 back to unassigned
    await fetch(`http://127.0.0.1:5000/api/estudiantes/${est1.id}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            carrera: 'Sin Asignar (Pendiente)',
            grupo: 'Sin Asignar'
        })
    });
    console.log('✓ Revertido a Sin Asignar (Pendiente)');

    // Trigger excel update
    const resExcel = await fetch('http://127.0.0.1:5000/api/exportar/excel');
    console.log('Excel download status:', resExcel.status, 'Content-Length:', resExcel.headers.get('content-length'));
}

testApiEstudiantes().catch(console.error);
