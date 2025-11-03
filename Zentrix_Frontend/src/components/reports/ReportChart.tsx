import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import type { Report } from "../../App";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportChart = ({ data }: { data: Report['difficultyBreakdown'] }) => {
  const chartData = {
    labels: data.map((item) => item.difficulty),
    datasets: [
      {
        label: "Problems Solved",
        data: data.map((item) => item.count),
        backgroundColor: [
          "#ff6b6b", // Easy
          "#e50914", // Medium
          "#8b0000", // Hard
        ],
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Problems Solved by Difficulty",
        color: "var(--text-primary)",
        font: {
          size: 16,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `Solved: ${context.raw}`,
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'var(--primary-color)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "var(--text-primary)",
          font: {
            size: 12,
          },
        },
        grid: { color: "var(--border-color)" },
      },
      y: {
        ticks: {
          color: "var(--text-primary)",
          font: {
            size: 12,
          },
          beginAtZero: true,
        },
        grid: { color: "var(--border-color)" },
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="report-chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ReportChart;