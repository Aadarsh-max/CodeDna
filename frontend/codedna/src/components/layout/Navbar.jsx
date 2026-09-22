import { motion } from "framer-motion";
import { Dna, Menu, LogOut, Sparkles } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 navbar bg-base-200/60 backdrop-blur-md shadow-clay-edge-b px-3 sm:px-6 sticky top-0 z-50 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onToggleSidebar} className="btn btn-ghost btn-sm btn-circle shrink-0" aria-label="Toggle sidebar">
          <Menu size={19} />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
          <Dna size={18} strokeWidth={2.2} />
        </div>
        <span className="hidden sm:inline font-display text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
          CodeDNA
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {user && <span className="hidden md:inline text-sm opacity-70 truncate max-w-[120px]">{user.name}</span>}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm shadow-md shadow-primary/20 gap-1.5 px-3 sm:px-4"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Analyze Repo</span>
        </motion.button>
        {user && (
          <button onClick={logout} className="btn btn-ghost btn-sm gap-1.5" aria-label="Log out">
            <LogOut size={16} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;