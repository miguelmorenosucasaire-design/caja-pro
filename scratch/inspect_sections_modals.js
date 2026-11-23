const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all sections
const sections = html.match(/<section[^>]*id="([^"]+)"[^>]*>/g) || [];
console.log('Sections found:');
sections.forEach(s => console.log(' ', s));

// Find all modals
const modals = html.match(/id="modal-[^"]+"/g) || [];
console.log('Modals found:', modals.length);
modals.forEach(m => console.log(' ', m));
