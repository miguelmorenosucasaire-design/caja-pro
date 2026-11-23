const fs = require('fs');

const lines = fs.readFileSync('C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.system_generated/logs/transcript.jsonl', 'utf8').trim().split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('CONECTAME') || lines[i].includes('Conéctame')) {
    console.log(`Step ${i}:`);
    const obj = JSON.parse(lines[i]);
    console.log('Type:', obj.type, 'Source:', obj.source);
    console.log('Content:', obj.content ? obj.content.substring(0, 150) : '');
    // let's print next response step
    if (i + 1 < lines.length) {
      const nextObj = JSON.parse(lines[i+1]);
      console.log('Next step type:', nextObj.type, 'Source:', nextObj.source);
      if (nextObj.content) console.log('Next content:', nextObj.content.substring(0, 200));
    }
  }
}
