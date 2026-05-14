'use client';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Transaction } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

interface Props { transactions: Transaction[] }

export default function RevenueChart({ transactions }: Props) {
  const days: string[] = [];
  const incomeData: number[] = [];
  const expenseData: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' });
    days.push(label);
    const dayTx = transactions.filter(t => t.date === key);
    incomeData.push(dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
    expenseData.push(dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  }

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: expenseData,
        backgroundColor: 'rgba(244,63,94,0.6)',
        borderColor: '#f43f5e',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(13,21,38,0.95)',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (ctx: any) => ` ₦${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: {
          color: '#475569',
          font: { size: 10 },
          callback: (v: any) => '₦' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Bar data={data} options={options as any} />
    </div>
  );
}
