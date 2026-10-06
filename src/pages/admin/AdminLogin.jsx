import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound,
  Building2,
  AlertCircle,
  CheckCircle2,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/logo-bg.png';
import { useJobContext } from '../../context/JobContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, user, isAuthenticated } = useJobContext();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-redirect if already logged in as admin
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both administrator email and access key.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAdmin({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (res && res.success) {
        navigate(redirectUrl, { replace: true });
      } else {
        setErrorMsg(res?.message || 'Invalid administrator credentials. Access restricted.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@balajiplacement.com');
    setPassword('admin@123');
    setErrorMsg('');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#090D16] flex flex-col justify-between font-sans selection:bg-[#2563EB] selection:text-white">
      
      {/* Top Bar with Home Link */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xs">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Balaji Placements" className="h-9 w-auto object-contain" />
        </Link>

        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Return to Jobseeker Site</span>
        </Link>
      </header>

      {/* Login Card Container */}
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          
          {/* Top Admin Badge */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-xs border border-blue-200">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>

          <div className="text-center space-y-1.5 mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full border border-blue-200">
              <KeyRound className="w-3 h-3" />
              Restricted Console Access
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-500">
              Secure authentication for Balaji Placements Governance & Company Inspection Console.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@balajiplacement.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#2563EB] rounded-xl outline-none text-slate-900 placeholder-slate-400 font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Security Access Key
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#2563EB] rounded-xl outline-none text-slate-900 placeholder-slate-400 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Access...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credentials & Enter Console</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] hover:text-blue-800 bg-[#EFF6FF] hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200 transition-all cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fill Default Admin (admin@balajiplacement.com)</span>
            </button>
          </div>

        </div>

        {/* Security Reassurance */}
        <div className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>256-Bit SSL Encrypted Administrative Session</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Balaji Placements Administration Security Protocol • Authorized Personnel Only
      </footer>

    </div>
  );
};

export default AdminLogin;
