'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { MonthFuel } from '@/data/monthly';

interface Props {
  data: MonthFuel[];
  currencySymbol: string;
  granularity: 'yearly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-2 font-semibold">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-slate-300">{p.name}</span>
            </span>
            <span className="font-bold" style={{ color: p.color }}>
              {currencySymbol}{p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function FuelChart({ data, currencySymbol, granularity }: Props) {
  const first = data[0];
  const last = data[data.length - 1];
  const petrolChange = ((last.petrol - first.petrol) / first.petrol) * 100;
  const dieselChange = ((last.diesel - first.diesel) / first.diesel) * 100;
  const lpgChange = ((last.lpg - first.lpg) / first.lpg) * 100;

  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Petrol', change: petrolChange, color: '#f59e0b' },
          { label: 'Diesel', change: dieselChange, color: '#60a5fa' },
          { label: 'LPG', change: lpgChange, color: '#a78bfa' },
        ].map(({ label, change, color }) => (
          <div key={label} className="bg-slate-700/30 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-500 mb-0.5">{label}</div>
            <div className="font-bold text-sm" style={{ color }}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">vs {first.year}</div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
            tickFormatter={(v) => v.toLocaleString()} />
          <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }} />
          {(['petrol', 'diesel', 'lpg'] as const).map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} name={key[0].toUpperCase() + key.slice(1)}
              stroke={['#f59e0b', '#60a5fa', '#a78bfa'][i]}
              strokeWidth={granularity === 'monthly' ? 1.5 : 2.5}
              dot={granularity === 'monthly' ? false : { r: 4, fill: ['#f59e0b', '#60a5fa', '#a78bfa'][i], strokeWidth: 0 }}
              activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
