import "@/App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import LandedCost from "@/pages/LandedCost";
import ImportVsLocal from "@/pages/ImportVsLocal";
import ProfitMode from "@/pages/ProfitMode";
import OpportunityScanner from "@/pages/OpportunityScanner";
import AIAssistant from "@/pages/AIAssistant";

function AppShell() {
  return (
    <div className="imex-bg min-h-screen flex overflow-x-hidden">
      <Sidebar />
      <MobileNav />
      <main className="relative z-10 flex-1 min-w-0 w-full px-4 sm:px-6 md:px-10 pt-24 lg:pt-10 pb-10 md:pb-12">
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calculator" element={<LandedCost />} />
            <Route path="/import-vs-local" element={<ImportVsLocal />} />
            <Route path="/profit-mode" element={<ProfitMode />} />
            <Route path="/opportunities" element={<OpportunityScanner />} />
            <Route path="/assistant" element={<AIAssistant />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
