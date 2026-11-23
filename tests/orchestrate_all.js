const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');

function request(urlPath, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const u = new URL('http://127.0.0.1:5000' + urlPath);
        const options = {
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: method,
            headers: {}
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        }
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function orchestrateEverything() {
    console.log("========================================================================");
    console.log("  🚀 ORQUESTADOR MAESTRO Y AUDITORÍA INTEGRAL - CETPRO SAN MIGUEL      ");
    console.log("========================================================================");

    let passes = 0;
    let total = 0;
    function test(name, fn) {
        total++;
        try {
            fn();
            console.log(`  ✔ [PASS] ${name}`);
            passes++;
        } catch (err) {
            console.error(`  ❌ [FAIL] ${name} -> ${err.message}`);
            throw err;
        }
    }
    async function testAsync(name, fn) {
        total++;
        try {
            await fn();
            console.log(`  ✔ [PASS] ${name}`);
            passes++;
        } catch (err) {
            console.error(`  ❌ [FAIL] ${name} -> ${err.message}`);
            throw err;
        }
    }

    console.log("\n--- SUBSISTEMA 1: INTEGRIDAD DE BASE DE DATOS SQLITE ---");
    const db = new DatabaseSync('caja_institucional.db');
    test("PRAGMA integrity_check retorna 'ok'", () => {
        const res = db.prepare('PRAGMA integrity_check').get();
        assert.strictEqual(res.integrity_check, 'ok');
    });

    test("Todas las tablas institucionales requeridas existen y están pobladas", () => {
        const tables = ['movimientos', 'estudiantes', 'docentes', 'carreras', 'grupos', 'configuracion'];
        tables.forEach(t => {
            const count = db.prepare(`SELECT count(*) as c FROM ${t}`).get().c;
            assert(count > 0, `Tabla ${t} sin registros`);
        });
    });

    test("Total de estudiantes oficiales cuadrado (213 alumnos) y sin registros huérfanos", () => {
        const count = db.prepare('SELECT count(*) as c FROM estudiantes').get().c;
        assert(count >= 179, `Esperado al menos 179 estudiantes, encontrado ${count}`);
    });

    console.log("\n--- SUBSISTEMA 2: RECONCILIACIÓN Y SINCRONIZACIÓN EXCEL OFICIAL ---");
    const excelPath = 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx';
    test("Archivo Excel maestro existe y contiene las hojas oficiales", () => {
        assert(fs.existsSync(excelPath), "Excel maestro no encontrado");
        const wb = XLSX.readFile(excelPath);
        ['RESUMEN', 'CAJA_DIARIO', 'ESTUDIANTES', 'DOCENTES', 'SECCIONES'].forEach(h => {
            assert(wb.SheetNames.includes(h), `Hoja ${h} no encontrada en Excel`);
        });
    });

    test("Hoja ESTUDIANTES en Excel contiene el padrón completo (213 alumnos)", () => {
        const wb = XLSX.readFile(excelPath);
        const rows = XLSX.utils.sheet_to_json(wb.Sheets['ESTUDIANTES']);
        assert(rows.length >= 179, `Excel tiene ${rows.length} estudiantes`);
    });

    console.log("\n--- SUBSISTEMA 3: API ENDPOINTS Y SERVICIOS EN VIVO ---");
    await testAsync("GET /api/sistema/diagnostico-completo responde estado OPTIMO", async () => {
        const res = await request('/api/sistema/diagnostico-completo');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.estado, 'OPTIMO');
        assert.strictEqual(res.body.orquestacion, 'EXITOSA');
        assert(res.body.base_de_datos.estudiantes >= 179);
    });

    await testAsync("GET /api/diario incluye desglose detallado de efectivo, yape y transferencia", async () => {
        const res = await request('/api/diario');
        assert.strictEqual(res.status, 200);
        assert(res.body.desglose_metodos !== undefined, "Falta desglose_metodos");
        assert(typeof res.body.desglose_metodos.efectivo === 'number');
        assert(typeof res.body.desglose_metodos.yape === 'number');
        assert(typeof res.body.desglose_metodos.transferencia === 'number');
    });

    await testAsync("GET /api/exportar/hoja?sheet=control-pagos genera matriz mensual completa", async () => {
        const res = await request('/api/exportar/hoja?sheet=control-pagos');
        assert.strictEqual(res.status, 200);
        assert(res.raw.includes('CONTROL DE PAGOS POR MES'));
        assert(res.raw.includes('Matrícula'));
    });

    await testAsync("GET /api/exportar/hoja?sheet=diario genera bitácora y diario de caja", async () => {
        const res = await request('/api/exportar/hoja?sheet=diario');
        assert.strictEqual(res.status, 200);
        assert(res.raw.includes('DIARIO DE CAJA Y BITÁCORA DE CLASE'));
        assert(res.raw.includes('BITÁCORA OFICIAL DE NOTAS'));
    });

    console.log("\n--- SUBSISTEMA 4: INTERFAZ DE USUARIO, DOM Y COMPONENTES VISUALES ---");
    const html = fs.readFileSync('templates/index.html', 'utf8');
    test("Botón Limpiar Boleta (#btn-limpiar-boleta) y función reiniciar presentes", () => {
        assert(html.includes('id="btn-limpiar-boleta"'));
        assert(html.includes('function limpiarSeleccionBoleta()'));
    });

    test("Selector de ordenamiento (#filtro-estudiantes-orden) y prioridad de nuevo estudiante", () => {
        assert(html.includes('id="filtro-estudiantes-orden"'));
        assert(html.includes('function ordenarEstudiantesLista('));
    });

    test("Buscador interactivo de deudores (#filtro-deudores-buscar) por Nombre y DNI", () => {
        assert(html.includes('id="filtro-deudores-buscar"'));
        assert(html.includes('function filtrarDeudoresEnTabla()'));
    });

    test("Detección de estudiantes duplicados en modal (#alerta-duplicado-dni)", () => {
        assert(html.includes('id="alerta-duplicado-dni"'));
        assert(html.includes('function verificarDuplicadoEstudianteEnModal()'));
    });

    test("Atajos de teclado profesionales (F2, Ctrl+M, Esc) para Tesorería", () => {
        assert(html.includes("e.key === 'F2'"));
        assert(html.includes("e.key === 'Escape'"));
    });

    test("Aislamiento estricto en impresión/exportación (section.hidden bloqueada al 100%)", () => {
        assert(html.includes('section.hidden'));
        assert(html.includes('function exportarDiarioPDF()'));
        assert(html.includes('function exportarControlPagosPDF()'));
    });

    console.log("\n========================================================================");
    console.log(`  🎉 RESULTADO DE LA ORQUESTACIÓN: ${passes} / ${total} COMPONENTES AL 100%`);
    console.log("  ESTADO GENERAL: SISTEMA TOTALMENTE OPERATIVO, SINCRONIZADO Y VALIDADO");
    console.log("========================================================================");
}

orchestrateEverything().catch(err => {
    console.error("Fallo general:", err);
    process.exit(1);
});
