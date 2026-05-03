'use client';

import { useState } from 'react';
import Link from 'next/link';
import { countries } from '@/data/countries';
import { YEARS, RANGE_LABEL, latest } from '@/data/years';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#f59e0b', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'];

function normalize(value: number, min: number, max: number) {
  if (max === min) return 50;
  return Math.round(((value - min) / (max - min)) * 100);
}

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['china', 'india', 'japan']);

  const selectedCountries = countries.filter((c) => selectedIds.includes(c.id));

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 5
        ? [...prev, id]
        : prev
    );
  }

  const getLatest = (arr: { year: number; value: number }[]) => latest(arr).value;

  const metricsRaw = selectedCountries.map((c) => ({
    id: c.id,
    name: c.name,
    flag: c.flag,
    perCapita: getLatest(c.perCapitaIncome),
    exports: getLatest(c.exports),
    imports: getLatest(c.imports),
    gdp: c.gdpLatest,
    fdi: getLatest(c.fdiInflow),
    inflationInv: 100 - Math.min(getLatest(c.inflationRate), 50) * 2,
    unemploymentInv: 100 - Math.min(getLatest(c.unemploymentRate), 20) * 5,
  }));

  const keys = ['perCapita', 'exports', 'imports', 'gdp', 'fdi', 'inflationInv', 'unemploymentInv'] as const;
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};
  keys.forEach((k) => {
    mins[k] = Math.min(...metricsRaw.map((m) => m[k]));
    maxs[k] = Math.max(...metricsRaw.map((m) => m[k]));
  });

  const radarData = [
    { metric: 'Per Capita' },
    { metric: 'Exports' },
    { metric: 'Imports' },
    { metric: 'GDP Size' },
    { metric: 'FDI Inflow' },
    { metric: 'Low Inflation' },
    { metric: 'Low Unemployment' },
  ].map((d, i) => {
    const key = keys[i];
    const row: Record<string, string | number> = { metric: d.metric };
    metricsRaw.forEach((m) => {
      row[m.name] = normalize(m[key], mins[key], maxs[key]);
    });
    return row;
  });

  const perCapitaData = YEARS.map((year) => {
    const row: Record<string, string | number> = { year };
    selectedCountries.forEach((c) => {
      const found = c.perCapitaIncome.find((d) => d.year === year);
      if (found) row[c.name] = found.value;
    });
    return row;
  });

  const exportData = YEARS.map((year) => {
    const row: Record<string, string | number> = { year };
    selectedCountries.forEach((c) => {
      const found = c.exports.find((d) => d.year === year);
      if (found) row[c.name] = found.value;
    });
    return row;
  });

  const latestYear = YEARS[YEARS.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/" className="text-slate-500 hover:text-amber-400 text-sm transition-colors">← Back</Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Compare Countries</h1>
        <p className="text-slate-400">Select up to 5 countries to compare side-by-side. Click a country to toggle selection.</p>
      </div>

      <div className="card p-5 mb-8">
        <h2 className="text-white font-semibold mb-3">Select Countries ({selectedIds.length}/5 selected)</h2>
        <div className="flex flex-wrap gap-2">
          {[...countries].sort((a, b) => a.gdpRank - b.gdpRank).map((c) => {
            const selected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                  ${selected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-700/40 border-slate-600 text-slate-400 hover:border-slate-400'
                  }`}
              >
                {c.flag} {c.name}
                {selected && <span className="ml-1 text-amber-400">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedCountries.length < 2 ? (
        <div className="card p-10 text-center text-slate-400">
          Please select at least 2 countries to compare.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {selectedCountries.map((c, i) => (
              <div key={c.id} className="card p-4 border-t-4" style={{ borderTopColor: COLORS[i] }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{c.name}</div>
                    <div className="text-slate-500 text-xs">#{c.gdpRank} Asian GDP</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">GDP {latestYear}</span>
                    <span className="text-white font-medium">
                      {c.gdpLatest >= 1000 ? `$${(c.gdpLatest / 1000).toFixed(1)}T` : `$${c.gdpLatest}B`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Per Capita</span>
                    <span className="text-white font-medium">${getLatest(c.perCapitaIncome).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exports</span>
                    <span className="text-emerald-400 font-medium">${getLatest(c.exports)}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Imports</span>
                    <span className="text-rose-400 font-medium">${getLatest(c.imports)}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inflation</span>
                    <span className={`font-medium ${getLatest(c.inflationRate) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {getLatest(c.inflationRate)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-white font-semibold text-lg mb-1">Overall Economic Profile ({latestYear})</h2>
            <p className="text-slate-500 text-sm mb-4">Normalized scores across key indicators (higher = better for each axis)</p>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                {selectedCountries.map((c, i) => (
                  <Radar key={c.id} name={c.name} dataKey={c.name}
                    stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
                ))}
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="text-white font-semibold text-lg mb-1">Per Capita Income (USD)</h2>
            <p className="text-slate-500 text-sm mb-4">Year-over-year comparison {RANGE_LABEL}</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={perCapitaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                {selectedCountries.map((c, i) => (
                  <Line key={c.id} type="monotone" dataKey={c.name} stroke={COLORS[i]} strokeWidth={2.5}
                    dot={{ r: 4, fill: COLORS[i], strokeWidth: 0 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="text-white font-semibold text-lg mb-1">Exports (Billion USD)</h2>
            <p className="text-slate-500 text-sm mb-4">Year-over-year comparison {RANGE_LABEL}</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={exportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v) => `$${v}B`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v) => [`$${Number(v)}B`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                {selectedCountries.map((c, i) => (
                  <Line key={c.id} type="monotone" dataKey={c.name} stroke={COLORS[i]} strokeWidth={2.5}
                    dot={{ r: 4, fill: COLORS[i], strokeWidth: 0 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6 overflow-x-auto">
            <h2 className="text-white font-semibold text-lg mb-4">Comparative Rankings</h2>
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-slate-400 font-medium">Metric</th>
                  {selectedCountries.map((c) => (
                    <th key={c.id} className="pb-3 text-slate-400 font-medium text-right">
                      {c.flag} {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {[
                  { label: 'GDP Rank (Asia)', fn: (c: typeof countries[0]) => `#${c.gdpRank}` },
                  { label: `GDP ${latestYear}`, fn: (c: typeof countries[0]) => c.gdpLatest >= 1000 ? `$${(c.gdpLatest / 1000).toFixed(1)}T` : `$${c.gdpLatest}B` },
                  { label: `Per Capita ${latestYear}`, fn: (c: typeof countries[0]) => `$${getLatest(c.perCapitaIncome).toLocaleString()}` },
                  { label: `Exports ${latestYear}`, fn: (c: typeof countries[0]) => `$${getLatest(c.exports)}B` },
                  { label: `Imports ${latestYear}`, fn: (c: typeof countries[0]) => `$${getLatest(c.imports)}B` },
                  { label: 'External Debt', fn: (c: typeof countries[0]) => `$${getLatest(c.externalDebt)}B` },
                  { label: `Inflation ${latestYear}`, fn: (c: typeof countries[0]) => `${getLatest(c.inflationRate)}%` },
                  { label: `Unemployment ${latestYear}`, fn: (c: typeof countries[0]) => `${getLatest(c.unemploymentRate)}%` },
                  { label: `FDI Inflow ${latestYear}`, fn: (c: typeof countries[0]) => `$${getLatest(c.fdiInflow)}B` },
                  { label: 'Currency (1 USD)', fn: (c: typeof countries[0]) => `${getLatest(c.currencyVsUSD)} ${c.currencyCode}` },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-slate-700/20">
                    <td className="py-2.5 text-slate-300">{row.label}</td>
                    {selectedCountries.map((c, i) => (
                      <td key={c.id} className="py-2.5 text-right font-medium" style={{ color: COLORS[i] }}>
                        {row.fn(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
