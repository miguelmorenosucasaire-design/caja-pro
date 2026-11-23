const http = require('http');

http.get('http://127.0.0.1:5000/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // 1. Both vouchers use the same color PNG for escudo
    const imgMatches = body.match(/<img src="\/public\/img\/escudo_recibo_ingreso\.png"/g) || [];
    console.log('Count of color escudo_recibo_ingreso.png in HTML:', imgMatches.length);

    // 2. Both vouchers use the multi-color bars in Minedu logo
    const mineduColoredBars = body.match(/fill="#93a6c2"/g) || [];
    console.log('Count of multi-colored Minedu logos in HTML:', mineduColoredBars.length);

    // 3. Neither voucher has monochrome all-blue Minedu logo
    const mineduAllBlue = body.match(/fill="#1f5aa6"><rect x="11"/g) || [];
    console.log('Count of all-blue Minedu logos in HTML:', mineduAllBlue.length);

    // 4. Titulo MINISTERIO DE EDUCACIÓN is solid var(--azul)
    const hasSolidH1 = body.includes('.recibo__titulos h1 {\n            margin: 0;\n            font: 900 20pt Arial, Helvetica, sans-serif;\n            letter-spacing: .2pt;\n            line-height: 1.15;\n            color: var(--azul);');
    console.log('Header MINISTERIO DE EDUCACIÓN is solid var(--azul):', hasSolidH1);

    // 5. Default style is 'color'
    const defaultColor = body.includes("currentVoucherEstilo = 'color'");
    console.log('Default style is color:', defaultColor);
  });
});
