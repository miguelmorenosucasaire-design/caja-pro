const fs = require('fs');
// Let's inspect the dimensions and crop of media_1794808692414_390916ab.jpg
const path = 'C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.user_uploaded/media_1794808692414_390916ab.jpg';
console.log('File exists:', fs.existsSync(path));
console.log('File size:', fs.statSync(path).size);
