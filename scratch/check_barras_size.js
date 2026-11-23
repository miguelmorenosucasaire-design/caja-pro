const fs = require('fs');
const s1 = fs.statSync('public/img/minedu_barras.png');
const s2 = fs.statSync('public/img/minedu_barras_azul.png');
console.log('minedu_barras.png size:', s1.size);
console.log('minedu_barras_azul.png size:', s2.size);
