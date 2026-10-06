import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { companiesData } from '../data/companiesData';
import CompanyCard from '../components/common/CompanyCard';

const Companies = () => {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const industries = ['All', 'IT & Software Development', 'Manufacturing & Engineering', 'Pharmaceutical & Healthcare', 'Banking, Finance & Accounts', 'Sales & Digital Marketing'];

  const filteredCompanies = useMemo(() => {
    return companiesData.filter(comp => {
      const matchSearch = comp.name.toLowerCase().includes(search.toLowerCase()) ||
                          comp.description.toLowerCase().includes(search.toLowerCase()) ||
                          comp.headquarters.toLowerCase().includes(search.toLowerCase());
      const matchIndustry = selectedIndustry === 'All' || comp.industry === selectedIndustry;
      return matchSearch && matchIndustry;
    });
  }, [search, selectedIndustry]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Verified Employer Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Explore Top Hiring Companies in India
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Discover corporate culture, employee benefits, salary standards, and open career opportunities at India's leading workplaces.
          </p>
        </div>

        {/* Search & Industry Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies by name, location, or tech domain..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedIndustry === ind
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-950 mb-1">No Companies Found</h3>
            <p className="text-xs text-slate-500 mb-4">Try searching with a different name or industry filter.</p>
            <button
              onClick={() => { setSearch(''); setSelectedIndustry('All'); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Companies;
