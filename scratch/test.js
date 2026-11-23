const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const estudiantes = db.prepare("SELECT carrera FROM estudiantes").all();
console.log('Total estudiantes in DB:', estudiantes.length);

const countMap = {
    'todas': estudiantes.length,
    'corte': 0,
    'computacion': 0,
    'peluqueria': 0,
    'electricidad': 0,
    'mecanica': 0,
    'motos': 0,
    'carpinteria': 0
};

estudiantes.forEach(e => {
    const c = (e.carrera || '').toLowerCase();
    if (c.includes('corte') || c.includes('confecc') || c.includes('ensamb')) countMap['corte']++;
    else if (c.includes('computa') || c.includes('inform')) countMap['computacion']++;
    else if (c.includes('peluquer') || c.includes('cosmeto') || c.includes('barber')) countMap['peluqueria']++;
    else if (c.includes('electri') || c.includes('sistema')) countMap['electricidad']++;
    else if (c.includes('motos') || c.includes('vehiculo')) countMap['motos']++;
    else if ((c.includes('automot') || c.includes('mecanic')) && !c.includes('motos')) countMap['mecanica']++;
    else if (c.includes('carpint')) countMap['carpinteria']++;
});

console.table(countMap);
