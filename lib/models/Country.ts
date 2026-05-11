import mongoose, { Schema, Model } from 'mongoose';

const YearlyValueSchema = new Schema(
  { year: { type: Number, required: true }, value: { type: Number, required: true } },
  { _id: false }
);

const FuelPriceSchema = new Schema(
  {
    year: { type: Number, required: true },
    petrol: { type: Number, required: true },
    diesel: { type: Number, required: true },
    lpg: { type: Number, required: true },
  },
  { _id: false }
);

export interface ICountry {
  id: string;
  name: string;
  flag: string;
  capital: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  gdpLatest: number;
  gdpRank: number;
  region: string;
  currencyVsUSD: { year: number; value: number }[];
  fuelPrices: { year: number; petrol: number; diesel: number; lpg: number }[];
  externalDebt: { year: number; value: number }[];
  perCapitaIncome: { year: number; value: number }[];
  imports: { year: number; value: number }[];
  exports: { year: number; value: number }[];
  asianRank: { year: number; value: number }[];
  inflationRate: { year: number; value: number }[];
  unemploymentRate: { year: number; value: number }[];
  fdiInflow: { year: number; value: number }[];
}

const CountrySchema = new Schema<ICountry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    flag: { type: String, required: true },
    capital: { type: String, required: true },
    currency: { type: String, required: true },
    currencyCode: { type: String, required: true },
    currencySymbol: { type: String, required: true },
    gdpLatest: { type: Number, required: true },
    gdpRank: { type: Number, required: true },
    region: { type: String, required: true },
    currencyVsUSD: [YearlyValueSchema],
    fuelPrices: [FuelPriceSchema],
    externalDebt: [YearlyValueSchema],
    perCapitaIncome: [YearlyValueSchema],
    imports: [YearlyValueSchema],
    exports: [YearlyValueSchema],
    asianRank: [YearlyValueSchema],
    inflationRate: [YearlyValueSchema],
    unemploymentRate: [YearlyValueSchema],
    fdiInflow: [YearlyValueSchema],
  },
  { timestamps: true }
);

const CountryModel: Model<ICountry> =
  mongoose.models.Country ?? mongoose.model<ICountry>('Country', CountrySchema);

export default CountryModel;
