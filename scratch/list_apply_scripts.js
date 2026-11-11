const fs = require('fs');

const files = fs.readdirSync('scratch').filter(f => f.includes('apply') || f.includes('config') || f.includes('unified'));
files.forEach(f => {
    const stat = fs.statSync('scratch/' + f);
    console.log(f, stat.size, stat.mtime);
});
