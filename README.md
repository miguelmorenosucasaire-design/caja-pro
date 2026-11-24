[README](README.md) · [Guía de Inicio Rápido](#inicio-rápido) · [Estructura y Tecnologías](#tecnologías-y-arquitectura) · [Orquestador de Pruebas](#verificación-y-orquestador) · [Licencia](LICENSE)

# 🏫 EduCaja Pro
### Control Financiero Institucional, Caja Chica y Emisión de Boletas Oficiales en Red Local
**Centro de Educación Técnico Productiva Público "Micaela Bastidas Puyucawa"** — San Román / Juliaca, Puno - Perú.

[🌐 Repositorio GitHub](https://github.com/miguelmorenosucasaire-design/caja-pro) · [💻 Acceso Local](http://localhost:5000) · [📊 Orquestador (63/63)](orchestrate.js) · [📄 Hoja Excel Maestro](CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx)

---

## ¿Por qué EduCaja Pro?

La administración de recursos propios, matrículas y aportes de mantenimiento en instituciones educativas técnicas y CETPROs suele depender de cuadernos físicos, registros dispersos o programas en la nube que fallan ante cortes de internet y conllevan cobros mensuales recurrentes.

Al mismo tiempo, la emisión de comprobantes impresos suele exigir talonarios pre-impresos difíciles de cuadrar, y la duplicación de datos entre libros contables y hojas de cálculo genera discrepancias financieras, saldos pendientes no cobrados y descuadres al momento del arqueo de caja institucional.

**EduCaja Pro es la solución definitiva Local-First.** Es una plataforma institucional desarrollada bajo tres pilares fundamentales:

1. **Sincronización Híbrida Automática:** Cada cobro o movimiento registrado se impacta de forma inmediata y simultánea en una **Base de Datos SQLite relacional** y en un **Libro Excel Maestro de 12 hojas oficiales**, garantizando cero discrepancias contables.
2. **Boleta Oficial Dual Calibrada (Media Carta):** Genera e imprime en formato talonario oficial reglamentario tanto el **Original a Color (Administración)** como la **Copia Azul (Estudiante)** en una sola página física, con membrete oficial del **Ministerio de Educación (MINEDU)** y la **UGEL San Román**, casillas de verificación de módulos y código correlativo.
3. **Autonomía Total Offline y Cero Fricción:** Funciona al 100% sin conexión a internet en la red local de la institución, cuenta con un monitor de salud criptográfico SHA-256 y un orquestador automatizado con **63 pruebas de validación al 100%**.

---

## 💻 Instalación

Elige tu método preferido y pon en marcha el sistema en menos de 1 minuto:

| Método / Plataforma | Comando / Instrucción | Descripción |
| :--- | :--- | :--- |
| **Windows (1 Clic)** | Doble clic en `INICIAR_SISTEMA.bat` | Inicia el servidor Node.js y abre automáticamente el navegador en `http://localhost:5000`. |
| **Terminal / CLI** | `npm install && npm start` | Descarga dependencias y levanta el servicio HTTP en el puerto `5000`. |
| **Acceso Directo** | Doble clic en `Crear_Acceso_Directo_Escritorio.bat` | Crea un icono de escritorio directo con el escudo institucional para personal de tesorería. |

> **Requisitos Previos:** [Node.js](https://nodejs.org/) v18.0.0 o superior instalado en el equipo y un navegador moderno (Google Chrome, Microsoft Edge, Mozilla Firefox o Brave).

---

## ⚡ Inicio Rápido

```bash
# 1. Iniciar el servidor local y abrir la interfaz web
npm start

# 2. Ejecutar la suite de diagnóstico y salud integral (63 pruebas)
node orchestrate.js

# 3. Acceder al sistema desde cualquier equipo en la misma red WiFi
http://<IP_LOCAL>:5000
```

Al iniciar, el sistema carga el tablero directivo general, conecta la base de datos relacional y verifica la integridad del libro Excel.

### Módulos Principales del Sistema

| Módulo | Sección | Qué hace |
| :--- | :--- | :--- |
| **Inicio / Dashboard** | `section-dashboard` | Balance financiero en vivo, gráfico anual interactivo (Chart.js), total recaudado (`S/. 29,920.00`) y KPIs contables. |
| **Boleta Oficial Dual** | `section-factura` | Emisión y previsualización de talonarios oficiales (Original + Copia) con marcado de módulos I al VII, concepto oficial e impresión en PDF. |
| **Padrón de Estudiantes** | `section-estudiantes` | Control de 213 estudiantes matriculados en 13 carreras técnicas, vistas Tarjetas/Tabla y **botón directo para imprimir boleta con datos ya guardados**. |
| **Sección Pendiente** | `filtro: pendiente` | Vista destacada en amarillo para estudiantes con saldos fraccionados, cuotas por completar o trámites pendientes. |
| **Control de Deudores** | `section-deudores` | Seguimiento de saldos por cobrar, estados de periodo (En Plazo, Próximo, Vencido) y tabla de costos oficiales por módulo. |
| **Control de Pagos (Mes a Mes)** | `section-control-pagos`| Matriz anual oficial sincronizada con Excel (Marzo a Diciembre) y exportación a PDF para auditorías de UGEL. |
| **Gestión de Docentes** | `section-docentes` | Control de honorarios devengados, horas lectivas y recaudación generada por sección. |
| **Caja Chica y Diario** | `section-caja` / `diario` | Arqueo diario de caja institucional con selector de fechas y bitácora de notas. |
| **Centro de Respaldos BD** | `section-respaldos` | Generación de copias de seguridad en paquetes `.zip` y validación de hash criptográfico SHA-256. |

---

## 🛠️ Tecnologías y Arquitectura

EduCaja Pro implementa una arquitectura desacoplada de alto rendimiento, libre de dependencias pesadas en la nube:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (SPA REACTIVA)                         │
│  HTML5 Semántico · Tailwind CSS 3 · Modo Oscuro Obsidian · Chart.js   │
│  html2pdf.js · html2canvas · FontAwesome 6 Pro · Logos Base64 HD       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Peticiones HTTP / JSON REST
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    BACKEND (MOTOR DE CAJA NODE.JS)                     │
│  server.js (Express.js) · Controladores REST · Middleware de Seguridad │
│  Consultas Parametrizadas · Prevención Path Traversal · Snapshots      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼─────────────┐    ┌─────────────▼───────────────────┐
│     SQLITE3 (RELACIONAL ACID)   │    │     SHEETJS (EXCEL MAESTRO)     │
│  caja_institucional.db (192 KB) │◄──►│  CEPRO_Control_MICAELA_...xlsx  │
│  241 Comprobantes Conciliados   │    │  12 Hojas Oficiales Minedu      │
│  213 Estudiantes Registrados    │    │  Sincronización Bidireccional   │
└─────────────────────────────────┘    └─────────────────────────────────┘
```

### Componentes y Motores Integrados

| Motor / Subsistema | Tecnología | Función Específica |
| :--- | :--- | :--- |
| **Engine de Base de Datos** | `SQLite3` (`better-sqlite3`) | Almacenamiento transaccional ACID local. Cero latencia en consultas y 0 violaciones de claves foráneas. |
| **Engine de Conciliación** | `SheetJS` (`xlsx`) | Escribe automáticamente en las hojas `RESUMEN`, `CAJA_DIARIO`, `ESTUDIANTES`, `DOCENTES`, `SECCIONES`, etc. |
| **Engine de Boletas PDF** | `html2pdf.js` & `html2canvas` | Calibración micrométrica a 8.10 pulgadas de ancho. Encabezado a 3 columnas (`1.50in 1fr 1.20in`) sin desbordes. |
| **Incrustación de Gráficos HD** | `Base64 Data URIs` | Las insignias del Ministerio de Educación y del CETPRO están embebidas en Base64 para garantizar renderizado instantáneo en PDF. |
| **Suite de Ciberseguridad** | `Consultas Parametrizadas` | Blindaje total frente a ataques de inyección SQL y sanitización contra saltos de directorio. |

---

## 🏛️ Especialidades Técnicas Atendidas

El sistema gestiona integralmente las especialidades reglamentarias del CETPRO:

1. **Computación e Informática:** Módulo I (Ofimática) · Módulo II (Diseño Gráfico y Plataformas Digitales).
2. **Confección Textil:** Módulo I (Técnicas de Trazado, Tendido y Corte) · Módulo II (Técnicas de Confección).
3. **Cosmetología / Peluquería y Barbería:** Módulo I (Corte de Cabello y Barbas) · Módulo II (Ondulación, Decoloración y Tinturación).
4. **Mecánica Automotriz:** Módulo I (Suspensión, Dirección, Frenos y Transmisión) · Módulo II (Motores de Combustión Interna).
5. **Mecánica de Motos y Vehículos Afines:** Módulo I (Sistemas Eléctricos y Mecánicos) · Módulo II (Conversión GNV-GLP).
6. **Mantenimiento de Sistemas Eléctricos:** Módulo I (Sistemas Eléctricos en Edificaciones) · Módulo II (Seguridad en Domótica).
7. **Carpintería Metálica:** Módulo I (Soldadura por Arco Eléctrico) · Módulo II (Soldadura TIG-MIG-MAG-Láser).
8. **Manualidades, Artesanía y Construcciones.**

---

## 🧪 Verificación y Orquestador

El proyecto cuenta con un orquestador de pruebas continuo ([orchestrate.js](orchestrate.js)) que audita 7 fases antes de certificar la operatividad del sistema:

```bash
node orchestrate.js
```

```text
========================================================================
  🚀 ORQUESTADOR MAESTRO DEL PROYECTO - CETPRO SAN MIGUEL EDUCAJA PRO 
  Control Institucional: Micaela Bastidas Puyucama - San Román / Juliaca
========================================================================

--- FASE 1: ENTORNO DE EJECUCIÓN Y MOTOR DE SISTEMA (Node.js, RAM, Archivos Clave)  -> ✔ PASS
--- FASE 2: ORQUESTACIÓN DE BASE DE DATOS SQLITE (B-Tree, Foreign Keys, 241 Pagos)  -> ✔ PASS
--- FASE 3: SINCRONIZACIÓN EXCEL OFICIAL (12 Hojas, Reconciliación Bidireccional)    -> ✔ PASS
--- FASE 4: RESPALDOS Y CRIPTOGRAFÍA (346 Snapshots, Hash SHA-256 Verificado)       -> ✔ PASS
--- FASE 5: SERVICIOS DE RED Y APIS EN VIVO (13 Endpoints HTTP 200, Latencia 12ms)  -> ✔ PASS
--- FASE 6: INTERFAZ DE USUARIO Y DOM (DOM Balanceado, Boleta PDF, Base64 HD)       -> ✔ PASS
--- FASE 7: SEGURIDAD Y CONCURRENCIA (Protección SQLi, Path Traversal, 30 Req/s)    -> ✔ PASS

========================================================================
  📊 RESUMEN FINAL: 63 / 63 COMPONENTES SUPERADOS (100.0%)
========================================================================
```

---

## 📁 Estructura del Repositorio

```text
├── server.js                          # Servidor principal Node.js con APIs REST y sincronización
├── package.json                       # Dependencias del proyecto (express, better-sqlite3, xlsx)
├── caja_institucional.db              # Base de datos SQLite (241 movimientos, 213 estudiantes)
├── CEPRO_Control_MICAELA_BASTIDAS...  # Libro Excel de 12 hojas institucionales sincronizadas
├── orchestrate.js                     # Orquestador con 63 pruebas automáticas
├── INICIAR_SISTEMA.bat                # Lanzador de un clic para Windows
├── templates/
│   └── index.html                     # Frontend Single Page Application (13 secciones aisladas)
├── public/
│   ├── html2pdf.bundle.min.js         # Librería offline para generación de PDF
│   └── img/                           # Logotipos oficiales del MINEDU y CETPRO
└── tests/                             # Suites automatizadas de pruebas de caja negra y blanca
```

---

## 🤝 Contribuciones y Desarrollo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/miguelmorenosucasaire-design/caja-pro.git
   ```
2. Instala las dependencias:
   ```bash
   cd caja-pro
   npm install
   ```
3. Ejecuta el orquestador para verificar que tu entorno esté 100% sano:
   ```bash
   node orchestrate.js
   ```

---

## 🏛️ Institución y Créditos

- **Institución:** Centro de Educación Técnico Productiva Público "Micaela Bastidas Puyucawa"
- **Ubicación:** San Román / Juliaca, Puno — Perú
- **UGEL:** Unidad de Gestión Educativa Local San Román
- **Desarrollo y Diseño:** Miguel Moreno ([@miguelmorenosucasaire-design](https://github.com/miguelmorenosucasaire-design))

---

## 📄 Licencia

Este proyecto está bajo la Licencia **Apache 2.0** / Licencia Institucional Educativa. Consulta el archivo [LICENSE](LICENSE) para más detalles.
