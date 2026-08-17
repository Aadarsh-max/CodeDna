import useAuth from "../../hooks/useAuth.js";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-200 border-b border-base-300 px-6">
      <div className="flex-1">
        <span className="font-display text-xl font-semibold tracking-tight text-primary">
          CodeDNA
        </span>
      </div>
      <div className="flex-none gap-3 items-center flex">
        {user && <span className="text-sm opacity-70">{user.name}</span>}
        <button className="btn btn-primary btn-sm">Analyze Repo</button>
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