"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ChartData = {
  date: string;
  revenue: number;
  cashCollected: number;
  showRate: number;
  closeRate: number;
};

export function CashChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
      <h3 className="mb-4 text-sm font-semibold text-neutral-300">Cash Collected & Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="date" stroke="#888888" />
          <YAxis stroke="#888888" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #404040", borderRadius: "8px" }}
            labelStyle={{ color: "#f0f0f0" }}
          />
          <Legend />
          <Line type="monotone" dataKey="cashCollected" stroke="#10b981" name="Cash Collected" strokeWidth={2} />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ShowRateChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
      <h3 className="mb-4 text-sm font-semibold text-neutral-300">Show Rate</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="date" stroke="#888888" />
          <YAxis stroke="#888888" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #404040", borderRadius: "8px" }}
            labelStyle={{ color: "#f0f0f0" }}
          />
          <Line type="monotone" dataKey="showRate" stroke="#f59e0b" name="Show Rate %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CloseRateChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
      <h3 className="mb-4 text-sm font-semibold text-neutral-300">Close Rate</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="date" stroke="#888888" />
          <YAxis stroke="#888888" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #404040", borderRadius: "8px" }}
            labelStyle={{ color: "#f0f0f0" }}
          />
          <Line type="monotone" dataKey="closeRate" stroke="#ef4444" name="Close Rate %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
