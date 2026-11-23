# 🏫 EduCaja Pro · CETPRO San Miguel
### Sistema Integral de Gestión de Caja, Control Escolar y Emisión de Comprobantes Oficiales
**Institución Educativa:** CETPRO Público *"Micaela Bastidas Puyucawa"* — San Román / Juliaca, Puno - Perú.

---

[![Node.js](https://img.shields.io/badge/Node.js-v18%20%7C%20v20%20%7C%20v24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend%20REST-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite3](https://img.shields.io/badge/SQLite3-Embedded%20DB-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![SheetJS](https://img.shields.io/badge/SheetJS-Excel%20Sync%20Bidireccional-217346?logo=microsoft-excel&logoColor=white)](https://sheetjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Orquestación](https://img.shields.io/badge/Orquestador-63%2F63%20Tests%20Passing%20(100%25)-brightgreen)](orchestrate.js)
[![Licencia](https://img.shields.io/badge/Licencia-Educativa%20Institucional-blue)]()

---

## 📌 Descripción General

**EduCaja Pro** es una plataforma tecnológica institucional desarrollada para modernizar, automatizar y asegurar el control de recursos propios, cobranza de matrículas y aportes de mantenimiento, registro de estudiantes y emisión de boletas de pago para el **CETPRO San Miguel (Micaela Bastidas Puyucawa)**.

El sistema fue concebido bajo el principio de **cero fricción operativa**: opera completamente offline en la red interna del instituto, sincroniza cada transacción en tiempo real contra un **Libro Excel Oficial de 12 hojas** y una **Base de Datos SQLite relacional**, permitiendo la emisión e impresión de boletas en formato talonario oficial reglamentario (Original Color + Copia Azul) con membretes vectoriales del **Ministerio de Educación (MINEDU)** y la **UGEL San Román**.

---

## 💻 Tecnologías y Lenguajes Implementados

El proyecto fue construido combinando tecnologías modernas de alto rendimiento en el backend con una interfaz web pura y ultra-optimizada en el frontend:

| Capa / Subsistema | Tecnologías Empleadas | Propósito y Función |
| :--- | :--- | :--- |
| **Backend & Runtime** | `JavaScript (ES2024)`, `Node.js` (v18 - v24) | Motor de ejecución del servidor, controladores HTTP, middleware de seguridad y concurrencia. |
| **Servidor Web & API** | `Express.js`, `RESTful JSON API` | Enrutamiento de endpoints para movimientos, estudiantes, docentes, deudores, caja chica y arqueos. |
| **Persistencia Relacional** | `SQLite3` (`better-sqlite3`) | Motor de base de datos embebido ACID, transaccional, con claves foráneas e integridad referencial garantizada. |
| **Motor de Conciliación Excel** | `SheetJS` (`xlsx`), `Node FileSystem` | Sincronización bidireccional automática en segundo plano: cada movimiento o abono se escribe en SQLite y en el libro `.xlsx`. |
| **Frontend & UI/UX** | `HTML5 Semántico`, `Tailwind CSS 3`, `CSS3 Grid/Flexbox` | Interfaz Single-Page Application (SPA) con 13 secciones aisladas, diseño responsivo, soporte nativo de **Modo Oscuro Obsidian** y **Modo Claro**. |
| **Visualización Gráfica** | `Chart.js`, `HTML5 Canvas` | Gráficos dinámicos interactivos para la evolución financiera mensual de ingresos versus gastos y flujos por docente. |
| **Motor de Boletas & PDF** | `html2pdf.js`, `html2canvas`, `jsPDF`, `Base64 Data URIs` | Renderizado e impresión fiel de talonarios oficiales (Original + Copia) ajustados a formato media carta (1 página estricta) con membretes incrustados en Base64 sin dependencia de red. |
| **Seguridad & Respaldo** | `Criptografía Node.js (SHA-256)`, `Consultas Parametrizadas` | Blindaje total contra Inyección SQL, protección contra Path Traversal y snapshots de base de datos automáticos fechados. |
| **Pruebas y Orquestación** | `Node.js VM`, `Unit & Integration Test Runners` | Suite propia de pruebas exhaustivas (`orchestrate.js`) con 63 comprobaciones en 7 fases consecutivas. |

---

## 🗂️ Estructura del Proyecto

```text
caja-chica/
│
├── server.js                          # Servidor principal Node.js / Express con todas las rutas y lógica contable
├── package.json                       # Configuración del paquete, dependencias y scripts de ejecución
├── caja_institucional.db              # Base de datos relacional SQLite oficial (241 movimientos, 213 alumnos)
├── CEPRO_Control_MICAELA_BASTIDAS...  # Libro Excel Maestro institucional sincronizado (12 hojas oficiales)
├── orchestrate.js                     # Orquestador maestro integral (63 pruebas automatizadas de extremo a extremo)
├── INICIAR_SISTEMA.bat                # Lanzador Windows para arranque con doble clic
├── INICIAR_SISTEMA_CETPRO.bat         # Lanzador alternativo con verificación de entorno
├── .gitignore                         # Reglas de exclusión de archivos temporales y dependencias
│
├── templates/
│   └── index.html                     # Frontend SPA completo (Dashboard, Boletas, Estudiantes, Deudores, etc.)
│
├── public/
│   ├── html2pdf.bundle.min.js         # Librería offline para generación local de documentos PDF
│   └── img/
│       ├── minedu_barras.png          # Logotipo institucional del Ministerio de Educación (Base64 HD)
│       ├── minedu_barras_azul.png     # Logotipo para copia azul del comprobante
│       ├── escudo_cetpro_vector.svg   # Escudo oficial de CETPRO San Miguel
│       └── logo_institucion.jpg       # Insignia institucional
│
├── tests/                             # Suites automatizadas de pruebas unitarias y de integración
│   ├── test_dom_sections_integrity.js # Verificación de integridad estructural del DOM y secciones HTML
│   ├── test_estudiante_jalar_boleta.js# Prueba de jalado automático de datos a la boleta oficial
│   ├── test_pdf_export_perfection.js  # Validación de exportación a PDF a página única sin recortes
│   ├── test_live_api.js               # Comprobación de endpoints REST y respuestas HTTP
│   └── test_cybersecurity_defenses.js # Pruebas de inyección SQL y contención de salto de directorio
│
└── backups/                           # Repositorio de copias de seguridad de la base de datos con hashes SHA-256
```

---

## 🚀 Módulos Funcionales

1. **📊 Panel General (Dashboard Directivo):**
   - Resumen financiero de Saldo Total, Ingresos Acumulados, Egresos y Saldos por Cobrar.
   - Gráfico anual comparativo interactivo de ingresos versus gastos.
   - Monitor de Salud del Sistema en tiempo real (estado de SQLite, Excel y respaldos).

2. **🧾 Emisor de Boletas de Ingreso (Talonario Oficial Dual):**
   - Generación simultánea de **Original a Color (Administración)** y **Copia Azul (Estudiante)**.
   - Checkboxes interactivos automáticos para *Módulo I, II, III, IV*, *Constancia*, *FUT* y *Línea 4.- Otros*.
   - Botón directo de guardado e impresión instantánea y descarga en PDF sin pérdida de nitidez.

3. **👨‍🎓 Padrón Oficial de Estudiantes:**
   - Lista completa de 213 estudiantes matriculados en las 13 especialidades técnicas.
   - Vistas duales intercambiables: **Tarjetas (`Grid`)** y **Tabla Detallada (`Table`)**.
   - Sección especial destacada en amarillo: **Estudiantes con Pagos o Trámites Pendientes**.
   - Acciones directas: Asignar Carrera, Registrar Abonos y **Botón Imprimir Boleta Oficial** que extrae automáticamente el comprobante guardado.

4. **⏳ Control de Vencimientos y Deudores:**
   - Gestión precisa de estudiantes con cuotas fraccionadas o saldos pendientes.
   - Tabla oficial de **Costos y Tarifas por Módulo y Carrera Técnica**.

5. **👨‍🏫 Gestión de Docentes y Honorarios:**
   - Control de honorarios devengados y recaudación generada por las secciones de cada docente.

6. **📅 Matriz Anual de Pagos (Mes a Mes):**
   - Cuadrícula institucional de aportes mensuales (Marzo a Diciembre) sincronizada con Excel y exportable a PDF con un solo clic.

7. **🛡️ Centro Criptográfico de Respaldos:**
   - Generación de respaldos descargables en ZIP y verificación de integridad mediante hashes criptográficos **SHA-256**.

---

## 🛠️ Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18.0.0 o superior (recomendado v20+ o v24+).
- Navegador web moderno (Chrome, Edge, Firefox, Brave, Safari).

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/miguelmorenosucasaire-design/caja-pro.git
   cd caja-pro
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   *(O simplemente haz doble clic en `INICIAR_SISTEMA.bat` en Windows).*

4. **Abrir en el navegador:**
   - Acceso local: `http://localhost:5000` o `http://127.0.0.1:5000`
   - Acceso en red local / WiFi: `http://<IP_LOCAL>:5000`

---

## 🧪 Verificación y Orquestación de Pruebas

Para comprobar la integridad de todos los subsistemas del proyecto (base de datos, endpoints REST, sincronización de Excel, DOM del frontend y seguridad), ejecuta el orquestador:

```bash
node orchestrate.js
```

**Resultado de la suite de pruebas:**
```text
========================================================================
  📊 RESUMEN FINAL DE LA ORQUESTACIÓN: 63 / 63 COMPONENTES SUPERADOS (100.0%)
  ⏱ Tiempo de Ejecución Total: 0.42 segundos
========================================================================
  🎉 ¡ORQUESTACIÓN COMPLETADA CON ÉXITO ABSOLUTO!
  ✔ Todos los subsistemas del proyecto se encuentran sincronizados, seguros y operativos.
```

---

## 🏛️ Especialidades Técnicas Atendidas
- Computación e Informática (Ofimática / Diseño Gráfico y Plataformas Digitales)
- Confección Textil (Corte y Ensamblaje / Confección de Prendas de Vestir)
- Cosmetología y Peluquería (Corte de Cabello / Barbería / Tinturación)
- Mecánica Automotriz (Sistemas de Suspensión, Frenos, Transmisión y Motores)
- Mecánica de Motos y Vehículos Afines
- Electricidad y Mantenimiento de Sistemas Eléctricos
- Carpintería Metálica y Soldadura (Arco Eléctrico / TIG-MIG-MAG)
- Artesanías, Manualidades y Construcciones

---

## 📄 Licencia y Derechos

Desarrollado para el **CETPRO Público Micaela Bastidas Puyucawa - San Miguel**. Todos los derechos reservados.
