const XLSX = require('xlsx');
const fs = require('fs');
const popFilePath = 'Poblacion municipio edad simple y sexo Mexico 2026 CENJSIA EGM.xlsx';
const wb = XLSX.readFile(popFilePath);
const sheet = wb.Sheets['Durango']; 
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

let ageStartRow = -1;
for (let i = 0; i < data.length; i++) {
  if (Array.isArray(data[i]) && data[i].includes('Edad')) { ageStartRow = i; break; }
}

const headers = data[ageStartRow];
const durangoIdx = headers.indexOf('Durango'); 
const muniNames = headers.slice(1).filter(n => n && String(n).trim() !== '' && !String(n).includes('Poblacion Total'));

const muniRanges = { '6 a 11 Meses': 0, '1 Año': 0, '18 Meses': 0, 'Rezag 2-12 Años': 0, '13-19 Años': 0, '20-39 Años': 0, '40-49 Años': 0 };
const stateRanges = { '6 a 11 Meses': 0, '1 Año': 0, '18 Meses': 0, 'Rezag 2-12 Años': 0, '13-19 Años': 0, '20-39 Años': 0, '40-49 Años': 0 };

for (let i = ageStartRow + 1; i < data.length; i++) {
  const row = data[i];
  if (row[0] === undefined || row[0] === null || isNaN(parseInt(row[0]))) continue;
  const age = parseInt(row[0]);
  if (age > 49) continue;
  
  const muniVal = parseInt(row[durangoIdx]) || 0;
  
  let stateVal = 0;
  muniNames.forEach((m, idx) => {
     stateVal += parseInt(row[idx + 1]) || 0;
  });
  
  const add = (ranges, val) => {
    if (age === 0) ranges['6 a 11 Meses'] += val;
    if (age === 1) { ranges['1 Año'] += val; ranges['18 Meses'] += val; }
    if (age >= 2 && age <= 12) ranges['Rezag 2-12 Años'] += val;
    if (age >= 13 && age <= 19) ranges['13-19 Años'] += val;
    if (age >= 20 && age <= 39) ranges['20-39 Años'] += val;
    if (age >= 40 && age <= 49) ranges['40-49 Años'] += val;
  };
  
  add(muniRanges, muniVal);
  add(stateRanges, stateVal);
}

fs.writeFileSync('check_durango.json', JSON.stringify({ state: stateRanges, muni: muniRanges }, null, 2));
