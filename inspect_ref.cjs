const XLSX = require('xlsx');
const fs = require('fs');

try {
  const file = 'c:\\Users\\aicil\\OneDrive\\Escritorio\\PVU\\SARAMPIÓN\\COBERTURA POR MUNICIPIO Y SEMANA EPIDEMIOLÒGICA\\COBERTURA_SARAMPION_POR_MUNICIPIO_CORTE18MARZO2026.xlsx';
  const wb = XLSX.readFile(file);
  console.log('Sheet Names:', wb.SheetNames);
  
  let out = '';
  wb.SheetNames.forEach(sheetName => {
    out += `\n--- SHEET: ${sheetName} ---\n`;
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for(let i=0; i<Math.min(30, data.length); i++) {
       out += `Row ${i}: ${JSON.stringify(data[i])}\n`;
    }
  });
  
  fs.writeFileSync('inspect_ref.txt', out);
  console.log('Done writing inspect_ref.txt');
} catch (e) {
  console.error(e);
}
