import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dna, Eye, EyeOff } from "lucide-react";
import useAuth from "../hooks/useAuth.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-base-100 to-base-200 shadow-clay flex items-center justify-center">
            <Dna className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-base-content">
            CodeDNA
          </h1>
          <p className="font-mono text-[11px] sm:text-xs text-base-content/45 tracking-wide">
            software architecture, decoded
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-linear-to-br from-base-100 to-base-200 shadow-clay rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs sm:text-sm font-medium text-base-content/70">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-field bg-base-100 border border-base-300/60 px-4 py-2.5 text-sm sm:text-base text-base-content placeholder:text-base-content/30 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs sm:text-sm font-medium text-base-content/70">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-field bg-base-100 border border-base-300/60 pl-4 pr-11 py-2.5 text-sm sm:text-base text-base-content placeholder:text-base-content/30 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-base-content/45 hover:text-primary hover:bg-base-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors duration-150 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-mono text-xs text-error bg-error/10 border border-error/20 rounded-field px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="relative w-full rounded-field bg-primary text-primary-content font-medium py-2.5 shadow-clay-sm hover:shadow-clay hover:-translate-y-0.5 active:translate-y-0 active:shadow-clay-pressed transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-clay-sm disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Log In"}
          </button>

          <p className="text-sm text-center text-base-content/60">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded cursor-pointer"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;