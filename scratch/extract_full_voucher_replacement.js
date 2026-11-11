const fs = require('fs');
const c = fs.readFileSync('scratch/apply_voucher_update.js', 'utf8');

const startIdx = c.indexOf('const voucherReplacement = `');
const endIdx = c.indexOf('`;', startIdx);
console.log('voucherReplacement start:', startIdx, 'end:', endIdx);
console.log(c.substring(startIdx + 28, endIdx));
