import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/logo-bg.png";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  ArrowRight,
  Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white text-slate-600 pt-16 pb-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter / Trust Strip (Light Slate Surface) */}
        {/* <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 mb-12 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Never Miss a Career Opportunity
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                Get Daily Job Alerts Tailored to Your Profile
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Join 1,200,000+ professionals receiving direct, verified job opportunities with salary transparency.
              </p>
            </div>
            <div className="lg:col-span-5">
              <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed successfully! You will receive daily verified job alerts."); }} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 placeholder-slate-400 font-medium shadow-xs"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md hover:shadow-blue-600/20 whitespace-nowrap active:scale-95"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div> */}

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-8 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center group">
              <img 
                src={logo} 
                alt="Balaji Placement" 
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]" 
              />
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              India's premier transparent career platform connecting ambitious talent with verified tech innovators, Fortune 500 enterprises, and high-growth startups.
            </p>
            
            <div className="flex flex-col gap-2 pt-2 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Near, Anand Nursing Home, Chandpuri Nagar, Chow Mandi, Roorkee 247667</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="mailto:info@jobsetu.net" className="hover:text-blue-600 transition-colors">info@jobsetu.net</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="tel:+917500055715" className="hover:text-blue-600 transition-colors font-bold">+91 75000 55715 (Mon - Sat, 9am - 7pm IST)</a>
              </div>
            </div>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li><Link to="/jobs" className="hover:text-blue-600 transition-colors">Browse All Jobs</Link></li>
              <li><Link to="/jobs?mode=Remote" className="hover:text-blue-600 transition-colors">Remote Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-blue-600 transition-colors">Top Companies</Link></li>
              <li><Link to="/categories" className="hover:text-blue-600 transition-colors">Job Categories</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">Candidate Tracker</Link></li>
              <li><Link to="/blogs" className="hover:text-blue-600 transition-colors">Career Insights</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li><Link to="/employer" className="text-blue-600 font-bold hover:underline">Employer ATS Hub</Link></li>
              <li><Link to="/employer/post-job" className="hover:text-blue-600 transition-colors">Post a New Job</Link></li>
              <li><Link to="/employer/applicants" className="hover:text-blue-600 transition-colors">Candidate Pipeline</Link></li>
              <li><Link to="/employer/jobs" className="hover:text-blue-600 transition-colors">Manage Postings</Link></li>
              <li><Link to="/employer/profile" className="hover:text-blue-600 transition-colors">Company ATS Profile</Link></li>
            </ul>
          </div>

          {/* Top Locations */}
          <div>
            <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-4">
              Top Job Hubs
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <li><Link to="/jobs?location=Bengaluru" className="hover:text-blue-600 transition-colors">Jobs in Bengaluru</Link></li>
              <li><Link to="/jobs?location=Pune" className="hover:text-blue-600 transition-colors">Jobs in Pune</Link></li>
              <li><Link to="/jobs?location=Delhi%20NCR" className="hover:text-blue-600 transition-colors">Jobs in Delhi NCR</Link></li>
              <li><Link to="/jobs?location=Hyderabad" className="hover:text-blue-600 transition-colors">Jobs in Hyderabad</Link></li>
              <li><Link to="/jobs?location=Mumbai" className="hover:text-blue-600 transition-colors">Jobs in Mumbai</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Trust & Legal Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              100% Verified Job Postings
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Award className="w-4 h-4 text-blue-600" />
              Zero Candidate Placement Fees
            </span>
            <span>ISO 9001:2015 Compliant</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Security & Trust</Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
          © {new Date().getFullYear()} Balaji Placements. All rights reserved. Built with precision for the modern workforce.
        </div>

      </div>
    </footer>
  );
};

export default Footer;