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
    <aside className="w-[78vw] max-w-64 lg:w-64 min-h-full bg-linear-to-b from-base-100 to-base-200 shadow-clay-edge-r rounded-r-[1.5rem] lg:rounded-none p-4 flex flex-col gap-1">
      <ul className="flex flex-col gap-1.5">
        {links.map(({ to, label, icon: Icon, requiresAnalysis }) => {
          const disabled = requiresAnalysis && !currentAnalysisId;

          if (disabled) {
            return (
              <li key={label}>
                <span className="flex items-center gap-3 px-3.5 py-2.5 rounded-field text-sm font-medium text-base-content/25 shadow-clay-pressed opacity-60 cursor-not-allowed">
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-field text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-base-100 shadow-clay-pressed text-primary"
                      : "text-base-content/65 hover:text-base-content hover:bg-base-100 hover:shadow-clay-sm"
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