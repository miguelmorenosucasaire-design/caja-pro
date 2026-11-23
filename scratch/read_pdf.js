const fs = require('fs');

const pdf = fs.readFileSync('scratch/test_output_1page.pdf', 'utf8');
console.log('PDF length:', pdf.length);

// Extract stream objects or text
const streamMatches = pdf.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g) || [];
console.log('Stream matches count:', streamMatches.length);
