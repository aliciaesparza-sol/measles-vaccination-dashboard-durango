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

const normalize = s => s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9 ]/g, "").trim();

const MAPPING = {
  'PEAON BLANCO': 'Peñón Blanco', 'PENON BLANCO': 'Peñón Blanco', 'PEON BLANCO': 'Peñón Blanco',
  'ORO EL': 'El Oro', 'EL ORO': 'El Oro',
  'PUEBLO NUEVO DGO': 'Pueblo Nuevo', 'HIDALGO DGO': 'Hidalgo',
  'GUADALUPE VICTORIA DGO': 'Guadalupe Victoria', 'OCAMPO DGO': 'Ocampo',
  'SAN JUAN DEL RIO DGO': 'San Juan del Río', 'DURANGO DGO': 'Durango',
  'PUEBLO NUEVO': 'Pueblo Nuevo', 'HIDALGO': 'Hidalgo',
  'GUADALUPE VICTORIA': 'Guadalupe Victoria', 'OCAMPO': 'Ocampo',
  'SAN JUAN DEL RIO': 'San Juan del Río',
};

const popMunis = ["Canatlán","Canelas","Coneto de Comonfort","Cuencamé","Durango","El Oro",
  "General Simón Bolívar","Gómez Palacio","Guadalupe Victoria","Guanaceví","Hidalgo",
  "Indé","Lerdo","Mapimí","Mezquital","Nazas","Nombre de Dios","Nuevo Ideal","Ocampo",
  "Otáez","Pánuco de Coronado","Peñón Blanco","Poanas","Pueblo Nuevo","Rodeo","San Bernardo",
  "San Dimas","San Juan de Guadalupe","San Juan del Río","San Luis del Cordero","San Pedro del Gallo",
  "Santa Clara","Santiago Papasquiaro","Súchil","Tamazula","Tepehuanes","Tlahualilo","Topia","Vicente Guerrero"];

const normPop = {};
popMunis.forEach(m => normPop[normalize(m)] = m);

// doseMap[muni][sheet][year] = total
const doseMap = {};
popMunis.forEach(m => {
  doseMap[m] = {
    '6-11 Meses': { y25: 0, y26: 0 },
    '1 Año': { y25: 0, y26: 0 },
    '18 Meses': { y25: 0, y26: 0 },
    'Rezag 2-12 Años': { y25: 0, y26: 0 },
    '13-19 Años': { y25: 0, y26: 0 },
    '20-39 Años': { y25: 0, y26: 0 },
    '40-49 Años': { y25: 0, y26: 0 },
  };
});

const val = (vals, col) => parseInt(vals[headers.indexOf(col)]) || 0;
let matched = 0, unmatched = new Set();

