const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');
const s2Path = path.join(xlDir, 'worksheets', 'sheet2.xml');
const s3Path = path.join(xlDir, 'worksheets', 'sheet3.xml');
const s4Path = path.join(xlDir, 'worksheets', 'sheet4.xml');
const ssPath = path.join(xlDir, 'sharedStrings.xml');

// 1. Cargar datos
const recibos = JSON.parse(fs.readFileSync(path.join(__dirname, 'recibos_reales.json'), 'utf8'));
const estudiantesMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'estudiantes_map.json'), 'utf8'));
const nombresEstudiantes = Object.keys(estudiantesMap);

// Helper fechas
function dateToSerial(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return Math.round((date - epoch) / (24 * 3600 * 1000));
}

// 2. Cargar SharedStrings
const ssXml = fs.readFileSync(ssPath, 'utf8');
const strings = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let match;
while ((match = siRegex.exec(ssXml)) !== null) {
    const siContent = match[1];
    const tMatches = [...siContent.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)];
    strings.push(tMatches.map(m => m[1]).join(''));
}

function getSharedStringId(str) {
    const s = String(str);
    let idx = strings.indexOf(s);
    if (idx === -1) {
        idx = strings.length;
        strings.push(s);
    }
    return idx;
}

// Mapeo grupo código a datos
const gruposCod = {
    'Computación e Informática - Grupo A': { cod: 'G01', mat: 40, cuota: 120 },
    'Electricidad Domiciliaria - Grupo A': { cod: 'G02', mat: 50, cuota: 150 },
    'Cosmetología - Grupo A': { cod: 'G03', mat: 40, cuota: 140 },
    'Gastronomía y Repostería - Grupo A': { cod: 'G04', mat: 50, cuota: 160 },
    'Corte y Confección - Grupo A': { cod: 'G05', mat: 40, cuota: 110 },
    'Mecánica Automotriz - Grupo A': { cod: 'G06', mat: 60, cuota: 180 }
};

// 3. Modificar ESTUDIANTES (sheet2.xml)
console.log('Generando filas para ESTUDIANTES (sheet2.xml)...');
let s2Xml = fs.readFileSync(s2Path, 'utf8');

// Extraer cabecera hasta row 5
const s2HeadMatch = s2Xml.match(/([\s\S]*?<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>)/);
const s2TailMatch = s2Xml.match(/(<\/sheetData>[\s\S]*)/);
if (!s2HeadMatch || !s2TailMatch) throw new Error('No se pudo parsear sheet2.xml');

