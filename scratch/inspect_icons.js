const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const asideStart = s.indexOf('<aside');
const asideEnd = s.indexOf('</aside>');
if (asideStart !== -1 && asideEnd !== -1) {
    const aside = s.slice(asideStart, asideEnd);
    console.log('--- SIDEBAR CONTENT ---');
    const lines = aside.split('\n');
    lines.forEach(l => {
        if (l.includes('<i class=') || l.includes('cambiarSeccion') || l.includes('nav-')) {
            console.log(l.trim());
        }
    });
}
