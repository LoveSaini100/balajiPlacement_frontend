import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  Briefcase, 
  IndianRupee, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import { categoriesData } from '../data/categoriesData';
import CategoryCard from '../components/common/CategoryCard';

const Categories = () => {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Job Sectors & Industries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Browse Jobs by Category & Domain
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Explore active hiring requirements across India's booming sectors with live salary benchmarks and role insights.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {categoriesData.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Detailed Category Breakdown Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                Industry Salary Benchmarks & In-Demand Roles
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time market insights aggregated from 4,200+ verified employer postings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categoriesData.map((cat) => (
              <div key={cat.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-base text-slate-950">{cat.name}</h3>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full">
                      {cat.avgSalary}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                    {cat.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Popular Roles in this Sector:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.popularRoles?.map((role, idx) => (
                        <Link
                          key={idx}
                          to={`/jobs?query=${encodeURIComponent(role)}`}
                          className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          {role}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {cat.openJobs?.toLocaleString()} Open Positions
                  </span>
                  <Link
                    to={`/jobs?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View All Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Categories;
