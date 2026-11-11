const fs = require('fs');

const steps = [552, 554, 556, 558, 560, 562, 564];
for (const s of steps) {
    if (fs.existsSync(`scratch/step_${s}.json`)) {
        const data = JSON.parse(fs.readFileSync(`scratch/step_${s}.json`, 'utf8'));
        fs.writeFileSync(`scratch/step_${s}_full.txt`, data.thinking || '');
        console.log(`Saved step_${s}_full.txt`);
    }
}
