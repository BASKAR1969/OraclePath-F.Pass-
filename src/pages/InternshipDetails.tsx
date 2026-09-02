import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { internshipService } from '../services';
import {
  MapPin, Clock, DollarSign, Users, Check, ArrowLeft, ChevronRight, AlertCircle, CheckCircle,
  Globe, Building2, Briefcase, Star, Send, Loader2, FileText, Calendar, Award, BarChart3
} from 'lucide-react';

export default function InternshipDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internship, setInternship] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showNotif, setShowNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [applicationData, setApplicationData] = useState({ coverLetter: '', portfolio: '' });
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      const res = await internshipService.getInternshipById(id);
      if (res.data) setInternship(res.data as unknown as Record<string, unknown>);
      if (user) {
        const apps = await internshipService.getUserApplications(user.id);
        if (apps.data?.some((a: any) => a.internship_id === id)) {
          setApplied(true);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  useEffect(() => {
    if (showNotif) { const t = setTimeout(() => setShowNotif(null), 3000); return () => clearTimeout(t); }
  }, [showNotif]);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    if (!internship) return;
    if (!showApplicationForm) { setShowApplicationForm(true); return; }
    if (!applicationData.coverLetter.trim()) { setShowNotif({ type: 'error', message: 'Please write a cover letter.' }); return; }

    setApplying(true);
    const newApp = {
      id: crypto.randomUUID(),
      user_id: user.id,
      internship_id: internship.id as string,
      status: 'submitted',
      applied_at: new Date().toISOString(),
      cover_letter: applicationData.coverLetter,
      portfolio_url: applicationData.portfolio || null,
      resume_url: 'https://example.com/resume.pdf',
      notes: '',
    };
    const result = await internshipService.createApplication(newApp as any);
    if (result.error) {
      setShowNotif({ type: 'error', message: result.error.message || 'Failed to submit application. Try again.' });
    } else {
      setApplied(true);
      setShowApplicationForm(false);
      setShowNotif({ type: 'success', message: 'Application submitted successfully! We will review it soon.' });
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20">
        <div className="w-8 h-8 border-2 border-oracle-red/30 border-t-oracle-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-oracle-red mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Internship Not Found</h1>
          <p className="text-dark-muted mb-6">This internship may have been closed or removed.</p>
          <Link to="/internships" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Browse Internships
          </Link>
        </div>
      </div>
    );
  }

  const typeIcon = internship.type === 'Remote' ? Globe : internship.type === 'Hybrid' ? Briefcase : Building2;
  const TypeIcon = typeIcon;
  const requirements = (internship.requirements as string[]) || [];
  const skills = (internship.skills as string[]) || [];

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-16">
      {showNotif && (
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg ${
            showNotif.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {showNotif.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {showNotif.message}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-dark-muted mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/internships" className="hover:text-white transition-colors">Internships</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{(internship.title as string)}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-oracle-red/10 flex items-center justify-center border border-oracle-red/20">
                  <span className="text-xl font-bold text-oracle-red">{(internship.company as string)?.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{(internship.title as string)}</h1>
                  <p className="text-oracle-red font-medium">{(internship.company as string)}</p>
                </div>
              </div>

              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-muted mb-6">
                <span className="flex items-center gap-1"><TypeIcon className="w-4 h-4" />{(internship.type as string)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{(internship.location as string)}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{(internship.duration as string)}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-500" />{(internship.stipend as string)}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(internship.openings as number)} openings</span>
              </div>

              {/* Description */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-oracle-red" /> About the Role
                </h2>
                <p className="text-dark-muted leading-relaxed">{(internship.description as string)}</p>
              </div>

              {/* Requirements */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-oracle-red" /> Requirements
                </h2>
                <div className="space-y-3">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-dark-muted text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-oracle-red" /> Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-sm text-dark-muted">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Application form */}
              {showApplicationForm && !applied && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-oracle-red" /> Submit Application
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white mb-2">Cover Letter</label>
                      <textarea
                        value={applicationData.coverLetter}
                        onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                        rows={5}
                        placeholder="Explain why you're a great fit for this role..."
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white mb-2">Portfolio URL (optional)</label>
                      <input
                        type="url"
                        value={applicationData.portfolio}
                        onChange={(e) => setApplicationData({ ...applicationData, portfolio: e.target.value })}
                        placeholder="https://github.com/yourname or portfolio site"
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-oracle-red" />
                  <div>
                    <p className="text-white font-medium text-sm">Application Deadline</p>
                    <p className="text-oracle-red font-semibold">{(internship.deadline as string)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-white font-medium text-sm">Monthly Stipend</p>
                    <p className="text-green-400 font-semibold">{(internship.stipend as string)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Open Positions</p>
                    <p className="text-blue-400 font-semibold">{(internship.openings as number)} available</p>
                  </div>
                </div>

                {applied ? (
                  <div className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-semibold">
                    <CheckCircle className="w-5 h-5" /> Application Submitted
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors disabled:opacity-50"
                  >
                    {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {applying ? 'Submitting...' : (showApplicationForm ? 'Submit Application' : 'Apply Now')}
                  </button>
                )}

                <p className="text-dark-muted text-xs text-center mt-3">
                  {applied ? 'Track your application in your student dashboard.' : 'Free to apply. No payment required.'}
                </p>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-oracle-red" /> Eligibility
                </h3>
                <div className="space-y-2 text-sm text-dark-muted">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> Active OraclePath student
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> 80%+ course completion recommended
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> Portfolio or GitHub profile preferred
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> Available for stated duration
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
