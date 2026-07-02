import {
  LayoutDashboard,
  Calculator,
  Scale,
  TrendingUp,
  Radar,
  Sparkles,
} from "lucide-react";
import { NAV } from "@/constants/testIds";

export const navLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, tid: NAV.dashboard },
  { to: "/calculator", label: "Landed Cost", icon: Calculator, tid: NAV.calculator },
  { to: "/import-vs-local", label: "Import vs Local", icon: Scale, tid: NAV.importVsLocal },
  { to: "/profit-mode", label: "Profit Mode", icon: TrendingUp, tid: NAV.profitMode },
  { to: "/opportunities", label: "Opportunity Scanner", icon: Radar, tid: NAV.opportunities },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles, tid: NAV.assistant },
];
