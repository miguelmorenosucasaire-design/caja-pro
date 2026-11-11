const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const unpackedDir = path.resolve(__dirname, 'excel_unpacked');
const cleanDir = path.resolve(__dirname, 'excel_clean_temp');

// 1. Clonar excel_unpacked
if (fs.existsSync(cleanDir)) {
    fs.rmSync(cleanDir, { recursive: true, force: true });
}

// Copiar recursivamente
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

copyRecursiveSync(unpackedDir, cleanDir);

// 2. Limpiar sheet2.xml (ESTUDIANTES): todas las filas 6 a 205 vacías con fórmulas
const s2Path = path.join(cleanDir, 'xl', 'worksheets', 'sheet2.xml');
let s2Xml = fs.readFileSync(s2Path, 'utf8');
const s2Head = s2Xml.match(/([\s\S]*?<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>)/)[1];
const s2Tail = s2Xml.match(/(<\/sheetData>[\s\S]*)/)[1];

let s2EmptyRows = '';
for (let r = 6; r <= 205; r++) {
    s2EmptyRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
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
fs.writeFileSync(s2Path, s2Head + s2EmptyRows + s2Tail, 'utf8');

// 3. Limpiar sheet3.xml (INGRESOS): todas las filas 6 a 505 vacías con fórmulas
const s3Path = path.join(cleanDir, 'xl', 'worksheets', 'sheet3.xml');
let s3Xml = fs.readFileSync(s3Path, 'utf8');
const s3Head = s3Xml.match(/([\s\S]*?<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>)/)[1];
const s3Tail = s3Xml.match(/(<\/sheetData>[\s\S]*)/)[1];

let s3EmptyRows = '';
for (let r = 6; r <= 505; r++) {
    s3EmptyRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
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
fs.writeFileSync(s3Path, s3Head + s3EmptyRows + s3Tail, 'utf8');

// 4. Limpiar sheet4.xml (GASTOS)
const s4Path = path.join(cleanDir, 'xl', 'worksheets', 'sheet4.xml');
let s4Xml = fs.readFileSync(s4Path, 'utf8');
const s4Head = s4Xml.match(/([\s\S]*?<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>)/)[1];
const s4Tail = s4Xml.match(/(<\/sheetData>[\s\S]*)/)[1];

let s4EmptyRows = '';
for (let r = 6; r <= 305; r++) {
    s4EmptyRows += `<row r="${r}" customFormat="false" ht="15" hidden="false" customHeight="false" outlineLevel="0" collapsed="false">` +
        `<c r="A${r}" s="28" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,ROW()-5)</f><v></v></c>` +
        `<c r="B${r}" s="19"/><c r="C${r}" s="18"/><c r="D${r}" s="18"/><c r="E${r}" s="18"/><c r="F${r}" s="18"/><c r="G${r}" s="17"/><c r="H${r}" s="27"/>` +
        `<c r="I${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,INDEX(L_MESES,MONTH($B${r})))</f><v></v></c>` +
        `<c r="J${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF(YEAR($B${r})=CFG_ANIO,MONTH($B${r}),0))</f><v></v></c>` +
        `<c r="K${r}" s="25" t="str"><f aca="false">IF($B${r}=&quot;&quot;,&quot;&quot;,IF($B${r}=F_DIA,COUNTIF($B$6:$B${r},F_DIA),&quot;&quot;))</f><v></v></c>` +
        `</row>`;
}
fs.writeFileSync(s4Path, s4Head + s4EmptyRows + s4Tail, 'utf8');

// 5. Comprimir plantilla limpia
const cleanZip = path.resolve(__dirname, 'clean_excel.zip');
if (fs.existsSync(cleanZip)) fs.unlinkSync(cleanZip);

const psCommand = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${cleanDir}', '${cleanZip}', [System.IO.Compression.CompressionLevel]::Optimal, $false)"`;
console.log('Comprimiendo plantilla limpia...');
execSync(psCommand, { stdio: 'inherit' });

const destCleanProject = path.resolve(__dirname, '..', 'CEPRO_Micaela_Bastidas_Control_PLANTILLA_LIMPIA.xlsm');
const destCleanDownloads = 'c:\\Users\\MIGUEL\\Downloads\\CEPRO_Micaela_Bastidas_Control_PLANTILLA_LIMPIA.xlsm';
fs.copyFileSync(cleanZip, destCleanProject);
fs.copyFileSync(cleanZip, destCleanDownloads);

console.log('Plantilla limpia generada exitosamente en:');
console.log('  1. ' + destCleanProject);
console.log('  2. ' + destCleanDownloads);
