const fs = require('fs');
const path = require('path');
const csvPath = path.join(__dirname, 'data', 'SRP-SR-2025_21-03-2026 08-11-38.csv');
const text = fs.readFileSync(csvPath, 'latin1');
const firstLine = text.split('\n')[0];
let cur = '', inQuotes = false, res = [];
for (let c of firstLine) {
  if (c === '"') inQuotes = !inQuotes;
  else if (c === ',' && !inQuotes) { res.push(cur.trim()); cur = ''; }
  else cur += c;
}
res.push(cur.trim());
fs.writeFileSync('headers.txt', res.join('\n'));
