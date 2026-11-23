const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const ests = db.prepare('SELECT id, codigo, nombre, dni, telefono, carrera, grupo FROM estudiantes').all();
const deudores = [];

for (const est of ests) {
  const movs = db.prepare("SELECT monto, comprobante, fecha FROM movimientos WHERE LOWER(nombre) = LOWER(?) AND tipo = 'Ingreso' AND estado = 'Pagado'").all(est.nombre);
  const totalPagado = movs.reduce((acc, m) => acc + Number(m.monto), 0);
  const costoTotal = 300; // 2 módulos de 150
  if (totalPagado < costoTotal) {
    const saldo = costoTotal - totalPagado;
    const faltaCompletar = totalPagado > 0;
    const ultimoComprobante = movs.length > 0 ? movs[movs.length - 1].comprobante : '---';
    deudores.push({
      id: est.id,
      nombre: est.nombre,
      dni: est.dni || 'No registrado',
      telefono: est.telefono || 'No registrado',
      carrera: est.carrera || 'General',
      grupo: est.grupo || 'General',
      concepto: faltaCompletar ? 'Cuota II - Mantenimiento y Talleres (Saldo pendiente)' : 'Cuota I y II - Mantenimiento y Talleres (Completo)',
      monto: saldo,
      monto_total: costoTotal,
      monto_abonado: totalPagado,
      falta_completar: faltaCompletar,
      fecha_vencimiento: '2026-11-30',
      comprobante: ultimoComprobante,
      dias_restantes: 12,
      urgencia: saldo > 150 ? 'urgente' : 'alerta',
      mensaje_urgencia: saldo > 150 ? 'Vence en 12 días (Urgente)' : 'En plazo (12 días)'
    });
  }
}
console.log('Total deudores encontrados:', deudores.length);
console.log('Sample deudor:', deudores[0]);
