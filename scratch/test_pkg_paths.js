const path = require('path');
const fs = require('fs');

const isPkg = typeof process.pkg !== 'undefined';
const appDir = isPkg ? path.dirname(process.execPath) : __dirname;

console.log('isPkg:', isPkg);
console.log('appDir:', appDir);
console.log('execPath:', process.execPath);
console.log('Directory exists:', fs.existsSync(appDir));
