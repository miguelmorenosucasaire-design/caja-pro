const fs = require('fs');

const b64Oficial = 'data:image/png;base64,' + fs.readFileSync('public/img/minedu_oficial_hd.png').toString('base64');
const b64Copia = 'data:image/png;base64,' + fs.readFileSync('public/img/minedu_copia_hd.png').toString('base64');

console.log('Oficial Base64 length:', b64Oficial.length);
console.log('Copia Base64 length:', b64Copia.length);
console.log('Sample Oficial:', b64Oficial.substring(0, 50));
