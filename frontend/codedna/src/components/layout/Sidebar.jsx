import { NavLink } from "react-router-dom";
import {
  UploadCloud, LayoutDashboard, Network, ShieldAlert, Wrench, FileText,
  TrendingUp, Lock, Copy, Trash2, Route, Database, BookOpen, Layers,
} from "lucide-react";
import useAnalysis from "../../hooks/useAnalysis.js";

const Sidebar = () => {
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
    <aside className="w-64 min-h-full bg-base-200 shadow-clay-edge-r p-4">
      <ul className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, requiresAnalysis }) => {
          const disabled = requiresAnalysis && !currentAnalysisId;

          if (disabled) {
            return (
              <li key={label}>
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-base-content/30 cursor-not-allowed">
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </span>
              </li>
            );
          }

          return (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-clay-pressed"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-300/40"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;