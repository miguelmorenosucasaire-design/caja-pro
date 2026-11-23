const fs = require('fs');

const lines = fs.readFileSync('C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.system_generated/logs/transcript.jsonl', 'utf8').trim().split('\n');

console.log('Total steps:', lines.length);
for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
  try {
    const obj = JSON.parse(lines[i]);
    console.log(`Step ${obj.step_index} | Source: ${obj.source} | Type: ${obj.type}`);
    if (obj.content) {
      console.log('  Content:', obj.content.substring(0, 150));
    }
    if (obj.media && obj.media.length) {
      console.log('  Media:', obj.media.map(m => m.uri));
    }
  } catch (e) {
    console.log('Error parsing line', i, e.message);
  }
}
