import * as XLSX from 'xlsx';

export interface SheetRow {
  municipio: string;
  universo: number;
  pctMeta: number;
  meta: number;
  cubos: number;
  nominal: number;
  total: number;
  pendientes: number;
  cobertura: number;
  semaforo: string;
}

export interface ExcelFidelityState {
  [sheetName: string]: SheetRow[];
}

export interface DashboardV4 {
  data: ExcelFidelityState;
  globalStats: {
    d12m: { doses: number; meta: number };
    d18m: { doses: number; meta: number };
    d6y: { doses: number; meta: number };
  };
}

const SHEETS = [
  'Resumen',
  '6 a 11 Meses',
  '1 Año',
  '18 Meses',
  'Rezagos 2-12 Años',
  '13 a 19 Años',
  '20 a 39 Años',
  '40 a 49 Años'
];

const MAPPING: { [raw: string]: string } = {
  'PEÃ‘ON BLANCO': 'Peñón Blanco',
  'PENON BLANCO': 'Peñón Blanco',
  'PUEBLO NUEVO DGO': 'Pueblo Nuevo',
  'PUEBLO NUEVO': 'Pueblo Nuevo',
  'HIDALGO DGO': 'Hidalgo',
  'HIDALGO': 'Hidalgo',
  'ORO EL': 'El Oro',
  'EL ORO': 'El Oro',
  'GUADALUPE VICTORIA DGO': 'Guadalupe Victoria',
  'GUADALUPE VICTORIA': 'Guadalupe Victoria',
  'OCAMPO DGO': 'Ocampo',
  'OCAMPO': 'Ocampo',
  'SAN JUAN DEL RIO DGO': 'San Juan del Río',
  'SAN JUAN DEL RIO': 'San Juan del Río',
  'DURANGO': 'Durango',
  'DURANGO DGO': 'Durango',
  'SNTIAGO PAPASQUIARO': 'Santiago Papasquiaro',
  'SANTIAGO PAPASQUIARO': 'Santiago Papasquiaro',
  'GOMEZ PALACIO': 'Gómez Palacio',
  'LERDO': 'Lerdo',
  'MAPIMI': 'Mapimí',
  'NOMBRE DE DIOS': 'Nombre de Dios',
  'PANUCO DE CORONADO': 'Pánuco de Coronado',
  'TEPEHUANES': 'Tepehuanes',
  'TAMAZULA': 'Tamazula',
  'TOPIA': 'Topia',
  'VICENTE GUERRERO': 'Vicente Guerrero'
};

