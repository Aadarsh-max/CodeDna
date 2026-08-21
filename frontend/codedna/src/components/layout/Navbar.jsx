import { motion } from "framer-motion";
import { Dna, Menu, UploadCloud, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md shadow-clay-edge-b px-4 sm:px-6 sticky top-0 z-30 min-h-16">
      <div className="flex-1 flex items-center gap-2.5 sm:gap-3">
        <label
          htmlFor="app-drawer"
          className="lg:hidden p-2 -ml-1 rounded-full text-base-content/60 hover:text-primary hover:bg-base-300/40 transition-colors duration-150 cursor-pointer"
        >
          <Menu size={20} strokeWidth={2} />
        </label>
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-linear-to-br from-base-100 to-base-200 shadow-clay-sm text-primary">
          <Dna size={17} strokeWidth={2.2} />
        </div>
        <span className="font-display text-lg sm:text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          CodeDNA
        </span>
      </div>

      <div className="flex-none gap-2 sm:gap-3 items-center flex">
        {user && (
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-secondary to-accent flex items-center justify-center text-[11px] font-semibold text-secondary-content shadow-clay-sm">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm text-base-content/70 max-w-28 truncate">{user.name}</span>
          </div>
        )}

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="rounded-field bg-primary text-primary-content text-sm font-medium px-3.5 sm:px-4 py-2 shadow-clay-sm hover:shadow-clay transition-shadow duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <UploadCloud size={15} strokeWidth={2.2} />
          <span className="hidden sm:inline">Analyze Repo</span>
        </motion.button>

        {user && (
          <button
            onClick={logout}
            aria-label="Log out"
            className="p-2 rounded-full text-base-content/50 hover:text-error hover:bg-error/10 transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={17} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;