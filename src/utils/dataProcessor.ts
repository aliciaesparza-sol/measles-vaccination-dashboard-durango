import { universeMap, muniNamesInPop } from '../data/population';
import { cubosByMuni } from '../data/historicDoses';
import { nominalData } from '../data/nominalData';

export interface SheetRow {
  municipio: string;
  universo: number;
  pctMetaStr: string;
  meta: number;
  cubos: number;
  nominal?: number;
  nom2025?: number;
  nom2026?: number;
  total: number;
  pendientes: number;
  cobertura: number;
  cobUniv?: number;
  semaforo: string;
}

export interface ExcelFidelityState {
  [sheetName: string]: SheetRow[];
}

export interface DashboardV4 {
  data: ExcelFidelityState;
  corteFecha: string;
}

const SHEETS = [
  'RESUMEN MUNICIPIOS',
  '6-11 Meses',
  '1 Año',
  '18 Meses',
  'Rezag 2-12 Años',
  '13-19 Años',
  '20-39 Años',
  '40-49 Años'
];

const OLD_SHEET_NAMES: Record<string, string> = {
  'RESUMEN MUNICIPIOS': 'Resumen',
  '6-11 Meses': '6 a 11 Meses',
  '1 Año': '1 Año',
  '18 Meses': '18 Meses',
  'Rezag 2-12 Años': 'Rezagos 2-12 Años',
  '13-19 Años': '13 a 19 Años',
  '20-39 Años': '20 a 39 Años',
  '40-49 Años': '40 a 49 Años'
};

const metaPcts: { [s: string]: number } = {
  '6-11 Meses': 0.5,
  '1 Año': 1.0,
  '18 Meses': 1.0,
  'Rezag 2-12 Años': 0.5,
  '13-19 Años': 0.5,
  '20-39 Años': 0.5,
  '40-49 Años': 0.5,
  'RESUMEN MUNICIPIOS': 1.0
};

export const processStaticData = (): DashboardV4 => {
  const result: ExcelFidelityState = {};
  SHEETS.forEach(s => result[s] = []);

  muniNamesInPop.forEach(m => {
    let r_universo = 0, r_meta = 0, r_nom25 = 0, r_nom26 = 0, r_nominal = 0, r_total = 0, r_cubos = 0;

    SHEETS.forEach(s => {
      if (s === 'RESUMEN MUNICIPIOS') return;

      const oldS = OLD_SHEET_NAMES[s];
      const universo = universeMap[m][oldS] || 0;
      const pMeta = metaPcts[s] || 1.0;
      const meta = Math.ceil(universo * pMeta);

      const muniNominal = nominalData[m] ? nominalData[m][s] : null;
      const nom25 = muniNominal ? muniNominal.y25 : 0;
      const nom26 = muniNominal ? muniNominal.y26 : 0;
      const nominal = nom25 + nom26;

      const cubos = (cubosByMuni[m] && cubosByMuni[m][s]) ? cubosByMuni[m][s] : 0;
      const total = nominal + cubos;
      const pendientes = Math.max(0, meta - total);
      const cobertura = meta ? (total / meta) * 100 : 0;

      let semaforo = '🟢 EN META';
      if (cobertura < 80) semaforo = '🔴 CRÍTICO';
      else if (cobertura < 95) semaforo = '🟡 EN PROCESO';

      result[s].push({
        municipio: m, universo, pctMetaStr: `${pMeta * 100}%`, meta, cubos,
        nominal, nom2025: nom25, nom2026: nom26,
        total, pendientes, cobertura, semaforo
      });

      r_universo += universo;
      r_meta += meta;
      r_nom25 += nom25;
      r_nom26 += nom26;
      r_nominal += nominal;
      r_cubos += cubos;
      r_total += total;
    });

    const r_pendientes = Math.max(0, r_meta - r_total);
    const r_cobertura = r_meta ? (r_total / r_meta) * 100 : 0;
    const r_cobUniv = r_universo ? (r_total / r_universo) * 100 : 0;

    let r_semaforo = '🟢 EN META';
    if (r_cobertura < 80) r_semaforo = '🔴 CRÍTICO';
    else if (r_cobertura < 95) r_semaforo = '🟡 EN PROCESO';

    result['RESUMEN MUNICIPIOS'].push({
      municipio: m, universo: r_universo, pctMetaStr: '100%', meta: r_meta, cubos: r_cubos,
      nom2025: r_nom25, nom2026: r_nom26, nominal: r_nominal, total: r_total,
      pendientes: r_pendientes, cobertura: r_cobertura, cobUniv: r_cobUniv, semaforo: r_semaforo
    });
  });

  return { data: result, corteFecha: '21/03/2026' };
};
