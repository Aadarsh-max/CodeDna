import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";

const PageShell = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 pb-28 lg:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
};

export default PageShell;