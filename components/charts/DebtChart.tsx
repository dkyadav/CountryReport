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
        <p className="text-rose-400 font-bold">External Debt: ${payload[0].value.toLocaleString()}B</p>
      </div>
    );
  }
  return null;
};

export default function DebtChart({ data, granularity }: Props) {
  const first = data[0];
  const last = data[data.length - 1];
  const change = ((last.value - first.value) / first.value) * 100;
  const increased = change > 0;

  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  return (
    <div>
      <div className="flex items-center gap-6 mb-4">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">{first.year} Debt</div>
          <div className="text-white font-bold">${first.value.toLocaleString()}B</div>
        </div>
        <div className="text-slate-600">→</div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">{last.year} Debt</div>
          <div className="text-white font-bold">${last.value.toLocaleString()}B</div>
        </div>
        <div className={`ml-auto text-lg font-bold ${increased ? 'text-rose-400' : 'text-emerald-400'}`}>
          {increased ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={increased ? '#f87171' : '#34d399'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={increased ? '#f87171' : '#34d399'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={55}
            tickFormatter={(v) => `$${v}B`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={increased ? '#f87171' : '#34d399'}
            strokeWidth={granularity === 'monthly' ? 1.5 : 2.5}
            fill="url(#debtGradient)"
            dot={granularity === 'monthly' ? false : { r: 4, fill: increased ? '#f87171' : '#34d399', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#f59e0b' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
