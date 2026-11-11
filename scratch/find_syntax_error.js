const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const jsCode = html.substring(scriptStart + 8, scriptEnd);
const lines = jsCode.split('\n');

// Test incremental lines to locate the exact line where syntax breaks
let currentCode = '';
for (let i = 0; i < lines.length; i++) {
    // We check function by function or try to parse
}

// Alternatively, let's use Acorn or Esprima or node's vm
const vm = require('vm');
try {
    new vm.Script(jsCode);
    console.log('Script parsed cleanly');
} catch (err) {
    console.log('VM Error:', err.message);
    console.log(err.stack);
}
