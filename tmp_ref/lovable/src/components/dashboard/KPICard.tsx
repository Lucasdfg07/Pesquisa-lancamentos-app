import { motion } from "framer-motion";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "hot" | "cold" | "accent" | "success";
  delay?: number;
}

const variantStyles = {
  default: "glow-primary",
  hot: "glow-danger",
  cold: "glow-accent",
  accent: "glow-accent",
  success: "glow-success",
};

const valueStyles = {
  default: "text-primary",
  hot: "text-gradient-hot",
  cold: "text-gradient-cold",
  accent: "text-accent",
  success: "text-chart-4",
};

const KPICard = ({ title, value, subtitle, icon, variant = "default", delay = 0 }: KPICardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`glass-card p-5 ${variantStyles[variant]} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            {title}
          </span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className={`text-3xl font-bold font-mono tracking-tight ${valueStyles[variant]}`}>
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default KPICard;
