const fs = require('fs');
const readline = require('readline');

async function getStep(stepNum) {
    const fileStream = fs.createReadStream('C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\5821ddea-af78-49ad-96d0-1a882b4589e0\\.system_generated\\logs\\transcript.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        const obj = JSON.parse(line);
        if (obj.step_index === stepNum || obj.step_index === stepNum + 1 || obj.step_index === stepNum + 2) {
            console.log('--- Step', obj.step_index, obj.source, obj.type);
            console.log(obj.content);
        }
    }
}
getStep(3740);
