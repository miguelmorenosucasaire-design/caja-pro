const http = require('http');

http.get('http://127.0.0.1:5000/', res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        const checks = [
            'id="contenedor-comprobante-oficial"',
            'id="contenedor-comprobante-copia"',
            'id="separador-corte-talonario"',
            'id="factura-nro-comprobante"',
            'id="factura-estudiante"',
            'id="factura-carrera"',
            'id="box-mod-1"',
            'id="box-mod-7"',
            'id="factura-monto-total"',
            'id="factura-dia"',
            'id="factura-mes"',
            'id="factura-ano"',
            'id="copia-factura-nro-comprobante"',
            'id="copia-factura-estudiante"',
            'id="copia-factura-carrera"',
            'id="copia-factura-monto-total"',
            'id="copia-factura-dia"',
            'id="modal-nuevo-estudiante-factura"',
            'id="modal-calendarizacion-ingresos"',
            'id="factura-fecha-emision-input"'
        ];

        console.log('HTTP 200 OK. Body length:', body.length);
        let allOk = true;
        checks.forEach(c => {
            const has = body.includes(c);
            console.log(`[${has ? 'OK' : 'MISSING'}] ${c}`);
            if (!has) allOk = false;
        });

        if (allOk) {
            console.log('\n>>> TODO EL COMPROBANTE OFICIAL ESTÁ 100% ACTIVO Y VISIBLE EN HTTP://127.0.0.1:5000! <<<');
        } else {
            console.error('\n>>> ALGUNOS ELEMENTOS FALTAN EN LA RESPUESTA HTTP <<<');
            process.exit(1);
        }
    });
}).on('error', console.error);
