import os
import sqlite3
import datetime
import webbrowser
from threading import Timer
from flask import Flask, render_template, request, jsonify, send_file, Response
import io
import csv

app = Flask(__name__)
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "caja_institucional.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Tabla de movimientos generales de caja
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        tipo TEXT NOT NULL,           -- 'Ingreso' o 'Egreso'
        estado TEXT NOT NULL,         -- 'Pagado' o 'Pendiente'
        rol TEXT NOT NULL,            -- 'Docente', 'Estudiante', 'Administrativo', 'General'
        nombre TEXT NOT NULL,
        carrera TEXT NOT NULL,
        concepto TEXT NOT NULL,
        monto REAL NOT NULL,          -- Saldo actual o monto pagado
        monto_total REAL DEFAULT 0,   -- Costo total acordado
        monto_abonado REAL DEFAULT 0, -- Total acumulado que ya pagó
        metodo_pago TEXT DEFAULT 'Efectivo',
        fecha_vencimiento TEXT,
        comprobante TEXT,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Migrar columnas a movimientos si no existen
    cursor.execute("PRAGMA table_info(movimientos)")
    cols = [col[1] for col in cursor.fetchall()]
    if "monto_total" not in cols:
        cursor.execute("ALTER TABLE movimientos ADD COLUMN monto_total REAL DEFAULT 0")
    if "monto_abonado" not in cols:
        cursor.execute("ALTER TABLE movimientos ADD COLUMN monto_abonado REAL DEFAULT 0")
    
    # Asegurar que registros antiguos tengan monto_total igual a monto si era 0
    cursor.execute("UPDATE movimientos SET monto_total = monto WHERE monto_total IS NULL OR monto_total = 0")
    
    # 2. Tabla del cuerpo docente
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS docentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        carrera TEXT NOT NULL,
        email TEXT,
        telefono TEXT,
        especialidad TEXT,
        tipo_contrato TEXT DEFAULT 'Tiempo Completo'
    )
    """)

    # 3. Tabla del alumnado / estudiantes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS estudiantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE,
        nombre TEXT NOT NULL UNIQUE,
        carrera TEXT NOT NULL,
        ciclo TEXT DEFAULT 'Ciclo I',
        email TEXT,
        telefono TEXT,
        estado_academico TEXT DEFAULT 'Activo'
    )
    """)

    # 4. Tabla de historial de abonos / pagos parciales
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS abonos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movimiento_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        monto REAL NOT NULL,
        metodo_pago TEXT DEFAULT 'Efectivo',
        comprobante TEXT,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(movimiento_id) REFERENCES movimientos(id)
    )
    """)

    # Seed de docentes
    cursor.execute("SELECT COUNT(*) FROM docentes")
    if cursor.fetchone()[0] == 0:
        docentes_muestra = [
            ("Dr. Carlos Alberto Mendoza", "Ingeniería de Sistemas", "c.mendoza@institucion.edu", "987654321", "Inteligencia Artificial y Bases de Datos", "Tiempo Completo"),
            ("Mg. Patricia Elena Rivas", "Administración y Negocios", "p.rivas@institucion.edu", "987112233", "Finanzas Corporativas y Gestión", "Tiempo Completo"),
            ("Ing. Roberto Fernando Silva", "Ingeniería Industrial", "r.silva@institucion.edu", "987445566", "Optimización y Control de Calidad", "Por Horas"),
            ("Dra. Carmen Lucía Vargas", "Medicina y Ciencias de la Salud", "c.vargas@institucion.edu", "987778899", "Farmacología Clínica", "Tiempo Completo"),
            ("Lic. Javier Alejandro Ortiz", "Derecho y Ciencias Políticas", "j.ortiz@institucion.edu", "987990011", "Derecho Constitucional y Laboral", "Por Horas"),
            ("Mg. Sofía Beatriz Morales", "Contabilidad y Finanzas", "s.morales@institucion.edu", "987223344", "Auditoría Tributaria", "Tiempo Completo")
        ]
        cursor.executemany("""
            INSERT INTO docentes (nombre, carrera, email, telefono, especialidad, tipo_contrato)
            VALUES (?, ?, ?, ?, ?, ?)
        """, docentes_muestra)

    # Seed de estudiantes
    cursor.execute("SELECT COUNT(*) FROM estudiantes")
    if cursor.fetchone()[0] == 0:
        estudiantes_muestra = [
            ("EST-2026-101", "Fernando José Quispe", "Ingeniería de Sistemas", "Ciclo V", "f.quispe@institucion.edu", "991223344", "Activo"),
            ("EST-2026-102", "Camila Daniela Castro", "Derecho y Ciencias Políticas", "Ciclo IV", "c.castro@institucion.edu", "992334455", "Activo"),
            ("EST-2026-103", "Alejandro Gabriel Salas", "Medicina y Ciencias de la Salud", "Ciclo VI", "a.salas@institucion.edu", "993445566", "Activo"),
            ("EST-2026-104", "Lucía Mariana Morales", "Administración y Negocios", "Ciclo III", "l.morales@institucion.edu", "994556677", "Activo"),
            ("EST-2026-105", "Rodrigo Alonso Vega", "Contabilidad y Finanzas", "Ciclo IV", "r.vega@institucion.edu", "995667788", "Activo"),
            ("EST-2026-106", "Sofía Valentina Morales", "Ingeniería Industrial", "Ciclo V", "s.val.morales@institucion.edu", "996778899", "Activo"),
            ("EST-2026-107", "Andrea Paola Gómez", "Ingeniería de Sistemas", "Ciclo I", "a.gomez@institucion.edu", "997889900", "Activo"),
            ("EST-2026-108", "Mateo Sebastián Torres", "Administración y Negocios", "Ciclo II", "m.torres@institucion.edu", "998990011", "Activo"),
            ("EST-2026-109", "Lucas Daniel Herrera", "Ingeniería de Sistemas", "Ciclo III", "l.herrera@institucion.edu", "990001122", "Activo")
        ]
        cursor.executemany("""
            INSERT INTO estudiantes (codigo, nombre, carrera, ciclo, email, telefono, estado_academico)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, estudiantes_muestra)

    # Verificar si necesitamos actualizar o crear movimientos con abonos
    cursor.execute("SELECT COUNT(*) FROM movimientos WHERE monto_abonado > 0")
    if cursor.fetchone()[0] == 0:
        hoy = datetime.date.today()
        # Aseguramos que existan casos representativos de:
        # a) FALTAN COMPLETAR (pago parcial)
        # b) DEBEN TODO (0% pagado)
        # c) AL DIA (completados)

        # Actualizar a Fernando Quispe: Monto total 500, Abonado 200, Saldo 300
        cursor.execute("""
            UPDATE movimientos 
            SET monto_total = 500.00, monto_abonado = 200.00, monto = 300.00,
                concepto = 'Pensión Semestre Regular (Pago Parcial)',
                notas = 'Abonó S/. 200 iniciales. Falta completar S/. 300'
            WHERE nombre = 'Fernando José Quispe' AND estado = 'Pendiente'
        """)

        # Actualizar a Camila Castro: Monto total 400, Abonado 150, Saldo 250
        cursor.execute("""
            UPDATE movimientos 
            SET monto_total = 400.00, monto_abonado = 150.00, monto = 250.00,
                concepto = 'Pensión Mensual (Pago Parcial)',
                notas = 'Abonó S/. 150. Saldo restante por completar S/. 250'
            WHERE nombre = 'Camila Daniela Castro' AND estado = 'Pendiente'
        """)

        # Agregar un estudiante nuevo con abono parcial: Sofía Valentina Morales (Ingeniería Industrial)
        cursor.execute("SELECT id FROM movimientos WHERE nombre = 'Sofía Valentina Morales'")
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas)
                VALUES (?, 'Ingreso', 'Pendiente', 'Estudiante', 'Sofía Valentina Morales', 'Ingeniería Industrial', 'Pensión y Laboratorio Industrial', 250.00, 600.00, 350.00, 'Yape', ?, 'PEND-06', 'Abonó S/. 350 en 2 partes. Falta completar S/. 250')
            """, (f"{hoy.year}-{hoy.month:02d}-03", (hoy + datetime.timedelta(days=5)).strftime("%Y-%m-%d")))
            mov_id = cursor.lastrowid
            
            # Registrar historial de abonos para Sofía
            cursor.execute("INSERT INTO abonos (movimiento_id, fecha, monto, metodo_pago, comprobante, notas) VALUES (?, ?, 200.00, 'Transferencia', 'ABO-0101', 'Primer abono de matrícula')", (mov_id, f"{hoy.year}-{hoy.month:02d}-01"))
            cursor.execute("INSERT INTO abonos (movimiento_id, fecha, monto, metodo_pago, comprobante, notas) VALUES (?, ?, 150.00, 'Yape', 'ABO-0102', 'Segundo abono parcial')", (mov_id, f"{hoy.year}-{hoy.month:02d}-03"))

    conn.commit()
    conn.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/stats")
def api_stats():
    conn = get_db()
    cursor = conn.cursor()
    hoy = datetime.date.today()
    año_actual = hoy.year
    mes_actual = hoy.month

    # Total Ingresos Pagados
    cursor.execute("SELECT COALESCE(SUM(monto), 0) FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'")
    total_ingresos = cursor.fetchone()[0]

    # Total Egresos Pagados
    cursor.execute("SELECT COALESCE(SUM(monto), 0) FROM movimientos WHERE tipo = 'Egreso' AND estado = 'Pagado'")
    total_egresos = cursor.fetchone()[0]

    # Saldo en Caja
    saldo_actual = total_ingresos - total_egresos

    # Total Deudas por Cobrar (Estudiantes pendientes - Saldo que falta completar)
    cursor.execute("SELECT COALESCE(SUM(monto), 0) FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pendiente' AND rol = 'Estudiante'")
    total_deudas = cursor.fetchone()[0]

    # Métricas específicas de Estudiantes: Deben Todo vs Faltan Completar vs Al Día
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN monto_abonado > 0 AND estado = 'Pendiente' THEN 1 END) as faltan_completar,
            COUNT(CASE WHEN (monto_abonado = 0 OR monto_abonado IS NULL) AND estado = 'Pendiente' THEN 1 END) as deben_todo,
            COALESCE(SUM(CASE WHEN monto_abonado > 0 AND estado = 'Pendiente' THEN monto_abonado ELSE 0 END), 0) as total_ya_abonado
        FROM movimientos
        WHERE rol = 'Estudiante'
    """)
    est_metrics = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) FROM estudiantes")
    total_estudiantes = cursor.fetchone()[0]

    # Ingresos y Egresos del mes actual
    cursor.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0)
        FROM movimientos 
        WHERE strftime('%Y', fecha) = ? AND strftime('%m', fecha) = ?
    """, (str(año_actual), f"{mes_actual:02d}"))
    mes_row = cursor.fetchone()
    ingresos_mes = mes_row[0]
    egresos_mes = mes_row[1]
    saldo_mes = ingresos_mes - egresos_mes

    # Datos mensuales para gráficos (Enero a Diciembre)
    meses_nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
    chart_ingresos = []
    chart_egresos = []
    chart_saldos = []

    for m in range(1, 13):
        m_str = f"{m:02d}"
        cursor.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0)
            FROM movimientos 
            WHERE strftime('%Y', fecha) = ? AND strftime('%m', fecha) = ?
        """, (str(año_actual), m_str))
        r = cursor.fetchone()
        ing = round(r[0], 2)
        egr = round(r[1], 2)
        chart_ingresos.append(ing)
        chart_egresos.append(egr)
        chart_saldos.append(round(ing - egr, 2))

    # Estadísticas de Docentes
    cursor.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) AS egresos_docentes,
            COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) AS ingresos_docentes
        FROM movimientos 
        WHERE rol = 'Docente'
    """)
    doc_row = cursor.fetchone()
    total_salidas_docentes = doc_row[0]
    total_entradas_docentes = doc_row[1]

    # Distribución por Carreras
    cursor.execute("""
        SELECT carrera, 
               COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as total_ingreso,
               COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as total_egreso,
               COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pendiente' THEN monto ELSE 0 END), 0) as total_deuda
        FROM movimientos 
        WHERE carrera != '' AND carrera != 'General'
        GROUP BY carrera
        ORDER BY total_ingreso DESC
    """)
    carreras_stats = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        "total_ingresos": round(total_ingresos, 2),
        "total_egresos": round(total_egresos, 2),
        "saldo_actual": round(saldo_actual, 2),
        "total_deudas": round(total_deudas, 2),
        "ingresos_mes": round(ingresos_mes, 2),
        "egresos_mes": round(egresos_mes, 2),
        "saldo_mes": round(saldo_mes, 2),
        "año_actual": año_actual,
        "estudiantes": {
            "total_alumnos": total_estudiantes,
            "faltan_completar": est_metrics[0],
            "deben_todo": est_metrics[1],
            "total_ya_abonado": round(est_metrics[2], 2),
            "saldo_restante": round(total_deudas, 2)
        },
        "docentes": {
            "total_salidas": round(total_salidas_docentes, 2),
            "total_entradas": round(total_entradas_docentes, 2),
            "balance": round(total_entradas_docentes - total_salidas_docentes, 2)
        },
        "chart": {
            "meses": meses_nombres,
            "ingresos": chart_ingresos,
            "egresos": chart_egresos,
            "saldos": chart_saldos
        },
        "carreras": carreras_stats
    })

@app.route("/api/movimientos", methods=["GET", "POST"])
def api_movimientos():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "POST":
        data = request.json
        fecha = data.get("fecha") or datetime.date.today().strftime("%Y-%m-%d")
        tipo = data.get("tipo", "Ingreso")
        estado = data.get("estado", "Pagado")
        rol = data.get("rol", "Estudiante")
        nombre = data.get("nombre", "").strip()
        carrera = data.get("carrera", "").strip()
        concepto = data.get("concepto", "").strip()
        monto = float(data.get("monto", 0))
        monto_total = float(data.get("monto_total", monto) or monto)
        monto_abonado = float(data.get("monto_abonado", 0) or 0)
        metodo_pago = data.get("metodo_pago", "Efectivo")
        fecha_vencimiento = data.get("fecha_vencimiento", "")
        comprobante = data.get("comprobante", "")
        notas = data.get("notas", "")

        cursor.execute("""
            INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas))
        conn.commit()
        new_id = cursor.lastrowid

        # Si el rol es Docente y no está en la tabla, guardarlo
        if rol == "Docente" and nombre:
            cursor.execute("SELECT id FROM docentes WHERE LOWER(nombre) = LOWER(?)", (nombre,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO docentes (nombre, carrera) VALUES (?, ?)", (nombre, carrera))
                conn.commit()

        # Si el rol es Estudiante y no está en la tabla, guardarlo
        if rol == "Estudiante" and nombre:
            cursor.execute("SELECT id FROM estudiantes WHERE LOWER(nombre) = LOWER(?)", (nombre,))
            if not cursor.fetchone():
                codigo_sug = f"EST-{datetime.date.today().year}-{new_id:03d}"
                cursor.execute("INSERT INTO estudiantes (codigo, nombre, carrera) VALUES (?, ?, ?)", (codigo_sug, nombre, carrera))
                conn.commit()

        conn.close()
        return jsonify({"success": True, "id": new_id, "message": "Movimiento registrado correctamente"})

    # GET con filtros
    tipo_filter = request.args.get("tipo")
    rol_filter = request.args.get("rol")
    carrera_filter = request.args.get("carrera")
    estado_filter = request.args.get("estado")
    search = request.args.get("search", "").lower()

    query = "SELECT * FROM movimientos WHERE 1=1"
    params = []

    if tipo_filter:
        query += " AND tipo = ?"
        params.append(tipo_filter)
    if rol_filter:
        query += " AND rol = ?"
        params.append(rol_filter)
    if carrera_filter:
        query += " AND carrera = ?"
        params.append(carrera_filter)
    if estado_filter:
        query += " AND estado = ?"
        params.append(estado_filter)
    if search:
        query += " AND (LOWER(nombre) LIKE ? OR LOWER(concepto) LIKE ? OR LOWER(comprobante) LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    query += " ORDER BY fecha DESC, id DESC"
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/movimientos/<int:mov_id>", methods=["PUT", "DELETE"])
def api_movimiento_detail(mov_id):
    conn = get_db()
    cursor = conn.cursor()

    if request.method == "DELETE":
        cursor.execute("DELETE FROM movimientos WHERE id = ?", (mov_id,))
        cursor.execute("DELETE FROM abonos WHERE movimiento_id = ?", (mov_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Movimiento eliminado"})

    if request.method == "PUT":
        data = request.json
        fields = []
        params = []
        for key in ["fecha", "tipo", "estado", "rol", "nombre", "carrera", "concepto", "monto", "monto_total", "monto_abonado", "metodo_pago", "fecha_vencimiento", "comprobante", "notas"]:
            if key in data:
                fields.append(f"{key} = ?")
                params.append(data[key])
        if fields:
            params.append(mov_id)
            cursor.execute(f"UPDATE movimientos SET {', '.join(fields)} WHERE id = ?", params)
            conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Movimiento actualizado"})

# =====================================================================
# API DE PLANTILLA DE ESTUDIANTES: DEBEN Y FALTAN COMPLETAR
# =====================================================================
@app.route("/api/estudiantes")
def api_estudiantes():
    conn = get_db()
    cursor = conn.cursor()
    carrera_filter = request.args.get("carrera")
    estado_filtro = request.args.get("estado") # 'faltan_completar', 'deben_todo', 'al_dia'
    search = request.args.get("search", "").lower()

    # Obtener todos los estudiantes registrados
    query_est = "SELECT * FROM estudiantes WHERE 1=1"
    params_est = []
    if carrera_filter:
        query_est += " AND carrera = ?"
        params_est.append(carrera_filter)
    if search:
        query_est += " AND (LOWER(nombre) LIKE ? OR LOWER(codigo) LIKE ?)"
        params_est.extend([f"%{search}%", f"%{search}%"])
    query_est += " ORDER BY nombre ASC"

    cursor.execute(query_est, params_est)
    estudiantes = [dict(r) for r in cursor.fetchall()]

    hoy_str = datetime.date.today().strftime("%Y-%m-%d")
    resultados = []

    for est in estudiantes:
        # Buscar todos los movimientos de este estudiante
        cursor.execute("""
            SELECT id, fecha, tipo, estado, concepto, monto, monto_total, monto_abonado, 
                   metodo_pago, fecha_vencimiento, comprobante, notas,
                   julianday(fecha_vencimiento) - julianday(date('now')) as dias_restantes
            FROM movimientos
            WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante'
            ORDER BY fecha_vencimiento ASC, id DESC
        """, (est["nombre"],))
        movs = [dict(m) for m in cursor.fetchall()]

        # Calcular métricas del estudiante
        total_comprometido = 0.0
        total_pagado = 0.0
        saldo_pendiente = 0.0
        tiene_abonos_parciales = False
        conceptos_pendientes = []
        dias_minimos = 999
        peor_urgencia = "al_dia"

        for m in movs:
            m_total = m.get("monto_total") or m["monto"]
            m_abonado = m.get("monto_abonado") or 0.0
            
            if m["estado"] == "Pendiente":
                m_saldo = m["monto"]
                total_comprometido += m_total
                total_pagado += m_abonado
                saldo_pendiente += m_saldo

                if m_abonado > 0:
                    tiene_abonos_parciales = True

                # Calcular urgencia de la cuota
                dias = m.get("dias_restantes")
                if dias is not None:
                    dias_int = int(round(dias))
                    if dias_int < dias_minimos:
                        dias_minimos = dias_int
                    if dias_int < 0:
                        urg = "vencido"
                    elif dias_int == 0:
                        urg = "vence_hoy"
                    elif dias_int <= 7:
                        urg = "urgente"
                    elif dias_int <= 15:
                        urg = "alerta"
                    else:
                        urg = "a_tiempo"
                else:
                    urg = "sin_fecha"

                m["urgencia"] = urg
                m["dias_restantes"] = int(round(dias)) if dias is not None else None
                conceptos_pendientes.append(m)
            elif m["estado"] == "Pagado" and m["tipo"] == "Ingreso":
                total_comprometido += m["monto"]
                total_pagado += m["monto"]

        # Determinar estado financiero global del alumno
        if saldo_pendiente == 0:
            estado_financiero = "al_dia"
            etiqueta_estado = "Al Día (100% Completado)"
            clase_estado = "bg-emerald-100 text-emerald-800 border-emerald-300"
            porcentaje_avance = 100.0
        elif tiene_abonos_parciales:
            estado_financiero = "faltan_completar"
            etiqueta_estado = "Falta Completar (Pago Parcial)"
            clase_estado = "bg-amber-100 text-amber-800 border-amber-300"
            porcentaje_avance = round((total_pagado / total_comprometido * 100), 1) if total_comprometido > 0 else 0
        else:
            estado_financiero = "deben_todo"
            etiqueta_estado = "Debe Total (Sin Abonos)"
            clase_estado = "bg-rose-100 text-rose-800 border-rose-300"
            porcentaje_avance = 0.0

        # Urgencia global
        if dias_minimos < 0:
            urgencia_global = "vencido"
            msg_urgencia = f"¡Vencido hace {abs(dias_minimos)} días!"
        elif dias_minimos == 0:
            urgencia_global = "vence_hoy"
            msg_urgencia = "¡Vence el día de hoy!"
        elif dias_minimos <= 7:
            urgencia_global = "urgente"
            msg_urgencia = f"Vence en {dias_minimos} días (Próximo)"
        elif dias_minimos <= 15:
            urgencia_global = "alerta"
            msg_urgencia = f"Vence en {dias_minimos} días"
        elif saldo_pendiente > 0:
            urgencia_global = "a_tiempo"
            msg_urgencia = f"En plazo ({dias_minimos} días)"
        else:
            urgencia_global = "al_dia"
            msg_urgencia = "Sin pagos pendientes"

        # Aplicar filtro de estado si se especificó
        if estado_filtro and estado_financiero != estado_filtro:
            continue

        resultados.append({
            "id": est["id"],
            "codigo": est["codigo"] or f"EST-{est['id']:03d}",
            "nombre": est["nombre"],
            "carrera": est["carrera"],
            "ciclo": est["ciclo"] or "Ciclo Regular",
            "email": est["email"] or f"{est['nombre'].lower().replace(' ', '.')}@institucion.edu",
            "telefono": est["telefono"] or "No registrado",
            "total_comprometido": round(total_comprometido, 2),
            "total_pagado": round(total_pagado, 2),
            "saldo_pendiente": round(saldo_pendiente, 2),
            "porcentaje_avance": porcentaje_avance,
            "estado_financiero": estado_financiero,
            "etiqueta_estado": etiqueta_estado,
            "clase_estado": clase_estado,
            "urgencia_global": urgencia_global,
            "msg_urgencia": msg_urgencia,
            "dias_minimos": dias_minimos,
            "total_pendientes_count": len(conceptos_pendientes),
            "conceptos_pendientes": conceptos_pendientes
        })

    # Ordenar: primero los que tienen deudas y vencen pronto, luego faltan completar, luego al día
    def sort_key(item):
        if item["estado_financiero"] == "deben_todo":
            return (1, item["dias_minimos"])
        elif item["estado_financiero"] == "faltan_completar":
            return (2, item["dias_minimos"])
        else:
            return (3, 999)

    resultados.sort(key=sort_key)
    conn.close()
    return jsonify(resultados)

@app.route("/api/estudiantes/<int:est_id>/detalle")
def api_estudiante_detalle(est_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM estudiantes WHERE id = ?", (est_id,))
    est = cursor.fetchone()
    if not est:
        conn.close()
        return jsonify({"error": "Estudiante no encontrado"}), 404

    est_data = dict(est)

    # Movimientos del estudiante
    cursor.execute("""
        SELECT id, fecha, tipo, estado, concepto, monto, monto_total, monto_abonado, 
               metodo_pago, fecha_vencimiento, comprobante, notas,
               julianday(fecha_vencimiento) - julianday(date('now')) as dias_restantes
        FROM movimientos 
        WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante'
        ORDER BY estado DESC, fecha_vencimiento ASC
    """, (est_data["nombre"],))
    movimientos = [dict(m) for m in cursor.fetchall()]

    # Abonos realizados por el estudiante
    cursor.execute("""
        SELECT a.id, a.fecha, a.monto, a.metodo_pago, a.comprobante, a.notas, m.concepto as concepto_original
        FROM abonos a
        JOIN movimientos m ON a.movimiento_id = m.id
        WHERE LOWER(m.nombre) = LOWER(?)
        ORDER BY a.fecha DESC
    """, (est_data["nombre"],))
    abonos = [dict(a) for a in cursor.fetchall()]

    total_comprometido = sum(m.get("monto_total") or m["monto"] for m in movimientos)
    total_pagado = sum(m.get("monto_abonado", 0) if m["estado"] == "Pendiente" else m["monto"] for m in movimientos if m["tipo"] == "Ingreso")
    saldo_pendiente = sum(m["monto"] for m in movimientos if m["estado"] == "Pendiente")

    conn.close()
    return jsonify({
        "estudiante": est_data,
        "movimientos": movimientos,
        "abonos": abonos,
        "total_comprometido": round(total_comprometido, 2),
        "total_pagado": round(total_pagado, 2),
        "saldo_pendiente": round(saldo_pendiente, 2),
        "porcentaje_avance": round((total_pagado / total_comprometido * 100), 1) if total_comprometido > 0 else 100.0
    })

@app.route("/api/estudiantes/abonar", methods=["POST"])
def api_estudiante_abonar():
    conn = get_db()
    cursor = conn.cursor()
    data = request.json

    mov_id = data.get("movimiento_id")
    monto_abono = float(data.get("monto_abono", 0))
    metodo = data.get("metodo_pago", "Efectivo")
    comprobante = data.get("comprobante", "")
    notas = data.get("notas", "")
    fecha_hoy = datetime.date.today().strftime("%Y-%m-%d")

    if not mov_id or monto_abono <= 0:
        conn.close()
        return jsonify({"error": "Monto de abono o cuota inválida"}), 400

    cursor.execute("SELECT * FROM movimientos WHERE id = ?", (mov_id,))
    mov = cursor.fetchone()
    if not mov:
        conn.close()
        return jsonify({"error": "Movimiento no encontrado"}), 404

    saldo_actual = mov["monto"]
    monto_total = mov["monto_total"] or saldo_actual
    monto_abonado_actual = mov["monto_abonado"] or 0.0

    if monto_abono > saldo_actual:
        conn.close()
        return jsonify({"error": f"El monto a abonar (S/. {monto_abono:.2f}) no puede ser mayor al saldo pendiente (S/. {saldo_actual:.2f})"}), 400

    nuevo_saldo = round(saldo_actual - monto_abono, 2)
    nuevo_abonado = round(monto_abonado_actual + monto_abono, 2)
    nuevo_estado = "Pagado" if nuevo_saldo == 0 else "Pendiente"
    nueva_nota = (mov["notas"] or "") + f" [Abono S/. {monto_abono:.2f} el {fecha_hoy} ({metodo})]"

    # 1. Actualizar el registro pendiente
    cursor.execute("""
        UPDATE movimientos 
        SET monto = ?, 
            monto_abonado = ?, 
            estado = ?, 
            notas = ?
        WHERE id = ?
    """, (nuevo_saldo, nuevo_abonado, nuevo_estado, nueva_nota, mov_id))

    # 2. Registrar en la tabla de abonos (auditoría)
    cursor.execute("""
        INSERT INTO abonos (movimiento_id, fecha, monto, metodo_pago, comprobante, notas)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (mov_id, fecha_hoy, monto_abono, metodo, comprobante, notas or f"Abono a {mov['concepto']}"))

    # 3. Registrar el ingreso real a la CAJA para que aumente el balance
    concepto_caja = f"Abono ({'Liquidación total' if nuevo_saldo == 0 else 'Pago parcial'}): {mov['concepto']}"
    cursor.execute("""
        INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas)
        VALUES (?, 'Ingreso', 'Pagado', 'Estudiante', ?, ?, ?, ?, ?, ?, ?, '', ?, ?)
    """, (fecha_hoy, mov["nombre"], mov["carrera"], concepto_caja, monto_abono, monto_abono, monto_abono, metodo, comprobante or f"ABO-{datetime.datetime.now().strftime('%y%m%d%H%M')}", f"Ingreso real a caja por concepto de abono a cuota #{mov_id}"))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True, 
        "message": f"Abono de S/. {monto_abono:.2f} registrado con éxito. {'¡La cuota ha quedado 100% completada!' if nuevo_saldo == 0 else f'Saldo restante por completar: S/. {nuevo_saldo:.2f}'}",
        "nuevo_saldo": nuevo_saldo,
        "completado": nuevo_saldo == 0
    })

@app.route("/api/deudores")
def api_deudores():
    conn = get_db()
    cursor = conn.cursor()
    carrera_filter = request.args.get("carrera")

    query = """
        SELECT id, fecha, nombre, carrera, concepto, monto, monto_total, monto_abonado, fecha_vencimiento, comprobante, notas,
               julianday(fecha_vencimiento) - julianday(date('now')) as dias_restantes
        FROM movimientos
        WHERE tipo = 'Ingreso' AND estado = 'Pendiente' AND rol = 'Estudiante'
    """
    params = []
    if carrera_filter:
        query += " AND carrera = ?"
        params.append(carrera_filter)

    query += " ORDER BY fecha_vencimiento ASC"
    cursor.execute(query, params)
    
    deudores = []
    for row in cursor.fetchall():
        item = dict(row)
        dias = item.get("dias_restantes")
        m_tot = item.get("monto_total") or item["monto"]
        m_abo = item.get("monto_abonado") or 0.0
        item["monto_total"] = m_tot
        item["monto_abonado"] = m_abo
        item["falta_completar"] = m_abo > 0

        if dias is not None:
            item["dias_restantes"] = int(round(dias))
            if item["dias_restantes"] < 0:
                item["urgencia"] = "vencido"
                item["mensaje_urgencia"] = f"Vencido hace {abs(item['dias_restantes'])} días"
            elif item["dias_restantes"] == 0:
                item["urgencia"] = "vence_hoy"
                item["mensaje_urgencia"] = "¡Vence el día de hoy!"
            elif item["dias_restantes"] <= 7:
                item["urgencia"] = "urgente"
                item["mensaje_urgencia"] = f"Vence en {item['dias_restantes']} días (Próximo)"
            elif item["dias_restantes"] <= 15:
                item["urgencia"] = "alerta"
                item["mensaje_urgencia"] = f"Vence en {item['dias_restantes']} días"
            else:
                item["urgencia"] = "a_tiempo"
                item["mensaje_urgencia"] = f"En plazo ({item['dias_restantes']} días)"
        else:
            item["urgencia"] = "sin_fecha"
            item["mensaje_urgencia"] = "Sin fecha límite asignada"
            item["dias_restantes"] = 999
        deudores.append(item)

    conn.close()
    return jsonify(deudores)

@app.route("/api/deudores/pagar/<int:mov_id>", methods=["POST"])
def api_pagar_deuda(mov_id):
    conn = get_db()
    cursor = conn.cursor()
    metodo = request.json.get("metodo_pago", "Efectivo")
    fecha_pago = datetime.date.today().strftime("%Y-%m-%d")

    # Leer el movimiento para liquidarlo completamente
    cursor.execute("SELECT * FROM movimientos WHERE id = ?", (mov_id,))
    mov = cursor.fetchone()
    if not mov:
        conn.close()
        return jsonify({"error": "Movimiento no encontrado"}), 404

    saldo_restante = mov["monto"]
    monto_total = mov["monto_total"] or saldo_restante

    cursor.execute("""
        UPDATE movimientos 
        SET estado = 'Pagado', 
            monto = ?,
            monto_abonado = ?,
            metodo_pago = ?,
            fecha = ?,
            notas = coalesce(notas, '') || ' [Liquidado al 100% el ' || ? || ']'
        WHERE id = ?
    """, (saldo_restante, monto_total, metodo, fecha_pago, fecha_pago, mov_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Deuda liquidada al 100% e ingresada a la caja exitosamente"})

@app.route("/api/docentes")
def api_docentes():
    conn = get_db()
    cursor = conn.cursor()
    carrera_filter = request.args.get("carrera")

    query = """
        SELECT 
            d.id, 
            d.nombre, 
            d.carrera, 
            d.email, 
            d.telefono, 
            d.especialidad, 
            d.tipo_contrato,
            COALESCE(SUM(CASE WHEN m.tipo = 'Egreso' AND m.estado = 'Pagado' THEN m.monto ELSE 0 END), 0) AS total_salidas,
            COALESCE(SUM(CASE WHEN m.tipo = 'Ingreso' AND m.estado = 'Pagado' THEN m.monto ELSE 0 END), 0) AS total_ingresos,
            COUNT(m.id) as total_movimientos
        FROM docentes d
        LEFT JOIN movimientos m ON LOWER(d.nombre) = LOWER(m.nombre) AND m.rol = 'Docente'
        WHERE 1=1
    """
    params = []
    if carrera_filter:
        query += " AND d.carrera = ?"
        params.append(carrera_filter)

    query += " GROUP BY d.id ORDER BY total_salidas DESC, d.nombre ASC"
    cursor.execute(query, params)
    
    docentes = []
    for r in cursor.fetchall():
        item = dict(r)
        item["total_salidas"] = round(item["total_salidas"], 2)
        item["total_ingresos"] = round(item["total_ingresos"], 2)
        item["balance_neto"] = round(item["total_ingresos"] - item["total_salidas"], 2)
        docentes.append(item)

    conn.close()
    return jsonify(docentes)

@app.route("/api/docentes/<int:doc_id>/detalle")
def api_docente_detalle(doc_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM docentes WHERE id = ?", (doc_id,))
    doc = cursor.fetchone()
    if not doc:
        conn.close()
        return jsonify({"error": "Docente no encontrado"}), 404

    doc_data = dict(doc)
    cursor.execute("""
        SELECT * FROM movimientos 
        WHERE LOWER(nombre) = LOWER(?) AND rol = 'Docente'
        ORDER BY fecha DESC
    """, (doc_data["nombre"],))
    movimientos = [dict(m) for m in cursor.fetchall()]
    conn.close()

    total_salidas = sum(m["monto"] for m in movimientos if m["tipo"] == "Egreso" and m["estado"] == "Pagado")
    total_ingresos = sum(m["monto"] for m in movimientos if m["tipo"] == "Ingreso" and m["estado"] == "Pagado")

    return jsonify({
        "docente": doc_data,
        "movimientos": movimientos,
        "total_salidas": round(total_salidas, 2),
        "total_ingresos": round(total_ingresos, 2),
        "balance_neto": round(total_ingresos - total_salidas, 2)
    })

@app.route("/api/exportar/csv")
def api_exportar_csv():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas FROM movimientos ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Fecha", "Tipo", "Estado", "Rol", "Nombre", "Carrera", "Concepto", "Saldo/Monto", "Monto Total", "Monto Abonado", "Metodo de Pago", "Fecha Vencimiento", "Comprobante", "Notas"])
    for r in rows:
        writer.writerow(list(r))

    output.seek(0)
    return Response(
        output.getvalue().encode('utf-8-sig'),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename=Caja_Institucional_{datetime.date.today()}.csv"}
    )

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == "__main__":
    init_db()
    print("Iniciando Sistema de Caja y Gestión Institucional en http://127.0.0.1:5000 ...")
    Timer(1.2, open_browser).start()
    app.run(host="127.0.0.1", port=5000, debug=False)
