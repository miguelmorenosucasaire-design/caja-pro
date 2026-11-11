async function testCarrerasApi() {
    console.log('Testing GET /api/carreras...');
    const r1 = await fetch('http://127.0.0.1:5000/api/carreras');
    const list1 = await r1.json();
    console.log(`Initial carreras count: ${list1.length}`);

    console.log('\nTesting POST /api/carreras (Create test career)...');
    const rCreate = await fetch('http://127.0.0.1:5000/api/carreras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'TEST CARRERA TEMPORAL', codigo: 'ESP-99' })
    });
    const createData = await rCreate.json();
    console.log('Create result:', createData);
    const newId = createData.id;

    console.log('\nTesting PUT /api/carreras/:id/editar (Edit name)...');
    const rEdit = await fetch(`http://127.0.0.1:5000/api/carreras/${newId}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'TEST CARRERA MODIFICADA' })
    });
    const editData = await rEdit.json();
    console.log('Edit result:', editData);

    console.log('\nTesting DELETE /api/carreras/:id (Delete)...');
    const rDel = await fetch(`http://127.0.0.1:5000/api/carreras/${newId}`, { method: 'DELETE' });
    const delData = await rDel.json();
    console.log('Delete result:', delData);

    const rFinal = await fetch('http://127.0.0.1:5000/api/carreras');
    const listFinal = await rFinal.json();
    console.log(`Final carreras count: ${listFinal.length}`);
}

testCarrerasApi().catch(console.error);