for(let i=1; i<lines.length; i++) {
  const vals = parseLine(lines[i]);
  const rawMuni = (vals[muniIdx]||'').trim();
  if(!rawMuni) continue;

  const matchedMuni = MAPPING[normalize(rawMuni)] || normPop[normalize(rawMuni)];
  if(!matchedMuni) { unmatched.add(rawMuni); continue; }
  matched++;

  const fechaRaw = (vals[fechaIdx]||'').trim();
  const is2026 = fechaRaw.includes('2026') || fechaRaw.includes('/26');
  const yKey = is2026 ? 'y26' : 'y25';

  const d = doseMap[matchedMuni];
  const sumCols = (cList) => cList.reduce((acc, c) => acc + val(vals, c), 0);

  d['6-11 Meses'][yKey] += sumCols([
    'SRP 6 A 11 MESES PRIMERA', 'SR 6 A 11 MESES PRIMERA'
  ]);
  
  d['1 Año'][yKey] += sumCols([
    'SRP 1 ANIO  PRIMERA', 'SR 1 ANIO PRIMERA'
  ]);
  
  d['18 Meses'][yKey] += sumCols([
    'SRP 18 MESES SEGUNDA', 'SR 18 MESES SEGUNDA'
  ]);
  
  d['Rezag 2-12 Años'][yKey] += sumCols([
    'SRP 2 A 5 ANIOS PRIMERA', 'SRP 2 A 5 ANIOS SEGUNDA',
    'SRP 6 ANIOS PRIMERA', 'SRP 6 ANIOS SEGUNDA',
    'SRP 7 A 9 ANIOS PRIMERA', 'SRP 7 A 9 ANIOS SEGUNDA',
    'SRP 10 A 12 ANIOS PRIMERA', 'SRP 10 A 12 ANIOS SEGUNDA',
    'SR 2 A 5 ANIOS PRIMERA', 'SR 2 A 5 ANIOS SEGUNDA',
    'SR 6 ANIOS PRIMERA', 'SR 6 ANIOS SEGUNDA',
    'SR 7 A 9 ANIOS PRIMERA', 'SR 7 A 9 ANIOS SEGUNDA',
    'SR 10 A 12 ANIOS PRIMERA', 'SR 10 A 12 ANIOS SEGUNDA'
  ]);
  
  d['13-19 Años'][yKey] += sumCols([
    'SRP 13 A 19 ANIOS PRIMERA', 'SRP 13 A 19 ANIOS SEGUNDA',
    'SRP 10 A 19 ANIOS PRIMERA', 'SRP 10 A 19 ANIOS SEGUNDA',
    'SR 13 A 19 ANIOS PRIMERA', 'SR 13 A 19 ANIOS SEGUNDA',
    'SR 10 A 19 ANIOS PRIMERA', 'SR 10 A 19 ANIOS SEGUNDA'
  ]);
  
  d['20-39 Años'][yKey] += sumCols([
    'SRP 20 A 29 ANIOS PRIMERA', 'SRP 20 A 29 ANIOS SEGUNDA',
    'SRP 30 A 39 ANIOS PRIMERA', 'SRP 30 A 39 ANIOS SEGUNDA',
    'SR 20 A 29 ANIOS PRIMERA', 'SR 20 A 29 ANIOS SEGUNDA',
    'SR 30 A 39 ANIOS PRIMERA', 'SR 30 A 39 ANIOS SEGUNDA',
    // Incluir personal institucional y jornaleros en este grupo (el más grande adulto)
    'SRP PERSONAL DE SALUD PRIMERA', 'SRP  PERSONAL DE SALUD SEGUNDA',
    'SRP PERSONAL EDUCATIVO PRIMERA', 'SRP  PERSONAL EDUCATIVO SEGUNDA',
    'SRP JORNALEROS AGRICOLAS PRIMERA', 'SRP JORNALEROS AGRICOLAS SEGUNDA',
    'SR PERSONAL DE SALUD PRIMERA', 'SR PERSONAL DE SALUD SEGUNDA',
    'SR PERSONAL EDUCATIVO PRIMERA', 'SR PERSONAL EDUCATIVO SEGUNDA',
    'SR JORNALEROS AGRICOLAS PRIMERA', 'SR JORNALEROS AGRICOLAS SEGUNDA'
  ]);
  
  d['40-49 Años'][yKey] += sumCols([
    'SRP 40 A 49 ANIOS PRIMERA', 'SRP 40 A 49 ANIOS SEGUNDA',
    'SR 40 A 49 ANIOS PRIMERA', 'SR 40 A 49 ANIOS SEGUNDA'
  ]);
}

console.log('Matched:', matched, '| Unmatched:', [...unmatched].join(', '));

// Sample check
console.log('Canatlán 1 Año:', JSON.stringify(doseMap['Canatlán']['1 Año']));
console.log('Durango 20-39:', JSON.stringify(doseMap['Durango']['20-39 Años']));

const tsContent = `// Datos Nominales SISCENSIA pre-agregados por municipio y grupo de edad
// Corte: 21/03/2026 | Fuente: ${csvFiles[0]}
// NOTA: y25 = dosis aplicadas en 2025, y26 = dosis aplicadas en 2026

export const nominalData: Record<string, Record<string, { y25: number; y26: number }>> = ${JSON.stringify(doseMap, null, 2)};
`;

fs.writeFileSync('src/data/nominalData.ts', tsContent);
const size = Math.round(Buffer.byteLength(tsContent, 'utf8') / 1024);
console.log(`✓ nominalData.ts generado — ${size} KB`);
