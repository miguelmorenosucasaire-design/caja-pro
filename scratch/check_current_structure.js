const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('File size:', html.length);
console.log('Contains </aside>?', html.includes('</aside>'));
console.log('Contains <main>?', html.includes('<main'));
console.log('Contains </main>?', html.includes('</main>'));
console.log('Contains </html>?', html.includes('</html>'));
