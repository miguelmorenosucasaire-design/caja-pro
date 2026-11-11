const fs = require('fs');
const readline = require('readline');

async function findWriteCalls() {
    const transcriptPath = 'C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\4ff10259-488d-456c-9048-85e28e72e05f\\.system_generated\\logs\\transcript_full.jsonl';
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let latestContent = null;
    let step = 0;

    for await (const line of rl) {
        if (!line.trim()) continue;
        step++;
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                for (const tc of obj.tool_calls) {
                    if (tc.name === 'write_file' && tc.args && tc.args.Path && tc.args.Path.includes('templates\\index.html')) {
                        if (tc.args.Content && tc.args.Content.length > 200000) {
                            latestContent = tc.args.Content;
                            console.log(`Found write_file in step ${step}, length: ${latestContent.length}`);
                        }
                    }
                }
            }
        } catch (e) {}
    }

    if (latestContent) {
        console.log('Writing recovered file to templates/index.html...');
        fs.writeFileSync('templates/index.html', latestContent, 'utf8');
        console.log('Done!');
    } else {
        console.log('No write_file to templates/index.html found');
    }
}

findWriteCalls().catch(console.error);
