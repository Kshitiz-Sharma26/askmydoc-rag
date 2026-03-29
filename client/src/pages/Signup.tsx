import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Stethoscope,
  ArrowRight,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

import useApiCall from "../hooks/useApiCall";
import { signupAPI } from "../utility/ApiService";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { fetchData, loading } = useApiCall(signupAPI);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    const { error } = await fetchData({ username: email, password });

    if (error) {
      toast.error(error);
    } else {
      toast.success("Signup successful! Please log in.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-5xl flex flex-row-reverse rounded-3xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-xl border border-white/50">
        {/* Right Side (Visual Identity, mapped to Right in code, visually Right due to flex-row-reverse) */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden p-12 flex-col justify-between">
          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
                <Stethoscope className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Ask My Doc
              </h1>
            </div>
            <p className="mt-6 text-slate-300 text-lg max-w-md leading-relaxed">
              Join Ask My Doc today. Get clear, AI-driven explanations for your
              complex medical reports in seconds.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-slate-400 text-sm">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Empowering your health understanding</span>
          </div>
        </div>

        {/* Left Side: Signup Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create an account
              </h2>
              <p className="mt-2 text-slate-500">
                Start your journey with Ask My Doc
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Create a password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Confirm your password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 active:scale-[0.98] mt-4 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
