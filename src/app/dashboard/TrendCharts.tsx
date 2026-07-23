"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export type DailyPoint = {
  date: string;
  cashCollected: number;
  revenue: number;
  showUpRate: number | null;
};

export default function TrendCharts({ data }: { data: DailyPoint[] }) {
  const showRateData = data.map((d) => ({ ...d, showUpRatePct: d.showUpRate === null ? null : Math.round(d.showUpRate * 1000) / 10 }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-md border border-neutral-200 p-4">
        <h3 className="text-sm font-medium text-neutral-700">Cash collected vs. revenue</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={11} tickMargin={8} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="cashCollected" name="Cash collected" fill="#171717" radius={[3, 3, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#a3a3a3" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-md border border-neutral-200 p-4">
        <h3 className="text-sm font-medium text-neutral-700">Show up rate</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={showRateData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={11} tickMargin={8} />
              <YAxis fontSize={11} unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="showUpRatePct" name="Show up rate" stroke="#171717" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
