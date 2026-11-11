const fs = require('fs');

const f572 = JSON.parse(fs.readFileSync('scratch/transcribed_found_572.txt', 'utf8'));
if (f572.thinking) {
    fs.writeFileSync('scratch/thinking_572.txt', f572.thinking);
    console.log('Saved thinking_572.txt, length:', f572.thinking.length);
}

const f627 = JSON.parse(fs.readFileSync('scratch/transcribed_found_627.txt', 'utf8'));
if (f627.thinking) {
    fs.writeFileSync('scratch/thinking_627.txt', f627.thinking);
    console.log('Saved thinking_627.txt, length:', f627.thinking.length);
}
