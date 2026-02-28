import { motion } from "framer-motion";
import { kpiData } from "@/data/dashboardData";

interface LeadProgressBarProps {
  totalLeads?: number;
  leadGoal?: number;
}

const LeadProgressBar = ({ totalLeads = kpiData.totalLeads, leadGoal = kpiData.leadGoal }: LeadProgressBarProps) => {
  const percentage = leadGoal > 0 ? (totalLeads / leadGoal) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5 glow-primary"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
          Meta de Captação
        </span>
        <span className="text-xs font-mono text-primary font-semibold">
          {percentage.toFixed(1)}% de {leadGoal.toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(0, 72%, 55%), hsl(45, 80%, 55%), hsl(130, 60%, 45%))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-3 text-xs text-muted-foreground">
        <span>0</span>
        <span className="font-mono font-bold text-foreground text-sm">
          {totalLeads.toLocaleString("pt-BR")} leads
        </span>
        <span>{leadGoal.toLocaleString("pt-BR")}</span>
      </div>
    </motion.div>
  );
};

export default LeadProgressBar;
