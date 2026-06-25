import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Loader2, Percent, DollarSign } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { calcProfitMode, fmtAUD } from "@/lib/api";
import { PROFIT } from "@/constants/testIds";

export default function ProfitMode() {
  const [form, setForm] = useState({
    unit_cost: 14.5,
    selling_price: 39,
    quantity: 1000,
    marketplace_fee_rate: 12,
    overhead_rate: 6,
    shipping_per_unit: 3.5,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: parseFloat(e.target.value) || 0 });

  const submit = async () => {
    setLoading(true);
    try {
      setResult(await calcProfitMode(form));
    } finally {
      setLoading(false);
    }
  };

  const metrics = result
    ? [
        { label: "Revenue", value: fmtAUD(result.revenue), icon: DollarSign },
        { label: "Net Profit", value: fmtAUD(result.net_profit), icon: TrendingUp, hot: true },
        { label: "Net Margin", value: `${result.margin_pct}%`, icon: Percent },
        { label: "ROI", value: `${result.roi_pct}%`, icon: TrendingUp },
      ]
    : [];

  return (
    <div data-testid={PROFIT.page} className="space-y-8">
      <PageHeader
        eyebrow="Profitability"
        title="Profit Mode"
        subtitle="Project net profit, margin and ROI after marketplace fees, overhead and per-unit shipping."
        icon={TrendingUp}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <GlassCard lift={false} className="lg:col-span-3 p-7">
          <h3 className="font-display text-lg text-stone-100 mb-6">Profit Inputs</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Unit Cost (Landed)" prefix="$" type="number" data-testid={PROFIT.unitCost} value={form.unit_cost} onChange={upd("unit_cost")} />
            <Field label="Selling Price" prefix="$" type="number" data-testid={PROFIT.sellingPrice} value={form.selling_price} onChange={upd("selling_price")} />
            <Field label="Quantity" type="number" data-testid={PROFIT.quantity} value={form.quantity} onChange={upd("quantity")} />
            <Field label="Marketplace Fee" suffix="%" type="number" data-testid={PROFIT.feeRate} value={form.marketplace_fee_rate} onChange={upd("marketplace_fee_rate")} />
            <Field label="Overhead" suffix="%" type="number" data-testid={PROFIT.overheadRate} value={form.overhead_rate} onChange={upd("overhead_rate")} />
            <Field label="Shipping / unit" prefix="$" type="number" value={form.shipping_per_unit} onChange={upd("shipping_per_unit")} />
          </div>
          <button
            data-testid={PROFIT.submit}
            onClick={submit}
            disabled={loading}
            className="btn-gold mt-7 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm w-full sm:w-auto disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
            Run Profit Model
          </button>
        </GlassCard>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="res" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} data-testid={PROFIT.result} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((m) => (
                    <GlassCard key={m.label} gold={m.hot} className="p-5">
                      <m.icon size={16} className="text-amber-300 mb-3" />
                      <div className={`font-display text-2xl ${m.hot ? "gold-text" : "text-stone-100"}`}>{m.value}</div>
                      <div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">{m.label}</div>
                    </GlassCard>
                  ))}
                </div>
                <GlassCard lift={false} className="p-6">
                  <div className="space-y-3 text-sm">
                    {[
                      ["COGS", result.cogs],
                      ["Marketplace Fees", result.marketplace_fees],
                      ["Overhead", result.overhead],
                      ["Shipping", result.shipping],
                    ].map(([l, v]) => (
                      <div key={l} className="flex items-center justify-between">
                        <span className="text-stone-400">{l}</span>
                        <span className="text-stone-200 font-medium">{fmtAUD(v)}</span>
                      </div>
                    ))}
                    <div className="gold-rule my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-amber-200 font-semibold">Profit / unit</span>
                      <span className="gold-text font-display text-lg">{fmtAUD(result.per_unit_profit)}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard lift={false} className="p-10 h-full grid place-items-center text-center">
                <p className="text-stone-400 text-sm max-w-[220px]">
                  Run the model to project your full profit, margin and ROI.
                </p>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
