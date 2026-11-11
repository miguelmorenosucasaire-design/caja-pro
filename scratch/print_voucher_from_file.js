const fs = require('fs');
const c = fs.readFileSync('scratch/apply_voucher_update.js', 'utf8');
console.log(c.substring(3496, 12000));
