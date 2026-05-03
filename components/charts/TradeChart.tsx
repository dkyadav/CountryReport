'use client';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { MonthData } from '@/data/monthly';

interface Props {
  imports: MonthData[];
  exports: MonthData[];
  granularity: 'yearly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const exp = payload.find((p: any) => p.name === 'Exports');
    const imp = payload.find((p: any) => p.name === 'Imports');
    const balance = exp && imp ? exp.value - imp.value : 0;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-400 mb-2 font-semibold">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded" style={{ background: p.fill || p.stroke }} />
              <span className="text-slate-300">{p.name}</span>
            </span>
            <span className="font-bold" style={{ color: p.fill || p.stroke }}>${p.value.toFixed(1)}B</span>
          </div>
        ))}
        {exp && imp && (
          <div className={`mt-1 pt-1 border-t border-slate-700 font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Balance: {balance >= 0 ? '+' : ''}${balance.toFixed(1)}B
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function TradeChart({ imports, exports, granularity }: Props) {
  const data = imports.map((imp, i) => ({
    label: imp.label,
    Imports: imp.value,
    Exports: exports[i]?.value ?? 0,
  }));

  const exportChange = ((exports[exports.length - 1].value - exports[0].value) / exports[0].value) * 100;
  const importChange = ((imports[imports.length - 1].value - imports[0].value) / imports[0].value) * 100;

  const tickFormatter = granularity === 'monthly'
    ? (v: string) => v.startsWith('Jan ') ? v.slice(4) : ''
    : undefined;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">Export Growth</div>
          <div className={`font-bold text-lg ${exportChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {exportChange > 0 ? '+' : ''}{exportChange.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">${exports[0].value.toFixed(0)}B → ${exports[exports.length - 1].value.toFixed(0)}B</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-xs text-slate-500">Import Growth</div>
          <div className={`font-bold text-lg ${importChange >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {importChange > 0 ? '+' : ''}{importChange.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">${imports[0].value.toFixed(0)}B → ${imports[imports.length - 1].value.toFixed(0)}B</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        {granularity === 'yearly' ? (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
              tickFormatter={(v) => `$${v}B`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#33415540' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }} />
            <Bar dataKey="Exports" fill="#34d399" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Imports" fill="#f87171" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={tickFormatter} interval={11} minTickGap={20} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
              tickFormatter={(v) => `$${v}B`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }} />
            <Line type="monotone" dataKey="Exports" stroke="#34d399" strokeWidth={1.5} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Imports" stroke="#f87171" strokeWidth={1.5} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
