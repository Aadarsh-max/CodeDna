import { Routes, Route } from "react-router-dom";
import PageShell from "./components/layout/PageShell.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
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
      <Route path="/" element={<ProtectedRoute><PageShell><RepoImport /></PageShell></ProtectedRoute>} />
      <Route path="/dashboard/:analysisId" element={<ProtectedRoute><PageShell><Dashboard /></PageShell></ProtectedRoute>} />
      <Route path="/architecture/:analysisId" element={<ProtectedRoute><PageShell><ArchitectureView /></PageShell></ProtectedRoute>} />
      <Route path="/risks/:analysisId" element={<ProtectedRoute><PageShell><RiskModules /></PageShell></ProtectedRoute>} />
      <Route path="/refactor/:analysisId" element={<ProtectedRoute><PageShell><Refactoring /></PageShell></ProtectedRoute>} />
      <Route path="/report/:analysisId" element={<ProtectedRoute><PageShell><Report /></PageShell></ProtectedRoute>} />
    </Routes>
  );
};

export default App;