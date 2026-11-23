const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\MIGUEL\\Downloads\\ReciboIngresos.jsx', 'utf8');
console.log('File length:', content.length);
// Print imports and component structure without long base64 strings
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('data:image')) {
        console.log(`Line ${i+1}: [Base64 data omitted, length: ${l.length}]`);
    } else if (i < 120 || i > lines.length - 200) {
        console.log(`Line ${i+1}: ${l}`);
    }
}
