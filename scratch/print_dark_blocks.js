const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (styleMatch) {
    const css = styleMatch[1];
    // Find all blocks containing .dark
    const blocks = css.split('}').filter(b => b.includes('.dark'));
    blocks.forEach((b, i) => {
        console.log(`--- Block ${i+1} ---`);
        console.log(b.trim() + '}');
    });
}
