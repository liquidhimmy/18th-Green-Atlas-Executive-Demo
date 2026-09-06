import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import api from "./api";

import ThreeLensWorkflow from "./pages/ThreeLensWorkflow";
import FiduciaryDashboard from "./pages/fiduciary/Dashboard";
import MatterOverview from "./pages/fiduciary/MatterOverview";
import GovernedChange from "./pages/fiduciary/GovernedChange";
import Obligations from "./pages/fiduciary/Obligations";
import FiduciaryRAC from "./pages/fiduciary/RAC";
import TimelinePage from "./pages/fiduciary/TimelinePage";
import BeneficiaryHome from "./pages/beneficiary/Home";
import BeneficiaryRAC from "./pages/beneficiary/RAC";
import OversightPortfolio from "./pages/oversight/Portfolio";
import OversightMatter from "./pages/oversight/MatterOversight";

const MatterContext = createContext(null);
export const useMatter = () => useContext(MatterContext);

function Provider({ children }) {
  const [matter, setMatter] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [m, p] = await Promise.all([api.getMatter(), api.getPortfolio()]);
    setMatter(m);
    setPortfolio(p);
    setLoading(false);
    return m;
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const resetDemo = useCallback(async () => {
    await api.reset();
    return refresh();
  }, [refresh]);

  return (
    <MatterContext.Provider value={{ matter, portfolio, loading, refresh, resetDemo }}>
      {children}
    </MatterContext.Provider>
  );
}

export default function App() {
  return (
    <Provider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<ThreeLensWorkflow />} />
          <Route path="/fiduciary" element={<FiduciaryDashboard />} />
          <Route path="/fiduciary/matter" element={<MatterOverview />} />
          <Route path="/fiduciary/change" element={<GovernedChange />} />
          <Route path="/fiduciary/obligations" element={<Obligations />} />
          <Route path="/fiduciary/timeline" element={<TimelinePage />} />
          <Route path="/fiduciary/rac" element={<FiduciaryRAC />} />
          <Route path="/beneficiary" element={<BeneficiaryHome />} />
          <Route path="/beneficiary/rac" element={<BeneficiaryRAC />} />
          <Route path="/oversight" element={<OversightPortfolio />} />
          <Route path="/oversight/matter" element={<OversightMatter />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
