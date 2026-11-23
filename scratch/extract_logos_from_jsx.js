const fs = require('fs');
const content = fs.readFileSync('c:/Users/MIGUEL/Downloads/ReciboIngresos.jsx', 'utf8');

const mLogo = content.match(/const logoMinedu = "data:image\/svg\+xml;base64,([^"]+)";/);
if (mLogo) {
    fs.writeFileSync('public/img/minedu_azul.svg', Buffer.from(mLogo[1], 'base64'));
    console.log('Saved public/img/minedu_azul.svg');
}

const mEscudo = content.match(/const escudo = "data:image\/png;base64,([^"]+)";/);
if (mEscudo) {
    fs.writeFileSync('public/img/escudo_recibo_ingreso.png', Buffer.from(mEscudo[1], 'base64'));
    console.log('Saved public/img/escudo_recibo_ingreso.png');
}

const mEscudoAzul = content.match(/const escudoAzul = "data:image\/png;base64,([^"]+)";/);
if (mEscudoAzul) {
    fs.writeFileSync('public/img/escudo_recibo_azul.png', Buffer.from(mEscudoAzul[1], 'base64'));
    console.log('Saved public/img/escudo_recibo_azul.png');
}
