const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

// List of all sections that should be toggleable
const secciones = [
    'dashboard',
    'resultados',
    'caja',
    'grupos',
    'estudiantes',
    'docentes',
    'deudores',
    'carreras',
    'respaldos'
];

console.log('=== VERIFICANDO EXISTENCIA DE CONTENEDORES DE SECCIÓN ===');
for (const s of secciones) {
    const id = `section-${s}`;
    const exists = html.includes(`id="${id}"`);
    console.log(`- Contenedor #${id}: ${exists ? 'EXISTS' : 'MISSING!'}`);
}

console.log('\n=== VERIFICANDO EXISTENCIA DE BOTONES DE NAVEGACIÓN ===');
for (const s of secciones) {
    const navId = `nav-${s}`;
    const topNavId = `top-nav-${s}`;
    console.log(`- Nav #${navId}: ${html.includes(`id="${navId}"`) ? 'OK' : 'MISSING'} | TopNav #${topNavId}: ${html.includes(`id="${topNavId}"`) ? 'OK' : 'MISSING'}`);
}
