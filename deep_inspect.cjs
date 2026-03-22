const XLSX = require('xlsx');
const fs = require('fs');

const file = 'COBERTURA_SARAMPION_POR_MUNICIPIO_2026_18marzo2026.xlsx';
const wb = XLSX.readFile(file);

let out = '';
wb.SheetNames.forEach(s => {
  const ws = wb.Sheets[s];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  out += `\n=== SHEET: ${s} ===\n`;
  for(let i=0; i<Math.min(10, data.length); i++) {
    out += `Row ${i}: ${JSON.stringify(data[i].slice(0,10))}\n`;
  }
});

fs.writeFileSync('deep_inspect.txt', out);
console.log('Done');
