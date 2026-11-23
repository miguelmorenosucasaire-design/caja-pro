const fs = require('fs');
const dump = fs.readFileSync('scratch/dump.html', 'utf8');
const match = dump.match(/<div id="measurements-output">([^<]+)<\/div>/);
if (match) {
  console.log(JSON.stringify(JSON.parse(match[1]), null, 2));
} else {
  console.log('measurements-output not found');
}
