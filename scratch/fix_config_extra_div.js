const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const target = `                            <div class="mt-4 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center space-x-2">
                                <i class="fa-solid fa-arrows-rotate text-sm"></i>
                                <span>Los cambios se reflejan al instante en la boleta oficial y en las impresiones en PDF.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>`;

const replacement = `                            <div class="mt-4 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center space-x-2">
                                <i class="fa-solid fa-arrows-rotate text-sm"></i>
                                <span>Los cambios se reflejan al instante en la boleta oficial y en las impresiones en PDF.</span>
                            </div>
                        </div>
                    </div>
                </div>
        </main>`;

// Try CRLF
const targetCRLF = target.replace(/\n/g, '\r\n');
const repCRLF = replacement.replace(/\n/g, '\r\n');

if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, repCRLF);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('CRLF removed extra div successfully!');
} else if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('LF removed extra div successfully!');
} else {
    console.log('Target not found!');
}
