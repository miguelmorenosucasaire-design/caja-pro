const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const regex = /<i class=\"fa-[^\"]+\"[^>]*><\/i>[\s\S]{0,100}?[✏️➕🗑️⚙️💾🔍📊⏳🎓]/g;
let match;
let count = 0;
while((match = regex.exec(s)) !== null) {
    count++;
    console.log(`[${count}] Match at ${match.index}:`, match[0].replace(/\s+/g, ' '));
}

console.log('Total matches with regex 1:', count);

// Also search all emojis in buttons that also have <i>
const buttonRegex = /<button[^>]*>[\s\S]*?<\/button>/g;
let btnMatch;
let btnCount = 0;
while((btnMatch = buttonRegex.exec(s)) !== null) {
    const btn = btnMatch[0];
    if (btn.includes('<i ') && /[✏️➕🗑️⚙️💾🔍📊⏳🎓🟠🔴🟢]/.test(btn)) {
        btnCount++;
        console.log(`[BTN ${btnCount}]:`, btn.replace(/\s+/g, ' ').slice(0, 150));
    }
}
console.log('Total buttons with both <i> and emoji:', btnCount);
