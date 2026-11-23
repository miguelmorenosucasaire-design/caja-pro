const fs = require('fs');
const files = [
    '08_marco_exterior.svg',
    '09_senor_especialidad.svg',
    '10_marco_cuadro_conceptos.svg',
    '11_conceptos_texto.svg',
    '12_casilleros_aporte.svg',
    '13_casilleros_importes.svg',
    '14_fecha_juliaca.svg',
    '15_firmas.svg'
];
files.forEach(f => {
    const c = fs.readFileSync('public/recibo_svg/' + f, 'utf8');
    const vb = c.match(/viewBox="[^"]*"/);
    console.log(f, '->', vb ? vb[0] : 'no vb', 'length:', c.length);
});