let s2NewRows = '';
for (let r = 6; r <= 205; r++) {
    const idx = r - 6;
    if (idx < nombresEstudiantes.length) {
        const nombre = nombresEstudiantes[idx];
        const est = estudiantesMap[nombre];
        const grp = gruposCod[est.grupo] || { cod: 'G01', mat: 40, cuota: 120 };
        const dni = String(70000000 + idx + 1);
        const tel = `9${String(Math.floor(10000000 + Math.random() * 89999999))}`;
        const fMatSerial = dateToSerial(est.fechaMatricula);
        
        // Calcular pagos hechos por el estudiante
        const pagosEst = recibos.filter(x => x.nombre.trim() === nombre);
        const totalPagado = pagosEst.reduce((sum, x) => sum + x.monto, 0);
        const ultPago = pagosEst.length > 0 ? dateToSerial(pagosEst[pagosEst.length - 1].fecha) : fMatSerial;

        const aId = getSharedStringId(est.codigo);
        const bId = getSharedStringId(dni);
        const cId = getSharedStringId(est.nombre);
        const dId = getSharedStringId(tel);
        const eId = getSharedStringId(grp.cod);
        const etiqueta = `${est.codigo} - ${est.nombre}`;
        
        s2NewRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
            `<c r="A${r}" s="16" t="s"><v>${aId}</v></c>` +
            `<c r="B${r}" s="17" t="s"><v>${bId}</v></c>` +
            `<c r="C${r}" s="18" t="s"><v>${cId}</v></c>` +
            `<c r="D${r}" s="16" t="s"><v>${dId}</v></c>` +
            `<c r="E${r}" s="16" t="s"><v>${eId}</v></c>` +
            `<c r="F${r}" s="19" t="n"><v>${fMatSerial}</v></c>` +
            `<c r="G${r}" s="20" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$B$6:$B$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),&quot;Grupo no existe&quot;))</f><v>${est.grupo}</v></c>` +
            `<c r="H${r}" s="20" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$C$6:$C$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),&quot;&quot;))</f><v>${est.encargado}</v></c>` +
            `<c r="I${r}" s="21" t="n"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$F$6:$F$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),0))</f><v>${grp.mat}</v></c>` +
            `<c r="J${r}" s="21" t="n"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$G$6:$G$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),0))</f><v>${grp.cuota}</v></c>` +
            `<c r="K${r}" s="22" t="n"><f aca="false">IF(OR($E${r}=&quot;&quot;,$F${r}=&quot;&quot;),&quot;&quot;,MAX(0,MIN(IFERROR(INDEX(GRUPOS!$H$6:$H$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),0),(YEAR(F_CORTE)-YEAR($F${r}))*12+MONTH(F_CORTE)-MONTH($F${r})+1)))</f><v>8</v></c>` +
            `<c r="L${r}" s="21" t="n"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,$I${r}+$J${r}*N($K${r}))</f><v>${grp.mat + grp.cuota * 8}</v></c>` +
            `<c r="M${r}" s="21" t="n"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,SUMIFS(INGRESOS!$K$6:$K$505,INGRESOS!$D$6:$D$505,$A${r}))</f><v>${totalPagado}</v></c>` +
            `<c r="N${r}" s="21" t="n"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,MAX(0,$L${r}-$M${r}))</f><v>${Math.max(0, (grp.mat + grp.cuota * 8) - totalPagado)}</v></c>` +
            `<c r="O${r}" s="23" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,IF($N${r}&gt;0,&quot;DEBE&quot;,&quot;AL DÍA&quot;))</f><v>${(grp.mat + grp.cuota * 8) - totalPagado > 0 ? 'DEBE' : 'AL DÍA'}</v></c>` +
            `<c r="P${r}" s="24" t="n"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,IF(COUNTIF(INGRESOS!$D$6:$D$505,$A${r})=0,&quot;&quot;,SUMPRODUCT(MAX((INGRESOS!$D$6:$D$505=$A${r})*INGRESOS!$B$6:$B$505))))</f><v>${ultPago}</v></c>` +
            `<c r="Q${r}" s="25" t="n"><f aca="false">IF($O${r}=&quot;DEBE&quot;,COUNTIF($O$6:$O${r},&quot;DEBE&quot;),&quot;&quot;)</f><v>${idx + 1}</v></c>` +
            `<c r="R${r}" s="20" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,$A${r}&amp;&quot; - &quot;&amp;$C${r})</f><v>${etiqueta}</v></c>` +
            `</row>`;
    } else {
        // Fila vacía con fórmulas estándar intactas
        s2NewRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
            `<c r="A${r}" s="16"/><c r="B${r}" s="17"/><c r="C${r}" s="18"/><c r="D${r}" s="16"/><c r="E${r}" s="16"/><c r="F${r}" s="19"/>` +
            `<c r="G${r}" s="20" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$B$6:$B$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),&quot;Grupo no existe&quot;))</f><v></v></c>` +
            `<c r="H${r}" s="20" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$C$6:$C$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),&quot;&quot;))</f><v></v></c>` +
            `<c r="I${r}" s="21" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$F$6:$F$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),0))</f><v></v></c>` +
            `<c r="J${r}" s="21" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(GRUPOS!$G$6:$G$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),0))</f><v></v></c>` +
            `<c r="K${r}" s="22" t="str"><f aca="false">IF(OR($E${r}=&quot;&quot;,$F${r}=&quot;&quot;),&quot;&quot;,MAX(0,MIN(IFERROR(INDEX(GRUPOS!$H$6:$H$25,MATCH($E${r},GRUPOS!$A$6:$A$25,0)),0),(YEAR(F_CORTE)-YEAR($F${r}))*12+MONTH(F_CORTE)-MONTH($F${r})+1)))</f><v></v></c>` +
            `<c r="L${r}" s="21" t="str"><f aca="false">IF($E${r}=&quot;&quot;,&quot;&quot;,$I${r}+$J${r}*N($K${r}))</f><v></v></c>` +
            `<c r="M${r}" s="21" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,SUMIFS(INGRESOS!$K$6:$K$505,INGRESOS!$D$6:$D$505,$A${r}))</f><v></v></c>` +
            `<c r="N${r}" s="21" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,MAX(0,$L${r}-$M${r}))</f><v></v></c>` +
            `<c r="O${r}" s="23" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,IF($N${r}&gt;0,&quot;DEBE&quot;,&quot;AL DÍA&quot;))</f><v></v></c>` +
            `<c r="P${r}" s="24" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,IF(COUNTIF(INGRESOS!$D$6:$D$505,$A${r})=0,&quot;&quot;,SUMPRODUCT(MAX((INGRESOS!$D$6:$D$505=$A${r})*INGRESOS!$B$6:$B$505))))</f><v></v></c>` +
            `<c r="Q${r}" s="25" t="str"><f aca="false">IF($O${r}=&quot;DEBE&quot;,COUNTIF($O$6:$O${r},&quot;DEBE&quot;),&quot;&quot;)</f><v></v></c>` +
            `<c r="R${r}" s="20" t="str"><f aca="false">IF($A${r}=&quot;&quot;,&quot;&quot;,$A${r}&amp;&quot; - &quot;&amp;$C${r})</f><v></v></c>` +
            `</row>`;
    }
}

