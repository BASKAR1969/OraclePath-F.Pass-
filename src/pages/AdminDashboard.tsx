import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentService, courseService, internshipService, certificateService, orderService, enrollmentService } from '../services';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  LayoutDashboard, Users, BookOpen, Briefcase, Award, BarChart3, Search, Plus, Edit2, Trash2, X,
  Check, AlertCircle, Eye, TrendingUp, DollarSign, GraduationCap, Clock, Activity, Filter,
  ChevronDown, ChevronRight, Lock, Shield, ArrowUpRight, ArrowDownRight, UserCog,
  CreditCard, FileText, CheckCircle, XCircle, Building2, Settings, Crown, Ban
} from 'lucide-react';

function now() { return new Date().toISOString(); }

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { profile, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [courseModal, setCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [internshipModal, setInternshipModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState<any>(null);
  const [certificateModal, setCertificateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; title: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [searchStudents, setSearchStudents] = useState('');
  const [searchCourses, setSearchCourses] = useState('');
  const [searchInternships, setSearchInternships] = useState('');
  const [searchApplications, setSearchApplications] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [sRes, cRes, iRes, eRes, certRes, appRes, oRes] = await Promise.all([
      studentService.getAllProfiles(),
      courseService.getAllCourses(),
      internshipService.getAllInternships(),
      enrollmentService.getAllEnrollments(),
      certificateService.getAllCertificates(),
      internshipService.getAllApplications(),
      orderService.getAllOrders(),
    ]);
    setAllProfiles((sRes.data || []) as unknown as Record<string, unknown>[]);
    setCourses((cRes.data || []) as unknown as Record<string, unknown>[]);
    setInternships((iRes.data || []) as unknown as Record<string, unknown>[]);
    setEnrollments((eRes.data || []) as unknown as Record<string, unknown>[]);
    setCertificates((certRes.data || []) as unknown as Record<string, unknown>[]);
    setApplications((appRes.data || []) as unknown as Record<string, unknown>[]);
    setOrders((oRes.data || []) as unknown as Record<string, unknown>[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalRevenue = useMemo(() => analytics.reduce((sum: number, a: any) => sum + (a.amount || 0), 0), [analytics]);
  const completionRate = useMemo(() => {
    if (enrollments.length === 0) return 0;
    return Math.round((enrollments.filter((e: any) => e.status === 'completed').length / enrollments.length) * 100);
  }, [enrollments]);

  const students = allProfiles.filter((p: any) => p.role === 'student');
  const instructors = allProfiles.filter((p: any) => p.role === 'instructor');
  const admins = allProfiles.filter((p: any) => p.role === 'admin' || p.role === 'super_admin');

  const saveCourse = async (data: any) => {
    if (editingCourse) {
      const result = await courseService.updateCourse(editingCourse.id as string, data);
      if (result.error) showNotif('error', result.error.message || 'Failed to update');
      else { showNotif('success', 'Course updated'); setCourseModal(false); setEditingCourse(null); fetchAll(); }
    } else {
      const result = await courseService.createCourse(data);
      if (result.error) showNotif('error', result.error.message || 'Failed to create');
      else { showNotif('success', 'Course created'); setCourseModal(false); fetchAll(); }
    }
  };
  const deleteCourse = async (id: string) => { await courseService.deleteCourse(id); setDeleteConfirm(null); showNotif('success', 'Deleted'); fetchAll(); };

  const saveInternship = async (data: any) => {
    if (editingInternship) {
      const result = await internshipService.updateInternship(editingInternship.id as string, data);
      if (result.error) showNotif('error', result.error.message || 'Failed to update');
      else { showNotif('success', 'Updated'); setInternshipModal(false); setEditingInternship(null); fetchAll(); }
    } else {
      const result = await internshipService.createInternship(data);
      if (result.error) showNotif('error', result.error.message || 'Failed to create');
      else { showNotif('success', 'Created'); setInternshipModal(false); fetchAll(); }
    }
  };
  const deleteInternship = async (id: string) => { await internshipService.deleteInternship(id); setDeleteConfirm(null); showNotif('success', 'Deleted'); fetchAll(); };

  const issueCertificate = async (userId: string, courseId: string) => {
    const certNum = certificateService.generateCertificateNumber();
    const result = await certificateService.createCertificate(userId, courseId, certNum);
    if (result.error) showNotif('error', result.error.message || 'Failed to issue');
    else { showNotif('success', 'Certificate issued'); setCertificateModal(false); fetchAll(); }
  };

  const updateApplicationStatus = async (appId: string, status: string) => {
    const result = await internshipService.updateApplicationStatus(appId, status);
    if (result.error) showNotif('error', result.error.message || 'Failed to update');
    else { showNotif('success', `Application ${status.replace('_', ' ')}`); fetchAll(); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'instructors', label: 'Instructors', icon: UserCog },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'orders', label: 'Orders', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const filteredStudents = students.filter((s: any) => s.full_name?.toLowerCase().includes(searchStudents.toLowerCase()) || s.email.toLowerCase().includes(searchStudents.toLowerCase()));
  const filteredCourses = courses.filter((c: any) => {
    const ms = c.title?.toLowerCase().includes(searchCourses.toLowerCase());
    const mf = courseFilter === 'all' || (courseFilter === 'published' && c.status === 'published') || (courseFilter === 'featured' && c.featured);
    return ms && mf;
  });
  const filteredInternships = internships.filter((i: any) => i.title?.toLowerCase().includes(searchInternships.toLowerCase()) || i.company?.toLowerCase().includes(searchInternships.toLowerCase()));
  const filteredApplications = applications.filter((a: any) => {
    const student = students.find((s: any) => s.id === a.user_id);
    const intern = internships.find((i: any) => i.id === a.internship_id);
    const searchMatch = (student?.full_name?.toLowerCase() || '').includes(searchApplications.toLowerCase()) ||
      (intern?.title?.toLowerCase() || '').includes(searchApplications.toLowerCase());
    const statusMatch = appFilter === 'all' || a.status === appFilter;
    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20">
        <div className="w-8 h-8 border-2 border-oracle-red/30 border-t-oracle-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-16">
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center border border-oracle-red/20">
              <Shield className="w-5 h-5 text-oracle-red" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-dark-muted text-sm">Manage OraclePath platform — an Ervion Technologies company</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {isSuperAdmin ? (
              <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3" /> Super Admin Access
              </span>
            ) : (
              <span className="px-2 py-1 rounded-md bg-oracle-red/10 text-oracle-red text-xs font-bold uppercase tracking-wider">Admin Access</span>
            )}
            <span className="text-dark-muted text-xs">Logged in as {profile?.email}</span>
          </div>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-oracle-red/15 text-oracle-red border border-oracle-red/20' : 'text-dark-muted hover:text-white hover:bg-dark-card border border-transparent'
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
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-400', change: 24, up: true },
                  { label: 'Instructors', value: instructors.length, icon: UserCog, color: 'text-orange-400', change: 12, up: true },
                  { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-400', change: 18, up: true },
                  { label: 'Completion Rate', value: `${completionRate}%`, icon: Activity, color: 'text-purple-400', change: 5, up: completionRate > 50 },
                ].map((stat) => (
                  <div key={stat.label} className="bg-dark-card border border-dark-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {stat.change}%
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-dark-muted text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Recent Enrollments</h3>
                  <div className="space-y-3">
                    {enrollments.slice(0, 6).map((e: any) => {
                      const student = students.find((s: any) => s.id === e.user_id);
                      const course = courses.find((c: any) => c.id === e.course_id);
                      return (
                        <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50">
                          <div className="w-8 h-8 rounded-full bg-oracle-red/10 flex items-center justify-center text-sm font-bold text-oracle-red flex-shrink-0">{student?.full_name?.charAt(0) || '?'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{student?.full_name || 'Unknown'}</p>
                            <p className="text-dark-muted text-xs truncate">enrolled in {course?.title || 'Course'}</p>
                          </div>
                          <span className="text-xs text-dark-muted flex-shrink-0">{new Date(e.enrolled_at).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                    {enrollments.length === 0 && <p className="text-dark-muted py-4">No enrollments yet</p>}
                  </div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Pending Applications</h3>
                  <div className="space-y-3">
                    {applications.filter((a: any) => a.status === 'submitted' || a.status === 'reviewing').slice(0, 6).map((app: any) => {
                      const student = students.find((s: any) => s.id === app.user_id);
                      const intern = internships.find((i: any) => i.id === app.internship_id);
                      return (
                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50">
                          <div className="w-8 h-8 rounded-full bg-oracle-red/10 flex items-center justify-center text-sm font-bold text-oracle-red flex-shrink-0">{student?.full_name?.charAt(0) || '?'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{student?.full_name || 'Unknown'}</p>
                            <p className="text-dark-muted text-xs truncate">applied for {intern?.title || 'Internship'}</p>
                          </div>
                          <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">{app.status}</span>
                        </div>
                      );
                    })}
                    {applications.filter((a: any) => a.status === 'submitted' || a.status === 'reviewing').length === 0 && <p className="text-dark-muted py-4">No pending applications</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STUDENTS */}
          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-white font-semibold">All Students ({students.length})</h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                    <input type="text" placeholder="Search students..." value={searchStudents} onChange={(e) => setSearchStudents(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm placeholder-dark-muted focus:outline-none focus:border-oracle-red/50"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Student</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Email</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Enrollments</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Progress</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Joined</th>
                    </tr></thead>
                    <tbody>
                      {filteredStudents.map((s: any) => {
                        const sEnrollments = enrollments.filter((e: any) => e.user_id === s.id);
                        const avgProgress = sEnrollments.length > 0 ? Math.round(sEnrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / sEnrollments.length) : 0;
                        return (
                          <tr key={s.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-oracle-red/10 flex items-center justify-center text-sm font-bold text-oracle-red">{s.full_name?.charAt(0) || '?'}</div>
                                <span className="text-white">{s.full_name || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-dark-muted">{s.email}</td>
                            <td className="py-3 px-3"><span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">{sEnrollments.length} courses</span></td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-dark-border rounded-full overflow-hidden">
                                  <div className="h-full bg-oracle-red rounded-full" style={{ width: `${avgProgress}%` }} />
                                </div>
                                <span className="text-xs text-dark-muted">{avgProgress}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-dark-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* INSTRUCTORS */}
          {activeTab === 'instructors' && (
            <motion.div key="instructors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">Instructors ({instructors.length})</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {instructors.map((inst: any) => {
                    const taughtCourses = courses.filter((c: any) => c.instructor_id === inst.id || c.instructor === inst.full_name);
                    return (
                      <div key={inst.id} className="border border-dark-border rounded-xl p-5 hover:border-oracle-red/30 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-oracle-red/10 flex items-center justify-center text-lg font-bold text-oracle-red">{inst.full_name?.charAt(0)}</div>
                          <div>
                            <p className="text-white font-semibold">{inst.full_name}</p>
                            <p className="text-dark-muted text-xs">{inst.email}</p>
                          </div>
                        </div>
                        <p className="text-oracle-red text-sm mb-3">{inst.title || 'Instructor'}</p>
                        <div className="flex items-center gap-2 text-sm text-dark-muted">
                          <BookOpen className="w-4 h-4" /> {taughtCourses.length} courses
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* COURSES */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-white font-semibold">Manage Courses</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                      <input type="text" placeholder="Search courses..." value={searchCourses} onChange={(e) => setSearchCourses(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm placeholder-dark-muted focus:outline-none focus:border-oracle-red/50"
                      />
                    </div>
                    <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none">
                      <option value="all">All</option><option value="published">Published</option><option value="featured">Featured</option>
                    </select>
                    <button onClick={() => { setEditingCourse(null); setCourseModal(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Course</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Level</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Price</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Students</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Status</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredCourses.map((c: any) => (
                        <tr key={c.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                          <td className="py-3 px-3">
                            <div><p className="text-white font-medium">{c.title}</p><p className="text-dark-muted text-xs">{c.subtitle}</p></div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.level === 'Beginner' ? 'bg-green-500/10 text-green-400' : c.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{c.level}</span>
                          </td>
                          <td className="py-3 px-3 text-white">${c.price}</td>
                          <td className="py-3 px-3 text-dark-muted">{c.students}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'published' ? 'bg-green-500/10 text-green-400' : c.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400'}`}>{c.status}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingCourse(c); setCourseModal(true); }} className="p-1.5 rounded-md hover:bg-dark-border text-dark-muted hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'course', id: c.id, title: c.title })} className="p-1.5 rounded-md hover:bg-red-500/10 text-dark-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* INTERNSHIPS */}
          {activeTab === 'internships' && (
            <motion.div key="internships" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-white font-semibold">Manage Internships</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                      <input type="text" placeholder="Search internships..." value={searchInternships} onChange={(e) => setSearchInternships(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm placeholder-dark-muted focus:outline-none focus:border-oracle-red/50"
                      />
                    </div>
                    <button onClick={() => { setEditingInternship(null); setInternshipModal(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Position</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Company</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Type</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Stipend</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Openings</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredInternships.map((i: any) => (
                        <tr key={i.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                          <td className="py-3 px-3"><p className="text-white font-medium">{i.title}</p></td>
                          <td className="py-3 px-3 text-dark-muted">{i.company}</td>
                          <td className="py-3 px-3"><span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">{i.type}</span></td>
                          <td className="py-3 px-3 text-white">{i.stipend}</td>
                          <td className="py-3 px-3 text-dark-muted">{i.openings}</td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingInternship(i); setInternshipModal(true); }} className="p-1.5 rounded-md hover:bg-dark-border text-dark-muted hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'internship', id: i.id, title: i.title })} className="p-1.5 rounded-md hover:bg-red-500/10 text-dark-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* APPLICATIONS */}
          {activeTab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-white font-semibold">Internship Applications ({applications.length})</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                      <input type="text" placeholder="Search by student or position..." value={searchApplications} onChange={(e) => setSearchApplications(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm placeholder-dark-muted focus:outline-none focus:border-oracle-red/50"
                      />
                    </div>
                    <select value={appFilter} onChange={(e) => setAppFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none">
                      <option value="all">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interview_scheduled">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Student</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Position</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Company</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Applied</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Status</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredApplications.map((app: any) => {
                        const student = students.find((s: any) => s.id === app.user_id);
                        const intern = internships.find((i: any) => i.id === app.internship_id);
                        const statusColors: Record<string, string> = {
                          submitted: 'bg-blue-500/10 text-blue-400', reviewing: 'bg-yellow-500/10 text-yellow-400',
                          interview_scheduled: 'bg-purple-500/10 text-purple-400', accepted: 'bg-green-500/10 text-green-400',
                          rejected: 'bg-red-500/10 text-red-400',
                        };
                        return (
                          <tr key={app.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-oracle-red/10 flex items-center justify-center text-sm font-bold text-oracle-red">{student?.full_name?.charAt(0) || '?'}</div>
                                <span className="text-white">{student?.full_name || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-white">{intern?.title || 'Unknown'}</td>
                            <td className="py-3 px-3 text-dark-muted">{intern?.company || ''}</td>
                            <td className="py-3 px-3 text-dark-muted">{new Date(app.applied_at).toLocaleDateString()}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[app.status] || 'bg-dark-surface text-dark-muted'}`}>
                                {app.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-1">
                                {app.status !== 'accepted' && <button onClick={() => updateApplicationStatus(app.id, 'accepted')} className="p-1.5 rounded-md hover:bg-green-500/10 text-dark-muted hover:text-green-400 transition-colors" title="Accept"><CheckCircle className="w-4 h-4" /></button>}
                                {app.status !== 'rejected' && <button onClick={() => updateApplicationStatus(app.id, 'rejected')} className="p-1.5 rounded-md hover:bg-red-500/10 text-dark-muted hover:text-red-400 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>}
                                {app.status !== 'interview_scheduled' && <button onClick={() => updateApplicationStatus(app.id, 'interview_scheduled')} className="p-1.5 rounded-md hover:bg-purple-500/10 text-dark-muted hover:text-purple-400 transition-colors" title="Schedule Interview"><Clock className="w-4 h-4" /></button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* CERTIFICATES */}
          {activeTab === 'certificates' && (
            <motion.div key="certificates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-white font-semibold">Certificate Management</h3>
                  <button onClick={() => setCertificateModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">
                    <Plus className="w-4 h-4" /> Issue Certificate
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Certificate #</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Student</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Course</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Issued</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {certificates.map((cert: any) => {
                        const student = students.find((s: any) => s.id === cert.user_id);
                        const course = courses.find((c: any) => c.id === cert.course_id);
                        return (
                          <tr key={cert.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                            <td className="py-3 px-3 font-mono text-oracle-red">{cert.certificate_number}</td>
                            <td className="py-3 px-3 text-white">{student?.full_name || 'Unknown'}</td>
                            <td className="py-3 px-3 text-dark-muted">{course?.title || 'Unknown'}</td>
                            <td className="py-3 px-3 text-dark-muted">{new Date(cert.issued_at).toLocaleDateString()}</td>
                            <td className="py-3 px-3"><span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">{cert.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6">Orders & Payments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-dark-border">
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Order #</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Student</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Items</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Total</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Payment</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Status</th>
                      <th className="text-left py-3 px-3 text-dark-muted font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {orders.map((order: any) => {
                        const student = students.find((s: any) => s.id === order.user_id);
                        const orderItems = order.items || [];
                        return (
                          <tr key={order.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                            <td className="py-3 px-3 font-mono text-oracle-red">{order.order_number}</td>
                            <td className="py-3 px-3 text-white">{student?.full_name || 'Unknown'}</td>
                            <td className="py-3 px-3 text-dark-muted">{orderItems.length} course{orderItems.length !== 1 ? 's' : ''}</td>
                            <td className="py-3 px-3 text-white font-medium">${order.total?.toLocaleString()}</td>
                            <td className="py-3 px-3 text-dark-muted">{order.payment_method}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{order.status}</span>
                            </td>
                            <td className="py-3 px-3 text-dark-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Enrollment by Course</h3>
                  <div className="space-y-4">
                    {courses.map((c: any) => {
                      const count = enrollments.filter((e: any) => e.course_id === c.id).length;
                      const max = Math.max(...courses.map((cc: any) => enrollments.filter((e: any) => e.course_id === cc.id).length), 1);
                      return (
                        <div key={c.id}>
                          <div className="flex justify-between text-sm mb-1"><span className="text-white truncate">{c.title}</span><span className="text-dark-muted">{count} students</span></div>
                          <div className="h-2 bg-dark-border rounded-full overflow-hidden"><div className="h-full bg-oracle-red rounded-full" style={{ width: `${(count / max) * 100}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Student Progress Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { label: '0-25% (Just Started)', range: [0, 25] as [number, number], color: 'bg-red-500' },
                      { label: '26-50% (In Progress)', range: [26, 50] as [number, number], color: 'bg-yellow-500' },
                      { label: '51-75% (Advanced)', range: [51, 75] as [number, number], color: 'bg-blue-500' },
                      { label: '76-100% (Near Complete)', range: [76, 100] as [number, number], color: 'bg-green-500' },
                    ].map((range) => {
                      const [min, max] = range.range;
                      const count = enrollments.filter((e: any) => e.progress >= min && e.progress <= max).length;
                      const total = enrollments.length || 1;
                      return (
                        <div key={range.label}>
                          <div className="flex justify-between text-sm mb-1"><span className="text-white">{range.label}</span><span className="text-dark-muted">{count} students</span></div>
                          <div className="h-2 bg-dark-border rounded-full overflow-hidden"><div className={`h-full ${range.color} rounded-full`} style={{ width: `${(count / total) * 100}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Monthly Revenue</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ month: 'Jan', revenue: 2450 }, { month: 'Feb', revenue: 3200 }, { month: 'Mar', revenue: 4100 }, { month: 'Apr', revenue: 3800 }, { month: 'May', revenue: 5200 }, { month: 'Jun', revenue: 6100 }].map((m) => (
                      <div key={m.month} className="bg-dark-surface/50 rounded-lg p-3 text-center">
                        <div className="text-white font-semibold">${m.revenue.toLocaleString()}</div>
                        <div className="text-dark-muted text-xs mt-1">{m.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Top Performing Students</h3>
                  <div className="space-y-3">
                    {students.slice(0, 5).map((s: any, i: number) => {
                      const sProgress = progressRecords.filter((p: any) => p.user_id === s.id);
                      const avgScore = sProgress.length > 0 ? Math.round(sProgress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / sProgress.length) : 0;
                      return (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50">
                          <div className="w-8 h-8 rounded-full bg-oracle-red/10 flex items-center justify-center text-sm font-bold text-oracle-red">{i + 1}</div>
                          <div className="flex-1"><p className="text-white text-sm">{s.full_name}</p><p className="text-dark-muted text-xs">{s.email}</p></div>
                          <div className="text-right"><p className="text-white font-medium text-sm">{avgScore}%</p><p className="text-dark-muted text-xs">avg score</p></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALS */}
      {courseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={() => { setCourseModal(false); setEditingCourse(null); }} className="p-1.5 rounded-md hover:bg-dark-border text-dark-muted hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <CourseForm initial={editingCourse} onSubmit={saveCourse} onCancel={() => { setCourseModal(false); setEditingCourse(null); }} instructors={instructors} />
          </motion.div>
        </div>
      )}

      {internshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">{editingInternship ? 'Edit Internship' : 'Add Internship'}</h3>
              <button onClick={() => { setInternshipModal(false); setEditingInternship(null); }} className="p-1.5 rounded-md hover:bg-dark-border text-dark-muted hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <InternshipForm initial={editingInternship} onSubmit={saveInternship} onCancel={() => { setInternshipModal(false); setEditingInternship(null); }} />
          </motion.div>
        </div>
      )}

      {certificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">Issue Certificate</h3>
              <button onClick={() => setCertificateModal(false)} className="p-1.5 rounded-md hover:bg-dark-border text-dark-muted hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <CertificateIssueForm students={students} courses={courses} onSubmit={issueCertificate} onCancel={() => setCertificateModal(false)} />
          </motion.div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-white font-semibold text-center mb-2">Confirm Delete</h3>
            <p className="text-dark-muted text-center text-sm mb-6">Are you sure you want to delete &quot;{deleteConfirm.title}&quot;? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-dark-border text-white text-sm font-medium hover:bg-dark-border transition-colors">Cancel</button>
              <button onClick={() => { if (deleteConfirm.type === 'course') deleteCourse(deleteConfirm.id); else deleteInternship(deleteConfirm.id); }} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CourseForm({ initial, onSubmit, onCancel, instructors }: { initial: any; onSubmit: (d: any) => void; onCancel: () => void; instructors: any[] }) {
  const [data, setData] = useState({
    title: initial?.title || '', subtitle: initial?.subtitle || '', description: initial?.description || '',
    level: initial?.level || 'Beginner', duration: initial?.duration || '', lessons: initial?.lessons || 0,
    price: initial?.price || 0, original_price: initial?.original_price || 0, instructor: initial?.instructor || '',
    instructor_id: initial?.instructor_id || '', status: initial?.status || 'draft', featured: initial?.featured || false,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Title</label><input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Subtitle</label><input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
      </div>
      <div><label className="block text-sm text-white mb-1">Description</label><textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50 resize-none" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Level</label><select value={data.level} onChange={(e) => setData({ ...data, level: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
        <div><label className="block text-sm text-white mb-1">Duration</label><input value={data.duration} onChange={(e) => setData({ ...data, duration: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Price ($)</label><input type="number" value={data.price} onChange={(e) => setData({ ...data, price: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Original Price ($)</label><input type="number" value={data.original_price} onChange={(e) => setData({ ...data, original_price: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Instructor</label><input value={data.instructor} onChange={(e) => setData({ ...data, instructor: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Status</label><select value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={data.featured} onChange={(e) => setData({ ...data, featured: e.target.checked })} className="w-4 h-4 rounded border-dark-border bg-dark-surface text-oracle-red" />
        <label className="text-sm text-white">Featured Course</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-dark-border text-white text-sm font-medium hover:bg-dark-border transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">{initial ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}

function InternshipForm({ initial, onSubmit, onCancel }: { initial: any; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [data, setData] = useState({
    title: initial?.title || '', company: initial?.company || '', location: initial?.location || '',
    type: initial?.type || 'Remote', duration: initial?.duration || '', stipend: initial?.stipend || '',
    description: initial?.description || '', openings: initial?.openings || 1, deadline: initial?.deadline || '',
    status: initial?.status || 'open', featured: initial?.featured || false,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Title</label><input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Company</label><input value={data.company} onChange={(e) => setData({ ...data, company: e.target.value })} required className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Location</label><input value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Type</label><select value={data.type} onChange={(e) => setData({ ...data, type: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none"><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Duration</label><input value={data.duration} onChange={(e) => setData({ ...data, duration: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Stipend</label><input value={data.stipend} onChange={(e) => setData({ ...data, stipend: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-white mb-1">Openings</label><input type="number" value={data.openings} onChange={(e) => setData({ ...data, openings: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
        <div><label className="block text-sm text-white mb-1">Deadline</label><input type="date" value={data.deadline} onChange={(e) => setData({ ...data, deadline: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50" /></div>
      </div>
      <div><label className="block text-sm text-white mb-1">Description</label><textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-oracle-red/50 resize-none" /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={data.featured} onChange={(e) => setData({ ...data, featured: e.target.checked })} className="w-4 h-4 rounded border-dark-border bg-dark-surface text-oracle-red" />
        <label className="text-sm text-white">Featured</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-dark-border text-white text-sm font-medium hover:bg-dark-border transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">{initial ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}

function CertificateIssueForm({ students, courses, onSubmit, onCancel }: { students: any[]; courses: any[]; onSubmit: (uid: string, cid: string) => void; onCancel: () => void }) {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(studentId, courseId); }} className="space-y-4">
      <div>
        <label className="block text-sm text-white mb-1">Student</label>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none">
          <option value="">Select student...</option>
          {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-white mb-1">Course</label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm focus:outline-none">
          <option value="">Select course...</option>
          {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-dark-border text-white text-sm font-medium hover:bg-dark-border transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors">Issue Certificate</button>
      </div>
    </form>
  );
}
