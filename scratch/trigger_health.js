const http = require('http');
// Trigger server update or call endpoint
http.get('http://127.0.0.1:5000/api/sistema/salud-integridad', res => {
    console.log('Status:', res.statusCode);
});
