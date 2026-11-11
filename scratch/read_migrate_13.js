const fs = require('fs');
if (fs.existsSync('scratch/migrate_to_13_grupos.js')) {
    console.log(fs.readFileSync('scratch/migrate_to_13_grupos.js', 'utf8'));
}
