'use client';

import { useState, useMemo } from 'react';
import { CountryData } from '@/types';
import { RANGE_LABEL } from '@/data/years';
import { toMonthly, toYearly, toMonthlyFuel, toYearlyFuel, VARIANCE } from '@/data/monthly';
import CurrencyChart from '@/components/charts/CurrencyChart';
import FuelChart from '@/components/charts/FuelChart';
import TradeChart from '@/components/charts/TradeChart';
import DebtChart from '@/components/charts/DebtChart';
import PerCapitaChart from '@/components/charts/PerCapitaChart';
import RankingChart from '@/components/charts/RankingChart';

interface SectionProps {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}

function Section({ title, subtitle, icon, children }: SectionProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function CountryCharts({ country }: { country: CountryData }) {
  const [granularity, setGranularity] = useState<'yearly' | 'monthly'>('yearly');

  const data = useMemo(() => {
    if (granularity === 'yearly') {
      return {
        currency: toYearly(country.currencyVsUSD),
        fuel: toYearlyFuel(country.fuelPrices),
        debt: toYearly(country.externalDebt),
        perCapita: toYearly(country.perCapitaIncome),
        imports: toYearly(country.imports),
        exports: toYearly(country.exports),
        rank: toYearly(country.asianRank),
        inflation: toYearly(country.inflationRate),
        unemployment: toYearly(country.unemploymentRate),
        fdi: toYearly(country.fdiInflow),
      };
    }
    return {
      currency: toMonthly(country.currencyVsUSD, VARIANCE.currency),
      fuel: toMonthlyFuel(country.fuelPrices, VARIANCE.fuel),
      debt: toMonthly(country.externalDebt, VARIANCE.externalDebt),
      perCapita: toMonthly(country.perCapitaIncome, VARIANCE.perCapita),
      imports: toMonthly(country.imports, VARIANCE.imports),
      exports: toMonthly(country.exports, VARIANCE.exports),
      rank: toMonthly(country.asianRank, VARIANCE.asianRank),
      inflation: toMonthly(country.inflationRate, VARIANCE.inflation),
      unemployment: toMonthly(country.unemploymentRate, VARIANCE.unemployment),
      fdi: toMonthly(country.fdiInflow, VARIANCE.fdi),
    };
  }, [country, granularity]);

  return (
    <div>
      {/* Granularity Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg">Charts</h3>
          <p className="text-slate-500 text-sm">
            {granularity === 'yearly'
              ? `7 annual data points · ${RANGE_LABEL}`
              : `77 monthly data points · Jan 2020 – May 2026`}
          </p>
        </div>
        <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
          {(['yearly', 'monthly'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${granularity === g
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'}`}
            >
              {g === 'yearly' ? 'Yearly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Currency vs USD"
          subtitle={`${country.currencyCode} exchange rate per 1 USD`}
          icon="💱"
        >
          <CurrencyChart
            data={data.currency}
            currencyCode={country.currencyCode}
            baseValue={data.currency[0].value}
            granularity={granularity}
          />
        </Section>

        <Section
          title="Fuel Prices"
          subtitle={`Petrol, Diesel & LPG in ${country.currencyCode}`}
          icon="⛽"
        >
          <FuelChart data={data.fuel} currencySymbol={country.currencySymbol} granularity={granularity} />
        </Section>

        <Section
          title="External Debt"
          subtitle="Total external debt in billion USD"
          icon="🏦"
        >
          <DebtChart data={data.debt} granularity={granularity} />
        </Section>

        <Section
          title="Per Capita Income"
          subtitle="GDP per capita in USD"
          icon="💰"
        >
          <PerCapitaChart data={data.perCapita} granularity={granularity} />
        </Section>

        <Section
          title="Trade — Imports & Exports"
          subtitle="Value in billion USD"
          icon="🚢"
        >
          <TradeChart imports={data.imports} exports={data.exports} granularity={granularity} />
        </Section>

        <Section
          title="Overall Country Position"
          subtitle="Asian rank, inflation, unemployment & FDI"
          icon="📊"
        >
          <RankingChart
            asianRank={data.rank}
            inflationRate={data.inflation}
            unemploymentRate={data.unemployment}
            fdiInflow={data.fdi}
            granularity={granularity}
          />
        </Section>
      </div>

      {granularity === 'monthly' && (
        <div className="mt-4 card p-4 text-sm text-slate-400 border-amber-500/20">
          <p>
            <span className="text-amber-400 font-semibold">ℹ️ Note on monthly data:</span> Annual figures from IMF/World Bank are
            interpolated to monthly granularity with realistic noise per indicator (FX ±1.5%, fuel ±3.5%, trade ±8%, FDI ±15%).
            Use the yearly view for the official source data points.
          </p>
        </div>
      )}
    </div>
  );
}
