const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const p2 = html.indexOf('<!DOCTYPE html>', 100);
const secondCopy = html.substring(p2);

const scriptMatch = secondCopy.match(/<script[\s\S]*?<\/script>/gi);
console.log('Total script tags in secondCopy:', scriptMatch.length);

let allValid = true;
scriptMatch.forEach((s, idx) => {
    const code = s.replace(/<\/?script[^>]*>/gi, '');
    try {
        new Function(code);
        console.log(`Script ${idx}: OK`);
    } catch (e) {
        console.error(`Script ${idx} ERROR:`, e.message);
        allValid = false;
    }
});

if (allValid) {
    console.log('Second copy is 100% syntactically valid! Saving back to templates/index.html...');
    fs.writeFileSync('templates/index.html', secondCopy, 'utf8');
}
