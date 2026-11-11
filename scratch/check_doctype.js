const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const occurrences = [];
let pos = 0;
while ((pos = html.indexOf('<!DOCTYPE html>', pos)) !== -1) {
    occurrences.push(pos);
    pos += 15;
}
console.log('Occurrences of <!DOCTYPE html>:', occurrences);
