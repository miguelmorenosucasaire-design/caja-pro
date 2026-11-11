const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

console.log('=== SCANNING FOR DUPLICATE ICONS AND EMOJIS IN BUTTONS / LABELS ===\n');

// 1. Buttons with icon + emoji/symbol
const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/g;
let m;
let count = 0;
while ((m = buttonRegex.exec(s)) !== null) {
    const inner = m[1];
    const hasFa = /<i\s+class=["'][^"']*fa-[^"']*["']/i.test(inner);
    const hasEmoji = /[✏️➕🗑️⚙️💾🔍📊⏳🎓🟠🔴🟢📥📤+⚡]/.test(inner);
    if (hasFa && hasEmoji) {
        count++;
        console.log(`[DUPLICATE BUTTON ${count}]`);
        console.log('HTML:', m[0].replace(/\s+/g, ' ').slice(0, 200));
        console.log('');
    }
}

// 2. Links with icon + emoji/symbol
const aRegex = /<a[^>]*>([\s\S]*?)<\/a>/g;
while ((m = aRegex.exec(s)) !== null) {
    const inner = m[1];
    const hasFa = /<i\s+class=["'][^"']*fa-[^"']*["']/i.test(inner);
    const hasEmoji = /[✏️➕🗑️⚙️💾🔍📊⏳🎓🟠🔴🟢📥📤+]/.test(inner);
    if (hasFa && hasEmoji) {
        count++;
        console.log(`[DUPLICATE LINK ${count}]`);
        console.log('HTML:', m[0].replace(/\s+/g, ' ').slice(0, 200));
        console.log('');
    }
}
