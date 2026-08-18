import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const PageShell = ({ children }) => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen text-base-content">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <div className="drawer-side z-20">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar />
      </div>
    </div>
  );
};

export default PageShell;