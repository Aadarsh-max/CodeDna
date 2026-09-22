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
import Timeline from "./pages/Timeline.jsx";
import SecurityIssues from "./pages/SecurityIssues.jsx";
import DuplicateCode from "./pages/DuplicateCode.jsx";
import DeadCode from "./pages/DeadCode.jsx";
import ApiExplorer from "./pages/ApiExplorer.jsx";
import ApiDocs from "./pages/ApiDocs.jsx";
import DatabaseSchema from "./pages/DatabaseSchema.jsx";
import Cohesion from "./pages/Cohesion.jsx";
import Report from "./pages/Report.jsx";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <RepoImport />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/architecture/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <ArchitectureView />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/risks/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <RiskModules />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/refactor/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <Refactoring />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <Timeline />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/security/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <SecurityIssues />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/duplicates/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <DuplicateCode />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dead-code/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <DeadCode />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-explorer/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <ApiExplorer />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/api-docs/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <ApiDocs />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/database/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <DatabaseSchema />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cohesion/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <Cohesion />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:analysisId"
          element={
            <ProtectedRoute>
              <PageShell>
                <PageTransition>
                  <Report />
                </PageTransition>
              </PageShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
