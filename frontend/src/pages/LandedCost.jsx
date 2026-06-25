import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Sparkles, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field } from "@/components/Field";
import { calcLandedCost, fmtAUD } from "@/lib/api";
import { CALC } from "@/constants/testIds";

export default function LandedCost() {
  const [form, setForm] = useState({
    unit_value: 12,
    quantity: 1000,
    freight: 2400,
    insurance: 350,
    duty_rate: 5,
    gst_rate: 10,
    other_fees: 600,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: parseFloat(e.target.value) || 0 });

  const submit = async () => {
    setLoading(true);
    try {
      const r = await calcLandedCost(form);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid={CALC.page} className="space-y-8">
      <PageHeader
        eyebrow="Calculator"
        title="Landed Cost Engine"
        subtitle="Model the true delivered cost per unit — CIF, customs duty, GST, freight and handling — with precision."
        icon={Calculator}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <GlassCard lift={false} className="lg:col-span-3 p-7">
          <h3 className="font-display text-lg text-stone-100 mb-6">Shipment Inputs</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Unit Value (FOB)" prefix="$" type="number" data-testid={CALC.unitValue} value={form.unit_value} onChange={upd("unit_value")} />
            <Field label="Quantity" type="number" data-testid={CALC.quantity} value={form.quantity} onChange={upd("quantity")} />
            <Field label="Freight" prefix="$" type="number" data-testid={CALC.freight} value={form.freight} onChange={upd("freight")} />
            <Field label="Insurance" prefix="$" type="number" data-testid={CALC.insurance} value={form.insurance} onChange={upd("insurance")} />
            <Field label="Customs Duty" suffix="%" type="number" data-testid={CALC.dutyRate} value={form.duty_rate} onChange={upd("duty_rate")} />
            <Field label="GST" suffix="%" type="number" data-testid={CALC.gstRate} value={form.gst_rate} onChange={upd("gst_rate")} />
            <Field label="Other Fees (port/handling)" prefix="$" type="number" data-testid={CALC.otherFees} value={form.other_fees} onChange={upd("other_fees")} />
          </div>
          <button
            data-testid={CALC.submit}
            onClick={submit}
            disabled={loading}
            className="btn-gold mt-7 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm w-full sm:w-auto disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
            Calculate Landed Cost
          </button>
        </GlassCard>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="res"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid={CALC.result}
              >
                <GlassCard gold className="p-7">
                  <span className="text-[0.7rem] uppercase tracking-[0.28em] text-amber-300/80 font-semibold">
                    Total Landed Cost
                  </span>
                  <div className="font-display text-4xl gold-text mt-2">
                    {fmtAUD(result.total_landed_cost)}
                  </div>
                  <div className="text-sm text-stone-400 mt-1">
                    {fmtAUD(result.per_unit_cost)} per unit · CIF {fmtAUD(result.cif_value)}
                  </div>
                  <div className="gold-rule my-6" />
                  <div className="space-y-3">
                    {result.breakdown.map((b) => (
                      <div key={b.label} className="flex items-center justify-between text-sm">
                        <span className="text-stone-400">{b.label}</span>
                        <span className="text-stone-100 font-medium">{fmtAUD(b.value)}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <GlassCard lift={false} className="p-10 h-full grid place-items-center text-center">
                <div>
                  <span className="grid place-items-center h-14 w-14 rounded-2xl glass-gold text-amber-300 mx-auto mb-4">
                    <Sparkles size={22} />
                  </span>
                  <p className="text-stone-400 text-sm max-w-[220px] mx-auto">
                    Enter your shipment details to reveal the full landed-cost breakdown.
                  </p>
                </div>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