const normalize = (s: string) => String(s).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const processV4Data = async (
  popFile: File,
  cubosFile: File,
  nominalFile: File
): Promise<DashboardV4> => {
  const [popWb, cubosWb, nominalCsv] = await Promise.all([
    readExcel(popFile),
    readExcel(cubosFile),
    readCsv(nominalFile)
  ]);

  const popSheet = popWb.Sheets['Durango'];
  if (!popSheet) throw new Error("No se encontró la hoja 'Durango' en el archivo de población.");
  const popData = XLSX.utils.sheet_to_json(popSheet, { header: 1 }) as any[][];

  let ageStartRow = -1;
  for (let i = 0; i < popData.length; i++) {
    if (popData[i].includes('Edad')) { ageStartRow = i; break; }
  }

  const muniNamesInPop = popData[ageStartRow].slice(1).filter(n => n && String(n).trim() !== '' && !String(n).includes('Poblacion Total'));
  
  const result: ExcelFidelityState = {};
  SHEETS.forEach(s => result[s] = []);

  const metaPcts: { [s: string]: number } = {
    '6 a 11 Meses': 0.5,
    '1 Año': 1.0,
    '18 Meses': 1.0,
    'Rezagos 2-12 Años': 0.3, // Meta ajustable según campaña
    '13 a 19 Años': 0.2,
    '20 a 39 Años': 0.2,
    '40 a 49 Años': 0.2,
    'Resumen': 1.0 
  };

  const universeMap: { [muni: string]: { [sheet: string]: number } } = {};
  muniNamesInPop.forEach(m => {
    universeMap[m] = {};
    SHEETS.forEach(s => universeMap[m][s] = 0);
    (universeMap[m] as any)['6 años'] = 0;
  });

  for (let i = ageStartRow + 1; i < popData.length; i++) {
    const row = popData[i];
    if (!row[0] || isNaN(parseInt(row[0]))) continue;
    const age = parseInt(row[0]);
    if (age > 49) break;

    muniNamesInPop.forEach((m, idx) => {
      const val = parseInt(row[idx + 1]) || 0;
      if (age === 0) universeMap[m]['6 a 11 Meses'] += val;
      if (age === 1) { 
        universeMap[m]['1 Año'] += val; 
        universeMap[m]['18 Meses'] += val; 
      }
      if (age >= 2 && age <= 12) universeMap[m]['Rezagos 2-12 Años'] += val;
      if (age >= 13 && age <= 19) universeMap[m]['13 a 19 Años'] += val;
      if (age >= 20 && age <= 39) universeMap[m]['20 a 39 Años'] += val;
      if (age >= 40 && age <= 49) universeMap[m]['40 a 49 Años'] += val;
      if (age === 6) (universeMap[m] as any)['6 años'] += val;
    });
  }

  const doseMap: { [muni: string]: { [sheet: string]: number } } = {};
  muniNamesInPop.forEach(m => {
    doseMap[m] = {};
    SHEETS.forEach(s => doseMap[m][s] = 0);
    (doseMap[m] as any)['6y'] = 0;
  });
  
  const normalizedPopNames: { [norm: string]: string } = {};
  muniNamesInPop.forEach(m => normalizedPopNames[normalize(m)] = m);

  nominalCsv.forEach(row => {
    const rawMuni = String(row['MUNICIPIO'] || '').trim();
    if (!rawMuni) return;
    
    let matchedMuni = MAPPING[rawMuni] || normalizedPopNames[normalize(rawMuni)];
    if (!matchedMuni) return;

    const val = (h: string) => parseInt(row[h]) || 0;

    doseMap[matchedMuni]['6 a 11 Meses'] += val('SRP 6 A 11 MESES PRIMERA') + val('SR 6 A 11 MESES PRIMERA');
    doseMap[matchedMuni]['1 Año'] += val('SRP 1 ANIO  PRIMERA');
    doseMap[matchedMuni]['18 Meses'] += val('SRP 18 MESES SEGUNDA');
    doseMap[matchedMuni]['Rezagos 2-12 Años'] += val('SRP 2 A 5 ANIOS PRIMERA') + val('SRP 6 ANIOS PRIMERA') + val('SRP 7 A 9 ANIOS PRIMERA') + val('SRP 10 A 12 ANIOS PRIMERA');
    doseMap[matchedMuni]['13 a 19 Años'] += val('SRP 13 a 19 ANIOS PRIMERA') + val('SRP 10 A 19 ANIOS PRIMERA');
    doseMap[matchedMuni]['20 a 39 Años'] += val('SRP 20 A 29 ANIOS PRIMERA') + val('SRP 30 A 39 ANIOS PRIMERA');
    doseMap[matchedMuni]['40 a 49 Años'] += val('SRP 40 A 49 ANIOS PRIMERA');
    (doseMap[matchedMuni] as any)['6y'] += val('SRP 6 ANIOS SEGUNDA') + val('SR 6 ANIOS SEGUNDA');
  });

  const cubosSheet = cubosWb.Sheets[cubosWb.SheetNames[0]];
  const cubosData = XLSX.utils.sheet_to_json(cubosSheet) as any[];
  const cubosTotals: { [sheet: string]: number } = { '1 Año': 0, '18 Meses': 0, '6y': 0 };
  
  cubosData.forEach(row => {
    cubosTotals['1 Año'] += parseInt(row['VAC23 PRIMERA 12 MESES (Total)']) || 0;
    cubosTotals['18 Meses'] += parseInt(row['VTV01 SEGUNDA 18 MESES (Total)']) || 0;
    (cubosTotals as any)['6y'] += parseInt(row['VAC81 SEGUNDA 6 AÑOS (Total)']) || 0;
  });

  muniNamesInPop.forEach(m => {
    SHEETS.forEach(s => {
      const universo = universeMap[m][s];
      const pMeta = metaPcts[s] || 1.0;
      const meta = Math.ceil(universo * pMeta);
      const nominal = doseMap[m][s] || 0;
      const total = nominal; 
      const pendientes = Math.max(0, meta - total);
      const cobertura = meta ? (total / meta) * 100 : 0;
      
      result[s].push({
        municipio: m, universo, pctMeta: pMeta * 100, meta, cubos: 0, nominal, total, pendientes, cobertura,
        semaforo: cobertura < 80 ? '🔴 CRÍTICO' : cobertura < 95 ? '🟡 ALERTA' : '🟢 ÓPTIMO'
      });
    });
  });

  // Regularización por Cubos (Estatal)
  ['Resumen', '1 Año', '18 Meses'].forEach(s => {
    const totalC = cubosTotals[s] || 0;
    if (totalC > 0) {
      result[s].push({
        municipio: 'REGULARIZACIÓN CUBOS (ESTATAL)', universo: 0, pctMeta: 0, meta: 0, cubos: totalC, nominal: 0, total: totalC, pendientes: 0, cobertura: 100, semaforo: '🟢 ÓPTIMO'
      });
    }
  });

  const summary = {
    d12m: { doses: cubosTotals['1 Año'], meta: 0 },
    d18m: { doses: cubosTotals['18 Meses'], meta: 0 },
    d6y: { doses: (cubosTotals as any)['6y'], meta: 0 }
  };
  
  muniNamesInPop.forEach(m => {
     summary.d12m.doses += doseMap[m]['1 Año'];
     summary.d12m.meta += universeMap[m]['1 Año'] * metaPcts['1 Año'];
     summary.d18m.doses += doseMap[m]['18 Meses'];
     summary.d18m.meta += universeMap[m]['18 Meses'] * metaPcts['18 Meses'];
     summary.d6y.doses += (doseMap[m] as any)['6y'] || 0;
     summary.d6y.meta += (universeMap[m] as any)['6 años'] || 0;
  });

  return { data: result, globalStats: summary };
};

const readExcel = (file: File): Promise<XLSX.WorkBook> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(XLSX.read(e.target?.result, { type: 'array' }));
    reader.readAsArrayBuffer(file);
  });
};

const readCsv = (file: File): Promise<any[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const headers = parseCsvLine(lines[0]);
      const data = lines.slice(1).map(line => {
        const values = parseCsvLine(line);
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
      });
      resolve(data);
    };
    reader.readAsText(file, 'latin1');
  });
};

const parseCsvLine = (line: string): string[] => {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  result.push(cur.trim());
  return result;
};

