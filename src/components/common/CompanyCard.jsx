import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';

const CompanyCard = ({ company }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header with Logo & Details */}
        <div className="flex items-center gap-3.5 mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base tracking-wider shrink-0 shadow-sm bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-800"
          >
            {company.logoText || company.name.substring(0, 3).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <Link 
              to={`/companies/${company.slug}`}
              className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <span className="truncate">{company.name}</span>
              {company.verified && <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 shrink-0" />}
            </Link>
            <span className="text-xs text-slate-500 font-medium block truncate">{company.industry}</span>
          </div>
        </div>

        {/* Tagline / Snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {company.tagline || company.description}
        </p>

        {/* Key stats pills */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-5">
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{company.headquarters || 'Pan-India'}</span>
          </div>
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 truncate">
            <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{company.employees || '1,000+ staff'}</span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5" />
          {company.openJobsCount || 12} Open Positions
        </span>

        <Link
          to={`/companies/${company.slug}`}
          className="text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
