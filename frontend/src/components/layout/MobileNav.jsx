import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Ship, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV } from "@/constants/testIds";
import { navLinks } from "@/components/layout/navLinks";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Fixed top bar (mobile + tablet only) */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-white/10 h-16 flex items-center justify-between px-4">
        <button
          data-testid={NAV.landing}
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="grid place-items-center h-11 w-11 rounded-xl btn-gold shrink-0">
            <Ship size={18} />
          </span>
          <span className="font-display text-lg gold-text leading-none">IMEX AI</span>
        </button>
        <button
          data-testid="mobile-nav-toggle"
          aria-label="Open navigation menu"
          onClick={() => setOpen(true)}
          className="grid place-items-center h-11 w-11 rounded-xl glass-gold text-amber-300"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Slide-out drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              data-testid="mobile-nav-backdrop"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed top-0 left-0 z-[60] h-full w-[82vw] max-w-[320px] p-4"
              data-testid="mobile-nav-drawer"
            >
              <div className="glass-card !rounded-3xl h-full flex flex-col p-5 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="grid place-items-center h-11 w-11 rounded-2xl btn-gold shrink-0">
                      <Ship size={20} />
                    </span>
                    <span>
                      <span className="block font-display text-lg leading-none gold-text">IMEX AI</span>
                      <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-stone-500 mt-1">
                        Cost Intelligence
                      </span>
                    </span>
                  </button>
                  <button
                    data-testid="mobile-nav-close"
                    aria-label="Close navigation menu"
                    onClick={() => setOpen(false)}
                    className="grid place-items-center h-11 w-11 rounded-xl glass text-stone-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="gold-rule my-5" />
                <p className="px-3 text-[0.6rem] uppercase tracking-[0.3em] text-stone-500 mb-2">
                  Workspace
                </p>
                <nav className="flex flex-col gap-1.5">
                  {navLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      data-testid={`${l.tid}-mobile`}
                      className={({ isActive }) =>
                        cn(
                          "nav-item flex items-center gap-3 px-3.5 min-h-[48px] rounded-xl text-[0.95rem] text-stone-400 font-medium",
                          isActive && "nav-item-active"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <l.icon size={19} className={cn(isActive ? "text-amber-300" : "text-stone-500")} />
                          <span className="flex-1">{l.label}</span>
                          {isActive && <ChevronRight size={15} className="text-amber-300/70" />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-auto pt-6">
                  <div className="glass-gold rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles size={15} className="text-amber-300" />
                      <span className="text-xs font-semibold text-amber-200">Pro Intelligence</span>
                    </div>
                    <p className="text-[0.78rem] text-stone-400 leading-relaxed">
                      Live AU–India trade lanes, duty data & AI margin analysis.
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
