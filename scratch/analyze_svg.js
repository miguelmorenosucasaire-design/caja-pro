const fs = require('fs');
const content = fs.readFileSync('scratch/recibo_svg_partes/00_recibo_completo.svg', 'utf8');
const regex = /<g id="([^"]+)"\s*transform="([^"]*)">/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(`Group: ${match[1]} -> transform: ${match[2]}`);
}
