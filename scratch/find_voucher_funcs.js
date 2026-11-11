const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const matches = html.match(/function [a-zA-Z0-9_]*voucher[a-zA-Z0-9_]*|function [a-zA-Z0-9_]*factura[a-zA-Z0-9_]*/gi);
console.log(matches);
