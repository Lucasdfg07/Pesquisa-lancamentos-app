import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dailyCaptureData } from "@/data/dashboardData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-3 text-xs border border-glass-border">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

interface CaptureChartProps {
  data?: { date: string; paid: number; organic: number }[];
}

const CaptureChart = ({ data = dailyCaptureData }: CaptureChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card p-6 glow-primary"
    >
      <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
        Captação de Leads por Dia
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={2}>
          <XAxis
            dataKey="date"
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
          <Legend
            wrapperStyle={{ fontSize: 11, color: "hsl(215, 12%, 50%)" }}
          />
          <Bar dataKey="paid" name="Pago" fill="hsl(45, 80%, 55%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="organic" name="Orgânico" fill="hsl(180, 70%, 45%)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CaptureChart;
