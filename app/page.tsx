import Link from 'next/link';
import { getAllCountries } from '@/lib/services/countryService';
import { RANGE_LABEL, latest, pctChange, FIRST_YEAR, LAST_YEAR } from '@/data/years';

function formatGDP(billion: number) {
  if (billion >= 1000) return `$${(billion / 1000).toFixed(1)}T`;
  return `$${billion.toFixed(0)}B`;
}

function TrendBadge({ pct, invert = false }: { pct: number; invert?: boolean }) {
  const positive = invert ? pct < 0 : pct > 0;
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

export default async function Home() {
  const sortedCountries = await getAllCountries(); // already sorted by gdpRank
  const totalGDP = sortedCountries.reduce((sum, c) => sum + c.gdpLatest, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Top 20 Asian Economies
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Track economic growth across currency, fuel prices, debt, trade, and per capita income
          for the largest Asian economies from <span className="text-amber-400 font-semibold">{RANGE_LABEL}</span>.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Countries Tracked', value: '20', sub: 'Top Asian GDPs' },
          { label: 'Indicators', value: '10', sub: 'Per country' },
          { label: 'Years Covered', value: `${LAST_YEAR - FIRST_YEAR + 1}`, sub: RANGE_LABEL },
          { label: 'Total GDP', value: `$${(totalGDP / 1000).toFixed(0)}T+`, sub: `Combined ${LAST_YEAR}` },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl font-bold text-amber-400">{s.value}</div>
            <div className="text-white font-medium text-sm mt-0.5">{s.label}</div>
            <div className="text-slate-500 text-xs">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedCountries.map((country) => {
          const gdpTrend = pctChange(country.perCapitaIncome);
          const exportTrend = pctChange(country.exports);
          const debtTrend = pctChange(country.externalDebt);
          const currencyTrend = pctChange(country.currencyVsUSD);

          return (
            <Link
              key={country.id}
              href={`/country/${country.id}`}
              className="card p-5 hover:border-amber-500/50 hover:shadow-amber-500/10 hover:shadow-xl transition-all group cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <h2 className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                      {country.name}
                    </h2>
                    <p className="text-slate-500 text-xs">{country.region}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-mono bg-slate-700/50 px-2 py-1 rounded-full">
                  #{country.gdpRank}
                </span>
              </div>

              {/* GDP */}
              <div className="bg-slate-700/30 rounded-lg px-3 py-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">GDP {LAST_YEAR}</span>
                  <span className="text-white font-bold">{formatGDP(country.gdpLatest)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-400 text-xs">Per Capita</span>
                  <span className="text-slate-300 text-sm font-medium">
                    ${latest(country.perCapitaIncome).value.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Per Capita Growth</span>
                  <TrendBadge pct={gdpTrend} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Export Growth</span>
                  <TrendBadge pct={exportTrend} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ext. Debt Change</span>
                  <TrendBadge pct={debtTrend} invert />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Currency vs USD</span>
                  <TrendBadge pct={currencyTrend} invert />
                </div>
              </div>

              {/* Currency */}
              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-600">{country.currencyCode}</span>
                <span className="text-slate-400">
                  1 USD = {latest(country.currencyVsUSD).value.toLocaleString()} {country.currencyCode}
                </span>
              </div>

              <div className="mt-2 text-center text-xs text-slate-600 group-hover:text-amber-500/70 transition-colors">
                View detailed charts →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 card text-sm text-slate-400">
        <p className="font-semibold text-slate-300 mb-2">About the Data</p>
        <p>
          GDP rankings and economic data sourced from IMF World Economic Outlook (Oct 2025), World Bank Open Data, UNCTAD, and national statistics bureaus.
          Currency rates are year-end values. Fuel prices are in local currency per liter (LPG per kg or per cylinder, country-specific).
          External debt and trade figures are in billion USD. Growth percentages compare {FIRST_YEAR} vs {LAST_YEAR} values.
          {LAST_YEAR} values reflect data through May {LAST_YEAR}, mixing actuals and Q1 projections.
        </p>
      </div>
    </div>
  );
}
