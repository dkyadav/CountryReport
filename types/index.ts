export interface YearlyValue {
  year: number;
  value: number;
}

export interface FuelPrice {
  year: number;
  petrol: number;
  diesel: number;
  lpg: number;
}

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  capital: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  gdpLatest: number; // in billion USD (latest available year)
  gdpRank: number;
  region: string;

  // Exchange rate: how many local currency units = 1 USD
  currencyVsUSD: YearlyValue[];

  // Fuel prices in local currency
  fuelPrices: FuelPrice[];

  // External debt in billion USD
  externalDebt: YearlyValue[];

  // Per capita income in USD
  perCapitaIncome: YearlyValue[];

  // Imports in billion USD
  imports: YearlyValue[];

  // Exports in billion USD
  exports: YearlyValue[];

  // Overall economic rank among Asian countries
  asianRank: YearlyValue[];

  // Additional metrics
  inflationRate: YearlyValue[];
  unemploymentRate: YearlyValue[];
  fdiInflow: YearlyValue[]; // Foreign direct investment in billion USD
}
