import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowUpRight,
  TrendingUp,
  Package,
  Flame,
  Target,
  ArrowRight,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { getDashboard, fmtNum } from "@/lib/api";
import { DASHBOARD } from "@/constants/testIds";

const ICONS = [Target, TrendingUp, Package, Flame];

const chartData = [
  { m: "Jan", v: 32 }, { m: "Feb", v: 41 }, { m: "Mar", v: 38 },
  { m: "Apr", v: 52 }, { m: "May", v: 61 }, { m: "Jun", v: 58 },
  { m: "Jul", v: 72 }, { m: "Aug", v: 84 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then(setData).catch(() => {});
  }, []);

  const stats = data?.stats || [];
  const tops = data?.top_opportunities || [];

  return (
    <div data-testid={DASHBOARD.page} className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Trade Command Center"
        subtitle="A live read on your most profitable AU–India opportunities, margins and demand momentum."
        icon={LayoutDashboard}
        action={
          <button
            onClick={() => navigate("/opportunities")}
            className="btn-ghost-gold hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Scan Opportunities <ArrowRight size={15} />
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <GlassCard data-testid={DASHBOARD.statCard} className="p-6">
                <div className="flex items-start justify-between">
                  <span className="grid place-items-center h-11 w-11 rounded-2xl glass-gold text-amber-300">
                    <Icon size={18} />
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300/90 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                    <ArrowUpRight size={13} /> {s.delta}
                  </span>
                </div>
                <div className="mt-5 font-display text-3xl text-stone-50">{s.value}</div>
                <div className="text-sm text-stone-300 mt-1 font-medium">{s.label}</div>
                <div className="text-xs text-stone-500 mt-2">{s.hint}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Chart + highlight */}
      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard className="lg:col-span-2 p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl text-stone-100">Trade Volume Momentum</h3>
              <p className="text-sm text-stone-500 mt-1">Indexed monthly units across active lanes</p>
            </div>
            <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-full">
              +18.2% YTD
            </span>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c8a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fill: "#7a766c", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,18,24,0.92)",
                    border: "1px solid rgba(200,169,110,0.3)",
                    borderRadius: 12,
                    color: "#eee",
                  }}
                  labelStyle={{ color: "#c8a96e" }}
                />
                <Area type="monotone" dataKey="v" stroke="#eab308" strokeWidth={2.5} fill="url(#gold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard gold className="p-7 flex flex-col justify-between">
          <div>
            <span className="grid place-items-center h-11 w-11 rounded-2xl btn-gold mb-5">
              <Flame size={18} />
            </span>
            <h3 className="font-display text-xl text-stone-100">Today's Signal</h3>
            <p className="text-sm text-stone-400 mt-2 leading-relaxed">
              Ayurvedic skincare demand is spiking in Sydney retail — margins now exceed 71% on premium SKUs.
            </p>
          </div>
          <button
            onClick={() => navigate("/opportunities")}
            className="btn-gold mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm w-full"
          >
            View Signals <ArrowRight size={15} />
          </button>
        </GlassCard>
      </div>

      {/* Top opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl text-stone-100">Top Opportunities</h3>
          <button
            onClick={() => navigate("/opportunities")}
            className="text-sm text-amber-300/90 hover:text-amber-200 inline-flex items-center gap-1 font-medium"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {tops.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <GlassCard data-testid={DASHBOARD.opportunityCard} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-amber-300/70 font-semibold">
                      {o.category}
                    </span>
                    <h4 className="font-display text-lg text-stone-100 mt-1">{o.product}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                      <MapPin size={12} /> {o.origin} → {o.destination}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-2xl gold-text">{o.margin_pct}%</div>
                    <div className="text-[0.65rem] text-stone-500 uppercase tracking-wide">margin</div>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-5 text-xs text-stone-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Demand {o.demand_score}/100
                  </span>
                  <span>{fmtNum(o.monthly_volume)} units/mo</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
