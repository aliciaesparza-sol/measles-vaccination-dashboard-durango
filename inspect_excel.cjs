const XLSX = require('xlsx');
const popFilePath = 'Poblacion municipio edad simple y sexo Mexico 2026 CENJSIA EGM.xlsx';
const wb = XLSX.readFile(popFilePath);
const sheet = wb.Sheets['Durango'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
for (let i = 0; i < data.length; i++) {
  if (data[i][0] === 'Hombres' || data[i][0] === 'Mujeres' || data[i][0] === 'Total') {
    console.log(`Row ${i}: ${data[i][0]}`);
  }
}
