const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'templates', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('--- VERIFICANDO INDEX.HTML ---');

// Extraer todos los IDs definidos en HTML: id="..."
const idDefRegex = /id=["']([^"']+)["']/g;
const definedIds = new Set();
let match;
let duplicates = [];
while ((match = idDefRegex.exec(html)) !== null) {
    const id = match[1];
    if (definedIds.has(id)) {
        duplicates.push(id);
    }
    definedIds.add(id);
}

if (duplicates.length > 0) {
    console.warn('⚠️ IDs duplicados encontrados:', duplicates);
} else {
    console.log('✅ No hay IDs duplicados en el HTML.');
}

// Extraer todos los document.getElementById('...') en los scripts
const getElementRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
const missingIds = [];
while ((match = getElementRegex.exec(html)) !== null) {
    const id = match[1];
    if (!definedIds.has(id)) {
        missingIds.push(id);
    }
}

if (missingIds.length > 0) {
    console.error('❌ IDs referenciados con getElementById pero NO encontrados en el HTML:', missingIds);
} else {
    console.log('✅ Todos los IDs llamados por getElementById existen en el HTML.');
}

console.log(`Total de elementos con ID definidos: ${definedIds.size}`);
