'use client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props { income: number; expense: number }

export default function CategoryPieChart({ income, expense }: Props) {
  const data = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expense],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(244,63,94,0.8)'],
      borderColor: ['#10b981', '#f43f5e'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(13,21,38,0.95)',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (ctx: any) => ` ₦${ctx.parsed.toLocaleString()}`,
        },
      },
    },
  };

  const net = income - expense;
  const margin = income > 0 ? ((net / income) * 100).toFixed(1) : '0';

  return (
    <div style={{ position: 'relative', height: 220 }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none',
      }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>Net</p>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {margin}%
        </p>
      </div>
    </div>
  );
}
