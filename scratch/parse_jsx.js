const fs = require('fs');
const content = fs.readFileSync('c:/Users/MIGUEL/Downloads/ReciboIngresos.jsx', 'utf8');

// Find all functions and exports
const nonBase64 = content.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '"[BASE64]"');
console.log(nonBase64);
