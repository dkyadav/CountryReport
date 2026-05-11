import { connectDB } from '@/lib/mongoose';
import CountryModel, { ICountry } from '@/lib/models/Country';
import MonthlyDataModel, { IMonthlyData } from '@/lib/models/MonthlyData';
import { CountryData } from '@/types';

/** Map a Mongoose ICountry doc to the app's CountryData shape (strips Mongoose internals). */
function toCountryData(doc: ICountry): CountryData {
  return {
    id: doc.id,
    name: doc.name,
    flag: doc.flag,
    capital: doc.capital,
    currency: doc.currency,
    currencyCode: doc.currencyCode,
    currencySymbol: doc.currencySymbol,
    gdpLatest: doc.gdpLatest,
    gdpRank: doc.gdpRank,
    region: doc.region,
    currencyVsUSD: doc.currencyVsUSD,
    fuelPrices: doc.fuelPrices,
    externalDebt: doc.externalDebt,
    perCapitaIncome: doc.perCapitaIncome,
    imports: doc.imports,
    exports: doc.exports,
    asianRank: doc.asianRank,
    inflationRate: doc.inflationRate,
    unemploymentRate: doc.unemploymentRate,
    fdiInflow: doc.fdiInflow,
  };
}

export async function getAllCountries(): Promise<CountryData[]> {
  await connectDB();
  const docs = await CountryModel.find({}).lean<ICountry[]>();
  return docs.map(toCountryData).sort((a, b) => a.gdpRank - b.gdpRank);
}

export async function getCountryById(id: string): Promise<CountryData | null> {
  await connectDB();
  const doc = await CountryModel.findOne({ id }).lean<ICountry>();
  return doc ? toCountryData(doc) : null;
}

export async function getMonthlyData(countryId: string): Promise<IMonthlyData | null> {
  await connectDB();
  return MonthlyDataModel.findOne({ countryId }).lean<IMonthlyData>();
}
