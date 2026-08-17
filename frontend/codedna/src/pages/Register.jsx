import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
            <label className="text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input input-bordered w-full"
            />
          </div>

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
              minLength={6}
              className="input input-bordered w-full"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Create Account"}
          </button>

          <p className="text-sm text-center opacity-70">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;