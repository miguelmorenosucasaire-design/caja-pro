async function verify() {
    const res = await fetch('http://127.0.0.1:5000/');
    const text = await res.text();
    console.log('HTTP 200 length:', text.length);
    console.log('Contains class="dark":', text.includes('class="dark"'));
    console.log('Contains modal-asignar-carrera-estudiante:', text.includes('modal-asignar-carrera-estudiante'));
    console.log('Contains "Modificar / Cambiar Carrera":', text.includes('Modificar / Cambiar Carrera'));
    console.log('Contains "btn-theme-toggle":', text.includes('btn-theme-toggle'));
    console.log('Contains "kpi-cyber-saldo":', text.includes('kpi-cyber-saldo'));
    console.log('Contains 12 sheets sidebar:', text.includes('nav-configuracion') && text.includes('nav-dashboard'));
}
verify();
