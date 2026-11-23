const fs = require('fs');
const readline = require('readline');

async function getLastUserSteps() {
    const fileStream = fs.createReadStream('C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\5821ddea-af78-49ad-96d0-1a882b4589e0\\.system_generated\\logs\\transcript.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const userSteps = [];
    for await (const line of rl) {
        if (line.includes('"source":"USER')) {
            userSteps.push(JSON.parse(line));
        }
    }
    const lastSteps = userSteps.slice(-3);
    for (const step of lastSteps) {
        console.log('--- USER STEP ---');
        console.log('Index:', step.step_index);
        console.log('Content:', step.content);
        console.log('Media:', step.media);
    }
}
getLastUserSteps();
