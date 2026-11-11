const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const headEnd = content.indexOf('</head>');
console.log(content.slice(0, headEnd + 7));
