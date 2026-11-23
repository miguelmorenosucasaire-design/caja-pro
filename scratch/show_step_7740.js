const fs = require('fs');

const lines = fs.readFileSync('C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.system_generated/logs/transcript.jsonl', 'utf8').trim().split('\n');

for (let i = 7700; i < 7760; i++) {
  if (lines[i]) {
    const obj = JSON.parse(lines[i]);
    if (obj.source === 'MODEL' && obj.content && obj.content.length > 50) {
      console.log(`Step ${obj.step_index}:`, obj.content.substring(0, 300));
    }
  }
}
