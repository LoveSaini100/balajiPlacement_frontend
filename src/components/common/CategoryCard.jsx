import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Factory, 
  Pill, 
  Landmark, 
  TrendingUp, 
  Users2, 
  Headphones, 
  Truck,
  ArrowRight,
  Briefcase
} from 'lucide-react';

const iconMap = {
  Code2,
  Factory,
  Pill,
  Landmark,
  TrendingUp,
  Users2,
  Headphones,
  Truck
};

const CategoryCard = ({ category }) => {
  const IconComponent = iconMap[category.iconName] || Briefcase;

  return (
    <Link
      to={`/jobs?category=${encodeURIComponent(category.name)}`}
      className="group bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 lg:p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Top Icon and Growth Tag */}
        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-4">
          <div 
            className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white shrink-0"
          >
            <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 transition-colors" />
          </div>

          <span className="text-[9px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 sm:px-2.5 py-0.5 rounded-full">
            {category.growthRate || '+12%'}
          </span>
        </div>

        {/* Name and Description */}
        <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 sm:mb-1.5 line-clamp-1">
          {category.name}
        </h3>
        
        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2.5 sm:mb-4">
          {category.description}
        </p>
      </div>

      {/* Stats and Arrow */}
      <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-900 block">
            {category.openJobs?.toLocaleString() || '1,200+'} Jobs
          </span>
          <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
            Avg: {category.avgSalary || 'Competitive'}
          </span>
        </div>

        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors shrink-0">
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
