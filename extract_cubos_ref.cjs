const XLSX = require('xlsx');
const fs = require('fs');

const refFile = 'c:\\Users\\aicil\\OneDrive\\Escritorio\\PVU\\SARAMPIÓN\\COBERTURA POR MUNICIPIO Y SEMANA EPIDEMIOLÒGICA\\COBERTURA_SARAMPION_POR_MUNICIPIO_CORTE18MARZO2026.xlsx';
const wb = XLSX.readFile(refFile);

const sheets = [
  { name: '6-11 Meses', tsName: '6-11 Meses' },
  { name: '1 Año', tsName: '1 Año' },
  { name: '18 Meses', tsName: '18 Meses' },
  { name: 'Rezag 2-12 Años', tsName: 'Rezag 2-12 Años' },
  { name: '13-19 Años', tsName: '13-19 Años' },
  { name: '20-39 Años', tsName: '20-39 Años' },
  { name: '40-49 Años', tsName: '40-49 Años' }
];

const cubosByMuni = {};

sheets.forEach(s => {
  const ws = wb.Sheets[s.name];
  if(!ws) return;
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  // Find header row
  let headerRow = -1;
  for(let i=0; i<data.length; i++) {
    if(data[i].includes('Municipio')) { headerRow = i; break; }
  }
  if(headerRow === -1) return;
  
  const headers = data[headerRow];
  const muniIdx = headers.indexOf('Municipio');
  const cubosIdx = headers.findIndex(h => typeof h === 'string' && h.includes('Cubos'));
  
  if(cubosIdx === -1 || muniIdx === -1) return;
  
  for(let i=headerRow+1; i<data.length; i++) {
    const row = data[i];
    if(!row || !row[muniIdx]) continue;
    const muni = String(row[muniIdx]).trim();
    if(muni === 'Durango' || muni === 'Gómez Palacio' || muni === 'Lerdo' || muni === 'Canatlán' || muni.length > 3) {
      if(!cubosByMuni[muni]) cubosByMuni[muni] = {};
      const valText = String(row[cubosIdx]).replace(/,/g, '');
      cubosByMuni[muni][s.tsName] = parseInt(valText) || 0;
    }
  }
});

let tsContent = `// Archivo generado estáticamente extrayendo la distribución de Cubos por municipio
// de la referencia oficial. El archivo original Vacunacion_SRP_SR_Cubos... solo tenía totales estatales.

export const cubosByMuni: Record<string, Record<string, number>> = ${JSON.stringify(cubosByMuni, null, 2)};

export const cubosTotals = {
  '1 Año': 4727,
  '18 Meses': 4001,
  '6y': 7365
};
`;

fs.writeFileSync('src/data/historicDoses.ts', tsContent);
console.log('historicDoses.ts actualizado con distribución municipal!');
