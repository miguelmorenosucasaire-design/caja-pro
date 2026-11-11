const fs = require('fs');
const readline = require('readline');
const path = 'C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\4ff10259-488d-456c-9048-85e28e72e05f\\.system_generated\\logs\\transcript.jsonl';

const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let count = 0;
rl.on('line', (line) => {
    try {
        const obj = JSON.parse(line);
        if (obj.thinking && (obj.thinking.includes('0000616') || obj.thinking.includes('Fanny Mamani') || obj.thinking.includes('0000762'))) {
            console.log(`Found in step ${obj.step_index}`);
            fs.writeFileSync(`scratch/transcribed_step_${obj.step_index}.txt`, obj.thinking);
        }
    } catch(e) {}
});

rl.on('close', () => {
    console.log('Finished searching transcript.');
});
