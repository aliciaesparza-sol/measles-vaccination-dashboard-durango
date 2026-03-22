const fs = require('fs');

// Read current data files
const cubosContent = fs.readFileSync('./src/data/historicDoses.ts', 'utf8');
const nominalContent = fs.readFileSync('./src/data/nominalData.ts', 'utf8');

// Extract JS objects using regex/eval (safe since we generated it)
const extractData = (str, varName) => {
    const match = str.match(new RegExp(`export const ${varName}.*?= ({[\\s\\S]*?});`));
    return match ? eval(`(${match[1]})`) : {};
};

const cubos = extractData(cubosContent, 'cubosByMuni');
const nominal = extractData(nominalContent, 'nominalData');

let totalCubos = 0;
let totalNominal = 0;

// Cubos sum
for (const muni in cubos) {
    for (const age in cubos[muni]) {
        if (age !== '6-11 Meses') {
            totalCubos += cubos[muni][age];
        }
    }
}

// Nominal sum
for (const muni in nominal) {
    for (const age in nominal[muni]) {
        if (age !== '6-11 Meses') {
            totalNominal += nominal[muni][age].y25 + nominal[muni][age].y26;
        }
    }
}

console.log('--- RESUMEN ACTUAL DEL TABLERO ---');
console.log('Total Cubos (Ene-May 2025):', totalCubos.toLocaleString());
console.log('Total Nominal (Jun-Mar 2026):', totalNominal.toLocaleString());
console.log('GRAN TOTAL (Excluyendo 6-11 Meses):', (totalCubos + totalNominal).toLocaleString());
