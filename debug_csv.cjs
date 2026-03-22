const fs = require('fs');
const path = require('path');

// Find the CSV in the data folder
const dataDir = path.join(__dirname, 'data');
const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
console.log('CSV files found:', csvFiles);

if(csvFiles.length === 0) { console.log('No CSV in /data'); process.exit(); }

const csvPath = path.join(dataDir, csvFiles[0]);
const text = fs.readFileSync(csvPath, 'latin1');
const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
console.log('Total lines:', lines.length);

// Parse header
const parseLine = (line) => {
  const result = [];
  let cur = '', inQ = false;
  for(const c of line) {
    if(c === '"') inQ = !inQ;
    else if(c === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  result.push(cur.trim());
  return result;
};

const headers = parseLine(lines[0]);
console.log('Headers count:', headers.length);
console.log('Municipio idx:', headers.indexOf('MUNICIPIO'));
console.log('Fecha idx:', headers.indexOf('Fecha de registro'));

// Show first 5 data rows
for(let i=1; i<=5 && i<lines.length; i++) {
  const vals = parseLine(lines[i]);
  const obj = {};
  headers.forEach((h,idx) => obj[h] = vals[idx]);
  console.log(`Row ${i}: MUNICIPIO="${obj['MUNICIPIO']}" | Fecha="${obj['Fecha de registro']}" | SRP 1 ANIO="${obj['SRP 1 ANIO  PRIMERA']}"`);
}

// Count dosis
let totalDoses = 0, totalRows = 0;
for(let i=1; i<lines.length; i++) {
  const vals = parseLine(lines[i]);
  const obj = {};
  headers.forEach((h,idx) => obj[h] = vals[idx]);
  const d = parseInt(obj['SRP 1 ANIO  PRIMERA']) || 0;
  totalDoses += d;
  totalRows++;
}
console.log('\nTotal rows processed:', totalRows);
console.log('Total SRP 1 Anio Primera dosis:', totalDoses);
