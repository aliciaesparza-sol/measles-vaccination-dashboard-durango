const XLSX = require('xlsx');
const fs = require('fs');

const reqFilePath = 'Vacunacion_SRP_SR_Cubos_Enero-Mayo_2025.xlsx';
const wb = XLSX.readFile(reqFilePath);
const sheet = wb.Sheets[wb.SheetNames[0]];

const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
let out = '';
out += 'Sheet: ' + wb.SheetNames[0] + '\n';
for (let i = 0; i < Math.min(20, data.length); i++) {
  out += `Row ${i}: ${JSON.stringify(data[i].slice(0, 15))}\n`;
}
fs.writeFileSync('inspect_cubos.txt', out);
console.log('Inspection complete.');
