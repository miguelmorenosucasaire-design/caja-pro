const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Let's inspect the dark mode CSS in <style>
const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (styleMatch) {
    const css = styleMatch[1];
    const darkRules = css.split('\n').filter(line => line.includes('.dark'));
    console.log('Number of .dark CSS rules:', darkRules.length);
    console.log('First 20 .dark rules:\n', darkRules.slice(0, 20).join('\n'));
}

// Let's check Chart.js in dark mode!
// When toggling theme, does Chart.js re-render or update its colors?
console.log('Chart references with theme:');
const chartMatches = html.match(/theme|chart|Chart/gi);
console.log('Matches count:', chartMatches ? chartMatches.length : 0);
