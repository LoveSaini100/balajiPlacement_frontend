import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Building2, 
  ShieldCheck, 
  Award, 
  Users, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  HeartHandshake,
  Briefcase,
  Layers,
  Zap,
  Lock,
  Cpu,
  Factory,
  Landmark,
  Stethoscope,
  Truck,
  LineChart,
  UserCheck,
  Search,
  FileCheck2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Globe2
} from 'lucide-react';

const About = () => {
  const stats = [
    { value: '25,000+', label: 'Active Job Openings', highlight: 'Updated Daily' },
    { value: '4,200+', label: 'Verified Corporate Partners', highlight: 'Across India' },
    { value: '1.2M+', label: 'Registered Professionals', highlight: 'Active Talent' },
    { value: '98.4%', label: 'Recruiter Response Rate', highlight: 'Industry Best' }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Smart Profile Matching',
      desc: 'Our intelligent matching algorithm pairs your skills, experience, and salary expectations directly with verified job listings.',
      icon: Search
    },
    {
      step: '02',
      title: 'Authenticated Verification',
      desc: 'Every employer and job opening undergoes stringent GSTIN and company domain verification to ensure 100% genuine opportunities.',
      icon: ShieldCheck
    },
    {
      step: '03',
      title: 'Direct Recruiter Connect',
      desc: 'Skip middleman recruitment layers. Connect directly with HR managers and hiring leads with real-time status updates.',
      icon: Users
    },
    {
      step: '04',
      title: 'Zero-Fee Placement',
      desc: 'Candidates never pay a single rupee. Enjoy 100% free lifetime career services, interviews, and onboarding support.',
      icon: Award
    }
  ];

  const industries = [
    {
      name: 'IT & Software Engineering',
      roles: 'Full Stack, Cloud, AI/ML, DevOps',
      count: '8,500+ Jobs',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      name: 'Manufacturing & Core Engineering',
      roles: 'Production, QC, Mechanical, Electrical',
      count: '5,200+ Jobs',
      icon: Factory,
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      name: 'Banking, Financial Services & Insurance',
      roles: 'FinTech, Credit Analyst, Wealth Mgmt',
      count: '3,800+ Jobs',
      icon: Landmark,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      name: 'Healthcare & Pharmaceuticals',
      roles: 'Clinical Research, R&D, Lab Tech',
      count: '2,400+ Jobs',
      icon: Stethoscope,
      color: 'bg-rose-50 text-rose-600 border-rose-100'
    },
    {
      name: 'Logistics & Supply Chain',
      roles: 'Fleet Operations, Procurement, Warehousing',
      count: '3,100+ Jobs',
      icon: Truck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    {
      name: 'Sales, Marketing & BD',
      roles: 'Digital Growth, B2B Sales, Brand Strategy',
      count: '4,600+ Jobs',
      icon: LineChart,
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    }
  ];

  const candidateBenefits = [
    '100% Free Lifetime Application Guarantee',
    'Transparent compensation brackets with no hidden clauses',
    'Direct application tracking with real-time status updates',
    'Curated openings from verified startups to Fortune 500s',
    'Zero cold calls or unsolicited data selling'
  ];

  const employerBenefits = [
    'Access to 1.2M+ pre-screened, active Indian professionals',
    '24-Hour candidate pipeline turnaround for urgent roles',
    'Advanced ATS dashboard with seamless 1-click applicant review',
    'Verified GSTIN employer badge for maximum applicant trust',
    'Dedicated relationship manager for custom enterprise hiring'
  ];

  const trustPillars = [
    {
      icon: Lock,
      title: 'Enterprise Data Security',
      desc: 'Candidate resumes and corporate data are protected with bank-grade 256-bit encryption and strict privacy protocols.'
    },
    {
      icon: FileCheck2,
      title: '100% Domain Verification',
      desc: 'All corporate accounts are verified via official company emails, CIN registration, and GSTIN databases.'
    },
    {
      icon: Clock,
      title: '48-Hour Response SLA',
      desc: 'Recruiters are incentivized for rapid candidate feedback, preventing endless application black holes.'
    },
    {
      icon: HeartHandshake,
      title: 'Ethical Placement Charter',
      desc: 'Zero tolerance for fraudulent recruiters, registration fees, or misleading job descriptions.'
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <Helmet>
        <title>About Us | JobPortal - India's Verified Career & Recruitment Ecosystem</title>
        <meta 
          name="description" 
          content="Learn about JobPortal, our mission, verified recruitment standards, and how we connect 1.2M+ ambitious professionals with India's top employers transparently and fee-free." 
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* ── 1. HEADER HERO ── */}
        <div className="text-center max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Transforming Career Mobility Across India</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Connecting Ambition with Transparent Opportunity
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
            JobPortal is India's leading verified career ecosystem, built on uncompromising salary transparency, authenticated employers, and zero placement fees for candidates.
          </p>
        </div>

        {/* ── 2. CORE STATS GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {item.value}
              </div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1.5">
                {item.label}
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                {item.highlight}
              </span>
            </div>
          ))}
        </div>

        {/* ── 3. WHO WE ARE & STORY (NEW SECTION) ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Our Heritage & Purpose</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                Pioneering a Trust-First Employment Network for Modern India
              </h2>
              
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Founded with a mission to eliminate fraud and opacity in the recruitment sector, JobPortal has grown from a regional talent bridge into a comprehensive pan-India career platform. We serve both emerging tier-2/tier-3 industrial corridors and premier metropolitan tech hubs.
              </p>
              
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                By pairing proprietary recruiter verification algorithms with dedicated candidate support, we ensure that every job listed represents genuine corporate openings with verified salary brackets and direct interviewer communication.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Direct Recruiter Access</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">No unauthorized third-party agencies</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">100% Free for Candidates</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Zero application or registration fees</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-2xl p-7 text-white shadow-xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Candidate First Pledge</p>
                    <h3 className="text-lg font-black text-white mt-0.5">The JobPortal Shield</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Globe2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Pan-India Reach</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">From Bangalore tech corridors to Haridwar & Sanand industrial hubs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">24-Hour Hiring Cycles</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Fast-tracked applications and direct scheduling with hiring managers.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">100% Authentic Listings</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Every employer is screened for business registration, GSTIN, and active operations.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/20"
                  >
                    <span>Explore Verified Positions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. MISSION & VISION SECTION ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-950">Our Mission</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              To empower every jobseeker in India—from tier-1 tech engineers to manufacturing specialists—with instant access to authentic employment opportunities, clear market compensation, and fast-track hiring with zero financial barrier.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-950">Our Vision</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              To build India's most trusted, AI-accelerated, and ethical employment platform where recruiters find pre-qualified talent within 24 hours and candidates advance their careers without anxiety, deceit, or delays.
            </p>
          </div>
        </div>

        {/* ── 5. HOW IT WORKS / THE 4-STEP ECOSYSTEM (NEW SECTION) ── */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>How We Work</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              A Seamless, Transparent Hiring Journey
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed to protect candidates and accelerate quality recruitment for enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-200 group-hover:text-blue-100 transition-colors">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-950 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                    <span>Verified Step</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6. DUAL VALUE PROPOSITION: CANDIDATES VS EMPLOYERS (NEW SECTION) ── */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Empowering Both Sides of the Hiring Table
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Whether you are advancing your career or scaling your corporate workforce, we provide tailored tools and verified workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Candidates */}
            <div className="bg-slate-800/80 rounded-2xl p-7 border border-slate-700/80 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">For Ambitious Job Seekers</h3>
                  <p className="text-xs text-slate-400">Land verified roles with complete peace of mind</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {candidateBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition"
              >
                <span>Browse Verified Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* For Employers */}
            <div className="bg-slate-800/80 rounded-2xl p-7 border border-slate-700/80 hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">For Corporate Employers & HRs</h3>
                  <p className="text-xs text-slate-400">Hire pre-qualified talent fast without agency markups</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {employerBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/employer"
                className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition"
              >
                <span>Employer Hiring Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 7. KEY INDUSTRIES & DOMAINS (NEW SECTION) ── */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Industry Coverage</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Sectors We Specialize In
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Connecting qualified talent across diverse economic pillars and technical disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${ind.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {ind.count}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-950 mb-1">
                      {ind.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {ind.roles}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link 
                      to={`/jobs?category=${encodeURIComponent(ind.name)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>Explore Openings</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 8. TRUST, SECURITY & ETHICAL CHARTER (NEW SECTION) ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trust & Candidate Protection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Our Uncompromising Safety Charter
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              We uphold the strictest verification standards to protect job seekers and maintain recruitment integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 9. CTA BANNER ── */}
        <div className="text-center bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-10 sm:p-14 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Accelerate Your Career or Build Your Team?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join over 1.2 million registered professionals and 4,200+ verified corporate partners hiring on JobPortal today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95 w-full sm:w-auto"
              >
                <span>Find Jobs Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/employer"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl border border-slate-700 transition w-full sm:w-auto"
              >
                <span>Employer Portal</span>
                <Briefcase className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;