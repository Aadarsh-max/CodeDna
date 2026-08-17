const Navbar = () => {
  return (
    <div className="navbar bg-base-200 border-b border-base-300 px-6">
      <div className="flex-1">
        <span className="font-display text-xl font-semibold tracking-tight text-primary">
          CodeDNA
        </span>
      </div>
      <div className="flex-none gap-2">
        <button className="btn btn-primary btn-sm">Analyze Repo</button>
      </div>
    </div>
  );
};

export default Navbar;