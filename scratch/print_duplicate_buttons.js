const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/g;
let m;
let count = 0;
while ((m = buttonRegex.exec(s)) !== null) {
    const inner = m[1];
    const hasFa = /<i\s+class=["'][^"']*fa-[^"']*["']/i.test(inner);
    const hasEmoji = /[✏️➕🗑️⚙️💾🔍📊⏳🎓🟠🔴🟢📥📤+⚡]/.test(inner);
    if (hasFa && hasEmoji) {
        count++;
        console.log(`=== [${count}] ===`);
        console.log(m[0].trim());
        console.log('');
    }
}
