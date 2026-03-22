const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
const text = fs.readFileSync(path.join(dataDir, csvFiles[0]), 'latin1');
const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

const parseLine = (line) => {
  const result = [];
  let cur = '', inQ = false;
  for(const c of line) {
    if(c === '"') inQ = !inQ;
    else if(c === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  result.push(cur.trim());
  return result;
};

const headers = parseLine(lines[0]);
const muniIdx = headers.indexOf('MUNICIPIO');
const fechaIdx = headers.indexOf('Fecha de registro');
const anioIdx = headers.indexOf('SRP 1 ANIO  PRIMERA');

const csvMunis = new Set();
for(let i=1; i<lines.length; i++) {
  const vals = parseLine(lines[i]);
  const m = vals[muniIdx];
  if(m) csvMunis.add(m.trim());
}

const popMunis = ["Canatlán","Canelas","Coneto de Comonfort","Cuencamé","Durango","El Oro",
  "General Simón Bolívar","Gómez Palacio","Guadalupe Victoria","Guanaceví","Hidalgo",
  "Indé","Lerdo","Mapimí","Mezquital","Nazas","Nombre de Dios","Nuevo Ideal","Ocampo",
  "Otáez","Pánuco de Coronado","Peñón Blanco","Poanas","Pueblo Nuevo","Rodeo",
  "San Bernardo","San Dimas","San Juan de Guadalupe","San Juan del Río",
  "San Luis del Cordero","San Pedro del Gallo","Santa Clara","Santiago Papasquiaro",
  "Súchil","Tamazula","Tepehuanes","Tlahualilo","Topia","Vicente Guerrero"];

const normalize = s => s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const normPop = {};
popMunis.forEach(m => normPop[normalize(m)] = m);

let out = '';
out += '=== UNMATCHED ===\n';
const sorted = [...csvMunis].sort();
sorted.forEach(csvM => {
  if(!normPop[normalize(csvM)]) out += `UNMATCHED: "${csvM}" => normalized: "${normalize(csvM)}"\n`;
});
out += '\n=== MATCHED ===\n';
sorted.forEach(csvM => {
  if(normPop[normalize(csvM)]) out += `OK: "${csvM}" => "${normPop[normalize(csvM)]}"\n`;
});

// Also: compute Canatlán Total
let cantDoses = 0;
for(let i=1; i<lines.length; i++) {
  const vals = parseLine(lines[i]);
  const m = (vals[muniIdx]||'').trim();
  if(normalize(m) !== normalize('Canatlán')) continue;
  cantDoses += parseInt(vals[anioIdx]) || 0;
}
out += `\nCanatlán 1 Año SRP dosis: ${cantDoses}\n`;

fs.writeFileSync('debug_munis.txt', out);
console.log('Done');
