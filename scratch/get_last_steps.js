const fs = require('fs');
const readline = require('readline');

async function getLastSteps() {
    const fileStream = fs.createReadStream('C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\5821ddea-af78-49ad-96d0-1a882b4589e0\\.system_generated\\logs\\transcript.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const allSteps = [];
    for await (const line of rl) {
        allSteps.push(JSON.parse(line));
    }
    const lastSteps = allSteps.slice(-5);
    for (const step of lastSteps) {
        console.log('--- STEP ---');
        console.log('Index:', step.step_index);
        console.log('Source:', step.source);
        console.log('Type:', step.type);
        console.log('Content preview:', (step.content || '').substring(0, 100));
    }
}
getLastSteps();
