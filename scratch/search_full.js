const fs = require('fs');
const readline = require('readline');
const path = 'C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\4ff10259-488d-456c-9048-85e28e72e05f\\.system_generated\\logs\\transcript_full.jsonl';

const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let foundCount = 0;
rl.on('line', (line) => {
    if (line.includes('Fanny Mamani') || line.includes('0000616') || line.includes('Hilasaca')) {
        foundCount++;
        try {
            const obj = JSON.parse(line);
            console.log(`Step ${obj.step_index}, type: ${obj.type}`);
            fs.writeFileSync(`scratch/transcribed_found_${obj.step_index}.txt`, JSON.stringify(obj, null, 2));
        } catch(e) {
            console.log('Error parsing line');
        }
    }
});

rl.on('close', () => {
    console.log(`Done. Found ${foundCount} lines.`);
});
