const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'caja_institucional.db');
const dest = path.join(__dirname, '..', 'backups', 'Respaldo_Pre_Datos_Reales_2026.db');

if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Respaldo creado exitosamente en: ${dest}`);
} else {
    console.log('No se encontró caja_institucional.db');
}
