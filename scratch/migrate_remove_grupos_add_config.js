const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'caja_institucional.db');
const db = new DatabaseSync(dbPath);

console.log("=== INICIANDO MIGRACIÓN DE BD: ELIMINACIÓN DE GRUPOS Y CREACIÓN DE CONFIGURACIÓN ===");

// 1. Crear tabla configuracion si no existe
db.exec(`
    CREATE TABLE IF NOT EXISTS configuracion (
        clave TEXT PRIMARY KEY,
        valor TEXT
    );
`);
console.log("[1] Tabla 'configuracion' verificada/creada.");

// 2. Insertar valores iniciales de configuración sin generar correo ni teléfono (como pidió el usuario)
const defaultConfigs = [
    ['nombre_institucion', 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA'],
    ['ruc', '20485938210'],
    ['direccion', 'Av. Costanera 1200, San Miguel, Lima'],
    ['campus', 'Campus Central San Miguel'],
    ['telefono', ''], // Vacío para configurar manualmente
    ['email', ''],    // Vacío para configurar manualmente
    ['serie_comprobante', 'B001'],
    ['correlativo_inicio', '000203'],
    ['responsable_nombre', 'Dirección General y Tesorería'],
    ['responsable_cargo', 'Administración de Caja Institucional'],
    ['mensaje_pie', 'Comprobante oficial válido para control institucional interno.'],
    ['moneda', 'S/.']
];

const insertConfig = db.prepare(`
    INSERT INTO configuracion (clave, valor) VALUES (?, ?)
    ON CONFLICT(clave) DO NOTHING
`);

for (const [k, v] of defaultConfigs) {
    insertConfig.run(k, v);
}
console.log("[2] Valores iniciales de configuración cargados (teléfono y correo vacíos para configuración manual).");

// 3. Eliminar los grupos para que el usuario los añada manualmente
const totalGruposAntes = db.prepare("SELECT COUNT(*) as c FROM grupos").get().c;
console.log(`[3] Total de grupos antes de eliminar: ${totalGruposAntes}`);

db.exec("DELETE FROM grupos;");
db.exec("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'grupos';");
console.log("[4] Grupos eliminados. La tabla 'grupos' está lista para que el usuario añada secciones manualmente.");

// 4. Actualizar estudiantes y movimientos a 'General'
db.exec("UPDATE estudiantes SET grupo = 'General' WHERE grupo IS NOT NULL;");
db.exec("UPDATE movimientos SET grupo = 'General' WHERE grupo IS NOT NULL;");
console.log("[5] Estudiantes y movimientos asignados a 'General' a la espera de ser asignados a los nuevos grupos manuales.");

// Verificar
const totalGruposDespues = db.prepare("SELECT COUNT(*) as c FROM grupos").get().c;
const totalEstudiantes = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;
const totalMovimientos = db.prepare("SELECT COUNT(*) as c FROM movimientos").get().c;
const sumaIngresos = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo='Ingreso' AND estado='Pagado'").get().s;

console.log("\n=== ESTADO FINAL DE LA BASE DE DATOS ===");
console.log(`Grupos activos: ${totalGruposDespues} (Esperado: 0 - listos para añadir manualmente)`);
console.log(`Total Estudiantes: ${totalEstudiantes} (Esperado: 147)`);
console.log(`Total Movimientos: ${totalMovimientos} (Esperado: 202)`);
console.log(`Total Ingresos Caja: S/. ${Number(sumaIngresos).toFixed(2)} (Esperado: S/. 24,630.00)`);
console.log("Configuración almacenada:", db.prepare("SELECT * FROM configuracion").all());
