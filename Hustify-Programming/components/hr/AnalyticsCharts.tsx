"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type Props = {
  applicationTrends: any[];
  jobPerformance: any[];
};

export default function AnalyticsCharts({ applicationTrends, jobPerformance }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Application Trends Chart */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-6">Application Trends (Last 30 Days)</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={applicationTrends}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BF3131" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#BF3131" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#BF3131"
                fillOpacity={1}
                fill="url(#colorCount)"
                name="Applications"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Jobs Chart */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-6">Top Jobs by Applicants</h2>
        <div className="h-[300px] w-full">
          {jobPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jobPerformance}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Bar 
                  dataKey="applicantCount" 
                  fill="#4F46E5" 
                  radius={[0, 4, 4, 0]} 
                  barSize={30}
                  name="Applicants"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-500">
               No job data available
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
