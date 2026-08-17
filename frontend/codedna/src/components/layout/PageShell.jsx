import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const PageShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default PageShell;