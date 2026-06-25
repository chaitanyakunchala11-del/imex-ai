import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Loader2, Truck, Building2, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { calcImportVsLocal, fmtAUD } from "@/lib/api";
import { IVL } from "@/constants/testIds";
import { cn } from "@/lib/utils";

export default function ImportVsLocal() {
  const [form, setForm] = useState({
    import_unit_cost: 14.5,
    local_unit_cost: 22,
    quantity: 1000,
    import_lead_days: 35,
    local_lead_days: 7,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: parseFloat(e.target.value) || 0 });

  const submit = async () => {
    setLoading(true);
    try {
      setResult(await calcImportVsLocal(form));
    } finally {
      setLoading(false);
    }
  };

  const importsWin = result?.recommendation === "import";

  return (
    <div data-testid={IVL.page} className="space-y-8">
      <PageHeader
        eyebrow="Comparison"
        title="Import vs Local Sourcing"
        subtitle="Weigh imported landed cost against local supply — see the true saving, percentage edge and lead-time trade-off."
        icon={Scale}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <GlassCard lift={false} className="lg:col-span-3 p-7">
          <h3 className="font-display text-lg text-stone-100 mb-6">Sourcing Inputs</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Import Unit Cost" prefix="$" type="number" data-testid={IVL.importCost} value={form.import_unit_cost} onChange={upd("import_unit_cost")} />
            <Field label="Local Unit Cost" prefix="$" type="number" data-testid={IVL.localCost} value={form.local_unit_cost} onChange={upd("local_unit_cost")} />
            <Field label="Quantity" type="number" data-testid={IVL.quantity} value={form.quantity} onChange={upd("quantity")} />
            <Field label="Import Lead Time" suffix="days" type="number" value={form.import_lead_days} onChange={upd("import_lead_days")} />
            <Field label="Local Lead Time" suffix="days" type="number" value={form.local_lead_days} onChange={upd("local_lead_days")} />
          </div>
          <button
            data-testid={IVL.submit}
            onClick={submit}
            disabled={loading}
            className="btn-gold mt-7 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm w-full sm:w-auto disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
            Compare Sourcing
          </button>
        </GlassCard>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key="res" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} data-testid={IVL.result}>
                <GlassCard gold className="p-7">
                  <span className="text-[0.7rem] uppercase tracking-[0.28em] text-amber-300/80 font-semibold">
                    Net Saving (Import)
                  </span>
                  <div className="font-display text-4xl gold-text mt-2">{fmtAUD(result.savings)}</div>
                  <div className="text-sm text-stone-400 mt-1">{result.savings_pct}% vs local total</div>
                  <div className="gold-rule my-6" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn("rounded-xl p-4 glass", importsWin && "glass-gold")}>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mb-1"><Truck size={13} /> Import</div>
                      <div className="font-display text-xl text-stone-100">{fmtAUD(result.import_total)}</div>
                      <div className="text-xs text-stone-500 mt-1">{result.import_lead_days} day lead</div>
                    </div>
                    <div className={cn("rounded-xl p-4 glass", !importsWin && "glass-gold")}>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mb-1"><Building2 size={13} /> Local</div>
                      <div className="font-display text-xl text-stone-100">{fmtAUD(result.local_total)}</div>
                      <div className="text-xs text-stone-500 mt-1">{result.local_lead_days} day lead</div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-start gap-2 text-sm text-amber-200/90 bg-amber-400/8 rounded-xl p-3.5">
                    <CheckCircle2 size={16} className="text-amber-300 mt-0.5 shrink-0" />
                    <span>{result.recommendation_text}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard lift={false} className="p-10 h-full grid place-items-center text-center">
                <p className="text-stone-400 text-sm max-w-[220px]">
                  Enter both sourcing costs to see which channel wins — and by how much.
                </p>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
