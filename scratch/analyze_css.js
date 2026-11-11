const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Check head styles
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>');
console.log('Current <style> block:\n', html.substring(styleStart, styleEnd + 8));
