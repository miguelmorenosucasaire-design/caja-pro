const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const targetDup = `                        <div class="hidden sm:flex items-center space-x-3 text-xs font-semibold">
                            <div class="flex items-center space-x-1.5 text-rose-600">
                                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                <span>Vencido</span>
                            </div>
                            <div class="flex items-center space-x-1.5 text-amber-600">
                                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span>Próximo (&le; 7 días)</span>
                            </div>
                            <div class="flex items-center space-x-1.5 text-emerald-600">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span>En Plazo</span>
                            </div>
                        </div>
                    </div>
                </div>`;

// Handle CRLF or LF
const targetDupCRLF = targetDup.replace(/\n/g, '\r\n');

if (html.includes(targetDupCRLF)) {
    html = html.replace(targetDupCRLF + '\r\n\r\n', '');
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('CRLF match removed successfully!');
} else if (html.includes(targetDup)) {
    html = html.replace(targetDup + '\n\n', '');
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('LF match removed successfully!');
} else {
    console.log('Target duplicate block NOT found, checking substring...');
    const searchPart = 'text-rose-600">';
    const idx = html.indexOf(searchPart);
    console.log('idx:', idx);
}
