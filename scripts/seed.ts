/**
 * One-time seed script: reads hardcoded country data, pre-computes monthly
 * series for every indicator, and upserts both collections into MongoDB.
 *
 * Usage:
 *   npm run seed
 */

// Load .env.local before anything else (tsx doesn't load it automatically)
import { readFileSync } from 'fs';
import { resolve } from 'path';
try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([^#][^=]*?)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
} catch { /* .env.local is optional */ }

import mongoose from 'mongoose';
import { countries } from '../data/countries';
import {
  toMonthly,
  toMonthlyFuel,
  VARIANCE,
} from '../data/monthly';
import CountryModel from '../lib/models/Country';
import MonthlyDataModel from '../lib/models/MonthlyData';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected.');

  let upsertedCountries = 0;
  let upsertedMonthly = 0;

  for (const country of countries) {
    // ── Yearly document ──────────────────────────────────────────────────────
    await CountryModel.findOneAndUpdate(
      { id: country.id },
      {
        id: country.id,
        name: country.name,
        flag: country.flag,
        capital: country.capital,
        currency: country.currency,
        currencyCode: country.currencyCode,
        currencySymbol: country.currencySymbol,
        gdpLatest: country.gdpLatest,
        gdpRank: country.gdpRank,
        region: country.region,
        currencyVsUSD: country.currencyVsUSD,
        fuelPrices: country.fuelPrices,
        externalDebt: country.externalDebt,
        perCapitaIncome: country.perCapitaIncome,
        imports: country.imports,
        exports: country.exports,
        asianRank: country.asianRank,
        inflationRate: country.inflationRate,
        unemploymentRate: country.unemploymentRate,
        fdiInflow: country.fdiInflow,
      },
      { upsert: true, new: true }
    );
    upsertedCountries++;

    // ── Monthly document (pre-computed) ──────────────────────────────────────
    const monthly = {
      countryId: country.id,
      currencyVsUSD: toMonthly(country.currencyVsUSD, VARIANCE.currency),
      fuelPrices: toMonthlyFuel(country.fuelPrices, VARIANCE.fuel),
      externalDebt: toMonthly(country.externalDebt, VARIANCE.externalDebt),
      perCapitaIncome: toMonthly(country.perCapitaIncome, VARIANCE.perCapita),
      imports: toMonthly(country.imports, VARIANCE.imports),
      exports: toMonthly(country.exports, VARIANCE.exports),
      asianRank: toMonthly(country.asianRank, VARIANCE.asianRank),
      inflationRate: toMonthly(country.inflationRate, VARIANCE.inflation),
      unemploymentRate: toMonthly(country.unemploymentRate, VARIANCE.unemployment),
      fdiInflow: toMonthly(country.fdiInflow, VARIANCE.fdi),
    };

    await MonthlyDataModel.findOneAndUpdate(
      { countryId: country.id },
      monthly,
      { upsert: true, new: true }
    );
    upsertedMonthly++;

    console.log(`  ✓ ${country.name}`);
  }

  console.log(`\nDone. Upserted ${upsertedCountries} countries, ${upsertedMonthly} monthly datasets.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
