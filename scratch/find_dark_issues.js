const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all occurrences of bg-slate-50/ or bg-white/ or similar
const slashClasses = html.match(/class="[^"]*bg-[a-z]+-[0-9]+(\/[0-9]+)?[^"]*"/g) || [];
console.log('Total elements with bg- classes:', slashClasses.length);

const problematic = [];
slashClasses.forEach(c => {
    if (!c.includes('dark:') && (c.includes('bg-slate-') || c.includes('bg-white') || c.includes('bg-gray-'))) {
        problematic.push(c);
    }
});

console.log('Elements with light bg but NO dark: variant:', problematic.length);
console.log('Sample problematic classes:\n', problematic.slice(0, 15).join('\n'));
