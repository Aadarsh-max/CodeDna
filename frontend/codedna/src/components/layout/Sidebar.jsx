import { NavLink } from "react-router-dom";
import { UploadCloud, LayoutDashboard, Network, ShieldAlert, Wrench, FileText } from "lucide-react";
import useAnalysis from "../../hooks/useAnalysis.js";

const Sidebar = () => {
  const { currentAnalysisId } = useAnalysis();

  const links = [
    { to: "/", label: "Import", icon: UploadCloud, requiresAnalysis: false },
    { to: `/dashboard/${currentAnalysisId}`, label: "Dashboard", icon: LayoutDashboard, requiresAnalysis: true },
    { to: `/architecture/${currentAnalysisId}`, label: "Architecture", icon: Network, requiresAnalysis: true },
    { to: `/risks/${currentAnalysisId}`, label: "Risk Modules", icon: ShieldAlert, requiresAnalysis: true },
    { to: `/refactor/${currentAnalysisId}`, label: "Refactor Plan", icon: Wrench, requiresAnalysis: true },
    { to: `/report/${currentAnalysisId}`, label: "Report", icon: FileText, requiresAnalysis: true },
  ];

  return (
    <aside className="w-64 min-h-full bg-base-200/60 backdrop-blur-sm border-r border-base-300/80 p-4">
      <ul className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, requiresAnalysis }) => {
          const disabled = requiresAnalysis && !currentAnalysisId;

          if (disabled) {
            return (
              <li key={label}>
                <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border-l-2 border-transparent text-base-content/30 cursor-not-allowed">
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
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-2 ${
                    isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-base-content/70 hover:text-base-content hover:bg-base-300/40"
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