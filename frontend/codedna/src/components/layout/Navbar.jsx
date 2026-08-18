import { motion } from "framer-motion";
import { Dna } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-200/60 backdrop-blur-md border-b border-base-300/80 px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex-1 flex items-center gap-2.5">
        <label htmlFor="app-drawer" className="btn btn-ghost btn-sm lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
          <Dna size={18} strokeWidth={2.2} />
        </div>
        <span className="font-display text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          CodeDNA
        </span>
      </div>
      <div className="flex-none gap-3 items-center flex">
        {user && <span className="text-sm opacity-70 hidden sm:inline">{user.name}</span>}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn btn-primary btn-sm shadow-md shadow-primary/20">
          Analyze Repo
        </motion.button>
        {user && (
          <button onClick={logout} className="btn btn-ghost btn-sm">
            Log Out
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;