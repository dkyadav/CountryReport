import { notFound } from 'next/navigation';
import Link from 'next/link';
import { countries, getCountryById } from '@/data/countries';
import { YEARS, RANGE_LABEL, latest, earliest, pctChange, absChange, fuelPctChange } from '@/data/years';
import CountryCharts from '@/components/CountryCharts';

export async function generateStaticParams() {
  return countries.map((c) => ({ id: c.id }));
}

export default async function CountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const country = getCountryById(id);
  if (!country) notFound();

  const sortedCountries = [...countries].sort((a, b) => a.gdpRank - b.gdpRank);
  const currentIndex = sortedCountries.findIndex((c) => c.id === country.id);
  const prevCountry = currentIndex > 0 ? sortedCountries[currentIndex - 1] : null;
  const nextCountry = currentIndex < sortedCountries.length - 1 ? sortedCountries[currentIndex + 1] : null;

  const latestPerCapita = latest(country.perCapitaIncome).value;
  const latestExports = latest(country.exports).value;
  const latestImports = latest(country.imports).value;
  const latestDebt = latest(country.externalDebt).value;
  const tradeBalance = latestExports - latestImports;
  const latestYear = latest(country.perCapitaIncome).year;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-amber-400 transition-colors">Countries</Link>
        <span>/</span>
        <span className="text-slate-300">{country.name}</span>
      </div>

      {/* Country Hero */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <span className="text-6xl">{country.flag}</span>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{country.name}</h1>
              <span className="bg-amber-500/20 text-amber-400 text-sm font-semibold px-3 py-1 rounded-full">
                #{country.gdpRank} Asian Economy
              </span>
              <span className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full">
                {country.region}
              </span>
            </div>
            <p className="text-slate-400 mt-1">Capital: {country.capital} · Currency: {country.currency} ({country.currencyCode})</p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: `GDP ${latestYear}`, value: country.gdpLatest >= 1000 ? `$${(country.gdpLatest / 1000).toFixed(1)}T` : `$${country.gdpLatest}B`, color: 'text-amber-400' },
            { label: 'Per Capita', value: `$${latestPerCapita.toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Exports', value: `$${latestExports}B`, color: 'text-blue-400' },
            { label: 'Imports', value: `$${latestImports}B`, color: 'text-purple-400' },
            { label: 'Trade Balance', value: `${tradeBalance >= 0 ? '+' : ''}$${tradeBalance.toFixed(0)}B`, color: tradeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400' },
            { label: 'Ext. Debt', value: `$${latestDebt}B`, color: 'text-rose-400' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-700/40 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts with granularity toggle (client component) */}
      <CountryCharts country={country} />

      {/* Annual Data Table */}
      <div className="card p-6 mt-6 overflow-x-auto">
        <h2 className="text-white font-semibold text-lg mb-4">📋 Annual Data Table ({RANGE_LABEL})</h2>
        <table className="w-full text-sm text-left min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="pb-3 text-slate-400 font-medium">Indicator</th>
              {YEARS.map((y) => (
                <th key={y} className="pb-3 text-slate-400 font-medium text-right">{y}{y === 2026 ? '*' : ''}</th>
              ))}
              <th className="pb-3 text-slate-400 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {[
              {
                label: `Currency (1 USD = ${country.currencyCode})`,
                values: country.currencyVsUSD.map((d) => d.value.toLocaleString()),
                pct: pctChange(country.currencyVsUSD),
                invertSign: true,
              },
              {
                label: 'Petrol Price',
                values: country.fuelPrices.map((d) => `${country.currencySymbol}${d.petrol.toLocaleString()}`),
                pct: fuelPctChange(country.fuelPrices, 'petrol'),
                invertSign: true,
              },
              {
                label: 'Diesel Price',
                values: country.fuelPrices.map((d) => `${country.currencySymbol}${d.diesel.toLocaleString()}`),
                pct: fuelPctChange(country.fuelPrices, 'diesel'),
                invertSign: true,
              },
              {
                label: 'LPG Price',
                values: country.fuelPrices.map((d) => `${country.currencySymbol}${d.lpg.toLocaleString()}`),
                pct: fuelPctChange(country.fuelPrices, 'lpg'),
                invertSign: true,
              },
              {
                label: 'External Debt (B USD)',
                values: country.externalDebt.map((d) => `$${d.value}B`),
                pct: pctChange(country.externalDebt),
                invertSign: true,
              },
              {
                label: 'Per Capita Income (USD)',
                values: country.perCapitaIncome.map((d) => `$${d.value.toLocaleString()}`),
                pct: pctChange(country.perCapitaIncome),
                invertSign: false,
              },
              {
                label: 'Imports (B USD)',
                values: country.imports.map((d) => `$${d.value}B`),
                pct: pctChange(country.imports),
                invertSign: false,
              },
              {
                label: 'Exports (B USD)',
                values: country.exports.map((d) => `$${d.value}B`),
                pct: pctChange(country.exports),
                invertSign: false,
              },
              {
                label: 'Inflation Rate (%)',
                values: country.inflationRate.map((d) => `${d.value}%`),
                pct: absChange(country.inflationRate),
                invertSign: true,
                isAbsolute: true,
              },
              {
                label: 'Unemployment Rate (%)',
                values: country.unemploymentRate.map((d) => `${d.value}%`),
                pct: absChange(country.unemploymentRate),
                invertSign: true,
                isAbsolute: true,
              },
              {
                label: 'FDI Inflow (B USD)',
                values: country.fdiInflow.map((d) => `$${d.value}B`),
                pct: pctChange(country.fdiInflow),
                invertSign: false,
              },
            ].map((row) => {
              const positive = row.invertSign ? row.pct < 0 : row.pct > 0;
              return (
                <tr key={row.label} className="hover:bg-slate-700/20">
                  <td className="py-2.5 text-slate-300 pr-4">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-2.5 text-right text-slate-400 text-xs">{v}</td>
                  ))}
                  <td className="py-2.5 text-right">
                    <span className={`text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.pct > 0 ? '+' : ''}{row.isAbsolute ? `${row.pct.toFixed(1)}pp` : `${row.pct.toFixed(1)}%`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-slate-600 mt-3">* 2026 data through May (Q1 + latest available). Toggle to monthly view for interpolated mid-year detail.</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 gap-4">
        {prevCountry ? (
          <Link href={`/country/${prevCountry.id}`}
            className="flex items-center gap-2 card px-4 py-3 hover:border-amber-500/50 transition-all text-sm">
            <span className="text-slate-400">←</span>
            <span>{prevCountry.flag} {prevCountry.name}</span>
            <span className="text-slate-500 text-xs">#{prevCountry.gdpRank}</span>
          </Link>
        ) : <div />}

        <Link href="/compare"
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
          Compare Countries
        </Link>

        {nextCountry ? (
          <Link href={`/country/${nextCountry.id}`}
            className="flex items-center gap-2 card px-4 py-3 hover:border-amber-500/50 transition-all text-sm">
            <span className="text-slate-500 text-xs">#{nextCountry.gdpRank}</span>
            <span>{nextCountry.flag} {nextCountry.name}</span>
            <span className="text-slate-400">→</span>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
