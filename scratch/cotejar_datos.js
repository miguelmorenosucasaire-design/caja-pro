const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');

const json = JSON.parse(fs.readFileSync('scratch/real_data/19-NOV-2026_INGRESO_RECURSOS_PROPIOS.json', 'utf8'));
const db = new DatabaseSync('caja_institucional.db');

console.log('=== COTEJO EXHAUSTIVO DE DATOS REALES VS SISTEMA ===\n');
console.log('Total registros en archivo real JSON:', json.length);

const dbMovs = db.prepare('SELECT * FROM movimientos').all();
console.log('Total movimientos actuales en DB:', dbMovs.length);

const mapDbByComp = new Map();
dbMovs.forEach(m => {
  const n = parseInt(m.comprobante, 10);
  if (!isNaN(n)) mapDbByComp.set(n, m);
});

// Programas de estudio en JSON
const programasJson = new Set();
const modulosJson = new Set();
const turnosJson = new Set();

json.forEach(j => {
  if (j.programa_estudio) programasJson.add(j.programa_estudio.trim());
  if (j.modulo) modulosJson.add(j.modulo.trim());
  if (j.turno) turnosJson.add(j.turno.trim());
});

console.log('Programas de estudio en JSON:', Array.from(programasJson));
console.log('Módulos en JSON:', Array.from(modulosJson));
console.log('Turnos en JSON:', Array.from(turnosJson));

// Carreras existentes en DB
const dbCarreras = db.prepare('SELECT * FROM carreras').all();
console.log('\nCarreras en DB:', dbCarreras.map(c => c.nombre));

// Grupos existentes en DB
const dbGrupos = db.prepare('SELECT * FROM grupos').all();
console.log('\nGrupos en DB:', dbGrupos.map(g => g.nombre));

// Docentes existentes en DB
const dbDocentes = db.prepare('SELECT * FROM docentes').all();
console.log('\nDocentes en DB:', dbDocentes.map(d => d.nombre));

db.close();
