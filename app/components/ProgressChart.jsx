"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProgressChart({ history }) {
  // Format the data for the chart
  const data = history.map((entry, index) => ({
    name: entry.date ? new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Log ${index + 1}`,
    score: entry.score || 0,
    stress: Number(entry.stress) || 0,
    sleep: Number(entry.sleep) || 0,
  }));

  if (history.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6 text-center py-12">
        <p className="text-slate-400">No check-in data available yet. Complete a check-in to see your trends!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Wellness Trends</h2>
          <p className="text-xs text-slate-400">Track your exam preparation balance over time</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              yAxisId="score" 
              domain={[0, 100]} 
              stroke="#818cf8" 
              fontSize={11}
              tickLine={false}
              label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#818cf8', style: { fontSize: 10, fontWeight: 'bold' } }}
            />
            <YAxis 
              yAxisId="metrics" 
              orientation="right" 
              domain={[0, 12]} 
              stroke="#2dd4bf" 
              fontSize={11}
              tickLine={false}
              label={{ value: 'Hours / Stress', angle: 90, position: 'insideRight', fill: '#2dd4bf', style: { fontSize: 10, fontWeight: 'bold' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="score"
              name="Wellness Score"
              stroke="#6366f1"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="metrics"
              type="monotone"
              dataKey="stress"
              name="Stress Level (1-10)"
              stroke="#f43f5e"
              strokeWidth={2}
            />
            <Line
              yAxisId="metrics"
              type="monotone"
              dataKey="sleep"
              name="Sleep (hrs)"
              stroke="#06b6d4"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}