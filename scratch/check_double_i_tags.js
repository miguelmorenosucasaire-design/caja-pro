const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

// Check every button for multiple <i> tags
const btnMatches = s.match(/<button[\s\S]*?<\/button>/g) || [];
btnMatches.forEach(b => {
    const icons = b.match(/<i [^>]*>/g) || [];
    if (icons.length > 1) {
        console.log('Button with multiple <i> tags:', b.replace(/\s+/g, ' ').slice(0, 150));
    }
});

// Check every <a> tag for multiple <i> tags
const aMatches = s.match(/<a [\s\S]*?<\/a>/g) || [];
aMatches.forEach(a => {
    const icons = a.match(/<i [^>]*>/g) || [];
    if (icons.length > 1) {
        console.log('Link with multiple <i> tags:', a.replace(/\s+/g, ' ').slice(0, 150));
    }
});
