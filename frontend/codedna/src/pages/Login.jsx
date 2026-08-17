import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-base-100 text-base-content px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-primary mb-6 text-center">
          CodeDNA
        </h1>

        <form onSubmit={handleSubmit} className="bg-base-200 border border-base-300 rounded-box p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Log In"}
          </button>

          <p className="text-sm text-center opacity-70">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;