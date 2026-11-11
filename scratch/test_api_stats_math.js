const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const yearStr = '2026';
const ingRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado' AND strftime('%Y', fecha) = ?").get(yearStr);
console.log('Total Ingresos 2026:', ingRow.total);

const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
const meses = [];
for (let i = 1; i <= 12; i++) {
    const mStr = String(i).padStart(2, '0');
    const r = db.prepare(`
        SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as ing,
            COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as egr
        FROM movimientos 
        WHERE strftime('%Y', fecha) = ? AND strftime('%m', fecha) = ?
    `).get(yearStr, mStr);
    meses.push({ mes: mesesNombres[i-1], ing: r.ing, egr: r.egr, neto: r.ing - r.egr });
}
console.log('Meses:', meses);
