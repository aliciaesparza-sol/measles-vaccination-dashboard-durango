// Quick test to simulate what dataProcessor.ts does
const file = require('./src/data/historicDoses.ts'); // Won't work with TS directly

const cubosByMuni = {
  "Canatlán": {
    "6-11 Meses": 0,
    "1 Año": 71,
    "18 Meses": 60,
    "Rezag 2-12 Años": 110
  }
};

const m = "Canatlán";
const s = "1 Año";
console.log("cubosByMuni[m]:", cubosByMuni[m]);
console.log("cubosByMuni[m][s]:", cubosByMuni[m][s]);
const cubos = (cubosByMuni[m] && cubosByMuni[m][s]) ? cubosByMuni[m][s] : 0;
console.log("cubos =>", cubos);
