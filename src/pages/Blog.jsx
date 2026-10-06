import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Clock, 
  User, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react';
import { blogsData } from '../data/blogsData';

const Blog = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Resume & Career Tips', 'Salary & Compensation', 'Interview Preparation'];

  const filteredBlogs = blogsData.filter(blog => {
    const matchSearch = blog.title.toLowerCase().includes(search.toLowerCase()) ||
                        blog.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Career Resources & Playbooks</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Level Up Your Career & Compensation
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-3 font-normal">
            Expert advice on ATS resume building, technical interview preparation, salary negotiation in India, and hiring trends.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search career articles and playbooks..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredBlogs.map((blog) => (
            <article 
              key={blog.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-600/5 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {blog.category}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
                    <span>{blog.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {blog.readTime}
                    </span>
                  </div>

                  <Link to={`/blogs/${blog.slug}`}>
                    <h2 className="text-lg font-bold text-slate-950 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {blog.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6 font-normal">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    By {blog.author.split(',')[0]}
                  </span>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Blog;