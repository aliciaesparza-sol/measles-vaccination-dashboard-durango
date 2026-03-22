const XLSX = require('xlsx');
const fs = require('fs');

const file = 'COBERTURA_SARAMPION_POR_MUNICIPIO_2026_18marzo2026.xlsx';
const wb = XLSX.readFile(file);

console.log('Sheets:', wb.SheetNames);

// Inspect first sheet rows to understand structure
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
let out = '';
for(let i=0; i<Math.min(15, data.length); i++) {
  out += `Row ${i}: ${JSON.stringify(data[i].slice(0,12))}\n`;
}
fs.writeFileSync('inspect_new_cubos.txt', out);
console.log('Done. Sheets:', wb.SheetNames.join(', '));
