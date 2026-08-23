import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud, LayoutDashboard, Network, ShieldAlert, Wrench, FileText } from "lucide-react";
import useAnalysis from "../../hooks/useAnalysis.js";

const BottomNav = () => {
  const { currentAnalysisId } = useAnalysis();

  const links = [
    { to: "/", label: "Import", icon: UploadCloud, requiresAnalysis: false, color: "#0E8C7E" },
    { to: `/dashboard/${currentAnalysisId}`, label: "Dashboard", icon: LayoutDashboard, requiresAnalysis: true, color: "#6D5FC4" },
    { to: `/architecture/${currentAnalysisId}`, label: "Architecture", icon: Network, requiresAnalysis: true, color: "#8B7FD6" },
    { to: `/risks/${currentAnalysisId}`, label: "Risk", icon: ShieldAlert, requiresAnalysis: true, color: "#C6493D" },
    { to: `/refactor/${currentAnalysisId}`, label: "Refactor", icon: Wrench, requiresAnalysis: true, color: "#C98A2E" },
    { to: `/report/${currentAnalysisId}`, label: "Report", icon: FileText, requiresAnalysis: true, color: "#3B82A6" },
  ];

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-base-100/90 backdrop-blur-md shadow-[0_-8px_20px_rgba(58,48,26,0.10)] pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-stretch justify-between px-1">
        {links.map(({ to, label, icon: Icon, requiresAnalysis, color }) => {
          const disabled = requiresAnalysis && !currentAnalysisId;

          if (disabled) {
            return (
              <li key={label} className="flex-1">
                <span className="flex flex-col items-center gap-0.5 py-2.5 text-base-content/25 cursor-not-allowed">
                  <Icon size={19} strokeWidth={2} />
                  <span className="text-[9px] font-medium leading-none">{label}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={label} className="flex-1">
              <NavLink to={to} className="relative flex flex-col items-center gap-0.5 py-2.5 cursor-pointer">
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="bottomnav-active-pill"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="absolute inset-x-2 inset-y-1 rounded-2xl shadow-clay-pressed"
                        style={{ backgroundColor: `${color}18` }}
                      />
                    )}
                    <span className="relative z-10 flex flex-col items-center gap-0.5">
                      <Icon size={19} strokeWidth={2} style={{ color: isActive ? color : undefined }} className={isActive ? "" : "text-base-content/55"} />
                      <span
                        className={`text-[9px] font-medium leading-none ${isActive ? "" : "text-base-content/55"}`}
                        style={{ color: isActive ? color : undefined }}
                      >
                        {label}
                      </span>
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;