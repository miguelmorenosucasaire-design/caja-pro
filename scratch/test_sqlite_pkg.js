const { DatabaseSync } = require('node:sqlite');
console.log('Testing sqlite inside standalone executable...');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE test (id INT); INSERT INTO test VALUES (42);');
const row = db.prepare('SELECT id FROM test').get();
console.log('SQLite works! Result:', row);
