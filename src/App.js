import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OverviewPage from "./pages/OverviewPage";
import ForgotPassword from "./pages/ForgotPassword";
import AccountSettings from "./pages/AccountSettings";
import DiseaseStatus from "./pages/DiseaseStatus";
import DashboardLightPage from "./pages/dashboard/LightInfo";
import DashboardTempPage from "./pages/dashboard/TempInfo";
import DashboardHumidityPage from "./pages/dashboard/HumidityInfo";
//import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/dashboard/overview" element={<OverviewPage />} />
        <Route path="/dashboard/light" element={<DashboardLightPage />} />
        <Route path="/dashboard/temperature" element={<DashboardTempPage />} />
        <Route path="/dashboard/humidity" element={<DashboardHumidityPage />} />
        <Route path="/dashboard/disease-status" element={<DiseaseStatus />} />
      </Routes>
    </Router>
  );
}

export default App;
