import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Star, 
  Users, 
  Globe, 
  Calendar, 
  CheckCircle2, 
  Briefcase, 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { companiesData } from '../data/companiesData';
import { useJobContext } from '../context/JobContext';
import JobCard from '../components/common/JobCard';

const CompanyDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { jobs } = useJobContext();

  const company = companiesData.find(c => c.slug === slug) || companiesData[0];
  const companyJobs = jobs.filter(j => j.companySlug === company?.slug || (company?.name && j.company?.toLowerCase().includes(company.name.toLowerCase().split(' ')[0])));

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Companies</span>
        </button>

        {/* Company Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex items-start gap-5">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-xl sm:text-2xl tracking-wider shrink-0 shadow-lg shadow-blue-950/20 bg-gradient-to-br from-slate-950 to-blue-950 border border-slate-800"
              >
                {company.logoText || company.name.substring(0, 3).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
                    {company.name}
                  </h1>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Verified Employer
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
                  {company.tagline || company.industry}
                </p>

                <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {company.headquarters}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    {company.employees}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Est. {company.founded}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating & Website */}
            <div className="flex items-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="text-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-center gap-1 text-base font-black text-slate-950">
                  <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
                  <span>{company.rating || 4.4}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                  {(company.reviewsCount || 1200).toLocaleString()} Reviews
                </span>
              </div>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* About Company */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950 mb-3">
                About {company.name}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {company.description}
              </p>

              {company.highlights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
                  {company.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Culture & Pillars */}
            {company.culture && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950 mb-4">
                  Workplace Culture & Core Values
                </h2>
                <div className="space-y-4">
                  {company.culture.map((c, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-950 mb-1">{c.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employee Benefits */}
            {company.benefits && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950 mb-4">
                  Perks & Employee Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.benefits.map((b, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Job Openings at this Company */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Open Positions ({companyJobs.length})</span>
                </h2>
              </div>

              {companyJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {companyJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  No active openings currently listed for this company. Check back soon.
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-4">
                Company Snapshot
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Industry:</span>
                  <span className="font-semibold text-slate-900 text-right">{company.industry}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Founded:</span>
                  <span className="font-semibold text-slate-900">{company.founded}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-400">Locations:</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {company.locations?.join(', ') || company.headquarters}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Workforce:</span>
                  <span className="font-semibold text-slate-900">{company.employees}</span>
                </div>
              </div>
            </div>

            {/* Employer CTA */}
            <div className="bg-gradient-to-br from-slate-950 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">
                Work at {company.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Follow this company or set up an instant job alert to receive notification when new positions open.
              </p>
              <button
                onClick={() => alert(`Job alerts for ${company.name} enabled!`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-95"
              >
                Set Free Job Alert for {company.name}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CompanyDetails;
