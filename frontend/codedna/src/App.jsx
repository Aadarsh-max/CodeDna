import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

const PageTransition = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/" element={<ProtectedRoute><PageShell><PageTransition><RepoImport /></PageTransition></PageShell></ProtectedRoute>} />
        <Route path="/dashboard/:analysisId" element={<ProtectedRoute><PageShell><PageTransition><Dashboard /></PageTransition></PageShell></ProtectedRoute>} />
        <Route path="/architecture/:analysisId" element={<ProtectedRoute><PageShell><PageTransition><ArchitectureView /></PageTransition></PageShell></ProtectedRoute>} />
        <Route path="/risks/:analysisId" element={<ProtectedRoute><PageShell><PageTransition><RiskModules /></PageTransition></PageShell></ProtectedRoute>} />
        <Route path="/refactor/:analysisId" element={<ProtectedRoute><PageShell><PageTransition><Refactoring /></PageTransition></PageShell></ProtectedRoute>} />
        <Route path="/report/:analysisId" element={<ProtectedRoute><PageShell><PageTransition><Report /></PageTransition></PageShell></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;