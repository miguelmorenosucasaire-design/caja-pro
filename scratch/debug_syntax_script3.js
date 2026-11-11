const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scriptMatch = html.match(/<script[\s\S]*?<\/script>/gi);
const s3 = scriptMatch[3].replace(/<\/?script[^>]*>/gi, '');

try {
    new Function(s3);
} catch (e) {
    console.log('Error:', e.message);
    const lines = s3.split('\n');
    // Binary search for error line
    for (let i = 1; i <= lines.length; i++) {
        try {
            new Function(lines.slice(0, i).join('\n'));
        } catch (err) {
            if (err.message.includes("Unexpected token '<'") || err.message.includes("Unexpected token '<'")) {
                console.log(`Error starts at line ${i}:`);
                console.log(lines.slice(Math.max(0, i - 10), Math.min(lines.length, i + 5)).join('\n'));
                break;
            }
        }
    }
}
