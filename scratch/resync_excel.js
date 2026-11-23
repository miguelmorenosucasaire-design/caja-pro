const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const XLSX = require('xlsx');
const fs = require('node:fs');

const excelPath = 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx';
if (fs.existsSync(excelPath)) {
    const wb = XLSX.readFile(excelPath);
    
    // Sync ESTUDIANTES sheet
    const ests = db.prepare("SELECT id, codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo FROM estudiantes ORDER BY nombre ASC").all();
    const estData = [
        ['N°', 'CÓDIGO', 'ESTUDIANTE', 'CARRERA / ESPECIALIDAD', 'CICLO', 'CORREO', 'TELÉFONO', 'ESTADO', 'GRUPO / SECCIÓN']
    ];
    let idx = 1;
    for (const e of ests) {
        estData.push([idx++, e.codigo, e.nombre, e.carrera, e.ciclo, e.email, e.telefono, e.estado_academico, e.grupo]);
    }
    wb.Sheets['ESTUDIANTES'] = XLSX.utils.aoa_to_sheet(estData);

    // Sync CAJA_DIARIO sheet
    const movs = db.prepare("SELECT * FROM movimientos ORDER BY id ASC").all();
    const cajaData = [
        ['ID', 'FECHA', 'TIPO', 'ESTADO', 'ROL', 'PERSONA / RESPONSABLE', 'ESPECIALIDAD', 'SECCIÓN', 'DOCENTE', 'CONCEPTO', 'CANTIDAD (S/.)', 'MÉTODO PAGO', 'COMPROBANTE', 'VENCIMIENTO', 'OBSERVACIONES']
    ];
    for (const m of movs) {
        cajaData.push([
            m.id, m.fecha, m.tipo, m.estado, m.rol, m.nombre, m.carrera, m.grupo, m.encargado, m.concepto, m.monto, m.metodo_pago, m.comprobante, m.fecha_vencimiento, m.notas
        ]);
    }
    wb.Sheets['CAJA_DIARIO'] = XLSX.utils.aoa_to_sheet(cajaData);

    XLSX.writeFile(wb, excelPath);
    console.log('Excel resynchronized! Estudiantes:', ests.length, 'Movimientos:', movs.length);
}
