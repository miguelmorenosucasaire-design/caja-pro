const http = require('http');

const data = JSON.stringify({ motivo: 'Datos_Reales_2026_Fotos_ZIP' });

const req = http.request('http://127.0.0.1:5000/api/backups/crear', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let resp = '';
    res.on('data', chunk => resp += chunk);
    res.on('end', () => {
        console.log('Respaldo oficial generado:', resp);
    });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
