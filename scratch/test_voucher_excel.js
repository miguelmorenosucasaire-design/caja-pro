const XLSX = require('xlsx');

function generarReciboExcel(reciboData) {
    const wb = XLSX.utils.book_new();

    // Estructura visual del Recibo Oficial Cetpro Micaela Bastidas
    // Filas y Columnas diseñadas para coincidir exactamente con el voucher impreso
    const data = [
        ['MINISTERIO DE EDUCACIÓN', '', '', '', '', '', '', 'N° ' + (reciboData.comprobante || '0000716')],
        ['UGEL SAN ROMÁN - CETPRO MICAELA BASTIDAS', '', '', '', '', '', '', ''],
        ['JULIACA - PUNO', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['INGRESOS DE RECURSOS PROPIOS', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Señor (a):', reciboData.nombre || '', '', '', '', 'DNI:', reciboData.dni || '', ''],
        ['Especialidad:', (reciboData.carrera || '') + ' - ' + (reciboData.turno || ''), '', '', '', 'Celular:', reciboData.telefono || '', ''],
        ['', '', '', '', '', '', '', ''],
        ['CONCEPTO DE PAGO / APORTE', '', '', '', '', 'IMPORTE (S/.)', '', ''],
        ['1.- Aporte por Mantenimiento [X]', '', '', '', '', Number(reciboData.monto || 150).toFixed(2), '', ''],
        ['2.- Expedición de constancia de estudio [ ]', '', '', '', '', '', '', ''],
        ['3.- FUT [ ]', '', '', '', '', '', '', ''],
        ['4.- Otros: ' + (reciboData.concepto || 'Módulo I'), '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['SON: ' + (reciboData.monto_letras || 'CIENTO CINCUENTA Y 00/100 SOLES'), '', '', '', '', 'TOTAL: S/.', Number(reciboData.monto || 150).toFixed(2), ''],
        ['', '', '', '', '', '', '', ''],
        ['FECHA DE EMISIÓN: Juliaca, ' + (reciboData.fecha_formateada || '08/05/2026'), '', '', '', '', '', '', ''],
        ['DÍA: ' + (reciboData.dia || '08'), 'MES: ' + (reciboData.mes || '05'), 'AÑO: 20' + (reciboData.ano || '26'), '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['____________________________________', '', '', '', '____________________________________', '', '', ''],
        ['Sello y Firma del Tesorero', '', '', '', 'Sello y Firma del Recaudador', '', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Configurar anchos de columna para que el diseño sea espacioso y legible
    ws['!cols'] = [
        { wch: 18 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 }
    ];

    // Merges para emular el voucher visualmente
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Título Ministerio
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // UGEL
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Juliaca
        { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }, // INGRESOS DE RECURSOS PROPIOS
        { s: { r: 6, c: 1 }, e: { r: 6, c: 4 } }, // Nombre señor(a)
        { s: { r: 6, c: 6 }, e: { r: 6, c: 7 } }, // DNI
        { s: { r: 7, c: 1 }, e: { r: 7, c: 4 } }, // Especialidad
        { s: { r: 7, c: 6 }, e: { r: 7, c: 7 } }, // Celular
        { s: { r: 9, c: 0 }, e: { r: 9, c: 4 } }, // Encabezado concepto
        { s: { r: 9, c: 5 }, e: { r: 9, c: 7 } }, // Encabezado importe
        { s: { r: 10, c: 0 }, e: { r: 10, c: 4 } },
        { s: { r: 11, c: 0 }, e: { r: 11, c: 4 } },
        { s: { r: 12, c: 0 }, e: { r: 12, c: 4 } },
        { s: { r: 13, c: 0 }, e: { r: 13, c: 4 } },
        { s: { r: 15, c: 0 }, e: { r: 15, c: 4 } }, // Monto letras
        { s: { r: 17, c: 0 }, e: { r: 17, c: 7 } }, // Fecha completa
        { s: { r: 20, c: 0 }, e: { r: 20, c: 3 } }, // Línea firma tesorero
        { s: { r: 20, c: 4 }, e: { r: 20, c: 7 } }, // Línea firma recaudador
        { s: { r: 21, c: 0 }, e: { r: 21, c: 3 } }, // Texto firma tesorero
        { s: { r: 21, c: 4 }, e: { r: 21, c: 7 } }  // Texto firma recaudador
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'RECIBO_OFICIAL');
    return wb;
}

const wb = generarReciboExcel({
    comprobante: '0000716',
    nombre: 'Ruth Mamani Hancco',
    dni: '73477222',
    carrera: 'Corte y Ensamblaje',
    turno: 'TARDE',
    telefono: '981763281',
    monto: 150,
    concepto: 'Aporte por Mantenimiento Módulo 1',
    fecha_formateada: '08/05/2026',
    dia: '08',
    mes: '05',
    ano: '26',
    monto_letras: 'CIENTO CINCUENTA Y 00/100 SOLES'
});

XLSX.writeFile(wb, 'scratch/test_recibo_export.xlsx');
console.log('Excel file generated successfully!');
