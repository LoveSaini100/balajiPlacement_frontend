import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo-bg.png';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Building2,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterInitial = location.pathname === '/register';
  const { loginCandidate, registerUser } = useJobContext();

  const searchParams = new URLSearchParams(location.search);
  const redirectMode = searchParams.get('redirect');
  const targetJobSlug = searchParams.get('job');

  const [mode, setMode] = useState(isRegisterInitial ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const result = await registerUser({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: 'candidate'
        });

        if (result && (result.success || result.token || result.user)) {
          if (redirectMode && redirectMode.startsWith('/')) {
            navigate(redirectMode);
          } else if (redirectMode === 'apply' && targetJobSlug) {
            toast.success("Resuming your job application...", { icon: '🚀' });
            navigate(`/apply/${targetJobSlug}`);
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        const result = await loginCandidate({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        });

        if (result && result.success) {
          if (redirectMode && redirectMode.startsWith('/')) {
            navigate(redirectMode);
          } else if (redirectMode === 'apply' && targetJobSlug) {
            toast.success("Resuming your job application...", { icon: '🚀' });
            navigate(`/apply/${targetJobSlug}`);
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Back to Home Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
          >
            <span>← Back to Home</span>
          </Link>
        </div>

        {/* Redirect Notice if coming from Apply button */}
        {redirectMode === 'apply' && (
          <div className="mb-5 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs flex items-center gap-3 text-blue-900 shadow-xs animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
              🔒
            </div>
            <div>
              <p className="font-bold text-slate-900">Sign in to Submit Application</p>
              <p className="text-slate-600 mt-0.5">Please sign in to your candidate account to submit your application directly to the recruiter.</p>
            </div>
          </div>
        )}

        {/* Top Brand Logo & Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center mb-1 group focus:outline-none">
            <img
              src={logo}
              alt="Balaji Placement"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl font-black text-slate-950">
            {mode === 'login' ? 'Candidate Sign In' : 'Create Candidate Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Access your profile, track applications, and apply for verified career openings.'
              : 'Join Balaji Placement to create your ATS resume and connect directly with top employers.'}
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name on Register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. candidate"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. candidate@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Mobile Number on Register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9528634580"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => toast.success("Password reset instructions sent to your email address.")}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms on Register */}
            {mode === 'register' && (
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to the <Link to="/about" className="text-blue-600 font-semibold hover:underline">Terms of Service</Link> and <Link to="/about" className="text-blue-600 font-semibold hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : mode === 'login' ? 'Candidate Sign In' : 'Create Candidate Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Toggle between Sign In & Register */}
          <div className="text-center pt-5 mt-5 border-t border-slate-100 text-xs text-slate-600">
            {mode === 'login' ? (
              <span>
                New Candidate?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Register Now
                </button>
              </span>
            ) : (
              <span>
                Already have a candidate account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Employer Portal Switcher Link */}
        <div className="text-center mt-6">
          <Link
            to="/employer"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Looking to hire talent? Switch to Employer Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
