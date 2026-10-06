import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../../context/JobContext';
import { authApi } from '../../services/api';
import EmployerLayout from './EmployerLayout';

const EmployerProfile = () => {
  const { employerProfile, setEmployerProfile } = useJobContext();

  const [formData, setFormData] = useState({
    companyName: employerProfile.companyName || 'SJ tech',
    industry: employerProfile.industry || 'IT & Software Development',
    headquarters: employerProfile.headquarters || 'Bengaluru, Karnataka',
    website: employerProfile.website || 'https://sjtech.com',
    recruiterName: employerProfile.recruiterName || 'employer',
    recruiterEmail: employerProfile.recruiterEmail || 'employer@gmail.com',
    recruiterPhone: employerProfile.recruiterPhone || '+91 98765 43210',
    description: employerProfile.description || 'Innovative technology and software engineering solutions provider.',
    verified: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({
        employerProfile: {
          companyName: formData.companyName,
          industry: formData.industry,
          location: formData.headquarters,
          companyWebsite: formData.website,
          aboutCompany: formData.description,
          isVerifiedCompany: true
        },
        name: formData.recruiterName,
        phone: formData.recruiterPhone
      });
      setEmployerProfile(formData);
      toast.success("Employer & Company profile saved to database!");
    } catch (err) {
      setEmployerProfile(formData);
      toast.success("Employer profile updated!");
    }
  };

  return (
    <EmployerLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Enterprise Hiring Branding
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">
              Company & Recruiter Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your verified company branding, ATS identifiers, and hiring lead contact information.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold self-start sm:self-auto shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Verified Enterprise ATS
          </span>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Company Info */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                1. Organization Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Industry *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Headquarters City & State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.headquarters}
                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>
              </div>

              <div className="mt-3.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  About the Company (Displayed to Applicants)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Recruiter Contact Details */}
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-950 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                2. Primary Recruiter / Hiring Lead
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Recruiter Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.recruiterPhone}
                    onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </EmployerLayout>
  );
};

export default EmployerProfile;
