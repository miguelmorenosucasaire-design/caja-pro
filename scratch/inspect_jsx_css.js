const fs = require('fs');
const content = fs.readFileSync('c:/Users/MIGUEL/Downloads/ReciboIngresos.jsx', 'utf8');
const match = content.match(/const CSS = `([\s\S]*?)`;/);
if (match) {
    console.log(match[1]);
} else {
    console.log('CSS not found with regex');
}
