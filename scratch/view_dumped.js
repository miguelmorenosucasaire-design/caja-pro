const fs = require('fs');

const steps = [550, 552, 554, 556, 558, 560, 562, 564, 567, 637];
for (const s of steps) {
    if (fs.existsSync(`scratch/step_${s}.json`)) {
        const data = JSON.parse(fs.readFileSync(`scratch/step_${s}.json`, 'utf8'));
        console.log(`\n================ STEP ${s} ================`);
        if (data.thinking) console.log('Thinking:\n', data.thinking.substring(0, 500) + '...');
        if (data.content) console.log('Content:\n', data.content.substring(0, 500) + '...');
    }
}
