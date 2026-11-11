const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('Total file length:', html.length);
console.log('Second <!DOCTYPE html> at:', html.indexOf('<!DOCTYPE html>', 100));

// Check if from 0 to 334533 has </html>
const firstHtmlClose = html.indexOf('</html>');
console.log('First </html> at:', firstHtmlClose);
