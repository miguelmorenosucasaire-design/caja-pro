const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

// Find all occurrences of emoji in HTML
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
const matches = [];
let m;
while ((m = emojiRegex.exec(s)) !== null) {
    const start = Math.max(0, m.index - 50);
    const end = Math.min(s.length, m.index + 50);
    matches.push({
        emoji: m[0],
        index: m.index,
        snippet: s.slice(start, end).replace(/\s+/g, ' ')
    });
}

console.log('Total emojis found:', matches.length);
matches.forEach((item, i) => {
    console.log(`[${i + 1}] '${item.emoji}': ${item.snippet}`);
});
