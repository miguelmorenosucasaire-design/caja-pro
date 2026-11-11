const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Check stats
const ingresos = db.prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get();
const egresos = db.prepare("SELECT COALESCE(SUM(monto), 0) AS total FROM movimientos WHERE tipo = 'Egreso' AND estado = 'Pagado'").get();
const balance = ingresos.total - egresos.total;

console.log('=== VERIFICACIÓN DE STATS ===');
console.log(`Total Ingresos: S/. ${ingresos.total.toFixed(2)}`);
console.log(`Total Egresos:  S/. ${egresos.total.toFixed(2)}`);
console.log(`Balance Caja:   S/. ${balance.toFixed(2)}`);

// Check monthly breakdown
const monthly = db.prepare(`
    SELECT 
        strftime('%m', fecha) as mes_num,
        CASE strftime('%m', fecha)
            WHEN '01' THEN 'Enero'
            WHEN '02' THEN 'Febrero'
            WHEN '03' THEN 'Marzo'
            WHEN '04' THEN 'Abril'
            WHEN '05' THEN 'Mayo'
            WHEN '06' THEN 'Junio'
            WHEN '07' THEN 'Julio'
            WHEN '08' THEN 'Agosto'
            WHEN '09' THEN 'Setiembre'
            ELSE 'Otro'
        END as mes_nombre,
        COUNT(*) as total_recibos,
        SUM(monto) as total_mes
    FROM movimientos
    WHERE tipo = 'Ingreso' AND estado = 'Pagado'
    GROUP BY mes_num
    ORDER BY mes_num ASC
`).all();

console.log('\n=== DESGLOSE MENSUAL EN BASE DE DATOS ===');
console.table(monthly);

let t1 = 0, t2 = 0, t3 = 0;
monthly.forEach(m => {
    const num = parseInt(m.mes_num);
    if (num <= 3) t1 += m.total_mes;
    else if (num <= 6) t2 += m.total_mes;
    else if (num <= 9) t3 += m.total_mes;
});

console.log('\n=== RECAPITULACIÓN TRIMESTRAL ===');
console.log(`Trimestre 1 (Ene-Mar): S/. ${t1.toFixed(2)} (Libro: S/. 9,280.00) -> ${t1 === 9280 ? 'EXACTO' : 'REVISAR'}`);
console.log(`Trimestre 2 (Abr-Jun): S/. ${t2.toFixed(2)} (Libro: S/. 7,485.00) -> ${t2 === 7485 ? 'EXACTO' : 'REVISAR'}`);
console.log(`Trimestre 3 (Jul-Set): S/. ${t3.toFixed(2)} (Libro: S/. 7,865.00) -> ${t3 === 7865 ? 'EXACTO' : 'REVISAR'}`);
console.log(`TOTAL GENERAL:         S/. ${(t1 + t2 + t3).toFixed(2)} (Libro: S/. 24,630.00) -> ${(t1 + t2 + t3) === 24630 ? 'EXACTO 100%' : 'REVISAR'}`);
