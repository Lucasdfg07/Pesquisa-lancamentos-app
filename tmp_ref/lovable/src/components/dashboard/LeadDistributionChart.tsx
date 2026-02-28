import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { leadScoreDistribution } from "@/data/dashboardData";

const colors = [
  "hsl(220, 70%, 60%)",
  "hsl(200, 80%, 50%)",
  "hsl(45, 80%, 55%)",
  "hsl(30, 90%, 55%)",
  "hsl(0, 72%, 55%)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 text-xs border border-glass-border">
      <p className="font-semibold text-foreground">{d.label}</p>
      <p className="text-muted-foreground">Score: {d.range}</p>
      <p className="font-mono font-bold text-foreground">{d.count} leads</p>
    </div>
  );
};

interface LeadDistributionChartProps {
  data?: { range: string; count: number; label: string }[];
}

const LeadDistributionChart = ({ data = leadScoreDistribution }: LeadDistributionChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card p-6 glow-accent"
    >
      <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
        Distribuição de Lead Score
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(220, 15%, 16%)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LeadDistributionChart;
