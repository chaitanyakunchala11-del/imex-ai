import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Sparkles, Loader2, TrendingUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassCard";
import { Field, SelectField } from "@/components/Field";
import { calcLandedCost, fmtAUD } from "@/lib/api";
import { CALC } from "@/constants/testIds";

const CATEGORIES = [
  "Spices & Wellness", "Textiles & Apparel", "Food & Grains", "Beauty & Personal",
  "Home & Lifestyle", "Electronics", "Jewelry & Luxury", "Leather Goods", "Furniture", "Other",
];
const ORIGINS = [
  "Mumbai, India", "Delhi, India", "Chennai, India", "Kolkata, India",
  "Bengaluru, India", "Tiruppur, India", "Jaipur, India", "Kochi, India",
];
const DESTINATIONS = ["Sydney, AU", "Melbourne, AU", "Brisbane, AU", "Perth, AU", "Adelaide, AU"];

export default function LandedCost() {
  const [form, setForm] = useState({
    product_name: "Organic Turmeric Powder",
    category: "Spices & Wellness",
    product_value: 12,
    quantity: 1000,
    weight_kg: 800,
    origin: "Mumbai, India",
    destination: "Sydney, AU",
    selling_price: 28,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updNum = (k) => (e) => setForm({ ...form, [k]: parseFloat(e.target.value) || 0 });
  const updStr = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await calcLandedCost(form);
      setResult(r);
    } catch (e) {
      setError("Could not calculate. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid={CALC.page} className="space-y-8">
      <PageHeader
        eyebrow="Calculator"
        title="Landed Cost Engine"
        subtitle="Capture your product, route and category — we estimate freight, duty, GST and the true delivered cost per unit (plus margin)."
        icon={Calculator}
      />

      <div className="grid lg:grid-cols-5 gap-5">
        <GlassCard lift={false} className="lg:col-span-3 p-7">
          <h3 className="font-display text-lg text-stone-100 mb-6">Shipment Details</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Product Name" type="text" data-testid={CALC.productName} value={form.product_name} onChange={updStr("product_name")} />
            </div>
            <SelectField label="Category" options={CATEGORIES} data-testid={CALC.category} value={form.category} onChange={updStr("category")} />
            <Field label="Product Value (FOB / unit)" prefix="$" type="number" data-testid={CALC.unitValue} value={form.product_value} onChange={updNum("product_value")} />
            <Field label="Quantity" type="number" data-testid={CALC.quantity} value={form.quantity} onChange={updNum("quantity")} />
            <Field label="Total Weight" suffix="kg" type="number" data-testid={CALC.weight} value={form.weight_kg} onChange={updNum("weight_kg")} />
            <SelectField label="Origin" options={ORIGINS} data-testid={CALC.origin} value={form.origin} onChange={updStr("origin")} />
            <SelectField label="Destination" options={DESTINATIONS} data-testid={CALC.destination} value={form.destination} onChange={updStr("destination")} />
            <div className="sm:col-span-2">
              <Field label="Selling Price (per unit, optional — for margin)" prefix="$" type="number" data-testid={CALC.sellingPrice} value={form.selling_price} onChange={updNum("selling_price")} />
            </div>
          </div>
          {error && <p data-testid="calc-error" className="text-sm text-rose-300 mt-4">{error}</p>}
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
                className="space-y-4"
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
                  <div className="text-xs text-stone-500 mt-1">
                    {result.origin} → {result.destination} · {result.category}
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

                {result.margin_pct !== null && result.margin_pct !== undefined && (
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={16} className="text-amber-300" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                        Projected Margin
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="font-display text-3xl gold-text">{result.margin_pct}%</div>
                        <div className="text-xs text-stone-500 mt-1">net margin / unit</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-xl text-stone-100">{fmtAUD(result.total_profit)}</div>
                        <div className="text-xs text-stone-500 mt-1">total profit · {fmtAUD(result.profit_per_unit)}/unit</div>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            ) : (
              <GlassCard lift={false} className="p-10 h-full grid place-items-center text-center">
                <div>
                  <span className="grid place-items-center h-14 w-14 rounded-2xl glass-gold text-amber-300 mx-auto mb-4">
                    <Sparkles size={22} />
                  </span>
                  <p className="text-stone-400 text-sm max-w-[220px] mx-auto">
                    Enter your shipment details to reveal landed cost, duties, freight and margin.
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
