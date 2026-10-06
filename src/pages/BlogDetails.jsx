import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import parse from 'html-react-parser';
import toast from 'react-hot-toast';
import { blogsData } from '../data/blogsData';

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const blog = blogsData.find(b => b.slug === slug) || blogsData[0];
  const relatedBlogs = blogsData.filter(b => b.id !== blog.id).slice(0, 2);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/blogs')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Career Articles</span>
        </button>

        {/* Main Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-12">
          
          {/* Header Meta */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3.5 py-1 rounded-full mb-4">
              {blog.category}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-800">{blog.author}</span>
                <span>•</span>
                <span>{blog.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {blog.readTime}
                </span>
              </div>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Guide</span>
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-10">
            <div className="blog-content prose max-w-none text-slate-700 leading-relaxed font-normal text-justify">
              {parse(blog.content || '')}
            </div>
          </div>

          {/* Author Bio Box */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-md shadow-blue-600/20">
              JP
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Written by {blog.author}</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Career expert and senior talent advisor helping candidates excel in modern employment markets.
              </p>
            </div>
          </div>

        </article>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div>
            <h3 className="text-xl font-black text-slate-950 mb-6">
              More Recommended Career Advice
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedBlogs.map((b) => (
                <Link
                  key={b.id}
                  to={`/blogs/${b.slug}`}
                  className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-600/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-bold text-blue-600">{b.category}</span>
                    <h4 className="text-sm font-bold text-slate-950 mt-1 mb-2 line-clamp-2">{b.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{b.excerpt}</p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogDetails;