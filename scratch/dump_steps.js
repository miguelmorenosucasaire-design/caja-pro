const fs = require('fs');
const readline = require('readline');
const path = 'C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\4ff10259-488d-456c-9048-85e28e72e05f\\.system_generated\\logs\\transcript_full.jsonl';

const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

const targetSteps = [550, 552, 554, 556, 558, 560, 562, 564, 567, 637];
rl.on('line', (line) => {
    try {
        const obj = JSON.parse(line);
        if (targetSteps.includes(obj.step_index)) {
            const outPath = `scratch/step_${obj.step_index}.json`;
            fs.writeFileSync(outPath, JSON.stringify({
                step: obj.step_index,
                thinking: obj.thinking,
                content: obj.content,
                tool_calls: obj.tool_calls
            }, null, 2));
            console.log(`Saved step_${obj.step_index}.json`);
        }
    } catch(e) {}
});

rl.on('close', () => {
    console.log('Done extracting steps.');
});
