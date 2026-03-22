const XLSX = require('xlsx');
const file = 'c:\\Users\\aicil\\OneDrive\\Escritorio\\PVU\\SARAMPIÓN\\COBERTURA DE VACUNACIÓN\\TABLERO SARAMPION\\COBERTURA_SARAMPION_POR_MUNICIPIO_CORTE18MARZO2026.xlsx';
const wb = XLSX.readFile(file);

let total = 0;
const sheets = ['6-11 Meses','1 Año','18 Meses','Rezag 2-12 Años','13-19 Años','20-39 Años','40-49 Años'];
let report = {};

sheets.forEach(s => {
  const ws = wb.Sheets[s];
  if(!ws) return;
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  let headerRow = -1;
  for(let i=0; i<data.length; i++) {
    if(data[i].includes('Municipio')) { headerRow = i; break; }
  }
  if(headerRow === -1) return;
  const headers = data[headerRow];
  const muniIdx = headers.indexOf('Municipio');
  const cubosIdx = headers.findIndex(h => typeof h === 'string' && h.includes('Cubos'));
  if(cubosIdx === -1 || muniIdx === -1) return;
  
  let sheetTotal = 0;
  for(let i=headerRow+1; i<data.length; i++) {
    const row = data[i];
    if(!row || !row[muniIdx]) continue;
    const muni = String(row[muniIdx]).trim();
    if(muni !== 'Durango' && muni !== 'Gómez Palacio' && muni !== 'Lerdo' && muni !== 'Canatlán' && muni.length <= 3) continue;
    
    // Check if it's an actual municipality (ignore summary rows if any)
    const valText = String(row[cubosIdx]).replace(/,/g, '');
    const val = parseInt(valText) || 0;
    sheetTotal += val;
  }
  report[s] = sheetTotal;
  total += sheetTotal;
});

report.TOTAL = total;
console.log(JSON.stringify(report, null, 2));
