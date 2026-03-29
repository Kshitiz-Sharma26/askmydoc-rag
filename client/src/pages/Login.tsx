import { useContext, useState } from "react";
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
import { loginAPI } from "../utility/ApiService";
import { GlobalContext, type User } from "../context/GlobalContextProvider";

export default function Login() {
  const { dispatch } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { fetchData, loading } = useApiCall(loginAPI);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await fetchData({ username: email, password });
    if (error) {
      toast.error(error);
    } else {
      dispatch({
        type: "SET-USER",
        payload: data as User,
      });
      toast.success("Login successful!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-xl border border-white/50">
        {/* Left Side: Brand Identity */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden p-12 flex-col justify-between">
          {/* Decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-[40%] left-[20%] w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Ask My Doc
              </h1>
            </div>
            <p className="mt-6 text-blue-100/90 text-lg max-w-md leading-relaxed">
              Your intelligent medical report companion. Upload, ask, and
              understand your health data seamlessly with RAG technology.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-blue-100/80 text-sm">
            <Activity className="w-5 h-5" />
            <span>Secure, private, and AI-powered insights</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-slate-500">
                Sign in to your Ask My Doc account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-2xl font-medium transition-all duration-200 active:scale-[0.98] mt-2 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
