import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'candidate',
    subject: 'General Inquiry',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you! Your message has been received. Our team will respond within 4 business hours.", {
        duration: 5000,
        style: { background: '#0F172A', color: '#FFFFFF', borderRadius: '12px' }
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'candidate',
        subject: 'General Inquiry',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-3">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Candidate & Recruiter Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            We're Here to Help You Succeed
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-3 font-normal">
            Have questions about a job listing, employer verification, or enterprise talent hiring? Reach out to our dedicated support teams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
            <h2 className="text-xl font-black text-slate-950 mb-2">
              Send us a Direct Message
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill in your inquiry details below and our team will get back to you promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* User Type Radio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'candidate' })}
                    className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${
                      formData.userType === 'candidate'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Job Seeker / Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'employer' })}
                    className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all ${
                      formData.userType === 'employer'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Employer / Recruiter
                  </button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Phone & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Inquiry Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-semibold"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Job Application Issue">Job Application Issue</option>
                    <option value="Employer Verification">Employer Verification</option>
                    <option value="Enterprise Hiring Partnership">Enterprise Hiring Partnership</option>
                    <option value="Report Fraudulent Job">Report Fraudulent Job</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Sending Message..." : "Send Message"}</span>
                <Send className="w-4 h-4" />
              </button>

            </form>
          </div>

          {/* Right Column: Office Info & Channels */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-950">
                Direct Contact Channels
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Helpline & WhatsApp</span>
                    <a href="tel:+917500055715" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      +91 75000 55715
                    </a>
                    <span className="text-[11px] text-slate-500 block">Mon - Sat: 9:00 AM - 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Official Email</span>
                    <a href="mailto:info@jobsetu.net" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      info@jobsetu.net
                    </a>
                    <span className="text-[11px] text-slate-500 block">Candidate & Employer inquiries</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Enterprise Hiring Desk</span>
                    <a href="mailto:info@jobsetu.net" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      info@jobsetu.net
                    </a>
                    <span className="text-[11px] text-slate-500 block">For corporate talent acquisition</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-950 mb-4">
                Head Office & Location
              </h3>

              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5 text-sm">Balaji Placements:</span>
                    <span className="text-slate-700 leading-relaxed block text-xs">
                      Near, Anand Nursing Home, Chandpuri Nagar, Chow Mandi, Roorkee 247667
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
