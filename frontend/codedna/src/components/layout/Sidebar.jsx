import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Import" },
  { to: "/dashboard/latest", label: "Dashboard" },
  { to: "/architecture/latest", label: "Architecture" },
  { to: "/risks/latest", label: "Risk Modules" },
  { to: "/refactor/latest", label: "Refactor Plan" },
  { to: "/report/latest", label: "Report" },
];

const Sidebar = () => {
  return (
    <aside className="w-56 bg-base-200 border-r border-base-300 min-h-[calc(100vh-4rem)] p-4">
      <ul className="menu gap-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? "active font-medium" : "font-medium")}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;