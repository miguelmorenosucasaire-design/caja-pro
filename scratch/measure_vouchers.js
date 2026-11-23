const fs = require('fs');
const { execSync } = require('child_process');

// Script to inject bounding client rect logging into test_print_page.html
const html = fs.readFileSync('templates/index.html', 'utf8');

const script = `
<script>
window.addEventListener('load', () => {
  const v1 = document.getElementById('contenedor-comprobante-oficial');
  const v2 = document.getElementById('contenedor-comprobante-copia');
  
  function getDetails(el, name) {
    const r = el.getBoundingClientRect();
    const t = el.querySelector('.recibo__tarjeta').getBoundingClientRect();
    const c = el.querySelector('.recibo__caja').getBoundingClientRect();
    const p = el.querySelector('.recibo__pie').getBoundingClientRect();
    return {
      name,
      recibo: { w: r.width, h: r.height, top: r.top, bottom: r.bottom },
      tarjeta: { w: t.width, h: t.height, top: t.top, bottom: t.bottom },
      caja: { w: c.width, h: c.height, top: c.top, bottom: c.bottom },
      pie: { w: p.width, h: p.height, top: p.top, bottom: p.bottom }
    };
  }

  const d1 = getDetails(v1, 'OFICIAL');
  const d2 = getDetails(v2, 'COPIA');
  
  const div = document.createElement('div');
  div.id = 'measurements-output';
  div.textContent = JSON.stringify({ d1, d2 });
  document.body.appendChild(div);
});
</script>
</body>
`;

fs.writeFileSync('scratch/measure_page.html', html.replace('</body>', script));
console.log('Saved scratch/measure_page.html');
