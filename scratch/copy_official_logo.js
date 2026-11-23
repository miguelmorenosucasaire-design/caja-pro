const fs = require('fs');

const officialPath = 'C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.user_uploaded/media_1794801113911_d263888c.jpg';
if (fs.existsSync(officialPath)) {
    const buf = fs.readFileSync(officialPath);
    fs.writeFileSync('public/img/logo_oficial_subido.jpg', buf);
    fs.writeFileSync('public/img/logo_institucion.jpg', buf);
    console.log('Official logo copied successfully, size:', buf.length);
} else {
    console.error('File not found:', officialPath);
}
