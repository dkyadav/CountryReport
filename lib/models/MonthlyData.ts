import mongoose, { Schema, Model } from 'mongoose';

const MonthDataSchema = new Schema(
  {
    label: { type: String, required: true },
    date: { type: String, required: true },
    value: { type: Number, required: true },
    year: { type: Number, required: true },
    monthIndex: { type: Number, required: true },
  },
  { _id: false }
);

const MonthFuelSchema = new Schema(
  {
    label: { type: String, required: true },
    date: { type: String, required: true },
    petrol: { type: Number, required: true },
    diesel: { type: Number, required: true },
    lpg: { type: Number, required: true },
    year: { type: Number, required: true },
    monthIndex: { type: Number, required: true },
  },
  { _id: false }
);

export interface IMonthlyData {
  countryId: string;
  currencyVsUSD: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  fuelPrices: { label: string; date: string; petrol: number; diesel: number; lpg: number; year: number; monthIndex: number }[];
  externalDebt: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  perCapitaIncome: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  imports: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  exports: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  asianRank: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  inflationRate: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  unemploymentRate: { label: string; date: string; value: number; year: number; monthIndex: number }[];
  fdiInflow: { label: string; date: string; value: number; year: number; monthIndex: number }[];
}

const MonthlyDataSchema = new Schema<IMonthlyData>(
  {
    countryId: { type: String, required: true, unique: true, index: true },
    currencyVsUSD: [MonthDataSchema],
    fuelPrices: [MonthFuelSchema],
    externalDebt: [MonthDataSchema],
    perCapitaIncome: [MonthDataSchema],
    imports: [MonthDataSchema],
    exports: [MonthDataSchema],
    asianRank: [MonthDataSchema],
    inflationRate: [MonthDataSchema],
    unemploymentRate: [MonthDataSchema],
    fdiInflow: [MonthDataSchema],
  },
  { timestamps: true }
);

const MonthlyDataModel: Model<IMonthlyData> =
  mongoose.models.MonthlyData ?? mongoose.model<IMonthlyData>('MonthlyData', MonthlyDataSchema);

export default MonthlyDataModel;
