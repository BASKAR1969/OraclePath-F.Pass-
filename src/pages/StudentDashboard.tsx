import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentService, certificateService, orderService, internshipService, authService, courseService } from '../services';
import {
  BookOpen, Award, Clock, TrendingUp, Calendar, Settings, ChevronRight, Play, Star,
  CheckCircle, AlertCircle, User, Bell, Shield, BarChart3, Target, GraduationCap,
  LogOut, Eye, Lock, Briefcase, CreditCard, FileText, Download, Bookmark,
  Globe, DollarSign, ArrowRight, Newspaper, X, Check, Loader2
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function StudentDashboard() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [courses, setCourses] = useState<Record<string, any>>({});
  const [internships, setInternships] = useState<Record<string, any>>({});
  const [internshipApplications, setInternshipApplications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ new: '', confirm: '' });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [enrollRes, certRes, internAppRes, orderRes] = await Promise.all([
      enrollmentService.getUserEnrollments(user.id),
      certificateService.getUserCertificates(user.id),
      internshipService.getUserApplications(user.id),
      orderService.getUserOrders(user.id),
    ]);

    const enrollments = (enrollRes.data || []) as unknown as Record<string, unknown>[];
    const certificates = (certRes.data || []) as unknown as Record<string, unknown>[];
    const applications = (internAppRes.data || []) as unknown as Record<string, unknown>[];
    const orders = (orderRes.data || []) as unknown as Record<string, unknown>[];

    const courseIds = [...new Set([
      ...enrollments.map((e: Record<string, unknown>) => e.course_id as string),
      ...certificates.map((c: Record<string, unknown>) => c.course_id as string),
    ])];

    const courseMap: Record<string, any> = {};
    await Promise.all(courseIds.map(async (cid) => {
      const res = await courseService.getCourseById(cid);
      if (res.data) courseMap[cid] = res.data;
    }));

    const internIds = [...new Set(applications.map((a: Record<string, unknown>) => a.internship_id as string))];
    const internMap: Record<string, any> = {};
    await Promise.all(internIds.map(async (iid) => {
      const res = await internshipService.getInternshipById(iid);
      if (res.data) internMap[iid] = res.data;
    }));

    setEnrollments(enrollments);
    setCertificates(certificates);
    setInternshipApplications(applications);
    setOrders(orders);
    setCourses(courseMap);
    setInternships(internMap);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (profile) setProfileData({ full_name: profile.full_name || '', phone: profile.phone || '' }); }, [profile]);

  const totalProgress = enrollments.length > 0 ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length) : 0;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;
  const avgScore = progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length) : 0;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(''); setUpdateSuccess('');
    const { error } = await updateProfile({ full_name: profileData.full_name, phone: profileData.phone });
    if (error) setUpdateError(error);
    else { setUpdateSuccess('Profile updated successfully'); setEditProfile(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(''); setUpdateSuccess('');
    if (passwordData.new !== passwordData.confirm) { setUpdateError('Passwords do not match'); return; }
    if (passwordData.new.length < 6) { setUpdateError('Password must be at least 6 characters'); return; }
    const result = await authService.updatePassword(passwordData.new);
    if (result.error) setUpdateError(result.error.message || 'Failed to update password');
    else { setUpdateSuccess('Password updated successfully'); setPasswordData({ new: '', confirm: '' }); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'orders', label: 'Orders', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20">
        <div className="w-8 h-8 border-2 border-oracle-red/30 border-t-oracle-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-16">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg ${
              notification.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-oracle-red/10 flex items-center justify-center border border-oracle-red/20">
              <User className="w-7 h-7 text-oracle-red" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {profile?.full_name || 'Student'}!</h1>
              <p className="text-dark-muted text-sm">Continue your Oracle SQL & PL/SQL learning journey</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-oracle-red/15 text-oracle-red border border-oracle-red/20'
                    : 'text-dark-muted hover:text-white hover:bg-dark-card border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'text-blue-400' },
                  { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-green-400' },
                  { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'text-yellow-400' },
                  { label: 'Certificates', value: certificates.length, icon: Award, color: 'text-purple-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-dark-card border border-dark-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-dark-muted text-sm">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Continue Learning */}
                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Play className="w-5 h-5 text-oracle-red" /> Continue Learning
                      </h3>
                      <button onClick={() => setActiveTab('courses')} className="text-sm text-oracle-red hover:text-oracle-light transition-colors">View all</button>
                    </div>
                    {enrollments.length === 0 ? (
                      <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 text-dark-muted mx-auto mb-3" />
                        <p className="text-dark-muted">No courses enrolled yet</p>
                        <p className="text-dark-muted text-sm mt-1">Browse our courses and start learning</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {enrollments.filter((e) => e.status !== 'completed').slice(0, 3).map((enrollment) => {
                          const course = courses[enrollment.course_id];
                          return (
                            <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-lg bg-dark-surface/50 hover:bg-dark-surface transition-colors">
                              <div className="w-12 h-12 rounded-lg bg-oracle-red/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-oracle-red" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm truncate">{course?.title || 'Course'}</h4>
                                <p className="text-dark-muted text-xs mt-0.5">{enrollment.progress}% complete</p>
                                <div className="mt-2 h-1.5 bg-dark-border rounded-full overflow-hidden">
                                  <div className="h-full bg-oracle-red rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                                </div>
                              </div>
                              <Link to={`/courses/${enrollment.course_id}`} className="px-3 py-1.5 rounded-md bg-oracle-red/10 text-oracle-red text-xs font-medium hover:bg-oracle-red hover:text-white transition-all flex-shrink-0">
                                Resume
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <h3 className="text-white font-semibold flex items-center gap-2 mb-5">
                      <Clock className="w-5 h-5 text-oracle-red" /> Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {progress.slice(0, 5).map((p, i) => {
                        const course = courses[p.course_id];
                        return (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <span className="text-white">Completed lesson: </span>
                              <span className="text-oracle-red">{p.lesson_title || 'Lesson'}</span>
                              <span className="text-dark-muted"> in {course?.title || 'Course'}</span>
                            </div>
                            <span className="text-dark-muted text-xs">{new Date(p.completed_at).toLocaleDateString()}</span>
                          </div>
                        );
                      })}
                      {progress.length === 0 && <p className="text-dark-muted text-sm py-4">No recent activity. Start a course to track progress!</p>}
                    </div>
                  </div>

                  {/* Internship Applications */}
                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-oracle-red" /> Internship Applications
                      </h3>
                      <button onClick={() => setActiveTab('internships')} className="text-sm text-oracle-red hover:text-oracle-light transition-colors">View all</button>
                    </div>
                    {internshipApplications.length === 0 ? (
                      <div className="text-center py-6">
                        <Briefcase className="w-10 h-10 text-dark-muted mx-auto mb-2" />
                        <p className="text-dark-muted text-sm">No applications yet. Browse internships to apply.</p>
                        <Link to="/internships" className="mt-2 inline-block text-sm text-oracle-red hover:text-oracle-light transition-colors">Browse Internships</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {internshipApplications.slice(0, 3).map((app) => {
                          const intern = internships[app.internship_id];
                          const statusColors: Record<string, string> = {
                            submitted: 'bg-blue-500/10 text-blue-400',
                            reviewing: 'bg-yellow-500/10 text-yellow-400',
                            interview_scheduled: 'bg-purple-500/10 text-purple-400',
                            accepted: 'bg-green-500/10 text-green-400',
                            rejected: 'bg-red-500/10 text-red-400',
                          };
                          return (
                            <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50">
                              <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-5 h-5 text-oracle-red" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{intern?.title || 'Internship'}</p>
                                <p className="text-dark-muted text-xs">{intern?.company || ''}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || 'bg-dark-surface text-dark-muted'}`}>
                                {app.status.replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Your Profile</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-dark-muted" />
                        <span className="text-sm text-white">{profile?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-4 h-4 text-dark-muted" />
                        <span className="text-sm text-white">{profile?.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-dark-muted" />
                        <span className="text-sm text-white capitalize">{profile?.role}</span>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="w-full mt-4 px-4 py-2 rounded-lg bg-dark-surface text-sm text-white hover:bg-dark-border transition-colors border border-dark-border">
                      Edit Profile
                    </button>
                  </div>

                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Overall Progress</h3>
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#2a2a3a" strokeWidth="8" />
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#C74634" strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - totalProgress / 100)}`}
                          strokeLinecap="round" className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl font-bold text-white">{totalProgress}%</div>
                      </div>
                    </div>
                    <p className="text-center text-dark-muted text-sm mt-3">Across all courses</p>
                  </div>

                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Upcoming</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-oracle-red" />
                        <div>
                          <p className="text-sm text-white">Next Lesson: SQL Joins</p>
                          <p className="text-xs text-dark-muted">Today, 2:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-oracle-red" />
                        <div>
                          <p className="text-sm text-white">Quiz: Aggregate Functions</p>
                          <p className="text-xs text-dark-muted">Tomorrow, 10:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-oracle-red" /> Quick Links
                    </h3>
                    <div className="space-y-2">
                      <Link to="/resources" className="flex items-center gap-2 text-sm text-dark-muted hover:text-oracle-red transition-colors">
                        <ArrowRight className="w-4 h-4" /> Learning Resources
                      </Link>
                      <Link to="/internships" className="flex items-center gap-2 text-sm text-dark-muted hover:text-oracle-red transition-colors">
                        <ArrowRight className="w-4 h-4" /> Browse Internships
                      </Link>
                      <Link to="/pricing" className="flex items-center gap-2 text-sm text-dark-muted hover:text-oracle-red transition-colors">
                        <ArrowRight className="w-4 h-4" /> Upgrade Plan
                      </Link>
                      <Link to="/faq" className="flex items-center gap-2 text-sm text-dark-muted hover:text-oracle-red transition-colors">
                        <ArrowRight className="w-4 h-4" /> Help & FAQ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MY COURSES */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">My Enrolled Courses</h3>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No courses enrolled yet</p>
                    <p className="text-dark-muted text-sm mt-2">Explore our courses and start your Oracle journey</p>
                    <Link to="/courses" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
                      Browse Courses <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {enrollments.map((enrollment) => {
                      const course = courses[enrollment.course_id];
                      if (!course) return null;
                      const statusColor = enrollment.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400';
                      return (
                        <div key={enrollment.id} className="border border-dark-border rounded-xl p-5 hover:border-oracle-red/30 transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-white font-semibold">{course.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{enrollment.status}</span>
                          </div>
                          <p className="text-dark-muted text-sm mb-4">{course.subtitle}</p>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-dark-muted">Progress</span>
                              <span className="text-white font-medium">{enrollment.progress}%</span>
                            </div>
                            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                              <div className="h-full bg-oracle-red rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-dark-muted">Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                            <Link to={`/courses/${enrollment.course_id}`} className="flex items-center gap-1 text-oracle-red hover:text-oracle-light transition-colors font-medium">
                              {enrollment.status === 'completed' ? 'Review' : 'Continue'} <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* INTERNSHIPS */}
          {activeTab === 'internships' && (
            <motion.div key="internships" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">My Internship Applications</h3>
                {internshipApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No applications yet</p>
                    <p className="text-dark-muted text-sm mt-2">Browse internships and apply for real-world Oracle experience</p>
                    <Link to="/internships" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
                      Browse Internships <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {internshipApplications.map((app) => {
                      const intern = internships[app.internship_id];
                      const statusColors: Record<string, string> = {
                        submitted: 'bg-blue-500/10 text-blue-400',
                        reviewing: 'bg-yellow-500/10 text-yellow-400',
                        interview_scheduled: 'bg-purple-500/10 text-purple-400',
                        accepted: 'bg-green-500/10 text-green-400',
                        rejected: 'bg-red-500/10 text-red-400',
                      };
                      return (
                        <div key={app.id} className="border border-dark-border rounded-xl p-5 hover:border-oracle-red/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div>
                              <h4 className="text-white font-semibold">{intern?.title || 'Internship'}</h4>
                              <p className="text-oracle-red text-sm">{intern?.company || ''}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[app.status] || 'bg-dark-surface text-dark-muted'}`}>
                              {app.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-3 gap-2 text-sm text-dark-muted mb-3">
                            <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{intern?.type}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-500" />{intern?.stipend}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-dark-border">
                            <p className="text-dark-muted text-xs">{app.notes || 'Your application is being reviewed.'}</p>
                            <Link to={`/internships/${app.internship_id}`} className="text-sm text-oracle-red hover:text-oracle-light transition-colors">
                              View Details <ArrowRight className="w-4 h-4 inline" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PERFORMANCE */}
          {activeTab === 'performance' && (
            <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Lesson Scores</h3>
                  {progress.length === 0 ? (
                    <p className="text-dark-muted py-8">Complete lessons to see your score history</p>
                  ) : (
                    <div className="space-y-4">
                      {progress.map((p, i) => {
                        const course = courses[p.course_id];
                        return (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white">{p.lesson_title || course?.title || 'Course'}</span>
                              <span className="text-white font-medium">{p.score}%</span>
                            </div>
                            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${p.score}%`, backgroundColor: p.score >= 90 ? '#22c55e' : p.score >= 75 ? '#eab308' : '#ef4444' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Course Completion</h3>
                  {enrollments.length === 0 ? (
                    <p className="text-dark-muted py-8">Enroll in courses to track completion</p>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map((e) => {
                        const course = courses[e.course_id];
                        return (
                          <div key={e.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white">{course?.title || 'Course'}</span>
                              <span className="text-dark-muted">{e.progress}%</span>
                            </div>
                            <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                              <div className="h-full bg-oracle-red rounded-full transition-all" style={{ width: `${e.progress}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CERTIFICATES */}
          {activeTab === 'certificates' && (
            <motion.div key="certificates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">My Certificates</h3>
                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No certificates yet</p>
                    <p className="text-dark-muted text-sm mt-2">Complete courses to earn certificates</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map((cert) => {
                      const course = courses[cert.course_id];
                      return (
                        <div key={cert.id} className="border border-dark-border rounded-xl p-6 bg-gradient-to-br from-oracle-red/5 to-transparent">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-oracle-red/10 flex items-center justify-center">
                              <Award className="w-6 h-6 text-oracle-red" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{course?.title || 'Course'}</h4>
                              <p className="text-dark-muted text-sm">Certificate of Completion</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-dark-muted">Certificate #:</span>
                              <span className="text-white font-mono">{cert.certificate_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-dark-muted">Issued:</span>
                              <span className="text-white">{new Date(cert.issued_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button className="flex-1 px-4 py-2 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors flex items-center justify-center gap-2">
                              <Download className="w-4 h-4" /> Download
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-dark-border text-sm text-dark-muted hover:text-white hover:bg-dark-surface transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ORDERS & PAYMENTS */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">Order & Payment History</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No orders yet</p>
                    <p className="text-dark-muted text-sm mt-2">Purchase a course to get started</p>
                    <Link to="/pricing" className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
                      View Pricing <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const orderItems = order.items || [];
                      const totalItems = orderItems.length;
                      return (
                        <div key={order.id} className="border border-dark-border rounded-xl p-5 hover:border-oracle-red/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-oracle-red" />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{order.order_number}</p>
                                <p className="text-dark-muted text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium capitalize">{order.status}</span>
                              <span className="text-white font-semibold">${order.total?.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-dark-muted">
                            <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                            <span className="mx-2">&bull;</span>
                            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" />{order.payment_method}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-5">
                    <User className="w-5 h-5 text-oracle-red" /> Profile Settings
                  </h3>
                  {updateSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-green-400 text-sm">{updateSuccess}</p>
                    </div>
                  )}
                  {updateError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-400 text-sm">{updateError}</p>
                    </div>
                  )}
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                      <input type="text" value={profileData.full_name} onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white focus:outline-none focus:border-oracle-red/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input type="email" value={profile?.email || ''} disabled
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-dark-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-dark-muted mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Phone</label>
                      <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white focus:outline-none focus:border-oracle-red/50 transition-colors"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark transition-colors">Save Changes</button>
                  </form>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-5">
                    <Lock className="w-5 h-5 text-oracle-red" /> Security
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">New Password</label>
                      <input type="password" value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} minLength={6}
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                      <input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark transition-colors">Update Password</button>
                  </form>
                  <div className="mt-6 pt-6 border-t border-dark-border">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-oracle-red" /> Notifications
                    </h4>
                    <div className="space-y-3">
                      {['Email me when a lesson is due', 'Send weekly progress reports', 'Notify about new course releases', 'Notify about internship updates'].map((label) => (
                        <label key={label} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-border bg-dark-surface text-oracle-red focus:ring-oracle-red/50" />
                          <span className="text-sm text-dark-muted">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-dark-border">
                    <button onClick={() => signOut()} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
