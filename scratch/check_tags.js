const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Check unclosed tags between <main> and </main>
const mainOpen = html.indexOf('<main');
const mainClose = html.indexOf('</main>');
const mainContent = html.substring(mainOpen, mainClose + 7);

const tags = [...mainContent.matchAll(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g)];
const stack = [];
const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];

let divBalance = 0;
for (const t of tags) {
    const raw = t[0];
    const name = t[1].toLowerCase();
    const isClose = raw.startsWith('</');
    if (selfClosing.includes(name)) continue;

    if (name === 'div') {
        if (isClose) divBalance--;
        else divBalance++;
    }
}

console.log('Div balance inside <main>:', divBalance);
