import { cn } from "@/lib/utils";

export function GlassCard({ className, children, gold = false, lift = true, ...props }) {
  return (
    <div
      className={cn(
        "glass-card",
        gold && "glass-gold",
        lift && "lift",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
