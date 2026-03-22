const fs = require('fs');

const cubosContent = fs.readFileSync('./src/data/historicDoses.ts', 'utf8');
const nominalContent = fs.readFileSync('./src/data/nominalData.ts', 'utf8');

const extractData = (str, varName) => {
    const match = str.match(new RegExp(`export const ${varName}.*?= ({[\\s\\S]*?});`));
    return match ? eval(`(${match[1]})`) : {};
};

const cubos = extractData(cubosContent, 'cubosByMuni');
const nominal = extractData(nominalContent, 'nominalData');

let c_6_11 = 0, c_1 = 0, c_18 = 0, c_2_12 = 0, c_13_19 = 0, c_20_39 = 0, c_40_49 = 0;
for(const m in cubos) {
  c_6_11 += cubos[m]['6-11 Meses']||0; c_1 += cubos[m]['1 Año']||0; c_18 += cubos[m]['18 Meses']||0;
  c_2_12 += cubos[m]['Rezag 2-12 Años']||0; c_13_19 += cubos[m]['13-19 Años']||0; 
  c_20_39 += cubos[m]['20-39 Años']||0; c_40_49 += cubos[m]['40-49 Años']||0;
}
const totalCubos = c_6_11+c_1+c_18+c_2_12+c_13_19+c_20_39+c_40_49;

let n_6_11 = 0, n_1 = 0, n_18 = 0, n_2_12 = 0, n_13_19 = 0, n_20_39 = 0, n_40_49 = 0;
for(const m in nominal) {
  const sum = (a) => (nominal[m][a]?.y25||0) + (nominal[m][a]?.y26||0);
  n_6_11 += sum('6-11 Meses'); n_1 += sum('1 Año'); n_18 += sum('18 Meses');
  n_2_12 += sum('Rezag 2-12 Años'); n_13_19 += sum('13-19 Años');
  n_20_39 += sum('20-39 Años'); n_40_49 += sum('40-49 Años');
}
const totalNom = n_6_11+n_1+n_18+n_2_12+n_13_19+n_20_39+n_40_49;

let out = '';
out += '=== Desglose de Dosis en el Tablero ===\n';
out += 'CUBOS (Ene-May 2025): ' + totalCubos.toLocaleString() + ' dosis\n';
out += `- 6-11M: ${c_6_11} | 1A: ${c_1} | 18M: ${c_18} | 2-12A: ${c_2_12} | 13-19A: ${c_13_19} | 20-39A: ${c_20_39} | 40-49A: ${c_40_49}\n`;

out += '\nNOMINAL (Jun 25 - Mar 26): ' + totalNom.toLocaleString() + ' dosis\n';
out += `- 6-11M: ${n_6_11} | 1A: ${n_1} | 18M: ${n_18} | 2-12A: ${n_2_12} | 13-19A: ${n_13_19} | 20-39A: ${n_20_39} | 40-49A: ${n_40_49}\n`;

out += '\nTOTAL TABLERO: ' + (totalCubos + totalNom).toLocaleString() + ' dosis (incluye 6-11 meses)\n';
out += 'Imagen usuario: SRP 241,553 + SR 224,198 = 465,751 dosis\n';
out += 'Diferencia: ' + (465751 - (totalCubos + totalNom)).toLocaleString() + ' dosis faltantes\n';

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
let rawCsvTotal = 0;
let nominalSRP = 0;
let nominalSR = 0;

for(let i=1; i<lines.length; i++){
  const vals = parseLineStr(lines[i]);
  for(let j=0; j<vals.length; j++) {
    const val = parseInt(vals[j]) || 0;
    if(headers[j]?.includes('SRP')) nominalSRP += val;
    if(headers[j]?.includes('SR ')) nominalSR += val;
    if(headers[j]?.includes('SRP') || headers[j]?.includes('SR ')) {
      rawCsvTotal += val;
    }
  }
}
out += '\nTotal MÁXIMO posible en el CSV Nominal (sumando TODAS las columnas SRP/SR): ' + rawCsvTotal.toLocaleString() + '\n';
out += '- SRP Nominal puro: ' + nominalSRP.toLocaleString() + '\n';
out += '- SR Nominal puro: ' + nominalSR.toLocaleString() + '\n';

fs.writeFileSync('totals_out.txt', out);
