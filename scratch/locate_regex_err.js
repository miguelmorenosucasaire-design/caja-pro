const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all script tags
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart + 8, scriptEnd);
const lines = script.split('\n');

console.log('Total lines in main script:', lines.length);

const vm = require('vm');

// Binary search or line-by-line check
for (let i = 1; i <= lines.length; i++) {
    const chunk = lines.slice(0, i).join('\n');
    try {
        // try to wrap in function with closing braces as needed or check tokens
        // Check if there is an unescaped slash or regex error
    } catch (e) {
    }
}

// Let's search for regexes or patterns like `/`
lines.forEach((line, idx) => {
    // Check if line has single slash that might be interpreted as start of regex
    if (line.includes('//') || line.includes('/*')) return;
    if (line.includes('/')) {
        // check if line alone or in context causes regex error
    }
});

// Let's pinpoint using vm with a wrapper
for (let i = 50; i < lines.length; i += 50) {
    // We can test syntax of slices by stubbing
}

// Better: find lines with `/` not followed by `/`
for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx];
    // Look for suspicious slashes
    if (l.match(/[^\/]\/[^\/*]/)) {
        // test if this line alone or with prefix has regex
        try {
            new vm.Script('function test() {\n' + l + '\n}');
        } catch (err) {
            if (err.message.includes('regular expression')) {
                console.log(`Line ${idx + 1} trigger:`, l.trim());
                console.log('Error:', err.message);
            }
        }
    }
}
