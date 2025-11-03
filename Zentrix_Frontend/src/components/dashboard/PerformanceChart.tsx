import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import type { Report } from '../../App';
import '../../styles/components.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type PerformanceChartProps = {
  reports: Report[];
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ reports }) => {
  const chartData = {
    labels: reports.map(r => new Date(r.date).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: 'Codeforces Rating',
        data: reports.map(r => r.codeforcesData?.rating || null).reverse(),
        borderColor: '#C5A32F',
        backgroundColor: 'rgba(197, 163, 47, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#F8F9FA',
        },
      },
      title: {
        display: true,
        text: 'Performance Trend',
        color: '#F8F9FA',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="performance-chart-container">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default PerformanceChart;