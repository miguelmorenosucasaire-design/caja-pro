const http = require('http');

http.get('http://127.0.0.1:5000/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('HTTP status:', res.statusCode);
        console.log('Contains btn-actualizar-sistema:', data.includes('btn-actualizar-sistema'));
        console.log('Contains Tesorero & Director only:', data.includes('<option value="Tesorero">') && data.includes('<option value="Director">') && !data.includes('<option value="Recaudador">'));
        console.log('Contains dark main style:', data.includes('.dark main, html.dark main'));
    });
});
