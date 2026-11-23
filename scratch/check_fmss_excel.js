const XLSX = require('xlsx');
const wb = XLSX.readFile('CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
const sheet = wb.Sheets['ESTUDIANTES'];
if (sheet) {
    const data = XLSX.utils.sheet_to_json(sheet);
    const fmss = data.filter(d => JSON.stringify(d).includes('fmss'));
    console.log('fmss in Excel:', fmss);
}
