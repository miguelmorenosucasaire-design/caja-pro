const fs = require('fs');
const http = require('http');
// Check that the SVGs are served correctly by server.js
http.get('http://127.0.0.1:5000/public/recibo_svg/01_logo_ministerio.svg', (res) => {
    console.log('01_logo_ministerio.svg status:', res.statusCode, res.headers['content-type']);
});
http.get('http://127.0.0.1:5000/public/recibo_svg/04_escudo_cetpro.svg', (res) => {
    console.log('04_escudo_cetpro.svg status:', res.statusCode, res.headers['content-type']);
});
http.get('http://127.0.0.1:5000/public/recibo_svg/07_titulo_ingresos.svg', (res) => {
    console.log('07_titulo_ingresos.svg status:', res.statusCode, res.headers['content-type']);
});
