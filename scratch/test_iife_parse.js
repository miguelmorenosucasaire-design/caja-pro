const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Let's find every function definition in the script block
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart + 8, scriptEnd);

// Let's use Babel / Acorn parser if available, or regex to check every function
const fnRegex = /(?:async\s+)?function\s*([a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/g;
let m;
let errors = [];

// Let's test parsing each function body or the entire script in a browser-like non-module environment
const vm = require('vm');
try {
    new vm.Script('(function() {\n' + script + '\n})();');
    console.log('Script parsed successfully inside IIFE!');
} catch (e) {
    console.log('Parse error inside IIFE:', e.message);
}
