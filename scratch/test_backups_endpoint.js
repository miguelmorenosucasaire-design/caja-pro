async function test() {
    const res = await fetch('http://127.0.0.1:5000/api/backups');
    const data = await res.json();
    console.log('GET /api/backups status:', res.status);
    console.log('Total backups:', data.length);
    console.log('First 3 backups:', data.slice(0, 3));
}
test();