fs.writeFileSync(s2Path, s2HeadMatch[1] + s2NewRows + s2TailMatch[1], 'utf8');
console.log('ESTUDIANTES (sheet2.xml) actualizado con éxito.');

// 4. Modificar INGRESOS (sheet3.xml)
console.log('Generando filas para INGRESOS (sheet3.xml)...');
let s3Xml = fs.readFileSync(s3Path, 'utf8');

const s3HeadMatch = s3Xml.match(/([\s\S]*?<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>)/);
const s3TailMatch = s3Xml.match(/(<\/sheetData>[\s\S]*)/);
if (!s3HeadMatch || !s3TailMatch) throw new Error('No se pudo parsear sheet3.xml');

const mesesMap = {
    'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
    'Julio': 7, 'Agosto': 8, 'Setiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
};

let s3NewRows = '';
for (let r = 6; r <= 505; r++) {
    const idx = r - 6;
    if (idx < recibos.length) {
        const rec = recibos[idx];
        const est = estudiantesMap[rec.nombre.trim()];
        const serialDate = dateToSerial(rec.fecha);
        const estDropdown = `${est.codigo} - ${est.nombre}`;
        const mesNum = mesesMap[rec.mes] || 3;
        
        const cId = getSharedStringId(estDropdown);
        const gId = getSharedStringId(rec.concepto);
        const iId = getSharedStringId('Efectivo');
        const jId = getSharedStringId(rec.num);
        const lId = getSharedStringId(`Recibo N° ${rec.num} - Mes de ${rec.mes} 2026`);

        s3NewRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
            `<c r="A${r}" s="26" t="n"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,ROW()-5)</f><v>${idx + 1}</v></c>` +
            `<c r="B${r}" s="19" t="n"><v>${serialDate}</v></c>` +
            `<c r="C${r}" s="18" t="s"><v>${cId}</v></c>` +
            `<c r="D${r}" s="25" t="str"><f aca="false">IF($C${r}=&quot;&quot;,&quot;&quot;,IFERROR(LEFT($C${r},FIND(&quot; - &quot;,$C${r})-1),&quot;&quot;))</f><v>${est.codigo}</v></c>` +
            `<c r="E${r}" s="20" t="str"><f aca="false">IF($D${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(ESTUDIANTES!$G$6:$G$205,MATCH($D${r},ESTUDIANTES!$A$6:$A$205,0)),&quot;&quot;))</f><v>${est.grupo}</v></c>` +
            `<c r="F${r}" s="20" t="str"><f aca="false">IF($D${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(ESTUDIANTES!$H$6:$H$205,MATCH($D${r},ESTUDIANTES!$A$6:$A$205,0)),&quot;&quot;))</f><v>${est.encargado}</v></c>` +
            `<c r="G${r}" s="18" t="s"><v>${gId}</v></c>` +
            `<c r="H${r}" s="16"/>` +
            `<c r="I${r}" s="18" t="s"><v>${iId}</v></c>` +
            `<c r="J${r}" s="17" t="s"><v>${jId}</v></c>` +
            `<c r="K${r}" s="27" t="n"><v>${rec.monto}</v></c>` +
            `<c r="L${r}" s="18" t="s"><v>${lId}</v></c>` +
            `<c r="M${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,INDEX(L_MESES,MONTH($B${r})))</f><v>${rec.mes}</v></c>` +
            `<c r="N${r}" s="25" t="n"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF(YEAR($B${r})=CFG_ANIO,MONTH($B${r}),0))</f><v>${mesNum}</v></c>` +
            `<c r="O${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF($B${r}=F_DIA,COUNTIF($B$6:$B${r},F_DIA),&quot;&quot;))</f><v></v></c>` +
            `</row>`;
    } else {
        // Fila vacía
        s3NewRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
            `<c r="A${r}" s="26" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,ROW()-5)</f><v></v></c>` +
            `<c r="B${r}" s="19"/><c r="C${r}" s="18"/>` +
            `<c r="D${r}" s="25" t="str"><f aca="false">IF($C${r}=&quot;&quot;,&quot;&quot;,IFERROR(LEFT($C${r},FIND(&quot; - &quot;,$C${r})-1),&quot;&quot;))</f><v></v></c>` +
            `<c r="E${r}" s="20" t="str"><f aca="false">IF($D${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(ESTUDIANTES!$G$6:$G$205,MATCH($D${r},ESTUDIANTES!$A$6:$A$205,0)),&quot;&quot;))</f><v></v></c>` +
            `<c r="F${r}" s="20" t="str"><f aca="false">IF($D${r}=&quot;&quot;,&quot;&quot;,IFERROR(INDEX(ESTUDIANTES!$H$6:$H$205,MATCH($D${r},ESTUDIANTES!$A$6:$A$205,0)),&quot;&quot;))</f><v></v></c>` +
            `<c r="G${r}" s="18"/><c r="H${r}" s="16"/><c r="I${r}" s="18"/><c r="J${r}" s="17"/><c r="K${r}" s="27"/><c r="L${r}" s="18"/>` +
            `<c r="M${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,INDEX(L_MESES,MONTH($B${r})))</f><v></v></c>` +
            `<c r="N${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF(YEAR($B${r})=CFG_ANIO,MONTH($B${r}),0))</f><v></v></c>` +
            `<c r="O${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF($B${r}=F_DIA,COUNTIF($B$6:$B${r},F_DIA),&quot;&quot;))</f><v></v></c>` +
            `</row>`;
    }
}

