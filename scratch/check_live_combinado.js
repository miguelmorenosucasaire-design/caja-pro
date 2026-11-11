const http = require('http');

http.get('http://127.0.0.1:5000/', res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        console.log('Live server has btn-estilo-combinado:', body.includes('id="btn-estilo-combinado"'));
        console.log('Live server has voucher-estilo-azul on copia:', body.includes('id="contenedor-comprobante-copia" class="voucher-media-carta voucher-estilo-azul'));
    });
});
