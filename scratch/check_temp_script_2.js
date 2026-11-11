const fs = require('fs');

const s = fs.readFileSync('scratch/temp_script_2.js', 'utf8');
console.log('temp_script_2.js length:', s.length);
console.log('Snippet start:\n', s.substring(0, 300));
console.log('Snippet end:\n', s.substring(s.length - 300));
