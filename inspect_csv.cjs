const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'data', 'SRP-SR-2025_21-03-2026 08-11-38.csv');
const content = fs.readFileSync(csvPath, 'latin1');
const lines = content.split('\n');
console.log('Line 0:', lines[0]);
console.log('Line 1:', lines[1]);
