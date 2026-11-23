const fs = require('fs');

const lines = fs.readFileSync('C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.system_generated/logs/transcript.jsonl', 'utf8').trim().split('\n');

for (let i = 0; i < lines.length; i++) {
  const obj = JSON.parse(lines[i]);
  if (obj.step_index === 7725 || obj.step_index === 7726 || obj.step_index === 7733) {
    console.log(`Step ${obj.step_index} | Type: ${obj.type} | Content:\n`, obj.content);
  }
}
