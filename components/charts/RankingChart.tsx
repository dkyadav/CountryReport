'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MonthData } from '@/data/monthly';

interface Props {
  asianRank: MonthData[];
  inflationRate: MonthData[];
  unemploymentRate: MonthData[];
  fdiInflow: MonthData[];
  granularity: 'yearly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-2 font-semibold">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-slate-300 text-xs">{p.name}</span>
            </span>
            <span className="font-bold text-xs" style={{ color: p.color }}>
              {p.name === 'Asian Rank' ? `#${Math.round(p.value)}` :
               p.name === 'FDI Inflow' ? `$${p.value.toFixed(1)}B` :
               `${p.value.toFixed(1)}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RankingChart({ asianRank, inflationRate, unemploymentRate, fdiInflow, granularity }: Props) {
  const data = asianRank.map((r, i) => ({
    label: r.label,
    'Asian Rank': r.value,
    'Inflation': inflationRate[i]?.value ?? 0,
    'Unemployment': unemploymentRate[i]?.value ?? 0,
    'FDI Inflow': fdiInflow[i]?.value ?? 0,
  }));

  const rankChange = asianRank[0].value - asianRank[asianRank.length - 1].value;
  const lastInflation = inflationRate[inflationRate.length - 1];
  const lastUnemployment = unemploymentRate[unemploymentRate.length - 1];
  const lastFdi = fdiInflow[fdiInflow.length - 1];

  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">Asian Rank Change</div>
          <div className={`font-bold text-lg ${rankChange > 0 ? 'text-emerald-400' : rankChange < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {rankChange > 0 ? `▲ ${Math.round(rankChange)}` : rankChange < 0 ? `▼ ${Math.abs(Math.round(rankChange))}` : '—'} pos.
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">Inflation {lastInflation.year}</div>
          <div className={`font-bold text-lg ${lastInflation.value > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lastInflation.value.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">Unemployment {lastUnemployment.year}</div>
          <div className="font-bold text-lg text-amber-400">
            {lastUnemployment.value.toFixed(1)}%
          </div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">FDI {lastFdi.year}</div>
          <div className="font-bold text-lg text-blue-400">
            ${lastFdi.value.toFixed(1)}B
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-2">Asian GDP Rank over time (lower = better)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
            <YAxis reversed tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={30}
              tickFormatter={(v) => `#${v}`} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Asian Rank" stroke="#818cf8" strokeWidth={granularity === 'monthly' ? 1.5 : 2.5}
              dot={granularity === 'monthly' ? false : { r: 4, fill: '#818cf8', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f59e0b' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">Inflation & Unemployment rates (%)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={35}
              tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Inflation" stroke="#fb923c" strokeWidth={granularity === 'monthly' ? 1.2 : 2}
              dot={granularity === 'monthly' ? false : { r: 3, fill: '#fb923c', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="Unemployment" stroke="#38bdf8" strokeWidth={granularity === 'monthly' ? 1.2 : 2}
              dot={granularity === 'monthly' ? false : { r: 3, fill: '#38bdf8', strokeWidth: 0 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
