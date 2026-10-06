import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Layers,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  ChevronRight,
  Flame,
  FileCheck,
  Zap,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { categoriesData } from '../data/categoriesData';
import { companiesData } from '../data/companiesData';
import { blogsData } from '../data/blogsData';
import { locationsList, experienceFilters } from '../data/jobsData';
import JobCard from '../components/common/JobCard';
import CategoryCard from '../components/common/CategoryCard';
import CompanyCard from '../components/common/CompanyCard';

const Home = () => {
  const navigate = useNavigate();
  const { jobs } = useJobContext();

  // Search state in Hero (Naukri / Indeed style 3-input search engine)
  const [keyword, setKeyword] = useState('');
  const [experience, setExperience] = useState('All Experience');
  const [location, setLocation] = useState('All Locations');
  const [activeTab, setActiveTab] = useState('all');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('query', keyword.trim());
    if (experience !== 'All Experience') params.append('experience', experience);
    if (location !== 'All Locations') params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const trendingSearches = [
    { label: "Remote", query: "Remote" },
    { label: "Fresher Jobs", query: "Fresher" },
    { label: "React Developer", query: "React" },
    { label: "Data Analyst", query: "Data" },
    { label: "Software Engineer", query: "Engineer" },
    { label: "HR Executive", query: "HR" },
    { label: "Sales & Marketing", query: "Sales" }
  ];

  // Filter jobs for the featured section
  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true;
    if (activeTab === 'remote') return job.workMode === 'Remote' || job.workMode === 'Hybrid';
    if (activeTab === 'tech') return job.categorySlug === 'it-software';
    if (activeTab === 'manufacturing') return job.categorySlug === 'manufacturing-engineering';
    if (activeTab === 'pharma') return job.categorySlug === 'pharma-healthcare';
    if (activeTab === 'finance') return job.categorySlug === 'banking-finance';
    return true;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {/* 1. HERO SECTION (Naukri & Indeed High-Impact Search Header) */}
      <section className="relative bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] pt-10 pb-8 border-b border-slate-200 overflow-hidden">
       
        {/* Subtle decorative tech blue ambient glow */}
        <div className="absolute -top-28 -left-28 sm:-top-40 sm:-left-40 lg:-top-56 lg:-left-56 w-[450px] sm:w-[550px] lg:w-[650px] h-[450px] sm:h-[550px] lg:h-[650px] rounded-full bg-gradient-to-br from-blue-100/80 via-sky-100/50 to-blue-50/20 border border-blue-200/40 pointer-events-none -z-0" />
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-400/35 blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-4 right-10 w-96 h-96 rounded-full bg-slate-100 blur-2xl pointer-events-none -z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Trust Pill */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>India's Leading Direct Hiring Portal • 25,000+ Verified Jobs</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
              Find Your <span className="text-blue-600">Dream Career</span> With Genuine Employers
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Direct recruitment for freshers and experienced professionals. Real salaries, direct HR contacts, and instant ATS shortlisting.
            </p>
          </div>

          {/* Search Box (Signature Naukri & Indeed 3-Field Capsule) */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 p-3 sm:p-4 mb-6">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

              {/* Keyword Input */}
              <div className="md:col-span-4 relative">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 pl-1">
                  Skills / Designations / Companies
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. React, Python, Java, Sales..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* Experience Select (Naukri Pattern) */}
              <div className="md:col-span-3 relative">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 pl-1">
                  Select Experience
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-blue-600 absolute left-3.5" />
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-semibold cursor-pointer"
                  >
                    <option value="All Experience">All Experience</option>
                    <option value="Fresher (0-1 yr)">Fresher (0-1 yr)</option>
                    <option value="Early Career (1-3 yrs)">1 - 3 Years</option>
                    <option value="Mid-Level (3-6 yrs)">3 - 6 Years</option>
                    <option value="Senior (6+ yrs)">6+ Years</option>
                  </select>
                </div>
              </div>

              {/* Location Select (Indeed Pattern) */}
              <div className="md:col-span-3 relative">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 pl-1">
                  Enter Location
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-semibold cursor-pointer"
                  >
                    {locationsList.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-2 md:pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 rounded-xl shadow-md shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

            </form>
          </div>

          {/* Trending Searches */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Trending:
            </span>
            {trendingSearches.map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/jobs?query=${encodeURIComponent(item.query)}`)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 font-semibold transition-all shadow-xs"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Stats Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8 pt-4 border-t border-slate-200">
            <div className="text-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-slate-950">25,400+</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Live Verified Openings</div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-600">4,200+</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Verified Employers</div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-slate-950">1.2M+</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Active Professionals</div>
            </div>
            <div className="text-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-600">98.4%</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Placement Trust Rate</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              Explore by Industry
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Popular Job Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse thousands of vacancies curated across top growth sectors in India.
            </p>
          </div>

          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {categoriesData.slice(0, 8).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED & LATEST JOBS SECTION */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5" />
                Top Hand-Picked Roles
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Featured & Latest Job Openings
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verified high-impact roles with competitive CTC and fast-track recruiter response.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all whitespace-nowrap active:scale-95"
            >
              <span>Explore All {jobs.length} Jobs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-100">
            {[
              { id: 'all', label: 'All Openings' },
              { id: 'remote', label: 'Remote / Hybrid' },
              { id: 'tech', label: 'Tech & IT' },
              { id: 'manufacturing', label: 'Manufacturing' },
              { id: 'pharma', label: 'Pharma & QC' },
              { id: 'finance', label: 'Banking & Finance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Bottom Callout */}
          <div className="mt-12 text-center">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-sm"
            >
              <span>Browse All Open Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. WHY CHOOSE US / TRUST PILLARS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            Built for High-Growth Careers
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            Why Professionals & Recruiters Choose JobPortal
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            We eliminate ghost postings, hidden salaries, and unsolicited spam with strict enterprise verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 mb-2">
              100% Verified Employers
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Every recruiter account and job listing undergoes strict enterprise authentication before publication. Zero scam tolerance.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 mb-2">
              Fast-Track Direct Apply
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              No endless 10-page forms. Attach your CV once and apply directly to hiring managers with real-time application tracking.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-600/5 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 mb-2">
              Salary & Role Transparency
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Clear compensation ranges, verified skills requirements, and work-mode specifications so you know exactly what to expect.
            </p>
          </div>

        </div>
      </section>

      {/* 5. TOP HIRING COMPANIES */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" />
                Featured Employers
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Top Companies Actively Hiring
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Discover work culture, employee benefits, and open positions across industry leaders.
              </p>
            </div>

            <Link
              to="/companies"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Explore All Companies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companiesData.slice(0, 4).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

        </div>
      </section>

      {/* 6. EMPLOYER CTA BANNER */}
      {/* 6. CANDIDATE CAREER ACCELERATOR BANNER (100% Candidate-Centric) */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        {/* Tech blue glow accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-8 space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Fast-Track Career Matching
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Ready to Land Your Next Job? Upload Your Resume in Seconds.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                Join over 120,000+ jobseekers who found high-paying roles across software engineering, manufacturing, healthcare, and finance with verified employers.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  100% Free for Candidates
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Direct Recruiter Outreach
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Real Salary Transparency
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/jobs"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl text-center shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Browse Latest Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-3.5 px-6 rounded-2xl text-center border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <span>Update Resume & Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAREER RESOURCES / BLOGS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <FileCheck className="w-3.5 h-3.5" />
                Career Playbooks
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Latest Career Resources & Tips
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Practical guides to help you optimize your resume, crack technical interviews, and negotiate higher compensation.
              </p>
            </div>

            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Read All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogsData.map((blog) => (
              <article
                key={blog.id}
                className="group bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-600/5 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {blog.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                      <span>{blog.date}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <Link to={`/blogs/${blog.slug}`}>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">By {blog.author.split(',')[0]}</span>
                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;