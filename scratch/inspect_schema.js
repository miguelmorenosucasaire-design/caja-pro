const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
console.log('Tables in database:');
for (const t of tables) {
    console.log(`\nTable: ${t.name}`);
    console.log(t.sql);
}

const counts = {};
for (const t of tables) {
    if (t.name.startsWith('sqlite_')) continue;
    const c = db.prepare(`SELECT COUNT(*) as count FROM "${t.name}"`).get();
    counts[t.name] = c.count;
}
console.log('\nRow counts:', counts);
