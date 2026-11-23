const fs = require('fs');
const content = fs.readFileSync('c:/Users/MIGUEL/Downloads/ReciboIngresos.jsx', 'utf8');

const mLogo = content.match(/const logoMinedu = "([^"]+)";/);
const mEscudo = content.match(/const escudo = "([^"]+)";/);
const mEscudoAzul = content.match(/const escudoAzul = "([^"]+)";/);

console.log('logoMinedu length:', mLogo ? mLogo[1].length : 'none');
console.log('escudo length:', mEscudo ? mEscudo[1].length : 'none');
console.log('escudoAzul length:', mEscudoAzul ? mEscudoAzul[1].length : 'none');
