const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all script blocks
const scripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Inline scripts count:', scripts.length);

for (let i = 0; i < scripts.length; i++) {
    const code = scripts[i][1];
    console.log(`\n--- SCRIPT ${i} (length ${code.length}) ---`);
    
    // Check if syntax is valid by parsing in node VM
    const vm = require('vm');
    try {
        new vm.Script(code);
        console.log(`Script ${i}: SYNTAX OK`);
    } catch(err) {
        console.error(`Script ${i}: SYNTAX ERROR!`, err.message);
    }
}
