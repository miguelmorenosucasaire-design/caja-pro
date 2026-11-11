const fs = require('fs');
const readline = require('readline');

async function findLatestIndexHtml() {
    const transcriptPath = 'C:\\Users\\MIGUEL\\.gemini\\antigravity\\brain\\4ff10259-488d-456c-9048-85e28e72e05f\\.system_generated\\logs\\transcript_full.jsonl';
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let latestFullHtml = null;
    let lineCount = 0;

    for await (const line of rl) {
        lineCount++;
        if (line.includes('templates/index.html') && line.includes('section-configuracion') && line.includes('nav-configuracion')) {
            // Check if this line contains full html
            if (line.includes('<!DOCTYPE html>') && line.includes('</html>')) {
                // Extract html string
                const match = line.match(/<!DOCTYPE html>[\s\S]*?<\/html>/);
                if (match && match[0].length > 200000) {
                    latestFullHtml = match[0];
                    console.log(`Found candidate at line ${lineCount}, length: ${match[0].length}`);
                }
            }
        }
    }

    if (latestFullHtml) {
        console.log('Successfully recovered latest full index.html! Length:', latestFullHtml.length);
        fs.writeFileSync('templates/index_recovered.html', latestFullHtml, 'utf8');
    } else {
        console.log('No direct match found in transcript lines');
    }
}

findLatestIndexHtml().catch(console.error);
