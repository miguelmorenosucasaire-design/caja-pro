const fs = require('fs');

const pdfPath = 'C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.user_uploaded/media_1795188589595_44ac50c9.pdf';
if (fs.existsSync(pdfPath)) {
  const buf = fs.readFileSync(pdfPath);
  console.log('PDF exists! Size:', buf.length, 'bytes');
  // Look for text strings in PDF
  const text = buf.toString('latin1');
  console.log('Has Ministerio in PDF?', text.includes('Ministerio'));
  console.log('Has INGRESOS in PDF?', text.includes('INGRESOS'));
  console.log('Has Juliaca in PDF?', text.includes('Juliaca'));
} else {
  console.log('PDF not found at path');
}
