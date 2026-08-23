import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud, LayoutDashboard, Network, ShieldAlert, Wrench, FileText, ChevronLeft } from "lucide-react";
import useAnalysis from "../../hooks/useAnalysis.js";

const Sidebar = () => {
  const { currentAnalysisId } = useAnalysis();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: "/", label: "Import", icon: UploadCloud, requiresAnalysis: false, color: "#0E8C7E" },
    { to: `/dashboard/${currentAnalysisId}`, label: "Dashboard", icon: LayoutDashboard, requiresAnalysis: true, color: "#6D5FC4" },
    { to: `/architecture/${currentAnalysisId}`, label: "Architecture", icon: Network, requiresAnalysis: true, color: "#8B7FD6" },
    { to: `/risks/${currentAnalysisId}`, label: "Risk Modules", icon: ShieldAlert, requiresAnalysis: true, color: "#C6493D" },
    { to: `/refactor/${currentAnalysisId}`, label: "Refactor Plan", icon: Wrench, requiresAnalysis: true, color: "#C98A2E" },
    { to: `/report/${currentAnalysisId}`, label: "Report", icon: FileText, requiresAnalysis: true, color: "#3B82A6" },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 248 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="hidden lg:flex flex-col shrink-0 min-h-screen bg-linear-to-b from-base-100 to-base-200 shadow-clay-edge-r relative"
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-base-100 shadow-clay-sm flex items-center justify-center text-base-content/50 hover:text-primary transition-colors duration-150 cursor-pointer z-10"
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronLeft size={14} strokeWidth={2.4} />
        </motion.span>
      </button>

      <ul className="flex flex-col gap-1.5 p-4 pt-8">
        {links.map(({ to, label, icon: Icon, requiresAnalysis, color }) => {
          const disabled = requiresAnalysis && !currentAnalysisId;

          if (disabled) {
            return (
              <li key={label}>
                <span
                  title={collapsed ? label : undefined}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-field text-sm font-medium text-base-content/25 shadow-clay-pressed opacity-60 cursor-not-allowed ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={17} strokeWidth={2} />
                  {!collapsed && label}
                </span>
              </li>
            );
          }

          return (
            <li key={label}>
              <NavLink
                to={to}
                title={collapsed ? label : undefined}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-field text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="absolute inset-0 rounded-field shadow-clay-pressed"
                        style={{ backgroundColor: `${color}18` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon size={17} strokeWidth={2} style={{ color: isActive ? color : undefined }} className={isActive ? "" : "text-base-content/55"} />
                      {!collapsed && (
                        <span className={`whitespace-nowrap ${isActive ? "text-base-content" : "text-base-content/60"}`}>
                          {label}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </motion.aside>
  );
};

export default Sidebar;