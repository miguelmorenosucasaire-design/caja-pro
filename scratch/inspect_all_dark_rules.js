const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all CSS rules in style tags that mention .dark
const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (styleMatch) {
    const css = styleMatch[1];
    const lines = css.split('\n');
    let insideDark = false;
    let currentRule = '';
    lines.forEach(l => {
        if (l.includes('.dark')) {
            insideDark = true;
        }
        if (insideDark) {
            currentRule += l + '\n';
            if (l.includes('}')) {
                console.log(currentRule.trim());
                console.log('---');
                currentRule = '';
                insideDark = false;
            }
        }
    });
}
