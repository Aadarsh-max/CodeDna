import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, LayoutDashboard, Network, ShieldAlert, Wrench, FileText,
  TrendingUp, Lock, Copy, Trash2, Route, Database, BookOpen, Layers, X,
} from "lucide-react";
import useAnalysis from "../../hooks/useAnalysis.js";

const Sidebar = ({ open, onClose }) => {
  const { currentAnalysisId } = useAnalysis();

  const links = [
    { to: "/", label: "Import", icon: UploadCloud, requiresAnalysis: false },
    { to: `/dashboard/${currentAnalysisId}`, label: "Dashboard", icon: LayoutDashboard, requiresAnalysis: true },
    { to: `/architecture/${currentAnalysisId}`, label: "Architecture", icon: Network, requiresAnalysis: true },
    { to: `/risks/${currentAnalysisId}`, label: "Risk Modules", icon: ShieldAlert, requiresAnalysis: true },
    { to: `/refactor/${currentAnalysisId}`, label: "Refactor Plan", icon: Wrench, requiresAnalysis: true },
    { to: `/timeline/${currentAnalysisId}`, label: "Timeline", icon: TrendingUp, requiresAnalysis: true },
    { to: `/security/${currentAnalysisId}`, label: "Security", icon: Lock, requiresAnalysis: true },
    { to: `/duplicates/${currentAnalysisId}`, label: "Duplicate Code", icon: Copy, requiresAnalysis: true },
    { to: `/dead-code/${currentAnalysisId}`, label: "Dead Code", icon: Trash2, requiresAnalysis: true },
    { to: `/api-explorer/${currentAnalysisId}`, label: "API Explorer", icon: Route, requiresAnalysis: true },
    { to: `/api-docs/${currentAnalysisId}`, label: "API Docs", icon: BookOpen, requiresAnalysis: true },
    { to: `/database/${currentAnalysisId}`, label: "Database", icon: Database, requiresAnalysis: true },
    { to: `/cohesion/${currentAnalysisId}`, label: "Cohesion", icon: Layers, requiresAnalysis: true },
    { to: `/report/${currentAnalysisId}`, label: "Report", icon: FileText, requiresAnalysis: true },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: open ? 256 : 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="fixed lg:static top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] bg-base-200 shadow-clay-edge-r overflow-hidden z-40"
      >
        <div className="w-64 h-full p-4 flex flex-col gap-1 overflow-y-auto">
          <div className="flex items-center justify-between px-1 pb-2 lg:hidden">
            <span className="text-xs font-semibold opacity-50 uppercase tracking-wide">Menu</span>
            <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
              <X size={16} />
            </button>
          </div>

          {links.map(({ to, label, icon: Icon, requiresAnalysis }, index) => {
            const disabled = requiresAnalysis && !currentAnalysisId;

            if (disabled) {
              return (
                <span
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/30 cursor-not-allowed whitespace-nowrap"
                >
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </span>
              );
            }

            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
              >
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-clay-pressed"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-300/40 hover:translate-x-0.5"
                    }`
                  }
                >
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;