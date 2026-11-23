const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all render functions for tables
const funcs = ['renderTablaEstudiantes', 'renderTablaDeudores', 'renderTablaDocentes', 'renderTablaGrupos', 'renderTablaResultados'];
funcs.forEach(f => {
    const idx = html.indexOf('function ' + f);
    if (idx !== -1) {
        console.log(`Found ${f} at index ${idx}`);
        console.log(html.substring(idx, idx + 400));
        console.log('===');
    } else {
        console.log(`NOT found: ${f}`);
    }
});
