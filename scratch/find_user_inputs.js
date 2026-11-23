const fs = require('fs');

const lines = fs.readFileSync('C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.system_generated/logs/transcript.jsonl', 'utf8').trim().split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.type === 'USER_INPUT') {
      console.log(`Step ${obj.step_index}:`);
      console.log('  Content:', obj.content);
      if (obj.media && obj.media.length) {
        console.log('  Media:', obj.media);
      }
      console.log('---');
    }
  } catch (e) {}
}
