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
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `Solved: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "var(--text-primary)" },
        grid: { color: "var(--border-color)" },
      },
      y: {
        ticks: { color: "var(--text-primary)" },
        grid: { color: "var(--border-color)" },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default ReportChart;