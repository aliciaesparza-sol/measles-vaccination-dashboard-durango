const XLSX = require('xlsx');
const fs = require('fs');

const file = 'COBERTURA_SARAMPION_POR_MUNICIPIO_2026_18marzo2026.xlsx';
const wb = XLSX.readFile(file);

const sheets = ['6-11 Meses','1 Año','18 Meses','Rezag 2-12 Años','13-19 Años','20-39 Años','40-49 Años'];
const cubosByMuni = {};

sheets.forEach(s => {
  const ws = wb.Sheets[s];
  if(!ws) { console.log('No sheet:', s); return; }
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  // Find header row (contains 'Municipio')
  let headerRow = -1;
  for(let i=0; i<data.length; i++) {
    if(Array.isArray(data[i]) && data[i].some(h => String(h||'').includes('Municipio'))) { headerRow = i; break; }
  }
  if(headerRow === -1) { console.log('No header in', s); return; }
  
  const headers = data[headerRow];
  const muniIdx = headers.findIndex(h => String(h||'').includes('Municipio'));
  // "Dosis 2025" is the column index 4 per our inspection (header contains 'Dosis' and '2025')
  const cubosIdx = headers.findIndex(h => {
    const str = String(h||'').replace(/[\r\n]+/g, ' ');
    return str.includes('2025');
  });
  
  if(cubosIdx === -1) {
    console.log(`Sheet "${s}" no Dosis 2025 col. Headers:`, headers.map(h => String(h||'').replace(/\n/g,' ')).join(' | '));
    return;
  }
  
  console.log(`Sheet "${s}": cubosIdx=${cubosIdx}, header="${String(headers[cubosIdx]).replace(/\n/g,' ')}"`);
  
  for(let i=headerRow+1; i<data.length; i++) {
    const row = data[i];
    if(!row || !row[muniIdx]) continue;
    const muni = String(row[muniIdx]).trim();
    if(!muni || muni.length <= 2) continue;
    
    const valRaw = row[cubosIdx];
    const val = parseInt(String(valRaw).replace(/,/g, '')) || 0;
    
    if(!cubosByMuni[muni]) cubosByMuni[muni] = {};
    cubosByMuni[muni][s] = val;
  }
});

// Fill missing sheets with 0 for each muni
const allMunis = Object.keys(cubosByMuni);
allMunis.forEach(m => {
  sheets.forEach(s => {
    if(cubosByMuni[m][s] === undefined) cubosByMuni[m][s] = 0;
  });
});

// Sort municipios alphabetically  
const sorted = {};
allMunis.sort().forEach(m => sorted[m] = cubosByMuni[m]);

// Compute totals for 1Año, 18Meses, 6-11 Meses
let tot1anio = 0, tot18meses = 0, tot6meses = 0, totRezag = 0;
allMunis.forEach(m => {
  tot1anio += cubosByMuni[m]['1 Año'] || 0;
  tot18meses += cubosByMuni[m]['18 Meses'] || 0;
  tot6meses += cubosByMuni[m]['6-11 Meses'] || 0;
  totRezag += cubosByMuni[m]['Rezag 2-12 Años'] || 0;
});

console.log('\nTotales Cubos (Dosis 2025):');
console.log('  1 Año:', tot1anio, '| 18 Meses:', tot18meses, '| 6-11 Meses:', tot6meses, '| Rezag:', totRezag);

const tsContent = `// Cubos (Dosis 2025) por municipio — extraido de COBERTURA_SARAMPION_POR_MUNICIPIO_2026_18marzo2026.xlsx
// Columna "Dosis 2025" = dosis aplicadas Enero-Mayo 2025
// Generado: ${new Date().toISOString()}

export const cubosByMuni: Record<string, Record<string, number>> = ${JSON.stringify(sorted, null, 2)};

export const cubosTotals = {
  '1 Año': ${tot1anio},
  '18 Meses': ${tot18meses},
  '6y': ${totRezag}
};
`;

fs.writeFileSync('src/data/historicDoses.ts', tsContent);
console.log('\nhistoricDoses.ts actualizado!');
console.log('Municipios:', allMunis.length);
if(sorted['Canatlán']) console.log('Canatlán:', JSON.stringify(sorted['Canatlán']));

