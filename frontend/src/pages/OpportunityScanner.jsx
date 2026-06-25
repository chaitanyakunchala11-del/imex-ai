import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, Search, MapPin, TrendingUp, ArrowUpRight, Flame } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { getOpportunities, fmtNum } from "@/lib/api";
import { SCANNER } from "@/constants/testIds";
import { cn } from "@/lib/utils";

const trendColor = { up: "text-emerald-300", flat: "text-stone-400", down: "text-rose-300" };

export default function OpportunityScanner() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    getOpportunities().then((d) => setItems(d.opportunities || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return items;
    return items.filter(
      (o) =>
        o.product.toLowerCase().includes(s) ||
        o.category.toLowerCase().includes(s) ||
        o.origin.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <div data-testid={SCANNER.page} className="space-y-8">
      <PageHeader
        eyebrow="Discovery"
        title="Opportunity Scanner"
        subtitle="Live AU–India trade lanes ranked by demand momentum, margin potential and monthly volume."
        icon={Radar}
        action={
          <div className="relative hidden md:block w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              data-testid={SCANNER.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, categories…"
              className="w-full glass rounded-full pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
        }
      />

      <div className="md:hidden relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full glass rounded-full pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
          >
            <GlassCard data-testid={SCANNER.card} className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[0.62rem] uppercase tracking-[0.2em] text-amber-300/70 font-semibold">
                  {o.category}
                </span>
                {o.demand_score >= 85 && (
                  <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-amber-200 bg-amber-400/12 px-2 py-1 rounded-full">
                    <Flame size={11} /> HOT
                  </span>
                )}
              </div>
              <h4 className="font-display text-lg text-stone-100 mt-2">{o.product}</h4>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                <MapPin size={12} /> {o.origin} → {o.destination}
              </div>
              <p className="text-[0.82rem] text-stone-400 mt-3 leading-relaxed flex-1">{o.summary}</p>

              <div className="gold-rule my-5" />
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-display text-3xl gold-text leading-none">{o.margin_pct}%</div>
                  <div className="text-[0.62rem] text-stone-500 uppercase tracking-wide mt-1">net margin</div>
                </div>
                <div className="text-right space-y-1.5">
                  <div className={cn("text-xs font-medium inline-flex items-center gap-1", trendColor[o.trend])}>
                    <TrendingUp size={12} /> Demand {o.demand_score}
                  </div>
                  <div className="text-xs text-stone-500">{fmtNum(o.monthly_volume)} units/mo</div>
                  <div className="text-[0.62rem] text-stone-600">HS {o.hs_code}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard lift={false} className="p-12 text-center">
          <p className="text-stone-400">No opportunities match "{q}".</p>
        </GlassCard>
      )}
    </div>
  );
}
