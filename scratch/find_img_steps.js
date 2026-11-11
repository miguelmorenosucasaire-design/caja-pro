const fs = require('fs');
const readline = require('readline');
const path = 'C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\4ff10259-488d-456c-9048-85e28e72e05f\\.system_generated\\logs\\transcript_full.jsonl';

const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let steps = [];
rl.on('line', (line) => {
    if (line.includes('WhatsApp Image 2026-10-14')) {
        try {
            const obj = JSON.parse(line);
            steps.push({ step: obj.step_index, type: obj.type, source: obj.source });
        } catch(e) {}
    }
});

rl.on('close', () => {
    console.log('Steps referencing WhatsApp Image:', steps);
});
