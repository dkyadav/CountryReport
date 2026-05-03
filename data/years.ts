export const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
export const FIRST_YEAR = YEARS[0];
export const LAST_YEAR = YEARS[YEARS.length - 1];
export const RANGE_LABEL = `${FIRST_YEAR}–May ${LAST_YEAR}`;
export const RANGE_LABEL_SHORT = `${FIRST_YEAR}–${LAST_YEAR}`;
export const LAST_FULL_YEAR = 2025;

export interface YearlyValue { year: number; value: number; }
export interface FuelPrice { year: number; petrol: number; diesel: number; lpg: number; }

export const latest = <T extends { year: number }>(arr: T[]): T => arr[arr.length - 1];
export const earliest = <T extends { year: number }>(arr: T[]): T => arr[0];

export const pctChange = (arr: YearlyValue[]): number => {
  const first = earliest(arr).value;
  const last = latest(arr).value;
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
};

export const absChange = (arr: YearlyValue[]): number => {
  return latest(arr).value - earliest(arr).value;
};

export const fuelPctChange = (arr: FuelPrice[], key: 'petrol' | 'diesel' | 'lpg'): number => {
  const first = earliest(arr)[key];
  const last = latest(arr)[key];
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
};