fs.writeFileSync(s3Path, s3HeadMatch[1] + s3NewRows + s3TailMatch[1], 'utf8');
console.log('INGRESOS (sheet3.xml) actualizado con éxito.');

// 5. Vaciar GASTOS (sheet4.xml)
console.log('Vaciando filas simuladas de GASTOS (sheet4.xml)...');
let s4Xml = fs.readFileSync(s4Path, 'utf8');

const s4HeadMatch = s4Xml.match(/([\s\S]*?<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>)/);
const s4TailMatch = s4Xml.match(/(<\/sheetData>[\s\S]*)/);
if (!s4HeadMatch || !s4TailMatch) throw new Error('No se pudo parsear sheet4.xml');

let s4NewRows = '';
for (let r = 6; r <= 305; r++) {
    s4NewRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
        `<c r="A${r}" s="28" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,ROW()-5)</f><v></v></c>` +
        `<c r="B${r}" s="19"/><c r="C${r}" s="18"/><c r="D${r}" s="18"/><c r="E${r}" s="18"/><c r="F${r}" s="18"/><c r="G${r}" s="17"/><c r="H${r}" s="27"/>` +
        `<c r="I${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,INDEX(L_MESES,MONTH($B${r})))</f><v></v></c>` +
        `<c r="J${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF(YEAR($B${r})=CFG_ANIO,MONTH($B${r}),0))</f><v></v></c>` +
        `<c r="K${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF($B${r}=F_DIA,COUNTIF($B$6:$B${r},F_DIA),&quot;&quot;))</f><v></v></c>` +
        `</row>`;
}

fs.writeFileSync(s4Path, s4HeadMatch[1] + s4NewRows + s4TailMatch[1], 'utf8');
console.log('GASTOS (sheet4.xml) vaciado y preparado con éxito.');

// 6. Guardar sharedStrings.xml
console.log(`Guardando sharedStrings.xml (${strings.length} cadenas únicas)...`);
let ssContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n`;
ssContent += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length * 3}" uniqueCount="${strings.length}">`;
for (const s of strings) {
    const esc = String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    ssContent += `<si><t>${esc}</t></si>`;
}
ssContent += `</sst>`;

fs.writeFileSync(ssPath, ssContent, 'utf8');
console.log('sharedStrings.xml guardado correctamente.');

console.log('=== ACTUALIZACIÓN DE ARCHIVOS XML COMPLETADA ===');
