'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InsightsChartProps {
  bookStats: { book: string; count: number }[];
  yearlyStats: { year: string; count: number }[];
}

export default function InsightsChart({ bookStats, yearlyStats }: InsightsChartProps) {
  const bookData = {
    labels: bookStats.map(s => s.book),
    datasets: [
      {
        label: '묵상 횟수',
        data: bookStats.map(s => s.count),
        backgroundColor: 'rgba(35, 131, 226, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const bookOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#37352f',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#efefed' } },
      x: { grid: { display: false } }
    }
  };

  const yearlyData = {
    labels: yearlyStats.map(s => `${s.year}년`),
    datasets: [
      {
        label: '연간 묵상 일수',
        data: yearlyStats.map(s => s.count),
        borderColor: '#f2c94c',
        backgroundColor: 'rgba(242, 201, 76, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f2c94c',
      },
    ],
  };

  const yearlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#37352f',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#efefed' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white border border-[#e9e9e7] rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#9b9a97] mb-6">자주 머무르신 성경 본문 (Top 5)</h3>
        <div className="h-[250px] w-full">
          <Bar data={bookData} options={bookOptions} />
        </div>
      </div>
      
      <div className="bg-white border border-[#e9e9e7] rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#9b9a97] mb-6">연도별 은혜의 기록 (묵상 횟수)</h3>
        <div className="h-[250px] w-full">
          <Line data={yearlyData} options={yearlyOptions} />
        </div>
      </div>
    </div>
  );
}
