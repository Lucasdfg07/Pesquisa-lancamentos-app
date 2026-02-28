import { motion } from "framer-motion";

interface PerformanceTableProps {
  title: string;
  data: { id?: string; name: string; leads: number; score: number; campaignName?: string }[];
  delay?: number;
  selectedName?: string | null;
  onSelectRow?: (id: string) => void;
  emptyMessage?: string;
}

const getCampaignHeatBadge = (campaignLikeName: string) => {
  const normalized = campaignLikeName.trim().toUpperCase();
  if (normalized.startsWith("PQ")) {
    return { label: "Quente", class: "bg-destructive/20 text-destructive border-destructive/30" };
  }
  if (normalized.startsWith("PF")) {
    return { label: "Frio", class: "bg-accent/20 text-accent border-accent/30" };
  }
  return { label: "Morno", class: "bg-primary/20 text-primary border-primary/30" };
};

const ScoreBar = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-green-400";
    if (s >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className={`text-[11px] font-mono font-semibold w-9 text-right ${getTextColor(score)}`}>
        {score.toFixed(1)}
      </span>
    </div>
  );
};

const PerformanceTable = ({
  title,
  data,
  delay = 0,
  selectedName = null,
  onSelectRow,
  emptyMessage = "Nenhum dado encontrado para este filtro.",
}: PerformanceTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="glass-card p-5 glow-primary overflow-hidden"
    >
      <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
        {title}
      </h3>
      <div className="overflow-hidden">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="border-b border-border">
              <th className="w-[45%] text-left py-2 pr-2 text-muted-foreground font-medium tracking-wider uppercase">Nome</th>
              <th className="w-[15%] text-right py-2 px-2 text-muted-foreground font-medium tracking-wider uppercase">Leads</th>
              <th className="w-[18%] text-left py-2 text-muted-foreground font-medium tracking-wider uppercase">Status</th>
              <th className="w-[22%] text-right py-2 text-muted-foreground font-medium tracking-wider uppercase">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => {
              const campaignReference = title === "Campanhas" ? item.name : item.campaignName ?? "";
              const badge = getCampaignHeatBadge(campaignReference);
              const rowId = item.id ?? item.name;
              const isSelected = selectedName === rowId;
              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: delay + i * 0.05 }}
                  className={`border-b border-border/50 transition-colors ${onSelectRow ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/30"} ${isSelected ? "bg-primary/15" : ""}`}
                  onClick={() => onSelectRow?.(rowId)}
                >
                  <td className="py-2.5 pr-2 text-foreground font-medium truncate" title={item.name}>
                    {item.name}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-foreground px-2">
                    {item.leads.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${badge.class}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <ScoreBar score={item.score} />
                  </td>
                </motion.tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PerformanceTable;
