const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Check dark mode styles
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
console.log('Style tags found:', styleMatches ? styleMatches.length : 0);

// Check tailwind dark mode configuration
// Does Tailwind script configure darkMode: 'class'?
const tailwindConfig = html.match(/tailwind\.config\s*=\s*({[\s\S]*?})/);
console.log('Tailwind config found:', tailwindConfig ? tailwindConfig[0] : 'None');

// Check initTheme
const initThemeMatch = html.match(/function initTheme\(\)\s*\{[\s\S]*?\}/);
console.log('initTheme:', initThemeMatch ? initThemeMatch[0] : 'None');

// Check toggleTheme
const toggleThemeMatch = html.match(/function toggleTheme\(\)\s*\{[\s\S]*?\}/);
console.log('toggleTheme:', toggleThemeMatch ? toggleThemeMatch[0] : 'None');
