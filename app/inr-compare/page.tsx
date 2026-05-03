'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { countries } from '@/data/countries';
import { YEARS, RANGE_LABEL } from '@/data/years';
import { toMonthly, VARIANCE } from '@/data/monthly';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';

const COLOR_PALETTE = [
  '#f59e0b', '#34d399', '#60a5fa', '#a78bfa', '#fb923c',
  '#22d3ee', '#fb7185', '#facc15', '#4ade80', '#818cf8',
  '#f472b6', '#2dd4bf', '#fdba74', '#c084fc', '#f87171',
  '#a3e635', '#06b6d4', '#ec4899', '#84cc16',
];

export default function InrComparePage() {
  const [granularity, setGranularity] = useState<'yearly' | 'monthly'>('yearly');
  const [direction, setDirection] = useState<'inr-to-other' | 'other-to-inr'>('inr-to-other');

  const india = countries.find((c) => c.id === 'india')!;
  const others = countries.filter((c) => c.id !== 'india');

  // Set up color map
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    others.forEach((c, i) => { map[c.id] = COLOR_PALETTE[i % COLOR_PALETTE.length]; });
    return map;
  }, [others]);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    ['china', 'japan', 'south-korea', 'singapore', 'pakistan', 'turkey']
  );

  function toggleSelected(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  // Build cross-rate time series
  const crossRateData = useMemo(() => {
    const inrSeries = granularity === 'yearly'
      ? india.currencyVsUSD.map((d) => ({ label: String(d.year), value: d.value, year: d.year }))
      : toMonthly(india.currencyVsUSD, VARIANCE.currency);

    return inrSeries.map((inrPoint, i) => {
      const row: Record<string, string | number> = { label: inrPoint.label };
      others.forEach((c) => {
        const otherSeries = granularity === 'yearly'
          ? c.currencyVsUSD.map((d) => ({ value: d.value }))
          : toMonthly(c.currencyVsUSD, VARIANCE.currency);
        const otherVal = otherSeries[i]?.value ?? 0;
        const inrVal = inrPoint.value;
        // 1 INR = (other/USD) / (INR/USD) units of other currency
        // 1 OTHER = (INR/USD) / (other/USD) units of INR
        if (direction === 'inr-to-other') {
          row[c.name] = otherVal / inrVal;
        } else {
          row[c.name] = inrVal / otherVal;
        }
      });
      return row;
    });
  }, [granularity, direction, india, others]);

  // Performance analysis: % change vs USD from first to last year (depreciation if positive)
  const performance = useMemo(() => {
    const inrFirst = india.currencyVsUSD[0].value;
    const inrLast = india.currencyVsUSD[india.currencyVsUSD.length - 1].value;
    const inrPct = ((inrLast - inrFirst) / inrFirst) * 100;

    const others_perf = others.map((c) => {
      const first = c.currencyVsUSD[0].value;
      const last = c.currencyVsUSD[c.currencyVsUSD.length - 1].value;
      const pct = ((last - first) / first) * 100;
      // If pct < inrPct → currency depreciated less than INR → stronger than INR
      const relative = pct - inrPct; // negative = stronger than INR; positive = weaker
      return {
        id: c.id,
        name: c.name,
        flag: c.flag,
        currencyCode: c.currencyCode,
        usdPct: pct,
        relative,
        stronger: relative < 0,
      };
    });

    others_perf.sort((a, b) => a.relative - b.relative);

    const stronger = others_perf.filter((p) => p.relative < -0.5);
    const weaker = others_perf.filter((p) => p.relative > 0.5);
    const similar = others_perf.filter((p) => Math.abs(p.relative) <= 0.5);

    return { inrPct, all: others_perf, stronger, weaker, similar };
  }, [india, others]);

  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  const formatValue = (v: number) => {
    if (v >= 1000) return v.toFixed(0);
    if (v >= 10) return v.toFixed(2);
    if (v >= 0.01) return v.toFixed(4);
    return v.toFixed(6);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-slate-500 hover:text-amber-400 text-sm transition-colors">← Back</Link>
        <div className="flex items-center gap-3 mt-2 mb-2">
          <span className="text-4xl">🇮🇳</span>
          <h1 className="text-3xl font-bold text-white">INR vs Asian Currencies</h1>
        </div>
        <p className="text-slate-400">
          How the Indian Rupee compares against the other 19 Asian currencies — cross-rates,
          relative performance vs USD, and a verdict on which currencies have outperformed INR.
        </p>
      </div>

      {/* INR Performance Hero */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <div className="text-slate-500 text-xs mb-1">INR vs USD ({YEARS[0]} → {YEARS[YEARS.length - 1]})</div>
            <div className="text-3xl font-bold text-rose-400">
              ▼ {performance.inrPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {india.currencyVsUSD[0].value} → {india.currencyVsUSD[india.currencyVsUSD.length - 1].value} per USD
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-500 text-xs mb-1">Currencies STRONGER than INR</div>
            <div className="text-3xl font-bold text-emerald-400">{performance.stronger.length}</div>
            <div className="text-xs text-slate-500 mt-1">depreciated less vs USD than INR</div>
          </div>
          <div className="text-right sm:text-center">
            <div className="text-slate-500 text-xs mb-1">Currencies WEAKER than INR</div>
            <div className="text-3xl font-bold text-rose-400">{performance.weaker.length}</div>
            <div className="text-xs text-slate-500 mt-1">depreciated more vs USD than INR</div>
          </div>
        </div>
        {performance.similar.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500 text-center">
            {performance.similar.length} currencies performed within ±0.5pp of INR
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white font-semibold">Cross-rate Chart</h2>
            <p className="text-slate-500 text-sm">
              Showing {selectedIds.length} of {others.length} currencies · {granularity === 'yearly' ? '7 yearly points' : '77 monthly points'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
              {(['inr-to-other', 'other-to-inr'] as const).map((d) => (
                <button key={d} onClick={() => setDirection(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${direction === d ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  {d === 'inr-to-other' ? '1 INR → Other' : '1 Other → INR'}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
              {(['yearly', 'monthly'] as const).map((g) => (
                <button key={g} onClick={() => setGranularity(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${granularity === g ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  {g === 'yearly' ? 'Yearly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Country chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {others.map((c) => {
            const selected = selectedIds.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggleSelected(c.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border-2`}
                style={selected ? {
                  background: colorMap[c.id] + '20',
                  borderColor: colorMap[c.id],
                  color: colorMap[c.id],
                } : {
                  background: 'transparent',
                  borderColor: '#475569',
                  color: '#94a3b8',
                }}>
                {c.flag} {c.currencyCode}
              </button>
            );
          })}
        </div>

        {selectedIds.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">Select at least one currency to compare.</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={crossRateData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={70}
                tickFormatter={(v) => formatValue(v)} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(v, name) => {
                  const n = Number(v);
                  const c = others.find((x) => x.name === String(name));
                  const label = direction === 'inr-to-other'
                    ? `${formatValue(n)} ${c?.currencyCode}`
                    : `₹${formatValue(n)}`;
                  return [label, String(name)];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              {others.filter((c) => selectedIds.includes(c.id)).map((c) => (
                <Line key={c.id} type="monotone" dataKey={c.name} stroke={colorMap[c.id]}
                  strokeWidth={granularity === 'monthly' ? 1.5 : 2}
                  dot={granularity === 'monthly' ? false : { r: 3, fill: colorMap[c.id], strokeWidth: 0 }}
                  activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        <p className="text-xs text-slate-600 mt-3">
          {direction === 'inr-to-other'
            ? `Y-axis: how many units of each currency you get for ₹1 (higher = INR strengthens vs that currency)`
            : `Y-axis: how many INR you get for 1 unit of the other currency (higher = the other currency strengthens vs INR)`}
        </p>
      </div>

      {/* Performance Bar Chart */}
      <div className="card p-6 mb-6">
        <h2 className="text-white font-semibold mb-1">Relative Performance vs USD ({YEARS[0]} → {YEARS[YEARS.length - 1]})</h2>
        <p className="text-slate-500 text-sm mb-4">
          Each bar shows that currency's depreciation vs USD minus INR's depreciation. Negative bars (green) = stronger than INR.
          Positive bars (red) = weaker than INR. Reference line at 0 = matched INR.
        </p>
        <ResponsiveContainer width="100%" height={Math.max(performance.all.length * 28, 320)}>
          <BarChart data={performance.all} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}pp`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#cbd5e1', fontWeight: 600 }}
              formatter={(v, _name, item: any) => {
                const n = Number(v);
                const usdPct = item.payload.usdPct;
                return [`${n > 0 ? '+' : ''}${n.toFixed(1)}pp vs INR (own depreciation: ${usdPct > 0 ? '+' : ''}${usdPct.toFixed(1)}%)`, 'Relative'];
              }}
            />
            <ReferenceLine x={0} stroke="#64748b" strokeWidth={2} />
            <Bar dataKey="relative" radius={[0, 3, 3, 0]}>
              {performance.all.map((p) => (
                <Cell key={p.id} fill={p.relative < -0.5 ? '#34d399' : p.relative > 0.5 ? '#f87171' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stronger / Weaker tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-400 text-xl">▲</span>
            <h2 className="text-white font-semibold">Stronger than INR ({performance.stronger.length})</h2>
          </div>
          <p className="text-slate-500 text-xs mb-4">These currencies depreciated less vs USD than the rupee did.</p>
          <div className="space-y-2">
            {performance.stronger.length === 0 && <p className="text-slate-500 text-sm">No currencies in this category.</p>}
            {performance.stronger.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.flag}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{p.name}</div>
                    <div className="text-slate-500 text-xs">{p.currencyCode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-sm">{p.relative.toFixed(1)}pp</div>
                  <div className="text-slate-500 text-xs">vs USD: {p.usdPct > 0 ? '+' : ''}{p.usdPct.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-rose-400 text-xl">▼</span>
            <h2 className="text-white font-semibold">Weaker than INR ({performance.weaker.length})</h2>
          </div>
          <p className="text-slate-500 text-xs mb-4">These currencies depreciated more vs USD than the rupee did.</p>
          <div className="space-y-2">
            {performance.weaker.length === 0 && <p className="text-slate-500 text-sm">No currencies in this category.</p>}
            {[...performance.weaker].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.flag}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{p.name}</div>
                    <div className="text-slate-500 text-xs">{p.currencyCode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-rose-400 font-bold text-sm">+{p.relative.toFixed(1)}pp</div>
                  <div className="text-slate-500 text-xs">vs USD: +{p.usdPct.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar */}
      {performance.similar.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="text-white font-semibold mb-3">Tracked closely with INR ({performance.similar.length})</h2>
          <div className="flex flex-wrap gap-2">
            {performance.similar.map((p) => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-700/30 rounded-full px-3 py-1.5 text-sm">
                <span>{p.flag}</span>
                <span className="text-slate-300">{p.name}</span>
                <span className="text-slate-500 text-xs">({p.relative > 0 ? '+' : ''}{p.relative.toFixed(1)}pp)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snapshot table — current rates */}
      <div className="card p-6 mt-6 overflow-x-auto">
        <h2 className="text-white font-semibold mb-4">Current Cross-rates ({YEARS[YEARS.length - 1]})</h2>
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="pb-3 font-medium">Currency</th>
              <th className="pb-3 font-medium text-right">1 USD</th>
              <th className="pb-3 font-medium text-right">1 INR</th>
              <th className="pb-3 font-medium text-right">1 unit → INR</th>
              <th className="pb-3 font-medium text-right">vs USD ({YEARS[0]}–{YEARS[YEARS.length - 1]})</th>
              <th className="pb-3 font-medium text-right">vs INR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {performance.all.map((p) => {
              const c = others.find((x) => x.id === p.id)!;
              const lastUSDtoOther = c.currencyVsUSD[c.currencyVsUSD.length - 1].value;
              const lastINR = india.currencyVsUSD[india.currencyVsUSD.length - 1].value;
              const inrToOther = lastUSDtoOther / lastINR;
              const otherToInr = lastINR / lastUSDtoOther;
              return (
                <tr key={p.id} className="hover:bg-slate-700/20">
                  <td className="py-2.5 text-slate-300">{p.flag} {p.name} <span className="text-slate-600 text-xs">({p.currencyCode})</span></td>
                  <td className="py-2.5 text-right text-slate-400">{lastUSDtoOther.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-slate-400">{formatValue(inrToOther)}</td>
                  <td className="py-2.5 text-right text-amber-400 font-medium">₹{formatValue(otherToInr)}</td>
                  <td className="py-2.5 text-right text-slate-400">{p.usdPct > 0 ? '+' : ''}{p.usdPct.toFixed(1)}%</td>
                  <td className={`py-2.5 text-right font-semibold ${p.relative < -0.5 ? 'text-emerald-400' : p.relative > 0.5 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {p.relative > 0 ? '+' : ''}{p.relative.toFixed(1)}pp
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
