'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { MonthData } from '@/data/monthly';

interface Props {
  data: MonthData[];
  currencyCode: string;
  baseValue: number;
  granularity: 'yearly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label, currencyCode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-amber-400 font-bold">
          1 USD = {payload[0].value.toLocaleString()} {currencyCode}
        </p>
      </div>
    );
  }
  return null;
};

export default function CurrencyChart({ data, currencyCode, baseValue, granularity }: Props) {
  const first = data[0];
  const last = data[data.length - 1];
  const pctChange = ((last.value - first.value) / first.value) * 100;
  const depreciated = pctChange > 0;

  // For monthly view, only show year on x-axis (every Jan)
  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-lg font-bold ${depreciated ? 'text-rose-400' : 'text-emerald-400'}`}>
          {depreciated ? '▼' : '▲'} {Math.abs(pctChange).toFixed(1)}%
        </div>
        <div className="text-slate-400 text-sm">
          {depreciated ? 'Depreciated' : 'Appreciated'} vs USD ({first.label}→{last.label})
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={tickFormatter} interval={granularity === 'monthly' ? 11 : 0} minTickGap={20} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60}
            tickFormatter={(v) => v.toLocaleString()} />
          <Tooltip content={<CustomTooltip currencyCode={currencyCode} />} />
          <ReferenceLine y={baseValue} stroke="#475569" strokeDasharray="4 2" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={depreciated ? '#f87171' : '#34d399'}
            strokeWidth={granularity === 'monthly' ? 1.5 : 2.5}
            dot={granularity === 'monthly' ? false : { r: 4, fill: depreciated ? '#f87171' : '#34d399', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#f59e0b' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {granularity === 'yearly' && (
        <div className="grid grid-cols-7 gap-1 mt-3">
          {data.map((d) => (
            <div key={d.label} className="text-center">
              <div className="text-xs text-slate-500">{d.label}</div>
              <div className="text-xs text-slate-300 font-medium">{d.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
      {granularity === 'monthly' && (
        <p className="text-xs text-slate-600 mt-2 text-center">{data.length} monthly data points · interpolated from annual anchors with realistic FX noise</p>
      )}
    </div>
  );
}
