const xlsx = require('xlsx');
const wb = xlsx.readFile('CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
const sheet = wb.Sheets['ESTUDIANTES'];
const rows = xlsx.utils.sheet_to_json(sheet);

const filtered = rows.filter(r => !(r['Apellidos y Nombres del Estudiante'] || '').includes('TEST'));
console.log('Filtered rows count:', filtered.length);

const newSheet = xlsx.utils.json_to_sheet(filtered);
wb.Sheets['ESTUDIANTES'] = newSheet;
xlsx.writeFile(wb, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
console.log('Excel updated cleanly.');
