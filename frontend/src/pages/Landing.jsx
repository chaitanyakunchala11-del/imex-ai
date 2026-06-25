import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Ship,
  ArrowRight,
  Calculator,
  Radar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { LANDING } from "@/constants/testIds";

const HERO =
  "https://images.pexels.com/photos/15674629/pexels-photo-15674629.jpeg?auto=compress&cs=tinysrgb&w=1920";

const features = [
  { icon: Calculator, title: "Landed Cost Engine", text: "Precision duty, GST, freight & CIF modelling down to the unit." },
  { icon: Radar, title: "Opportunity Scanner", text: "Live AU–India lanes ranked by margin, demand & momentum." },
  { icon: TrendingUp, title: "Profit Intelligence", text: "Model marketplace fees, overhead and ROI before you commit." },
  { icon: Sparkles, title: "AI Trade Advisor", text: "Ask anything on customs, sourcing and margins — instantly." },
];

const stats = [
  { v: "$2.4B", l: "Trade flow analysed" },
  { v: "120+", l: "HS code categories" },
  { v: "64%", l: "Avg. opportunity margin" },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="imex-bg min-h-screen relative overflow-hidden">
      {/* Hero */}
      <section
        data-testid={LANDING.hero}
        className="relative min-h-screen flex flex-col"
      >
        <img
          src={HERO}
          alt="Cargo ship at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070a0f] via-[#070a0f]/85 to-[#070a0f]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a0f] via-transparent to-[#070a0f]/40" />

        {/* Top bar */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-14 py-7">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-11 w-11 rounded-2xl btn-gold">
              <Ship size={20} />
            </span>
            <div>
              <span className="block font-display text-xl gold-text leading-none">IMEX AI</span>
              <span className="block text-[0.6rem] uppercase tracking-[0.32em] text-stone-400 mt-1">
                Cost Intelligence
              </span>
            </div>
          </div>
          <button
            data-testid={LANDING.enterBtn}
            onClick={() => navigate("/dashboard")}
            className="btn-ghost-gold hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Launch Platform <ArrowRight size={16} />
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center px-6 md:px-14 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card glass-gold max-w-2xl p-9 md:p-12"
          >
            <span className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.32em] text-amber-300/90 font-semibold mb-6">
              <Globe2 size={14} /> Australia · India · Global Trade
            </span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.04] text-stone-50">
              Import smarter.
              <br />
              <span className="gold-text">Profit with clarity.</span>
            </h1>
            <p className="mt-6 text-stone-300/90 text-base md:text-lg leading-relaxed max-w-xl">
              The premium intelligence layer for import/export. Model landed costs,
              compare sourcing, scan live opportunities and let AI sharpen every margin.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <button
                data-testid={LANDING.enterBtn}
                onClick={() => navigate("/dashboard")}
                className="btn-gold inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm"
              >
                Enter Platform <ArrowRight size={17} />
              </button>
              <button
                data-testid={LANDING.exploreBtn}
                onClick={() => navigate("/opportunities")}
                className="btn-ghost-gold inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold"
              >
                <Radar size={16} /> Explore Opportunities
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 pt-7 border-t border-white/10">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl md:text-3xl gold-text">{s.v}</div>
                  <div className="text-[0.72rem] text-stone-400 mt-1 leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-14 py-24 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-amber-300" />
          <span className="text-[0.7rem] uppercase tracking-[0.32em] text-amber-300/80 font-semibold">
            Built for serious traders
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-stone-100 max-w-2xl">
          A complete cost-intelligence suite, refined to a luxury standard.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass-card lift p-7"
            >
              <span className="grid place-items-center h-12 w-12 rounded-2xl glass-gold text-amber-300 mb-5">
                <f.icon size={20} />
              </span>
              <h3 className="font-display text-lg text-stone-100">{f.title}</h3>
              <p className="text-sm text-stone-400 mt-2 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card glass-gold lift mt-16 p-10 md:p-14 text-center">
          <h3 className="font-display text-3xl md:text-4xl text-stone-100">
            Ready to see your <span className="gold-text">margins clearly?</span>
          </h3>
          <p className="text-stone-400 mt-4 max-w-xl mx-auto">
            Step into the platform and start modelling profitable trade in seconds.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm mt-8"
          >
            Enter Platform <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
