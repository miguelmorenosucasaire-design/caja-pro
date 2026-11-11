const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all buttons or links with tab/seccion/view navigation
const navButtons = [...html.matchAll(/<button[^>]*onclick="[^"]*showTab\('([^']+)'\)[^"]*"[^>]*>([\s\S]*?)<\/button>/g)];
console.log('Tabs found:');
for (const b of navButtons) {
    const tabName = b[1];
    const text = b[2].replace(/<[^>]*>/g, '').trim();
    console.log(`- Tab ID: ${tabName} | Text: "${text}"`);
}

// Check what main sections exist (id="tab-..." or similar)
const sections = [...html.matchAll(/id="(tab-[^"]+|view-[^"]+|section-[^"]+)"/g)];
console.log('\nSections/Tab containers found:');
for (const s of sections) {
    console.log(`- Container ID: ${s[1]}`);
}

// Check JavaScript console errors or functions
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
console.log('\nScript size:', scriptMatch ? scriptMatch[1].length : 0);
