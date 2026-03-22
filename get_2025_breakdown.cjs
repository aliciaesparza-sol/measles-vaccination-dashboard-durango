const fs = require('fs');
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
const fechaIdx = headers.indexOf('Fecha de registro');

const totals = { 
  2025: { SRP: 0, SR: 0, cols: {} }, 
  2026: { SRP: 0, SR: 0, cols: {} } 
};

for(let i=1; i<lines.length; i++){
  const vals = parseLineStr(lines[i]);
  const fechaRaw = (vals[fechaIdx]||'').trim();
  const year = (fechaRaw.includes('2026') || fechaRaw.includes('/26')) ? 2026 : 2025;
  
  for(let j=0; j<vals.length; j++) {
    const header = headers[j] || '';
    const val = parseInt(vals[j]) || 0;
    
    if(val > 0 && (header.includes('SRP') || header.includes('SR '))) {
        // Ignorar "TOTAL" para no doble-contar
        if(header.includes('TOTAL')) continue;
        
        totals[year].cols[header] = (totals[year].cols[header] || 0) + val;
        
        if (header.includes('SRP')) totals[year].SRP += val;
        if (header.includes('SR ')) totals[year].SR += val;
    }
  }
}

let out = '==== DOSIS TOTALES SISCENSIA SOLO AÑO 2025 ====\n';
out += `Total SRP 2025: ${totals[2025].SRP.toLocaleString()}\n`;
out += `Total SR 2025: ${totals[2025].SR.toLocaleString()}\n`;
out += `GRAN TOTAL 2025: ${(totals[2025].SRP + totals[2025].SR).toLocaleString()}\n\n`;

out += '==== DESGLOSE DE COLUMNAS (AÑO 2025) ====\n';
const sortedCols2025 = Object.entries(totals[2025].cols).sort((a,b) => b[1] - a[1]);
for (const [col, val] of sortedCols2025) {
    out += `- ${col}: ${val.toLocaleString()}\n`;
}

out += '\n\n==== DOSIS TOTALES SISCENSIA SOLO AÑO 2026 ====\n';
out += `Total SRP 2026: ${totals[2026].SRP.toLocaleString()}\n`;
out += `Total SR 2026: ${totals[2026].SR.toLocaleString()}\n`;
out += `GRAN TOTAL 2026: ${(totals[2026].SRP + totals[2026].SR).toLocaleString()}\n\n`;

out += '==== DESGLOSE DE COLUMNAS (AÑO 2026) ====\n';
const sortedCols2026 = Object.entries(totals[2026].cols).sort((a,b) => b[1] - a[1]);
for (const [col, val] of sortedCols2026) {
    out += `- ${col}: ${val.toLocaleString()}\n`;
}

fs.writeFileSync('breakdown_2025_2026.txt', out);
