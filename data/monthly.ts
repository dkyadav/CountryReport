import { YearlyValue, FuelPrice } from './years';

export interface MonthData {
  label: string;       // "Jan 2020"
  date: string;        // "2020-01"
  value: number;
  year: number;        // for compatibility & tick formatting
  monthIndex: number;  // 0–11
}

export interface MonthFuel {
  label: string;
  date: string;
  petrol: number;
  diesel: number;
  lpg: number;
  year: number;
  monthIndex: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Deterministic hash → [-1, 1] noise. Stable across renders.
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

// Generate timeline of (year, monthIndex) tuples from Jan first-year to lastYearMonth of last-year.
function timeline(annual: YearlyValue[] | FuelPrice[], lastYearLastMonth: number = 4): { year: number; m: number }[] {
  const out: { year: number; m: number }[] = [];
  const firstYear = annual[0].year;
  const lastYear = annual[annual.length - 1].year;
  for (let y = firstYear; y <= lastYear; y++) {
    const maxM = y === lastYear ? lastYearLastMonth : 11;
    for (let m = 0; m <= maxM; m++) out.push({ year: y, m });
  }
  return out;
}

// Get value at a specific month via linear interpolation between annual anchors.
// Annual values represent end-of-year (Dec) for that year; treating Dec(Y-1) → Dec(Y) as a smooth ramp.
function interp(annual: YearlyValue[], year: number, m: number): number {
  const idx = annual.findIndex((a) => a.year === year);
  const cur = annual[idx];
  if (!cur) return annual[annual.length - 1].value;
  // Position within the year: m=0 (Jan) → just past prev Dec; m=11 (Dec) → cur.value
  const prev = idx > 0 ? annual[idx - 1] : cur;
  // Treat each annual value as the December value. Linearly interpolate across 12 months.
  // At m=0 (Jan), value ≈ prev.value + (cur-prev) * (1/12)
  // At m=11 (Dec), value = cur.value
  const t = (m + 1) / 12;
  return prev.value + (cur.value - prev.value) * t;
}

function interpFuel(annual: FuelPrice[], year: number, m: number, key: 'petrol' | 'diesel' | 'lpg'): number {
  const idx = annual.findIndex((a) => a.year === year);
  const cur = annual[idx];
  if (!cur) return annual[annual.length - 1][key];
  const prev = idx > 0 ? annual[idx - 1] : cur;
  const t = (m + 1) / 12;
  return prev[key] + (cur[key] - prev[key]) * t;
}

/**
 * Convert annual series into monthly series with realistic noise.
 * variancePct = ±% noise relative to local value (e.g. 0.02 = ±2%).
 */
export function toMonthly(
  annual: YearlyValue[],
  variancePct: number = 0.02,
  lastYearLastMonth: number = 4 // May = index 4
): MonthData[] {
  return timeline(annual, lastYearLastMonth).map(({ year, m }) => {
    const base = interp(annual, year, m);
    const seed = year * 13 + m * 7 + Math.round(annual[0].value % 100);
    const variance = base * variancePct * noise(seed);
    const value = Math.max(0, base + variance);
    return {
      label: `${MONTH_NAMES[m]} ${year}`,
      date: `${year}-${String(m + 1).padStart(2, '0')}`,
      value: Math.round(value * 100) / 100,
      year,
      monthIndex: m,
    };
  });
}

/**
 * Specialized monthly generator for fuel (3 series).
 */
export function toMonthlyFuel(
  annual: FuelPrice[],
  variancePct: number = 0.04,
  lastYearLastMonth: number = 4
): MonthFuel[] {
  return timeline(annual, lastYearLastMonth).map(({ year, m }) => {
    const seedBase = year * 17 + m * 11;
    const mkSeries = (key: 'petrol' | 'diesel' | 'lpg', salt: number) => {
      const base = interpFuel(annual, year, m, key);
      const v = base * variancePct * noise(seedBase + salt);
      return Math.max(0, base + v);
    };
    return {
      label: `${MONTH_NAMES[m]} ${year}`,
      date: `${year}-${String(m + 1).padStart(2, '0')}`,
      year,
      monthIndex: m,
      petrol: Math.round(mkSeries('petrol', 1) * 100) / 100,
      diesel: Math.round(mkSeries('diesel', 2) * 100) / 100,
      lpg: Math.round(mkSeries('lpg', 3) * 100) / 100,
    };
  });
}

/** Convert YearlyValue[] into MonthData[]-compatible shape (one point per year, label = "2020"). */
export function toYearly(annual: YearlyValue[]): MonthData[] {
  return annual.map((a) => ({
    label: String(a.year),
    date: String(a.year),
    value: a.value,
    year: a.year,
    monthIndex: 0,
  }));
}

export function toYearlyFuel(annual: FuelPrice[]): MonthFuel[] {
  return annual.map((a) => ({
    label: String(a.year),
    date: String(a.year),
    year: a.year,
    monthIndex: 0,
    petrol: a.petrol,
    diesel: a.diesel,
    lpg: a.lpg,
  }));
}

// Indicator-specific variance configurations
export const VARIANCE = {
  currency: 0.015,     // ±1.5% — moderate FX volatility
  fuel: 0.035,         // ±3.5% — commodity-driven
  externalDebt: 0.005, // very smooth, annual indicator
  perCapita: 0.003,    // very smooth
  imports: 0.08,       // ±8% — seasonal trade swings
  exports: 0.08,
  inflation: 0.05,     // ±5% relative noise
  unemployment: 0.04,
  fdi: 0.15,           // FDI is volatile quarter to quarter
  asianRank: 0,        // discrete, no noise
};
