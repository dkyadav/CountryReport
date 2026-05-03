'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MonthData } from '@/data/monthly';

interface Props {
  data: MonthData[];
  granularity: 'yearly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-amber-400 font-bold">Per Capita: ${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function PerCapitaChart({ data, granularity }: Props) {
  const first = data[0];
  const last = data[data.length - 1];
  const change = ((last.value - first.value) / first.value) * 100;
  const yearsSpan = granularity === 'yearly' ? data.length - 1 : (data.length - 1) / 12;
  const cagr = (Math.pow(last.value / first.value, 1 / Math.max(yearsSpan, 1)) - 1) * 100;

  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">{first.year}</div>
          <div className="text-white font-bold">${first.value.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">{last.year}</div>
          <div className="text-white font-bold">${last.value.toLocaleString()}</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">CAGR</div>
          <div className={`font-bold ${cagr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {cagr > 0 ? '+' : ''}{cagr.toFixed(1)}%
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="pcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={granularity === 'monthly' ? 1.5 : 2.5}
            fill="url(#pcGradient)"
            dot={granularity === 'monthly' ? false : { r: 4, fill: '#f59e0b', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#fbbf24' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
