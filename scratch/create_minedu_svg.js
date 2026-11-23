const fs = require('fs');

// Let's create an SVG that includes both the bars and the exact typography
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 115" width="368" height="230">
  <!-- 3 Barras Verticales en Escala de Grises / Azul Grisáceo Oficial -->
  <rect x="10" y="48" width="16" height="44" fill="#93a6c2"/>
  <rect x="32" y="24" width="16" height="68" fill="#a2aec0"/>
  <rect x="54" y="0" width="16" height="92" fill="#b4becd"/>
  
  <!-- 3 Barras Horizontales en Azul Minedu Oficial -->
  <rect x="78" y="0" width="48" height="28" fill="#1f5aa6"/>
  <rect x="78" y="34" width="80" height="28" fill="#1f5aa6"/>
  <rect x="78" y="68" width="100" height="24" fill="#1f5aa6"/>

  <!-- Textos oficiales inferiores -->
  <text x="92" y="104" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-weight="700" font-size="14" fill="#333366">Ministerio de Educación</text>
  <text x="92" y="113" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-weight="400" font-size="9" fill="#333366">REPÚBLICA DEL PERÚ</text>
</svg>`;

fs.writeFileSync('public/img/minedu_oficial.svg', svg);
console.log('Saved public/img/minedu_oficial.svg');
