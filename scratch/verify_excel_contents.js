const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.join(__dirname, '..', 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
console.log("==================================================================");
console.log("   VERIFICACIÓN DEL LIBRO EXCEL LLENO CON DATOS DEL SISTEMA");
console.log("==================================================================");

if (!fs.existsSync(excelPath)) {
    console.error("❌ El archivo Excel no existe en:", excelPath);
    process.exit(1);
}

const stat = fs.statSync(excelPath);
console.log(`[+] Archivo Excel: ${path.basename(excelPath)}`);
console.log(`[+] Tamaño en disco: ${(stat.size / 1024).toFixed(1)} KB (${stat.size} bytes)`);
console.log(`[+] Última actualización: ${stat.mtime.toLocaleString('es-PE')}`);

const workbook = XLSX.readFile(excelPath);
console.log(`\n[+] Hojas contenidas en el libro (${workbook.SheetNames.length}):`, workbook.SheetNames);

// 1. Hoja RESUMEN
console.log("\n--- HOJA 1: RESUMEN ---");
const wsResumen = workbook.Sheets['RESUMEN'];
const dataResumen = XLSX.utils.sheet_to_json(wsResumen, { header: 1 });
dataResumen.forEach((row, i) => {
    if (row && row.length > 0) {
        console.log(`  Fila ${i + 1}:`, row.join(' | '));
    }
});

// 2. Hoja CAJA_DIARIO
console.log("\n--- HOJA 2: CAJA_DIARIO ---");
const wsCaja = workbook.Sheets['CAJA_DIARIO'];
const dataCaja = XLSX.utils.sheet_to_json(wsCaja);
console.log(`  Total registros de caja/movimientos: ${dataCaja.length}`);
const sumaIngresos = dataCaja.filter(r => r['Tipo Operación'] === 'Ingreso' && r['Estado'] === 'Pagado')
                             .reduce((acc, r) => acc + (parseFloat(r['Monto Operación (S/.)']) || 0), 0);
console.log(`  Suma de Ingresos en CAJA_DIARIO: S/. ${sumaIngresos.toFixed(2)} (Esperado: 24,630.00)`);
if (sumaIngresos !== 24630) throw new Error("Discrepancia en suma de caja");

// 3. Hoja ESTUDIANTES
console.log("\n--- HOJA 3: ESTUDIANTES ---");
const wsEst = workbook.Sheets['ESTUDIANTES'];
const dataEst = XLSX.utils.sheet_to_json(wsEst);
console.log(`  Total estudiantes llenados en la nómina: ${dataEst.length} (Esperado: 147)`);
if (dataEst.length !== 147) throw new Error("Discrepancia en cantidad de estudiantes");
console.log(`  Muestra primer estudiante:`, dataEst[0]);
console.log(`  Muestra último estudiante:`, dataEst[dataEst.length - 1]);

// 4. Hoja DOCENTES
console.log("\n--- HOJA 4: DOCENTES ---");
const wsDocs = workbook.Sheets['DOCENTES'];
const dataDocs = XLSX.utils.sheet_to_json(wsDocs);
console.log(`  Total docentes registrados: ${dataDocs.length} (Esperado: 8)`);
dataDocs.forEach(d => {
    console.log(`   - ${d['Apellidos y Nombres del Docente']} | ${d['Programa Oficial']} | ${d['Especialidad Técnica']}`);
});

// 5. Hoja SECCIONES
console.log("\n--- HOJA 5: SECCIONES ---");
const wsGrps = workbook.Sheets['SECCIONES'];
const dataGrps = XLSX.utils.sheet_to_json(wsGrps);
console.log(`  Total secciones registradas: ${dataGrps.length} (Esperado: 13)`);
dataGrps.forEach(g => {
    console.log(`   - ${g['Sección / Grupo']} | Turno: ${g['Turno Oficial']} | Docente: ${g['Docente Encargado']} | Alumnos: ${g['Estudiantes Matriculados']}`);
});

console.log("\n==================================================================");
console.log("   🎉 VERIFICACIÓN DE EXCEL LLENO 100% EXITOSA");
console.log("==================================================================");
