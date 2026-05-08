import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { adminService } from "../../services/admin";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface GrowthChartProps {
  isLoading?: boolean;
}

const GrowthChart: React.FC<GrowthChartProps> = () => {
  const { data: growthData, isLoading } = useQuery({
    queryKey: ["admin-growth-analytics"],
    queryFn: () => adminService.getGrowthAnalytics(),
  });

  // Sample data for when there's no real data
  const sampleData = [
    { month: "Jan", users: 45, companies: 8, bookings: 32 },
    { month: "Feb", users: 52, companies: 12, bookings: 45 },
    { month: "Mar", users: 68, companies: 15, bookings: 58 },
    { month: "Apr", users: 85, companies: 18, bookings: 72 },
    { month: "May", users: 102, companies: 22, bookings: 89 },
    { month: "Jun", users: 125, companies: 28, bookings: 105 },
  ];

  // Use real data if available and has values, otherwise use sample data
  const rawData = growthData?.data || [];
  const hasRealData =
    rawData.length > 0 &&
    rawData.some(
      (item: any) => item.users > 0 || item.companies > 0 || item.bookings > 0,
    );

  const chartData = hasRealData ? rawData : sampleData;

  // Prepare data for Line Chart
  const lineChartData = {
    labels: chartData.map((item) => item.month),
    datasets: [
      {
        label: "Users",
        data: chartData.map((item) => item.users),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Companies",
        data: chartData.map((item) => item.companies),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Bookings",
        data: chartData.map((item) => item.bookings),
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(245, 158, 11)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  // Prepare data for Bar Chart
  const barChartData = {
    labels: chartData.map((item) => item.month),
    datasets: [
      {
        label: "Users",
        data: chartData.map((item) => item.users),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: "Companies",
        data: chartData.map((item) => item.companies),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: "Bookings",
        data: chartData.map((item) => item.bookings),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "rgb(245, 158, 11)",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#6b7280",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#6b7280",
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 font-display">
            Growth Analytics
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            User, Company, and Booking trends over time
          </p>
        </div>
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
          <ChartBarIcon className="h-6 w-6 text-primary-600" />
        </div>
      </div>

      {/* Line Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          📈 Growth Trends (Line Chart)
        </h4>
        <div className="h-64">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          📊 Monthly Comparison (Bar Chart)
        </h4>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-blue-600">
            {chartData.reduce((sum, item) => sum + item.users, 0)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {chartData.length > 0 && chartData[0].users > 0
              ? `+${Math.round(
                  ((chartData[chartData.length - 1].users -
                    chartData[0].users) /
                    chartData[0].users) *
                    100,
                )}%`
              : "+0%"}{" "}
            growth
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Companies</p>
          <p className="text-2xl font-bold text-green-600">
            {chartData.reduce((sum, item) => sum + item.companies, 0)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {chartData.length > 0 && chartData[0].companies > 0
              ? `+${Math.round(
                  ((chartData[chartData.length - 1].companies -
                    chartData[0].companies) /
                    chartData[0].companies) *
                    100,
                )}%`
              : "+0%"}{" "}
            growth
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-orange-600">
            {chartData.reduce((sum, item) => sum + item.bookings, 0)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {chartData.length > 0 && chartData[0].bookings > 0
              ? `+${Math.round(
                  ((chartData[chartData.length - 1].bookings -
                    chartData[0].bookings) /
                    chartData[0].bookings) *
                    100,
                )}%`
              : "+0%"}{" "}
            growth
          </p>
        </div>
      </div>

      {!hasRealData && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            📊 Showing sample data. Real data will appear as users, companies,
            and bookings are created.
          </p>
        </div>
      )}
    </div>
  );
};

export default GrowthChart;
