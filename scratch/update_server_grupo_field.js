const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

const target = `                    carrera: est.carrera,
                    ciclo: est.ciclo || 'Ciclo Regular',`;

const replacement = `                    carrera: est.carrera,
                    grupo: est.grupo || 'General',
                    ciclo: est.ciclo || 'Ciclo Regular',`;

if (!server.includes(target)) {
    throw new Error('target not found in server.js');
}

server = server.replace(target, replacement);
fs.writeFileSync('server.js', server, 'utf8');
console.log('server.js updated with grupo in GET /api/estudiantes.');
