const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all functions in <script>
const scriptStart = html.indexOf('<script>');
const scriptContent = html.substring(scriptStart);

const regex = /<tr[^>]*>[\s\S]*?<\/tr>/g;
let match;
console.log('--- Inspecting template rows in JS ---');
const jsMatches = scriptContent.match(/`[\s\S]*?`/g) || [];
for (const tmpl of jsMatches) {
  if (tmpl.includes('<tr') || tmpl.includes('cyber-card') || tmpl.includes('<td')) {
    const textClasses = tmpl.match(/text-[a-z]+-[0-9]+/g) || [];
    const unique = [...new Set(textClasses)];
    const darkClasses = unique.filter(c => c.endsWith('-700') || c.endsWith('-800') || c.endsWith('-900'));
    if (darkClasses.length > 0) {
      console.log('Template snippet with dark classes:', darkClasses.join(', '));
      // print first 120 chars of template
      console.log('   Snippet:', tmpl.substring(0, 150).replace(/\n/g, ' '));
    }
  }
}
