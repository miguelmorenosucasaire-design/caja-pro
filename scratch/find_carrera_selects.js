const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const matches = [...content.matchAll(/Corte y Confección|Peluquería y Barbería|Soporte Técnico|Gastronomía|Mantenimiento de Sistemas|Mecánica Automotriz|Carpintería/g)];
console.log('Matches count:', matches.length);
const unique = new Set(matches.map(m => m[0]));
console.log('Unique matches:', unique);

// Also look for select options with carreras
const selectMatches = [...content.matchAll(/<select[^>]*carrera[^>]*>[\s\S]*?<\/select>/gi)];
console.log('Select carrera elements count:', selectMatches.length);
selectMatches.forEach((s, idx) => {
    console.log(`Select #${idx+1}:\n`, s[0].slice(0, 400));
});
