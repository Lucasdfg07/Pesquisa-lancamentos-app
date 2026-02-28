import { motion } from "framer-motion";

interface LeadScoreGaugeProps {
  score: number;
  label: string;
  delay?: number;
}

const LeadScoreGauge = ({ score, label, delay = 0 }: LeadScoreGaugeProps) => {
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;
  const getColor = (s: number) => {
    if (s >= 70) return "hsl(130, 60%, 45%)";
    if (s >= 50) return "hsl(45, 80%, 55%)";
    if (s >= 30) return "hsl(30, 90%, 55%)";
    return "hsl(0, 72%, 55%)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="glass-card p-6 flex flex-col items-center glow-primary"
    >
      <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
        {label}
      </span>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-bold font-mono text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.8 }}
          >
            {score.toFixed(1)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default LeadScoreGauge;
