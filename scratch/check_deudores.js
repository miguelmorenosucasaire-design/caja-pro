const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const estados = db.prepare('SELECT estado, count(*) as count FROM movimientos GROUP BY estado').all();
console.log('Estados movimientos:', estados);

const tipos = db.prepare('SELECT tipo, count(*) as count FROM movimientos GROUP BY tipo').all();
console.log('Tipos movimientos:', tipos);

const roles = db.prepare('SELECT rol, count(*) as count FROM movimientos GROUP BY rol').all();
console.log('Roles movimientos:', roles);
