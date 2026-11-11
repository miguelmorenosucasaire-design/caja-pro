async function testDocentes() {
    const res = await fetch('http://127.0.0.1:5000/api/docentes');
    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Total docentes devueltos:', data.length);
    console.log('Primeros 5 docentes:');
    data.slice(0, 5).forEach(d => console.log(`- [${d.cargo}] (${d.turno}) ${d.nombre} -> ${d.carrera}`));
    console.log('Docente 15:');
    console.log(`- [${data[14]?.cargo}] (${data[14]?.turno}) ${data[14]?.nombre} -> ${data[14]?.carrera}`);
}
testDocentes();
