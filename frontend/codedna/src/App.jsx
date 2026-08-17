import { Routes, Route } from "react-router-dom";
import PageShell from "./components/layout/PageShell.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RepoImport from "./pages/RepoImport.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ArchitectureView from "./pages/ArchitectureView.jsx";
import RiskModules from "./pages/RiskModules.jsx";
import Refactoring from "./pages/Refactoring.jsx";
import Report from "./pages/Report.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PageShell><RepoImport /></PageShell>} />
      <Route path="/dashboard/:analysisId" element={<PageShell><Dashboard /></PageShell>} />
      <Route path="/architecture/:analysisId" element={<PageShell><ArchitectureView /></PageShell>} />
      <Route path="/risks/:analysisId" element={<PageShell><RiskModules /></PageShell>} />
      <Route path="/refactor/:analysisId" element={<PageShell><Refactoring /></PageShell>} />
      <Route path="/report/:analysisId" element={<PageShell><Report /></PageShell>} />
    </Routes>
  );
};

export default App;