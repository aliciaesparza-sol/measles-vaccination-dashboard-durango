const fs = require('fs');

const keepCols = new Set([
  'SRP 6 A 11 MESES PRIMERA',
  'SRP 1 ANIO  PRIMERA',
  'SRP 18 MESES SEGUNDA',
  'SRP 2 A 5 ANIOS PRIMERA',
  'SRP 6 ANIOS PRIMERA',
  'SRP 7 A 9 ANIOS PRIMERA',
  'SRP 10 A 12 ANIOS PRIMERA',
  'SRP 13 A 19 ANIOS PRIMERA',
  'SRP 10 A 19 ANIOS PRIMERA',
  'SRP 20 A 29 ANIOS PRIMERA',
  'SRP 30 A 39 ANIOS PRIMERA',
  'SRP 40 A 49 ANIOS PRIMERA',
  'SR 6 A 11 MESES PRIMERA',
  'SRP 6 ANIOS SEGUNDA',
  'SR 6 ANIOS SEGUNDA',
]);

const dataDir = require('path').join(__dirname, 'data');
const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
const text = fs.readFileSync(require('path').join(dataDir, csvFiles[0]), 'latin1');
const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);

const parseLineStr = (line) => {
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

const headers = parseLineStr(lines[0]);

const unmapped = [];
const mappedTotals = {};
const unmappedTotals = {};

for(let i=1; i<lines.length; i++){
  const vals = parseLineStr(lines[i]);
  for(let j=0; j<vals.length; j++) {
    const header = headers[j];
    if (!header || (!header.includes('SRP') && !header.includes('SR '))) continue;
    
    const val = parseInt(vals[j]) || 0;
    if (keepCols.has(header)) {
        mappedTotals[header] = (mappedTotals[header] || 0) + val;
    } else {
        unmappedTotals[header] = (unmappedTotals[header] || 0) + val;
        if (!unmapped.includes(header)) unmapped.push(header);
    }
  }
}

// Write to a file instead of console log to prevent truncation
let out = '==== COLUMNAS QUE NO ESTAMOS SUMANDO EN EL TABLERO ====\n\n';
for (const col of unmapped) {
    if (unmappedTotals[col] > 0) {
        out += `- ${col}: ${unmappedTotals[col].toLocaleString()} dosis\n`;
    }
}

out += '\n==== COLUMNAS QUE SÍ ESTAMOS SUMANDO ====\n\n';
for (const col of keepCols) {
    if (mappedTotals[col] > 0) {
        out += `- ${col}: ${mappedTotals[col].toLocaleString()} dosis\n`;
    }
}

fs.writeFileSync('unmapped_cols.txt', out);
