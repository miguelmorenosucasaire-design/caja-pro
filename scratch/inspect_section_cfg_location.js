const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const cfgIdx = content.indexOf('id="section-configuracion"');
console.log('section-configuracion at:', cfgIdx);

const btnGuardarIdx = content.indexOf('Guardar Todos los Cambios', cfgIdx);
console.log('Guardar Todos los Cambios at:', btnGuardarIdx);
if (btnGuardarIdx !== -1) {
    console.log(content.slice(btnGuardarIdx - 300, btnGuardarIdx + 300));
}
