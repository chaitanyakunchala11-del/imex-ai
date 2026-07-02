import { NavLink, useNavigate } from "react-router-dom";
import { Ship, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV } from "@/constants/testIds";
import { navLinks as links } from "@/components/layout/navLinks";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 z-20 p-5">
      <div className="glass-card !rounded-3xl h-full flex flex-col p-5">
        {/* Brand */}
        <button
          data-testid={NAV.landing}
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-2 py-2 group text-left"
        >
          <span className="grid place-items-center h-11 w-11 rounded-2xl btn-gold shrink-0">
            <Ship size={20} />
          </span>
          <span>
            <span className="block font-display text-lg leading-none gold-text">IMEX AI</span>
            <span className="block text-[0.65rem] uppercase tracking-[0.3em] text-stone-500 mt-1">
              Cost Intelligence
            </span>
          </span>
        </button>

        <div className="gold-rule my-5" />

        <p className="px-3 text-[0.6rem] uppercase tracking-[0.3em] text-stone-500 mb-2">
          Workspace
        </p>
        <nav className="flex flex-col gap-1.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={l.tid}
              className={({ isActive }) =>
                cn(
                  "nav-item flex items-center gap-3 px-3.5 py-3 rounded-xl text-[0.92rem] text-stone-400 font-medium",
                  isActive && "nav-item-active"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon size={18} className={cn(isActive ? "text-amber-300" : "text-stone-500")} />
                  <span className="flex-1">{l.label}</span>
                  {isActive && <ChevronRight size={15} className="text-amber-300/70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="glass-gold rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={15} className="text-amber-300" />
              <span className="text-xs font-semibold text-amber-200">Pro Intelligence</span>
            </div>
            <p className="text-[0.78rem] text-stone-400 leading-relaxed">
              Live AU–India trade lanes, duty data & AI margin analysis.
            </p>
          </div>
          <p className="text-center text-[0.65rem] text-stone-600 mt-4 tracking-wide">
            © {new Date().getFullYear()} IMEX AI · Trade Intelligence
          </p>
        </div>
      </div>
    </aside>
  );
}
