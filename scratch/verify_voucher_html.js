const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:5000/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    // Check if the required elements and styles are present
    const hasVectorLogo = body.includes('/public/recibo_svg/04_escudo_cetpro.svg');
    const hasOutlinedH1 = body.includes('-webkit-text-stroke: 1.15pt var(--azul)');
    const hasInstNombre = body.includes('INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS');
    const hasNoVisibleConstanciaBox = !body.includes('id="check-constancia" onclick');
    const hasNoVisibleFutBox = !body.includes('id="check-fut" onclick');
    
    console.log('Vector logo in original voucher:', hasVectorLogo);
    console.log('Outlined font for MINISTERIO DE EDUCACIÓN:', hasOutlinedH1);
    console.log('INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS in header:', hasInstNombre);
    console.log('No visible checkbox in item 2 (constancia):', hasNoVisibleConstanciaBox);
    console.log('No visible checkbox in item 3 (fut):', hasNoVisibleFutBox);
  });
});
