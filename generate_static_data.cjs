const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dataDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const SHEETS = [
  'Resumen',
  '6 a 11 Meses',
  '1 Año',
  '18 Meses',
  'Rezagos 2-12 Años',
  '13 a 19 Años',
  '20 a 39 Años',
  '40 a 49 Años'
];

console.log('Generando population.ts...');
const popFilePath = path.join(process.cwd(), 'Poblacion municipio edad simple y sexo Mexico 2026 CENJSIA EGM.xlsx');
const popWb = XLSX.readFile(popFilePath);
const popSheet = popWb.Sheets['Durango'];
if (!popSheet) throw new Error("No se encontró la hoja 'Durango'");
const popData = XLSX.utils.sheet_to_json(popSheet, { header: 1 });

let ageStartRow = -1;
for (let i = 0; i < popData.length; i++) {
  if (Array.isArray(popData[i]) && popData[i].includes('Edad')) { ageStartRow = i; break; }
}

const muniNamesInPop = popData[ageStartRow].slice(1).filter(n => n && String(n).trim() !== '' && !String(n).includes('Poblacion Total'));

const universeMap = {};
muniNamesInPop.forEach(m => {
  universeMap[m] = {};
  SHEETS.forEach(s => universeMap[m][s] = 0);
  universeMap[m]['6 años'] = 0;
});

for (let i = ageStartRow + 1; i < popData.length; i++) {
  const row = popData[i];
  if (row[0] === undefined || row[0] === null || isNaN(parseInt(row[0]))) continue;
  const age = parseInt(row[0]);
  if (age > 49) continue;

  muniNamesInPop.forEach((m, idx) => {
    const val = parseInt(row[idx + 1]) || 0;
    if (age === 0) universeMap[m]['6 a 11 Meses'] += val;
    if (age === 1) { 
      universeMap[m]['1 Año'] += val; 
      universeMap[m]['18 Meses'] += val; 
    }
    if (age >= 2 && age <= 12) universeMap[m]['Rezagos 2-12 Años'] += val;
    if (age >= 13 && age <= 19) universeMap[m]['13 a 19 Años'] += val;
    if (age >= 20 && age <= 39) universeMap[m]['20 a 39 Años'] += val;
    if (age >= 40 && age <= 49) universeMap[m]['40 a 49 Años'] += val;
    if (age === 6) universeMap[m]['6 años'] += val;
  });
}

// Sumar resumen
muniNamesInPop.forEach(m => {
  let sum = 0;
  sum += universeMap[m]['6 a 11 Meses'];
  sum += universeMap[m]['1 Año'];
  sum += universeMap[m]['18 Meses'];
  sum += universeMap[m]['Rezagos 2-12 Años'];
  sum += universeMap[m]['13 a 19 Años'];
  sum += universeMap[m]['20 a 39 Años'];
  sum += universeMap[m]['40 a 49 Años'];
  universeMap[m]['Resumen'] = sum;
});

const popContent = `export const universeMap: { [muni: string]: { [sheet: string]: number } } = ${JSON.stringify(universeMap, null, 2)};\nexport const muniNamesInPop: string[] = ${JSON.stringify(muniNamesInPop, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, 'population.ts'), popContent, 'utf-8');
console.log('✓ population.ts generado');

console.log('Generando historicDoses.ts...');
const cubosFilePath = path.join(process.cwd(), 'Vacunacion_SRP_SR_Cubos_Enero-Mayo_2025.xlsx');
const cubosWb = XLSX.readFile(cubosFilePath);
const cubosSheet = cubosWb.Sheets[cubosWb.SheetNames[0]];
const cubosData = XLSX.utils.sheet_to_json(cubosSheet);

const cubosTotals = { '1 Año': 0, '18 Meses': 0, '6y': 0 };

cubosData.forEach((row) => {
  cubosTotals['1 Año'] += parseInt(row['VAC23 PRIMERA 12 MESES (Total)']) || 0;
  cubosTotals['18 Meses'] += parseInt(row['VTV01 SEGUNDA 18 MESES (Total)']) || 0;
  cubosTotals['6y'] += parseInt(row['VAC81 SEGUNDA 6 AÑOS (Total)']) || 0;
});

const cubosContent = `export const cubosTotals: { [sheet: string]: number } = ${JSON.stringify(cubosTotals, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, 'historicDoses.ts'), cubosContent, 'utf-8');
console.log('✓ historicDoses.ts generado');
