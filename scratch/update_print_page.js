const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');
const script = `
<script>
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('main > div').forEach(el => el.classList.add('hidden'));
  const fac = document.getElementById('section-factura');
  if (fac) fac.classList.remove('hidden');
  const cont = document.getElementById('contenedor-impresion-factura');
  if (cont) cont.classList.add('generando-pdf-oficial');
});
</script>
</body>
`;

fs.writeFileSync('scratch/test_print_page.html', html.replace('</body>', script));
console.log('Updated test_print_page.html');
