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
import Communications from "./pages/fiduciary/Communications";
import BeneficiaryHome from "./pages/beneficiary/Home";
import BeneficiaryRAC from "./pages/beneficiary/RAC";
import OversightPortfolio from "./pages/oversight/Portfolio";
import OversightMatter from "./pages/oversight/MatterOversight";

const HAR = "ATL-HAR-00217";
const MatterContext = createContext(null);
export const useMatter = () => useContext(MatterContext);

function Provider({ children }) {
  const [matterId, setMatterId] = useState(HAR);
  const [matter, setMatter] = useState(null);
  const [matters, setMatters] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (mid) => {
    const id = mid || matterId;
    const [m, p, list] = await Promise.all([api.getMatter(id), api.getPortfolio(), api.listMatters()]);
    setMatter(m);
    setPortfolio(p);
    setMatters(list.matters);
    setLoading(false);
    return m;
  }, [matterId]);

  useEffect(() => { refresh(matterId); /* eslint-disable-next-line */ }, [matterId]);

  const switchMatter = useCallback((mid) => { setMatterId(mid); }, []);

  const resetDemo = useCallback(async () => {
    await api.reset();
    return refresh(matterId);
  }, [refresh, matterId]);

  return (
    <MatterContext.Provider value={{ matter, matters, matterId, switchMatter, portfolio, loading, refresh, resetDemo }}>
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
          <Route path="/fiduciary/communications" element={<Communications />} />
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
