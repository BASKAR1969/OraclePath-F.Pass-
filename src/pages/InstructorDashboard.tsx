import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { courseService, enrollmentService, studentService } from '../services';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  BookOpen, Users, BarChart3, FileText, Award, GraduationCap, Clock, TrendingUp,
  ChevronRight, CheckCircle, X, AlertCircle, Check, Plus, Edit2, Eye, Play, Lock
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function InstructorDashboard() {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin', 'super_admin']}>
      <InstructorDashboardContent />
    </ProtectedRoute>
  );
}

function InstructorDashboardContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('my-courses');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);

    try {
      // Fetch courses taught by this instructor
      const courseResult = await courseService.getCoursesByInstructorId(profile.id);
      const myCourses = courseResult.data || [];
      setCourses(myCourses as unknown as Record<string, unknown>[]);

      const courseIds: string[] = (myCourses as any[]).map((c: any) => String(c.id));
      if (courseIds.length > 0) {
        const lessonsResult = await courseService.getCourseLessonsByCourseIds(courseIds);
        setLessons((lessonsResult.data || []) as unknown as Record<string, unknown>[]);

        const enrollmentResult = await enrollmentService.getEnrollmentsByCourseIds(courseIds);
        setEnrollments((enrollmentResult.data || []) as unknown as Record<string, unknown>[]);

        const studentIds = [...new Set((enrollmentResult.data || []).map((e: any) => e.user_id as string))];
        if (studentIds.length > 0) {
          const studentResult = await studentService.getStudentsByIds(studentIds);
          setStudents((studentResult.data || []) as unknown as Record<string, unknown>[]);
        }

        const progressResult = await enrollmentService.getLessonProgressByCourseIds(courseIds);
        setLessonProgress((progressResult.data || []) as unknown as Record<string, unknown>[]);
      }
    } catch (err: any) {
      showNotif('error', err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Instructor Dashboard</h1>
              <p className="text-dark-muted text-sm">Manage your courses, students, and content</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">Instructor</span>
            <span className="text-dark-muted text-xs">{profile?.email}</span>
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
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-dark-muted hover:text-white hover:bg-dark-card border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* MY COURSES */}
          {activeTab === 'my-courses' && (
            <motion.div key="my-courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid lg:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Published Courses', value: courses.filter((c: any) => c.status === 'published').length, icon: BookOpen, color: 'text-blue-400' },
                  { label: 'Total Students', value: enrollments.length, icon: Users, color: 'text-green-400' },
                  { label: 'Total Lessons', value: lessons.length, icon: FileText, color: 'text-yellow-400' },
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

              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-5">Your Courses</h3>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No courses assigned yet</p>
                    <p className="text-dark-muted text-sm mt-2">Contact an admin to have courses assigned to you</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course: any) => {
                      const courseLessons = lessons.filter((l: any) => l.course_id === course.id);
                      const courseEnrollments = enrollments.filter((e: any) => e.course_id === course.id);
                      const avgProgress = courseEnrollments.length > 0
                        ? Math.round(courseEnrollments.reduce((sum: number, e: any) => sum + (e.progress_pct || 0), 0) / courseEnrollments.length)
                        : 0;

                      return (
                        <div key={course.id} className="border border-dark-border rounded-xl p-5 hover:border-blue-500/30 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                              <h4 className="text-white font-semibold">{course.title}</h4>
                              <p className="text-dark-muted text-sm">{course.subtitle}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                              course.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>{course.status}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{courseEnrollments.length}</div>
                              <div className="text-xs text-dark-muted">Students</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{courseLessons.length}</div>
                              <div className="text-xs text-dark-muted">Lessons</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{avgProgress}%</div>
                              <div className="text-xs text-dark-muted">Avg Progress</div>
                            </div>
                          </div>

                          <div className="h-2 bg-dark-border rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgProgress}%` }} />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedCourse(course); setShowLessonModal(true); }}
                              className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <FileText className="w-4 h-4" /> Manage Lessons
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-sm text-dark-muted hover:text-white transition-all flex items-center gap-1.5">
                              <Users className="w-4 h-4" /> View Students
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

          {/* STUDENTS */}
          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-5">Your Students</h3>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-dark-muted mx-auto mb-4" />
                    <p className="text-dark-muted text-lg">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-border">
                          <th className="text-left py-3 px-3 text-dark-muted font-medium">Student</th>
                          <th className="text-left py-3 px-3 text-dark-muted font-medium">Course</th>
                          <th className="text-left py-3 px-3 text-dark-muted font-medium">Progress</th>
                          <th className="text-left py-3 px-3 text-dark-muted font-medium">Lessons Completed</th>
                          <th className="text-left py-3 px-3 text-dark-muted font-medium">Enrolled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment: any) => {
                          const student = students.find((s: any) => s.id === enrollment.user_id);
                          const course = courses.find((c: any) => c.id === enrollment.course_id);
                          const completedLessons = lessonProgress.filter((p: any) => p.user_id === enrollment.user_id && p.course_id === enrollment.course_id && p.is_completed).length;
                          return (
                            <tr key={enrollment.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-400">
                                    {student?.full_name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm">{student?.full_name || 'Unknown'}</p>
                                    <p className="text-dark-muted text-xs">{student?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-white">{course?.title || 'Course'}</td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 bg-dark-border rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${enrollment.progress_pct}%` }} />
                                  </div>
                                  <span className="text-xs text-dark-muted">{enrollment.progress_pct}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-dark-muted">{completedLessons}</td>
                              <td className="py-3 px-3 text-dark-muted">{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Enrollment by Course</h3>
                  {courses.map((course: any) => {
                    const count = enrollments.filter((e: any) => e.course_id === course.id).length;
                    const max = Math.max(...courses.map((c: any) => enrollments.filter((e: any) => e.course_id === c.id).length), 1);
                    return (
                      <div key={course.id} className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white truncate">{course.title}</span>
                          <span className="text-dark-muted">{count} students</span>
                        </div>
                        <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Student Progress Distribution</h3>
                  {[
                    { label: '0-25% (Just Started)', range: [0, 25] as [number, number], color: 'bg-red-500' },
                    { label: '26-50% (In Progress)', range: [26, 50] as [number, number], color: 'bg-yellow-500' },
                    { label: '51-75% (Advanced)', range: [51, 75] as [number, number], color: 'bg-blue-500' },
                    { label: '76-100% (Near Complete)', range: [76, 100] as [number, number], color: 'bg-green-500' },
                  ].map((range) => {
                    const [min, max] = range.range;
                    const count = enrollments.filter((e: any) => e.progress_pct >= min && e.progress_pct <= max).length;
                    const total = enrollments.length || 1;
                    return (
                      <div key={range.label} className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{range.label}</span>
                          <span className="text-dark-muted">{count} students</span>
                        </div>
                        <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                          <div className={`h-full ${range.color} rounded-full`} style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Top Performing Students</h3>
                  <div className="space-y-3">
                    {enrollments
                      .sort((a: any, b: any) => b.progress_pct - a.progress_pct)
                      .slice(0, 5)
                      .map((enrollment: any, i: number) => {
                        const student = students.find((s: any) => s.id === enrollment.user_id);
                        const course = courses.find((c: any) => c.id === enrollment.course_id);
                        return (
                          <div key={enrollment.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-400">{i + 1}</div>
                            <div className="flex-1">
                              <p className="text-white text-sm">{student?.full_name || 'Unknown'}</p>
                              <p className="text-dark-muted text-xs">{course?.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium text-sm">{enrollment.progress_pct}%</p>
                              <p className="text-dark-muted text-xs">progress</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-5">Course Engagement</h3>
                  <div className="space-y-4">
                    {courses.map((course: any) => {
                      const courseEnrollments = enrollments.filter((e: any) => e.course_id === course.id);
                      const avgProgress = courseEnrollments.length > 0
                        ? Math.round(courseEnrollments.reduce((sum: number, e: any) => sum + (e.progress_pct || 0), 0) / courseEnrollments.length)
                        : 0;
                      const activeStudents = courseEnrollments.filter((e: any) => e.status === 'active').length;
                      return (
                        <div key={course.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{course.title}</span>
                            <span className="text-dark-muted">{avgProgress}% avg</span>
                          </div>
                          <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgProgress}%` }} />
                          </div>
                          <p className="text-xs text-dark-muted mt-1">{activeStudents} active students</p>
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

      {/* Lesson Management Modal */}
      {showLessonModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">Lessons: {selectedCourse.title}</h3>
              <button onClick={() => setShowLessonModal(false)} className="p-1.5 rounded-md hover:bg-dark-border text-dark-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {lessons.filter((l: any) => l.course_id === selectedCourse.id).length === 0 ? (
                <p className="text-dark-muted text-sm py-4">No lessons created yet. Add lessons via the admin panel.</p>
              ) : (
                lessons.filter((l: any) => l.course_id === selectedCourse.id).map((lesson: any, i: number) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50 border border-dark-border/50">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{lesson.title}</p>
                      <p className="text-dark-muted text-xs capitalize">{lesson.lesson_type} &bull; {lesson.video_duration ? `${Math.floor(lesson.video_duration / 60)} min` : '—'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {lesson.is_published ? (
                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-xs">Published</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 text-xs">Draft</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-dark-border">
              <p className="text-dark-muted text-sm">
                <Lock className="w-4 h-4 inline mr-1" />
                Lesson editing requires admin access. Contact an administrator to add or modify lessons.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
