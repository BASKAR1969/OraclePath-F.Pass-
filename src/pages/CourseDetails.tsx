import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { courseService, enrollmentService } from '../services';
import { supabase } from '../lib/supabase';
import type { Course } from '../types/domain';

import {
  BookOpen, Clock, Users, Star, ChevronRight, Check, Play, ArrowLeft, GraduationCap,
  Tag, BarChart3, Award, Zap, AlertCircle, CheckCircle, Lock, Globe, LockKeyhole
} from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showNotif, setShowNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      const courseResult = await courseService.getCourseById(id);
      if (courseResult.error) {
        setShowNotif({ type: 'error', message: courseResult.error.message || 'Failed to load course' });
      } else if (courseResult.data) {
        setCourse(courseResult.data as unknown as Record<string, unknown>);
      }
      if (user) {
        const enrollResult = await enrollmentService.getEnrollment(user.id, id);
        if (!enrollResult.error && enrollResult.data) {
          setEnrolled(true);
        }
      }
      setLoading(false);
    };
    fetchCourse();
  }, [id, user]);

  useEffect(() => {
    if (showNotif) { const t = setTimeout(() => setShowNotif(null), 3000); return () => clearTimeout(t); }
  }, [showNotif]);

  const handleEnrollClick = async () => {
    if (!user) { navigate('/login'); return; }
    if (!course) return;
    const price = (course.price as number) || 0;
    if (price > 0) {
      // Initiate Razorpay order via server
      setCheckoutLoading(true);
      try {
        const session = await supabase?.auth.getSession();
        const token = session?.data?.session?.access_token;
        if (!token) { navigate('/login'); return; }
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ course_id: course.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          setShowNotif({ type: 'error', message: data.error || 'Failed to initiate payment' });
          setCheckoutLoading(false);
          return;
        }
        // Open Razorpay checkout
        if (data.requires_payment) {
          const Razorpay = (window as any).Razorpay;
          if (!Razorpay) {
            setShowNotif({ type: 'error', message: 'Payment system is loading. Please refresh and try again.' });
            setCheckoutLoading(false);
            return;
          }
          const options = {
            key: data.razorpay_key_id,
            amount: data.amount,
            currency: data.currency || 'INR',
            name: 'OraclePath',
            description: course.title as string,
            order_id: data.razorpay_order_id,
            handler: async (response: any) => {
              // Verify payment server-side
              try {
                const verifyRes = await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    course_id: course.id,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (verifyRes.ok && verifyData.enrollment) {
                  setEnrolled(true);
                  setShowNotif({ type: 'success', message: 'Payment verified! Welcome to the course.' });
                } else {
                  setShowNotif({ type: 'error', message: verifyData.error || 'Payment verification failed. Contact support.' });
                }
              } catch {
                setShowNotif({ type: 'error', message: 'Payment verification failed. Contact support.' });
              }
              setShowCheckout(false);
              setCheckoutLoading(false);
            },
            prefill: { name: '', email: user.email },
            theme: { color: '#C74634' },
          };
          const rzp = new Razorpay(options);
          rzp.open();
          setShowCheckout(true);
        } else {
          // Free enrollment confirmed server-side
          setEnrolled(true);
          setShowNotif({ type: 'success', message: 'Successfully enrolled!' });
        }
      } catch {
        setShowNotif({ type: 'error', message: 'Failed to initiate payment. Please try again.' });
      }
      setCheckoutLoading(false);
    } else {
      handleFreeEnroll();
    }
  };

  const handleFreeEnroll = async () => {
    if (!user || !course) return;
    const result = await enrollmentService.createEnrollment(user.id, course.id as string, 'active');
    if (result.error) {
      setShowNotif({ type: 'error', message: result.error.message || 'Enrollment failed. Try again.' });
    } else {
      setEnrolled(true);
      setShowNotif({ type: 'success', message: 'Successfully enrolled! Starting your course.' });
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20">
        <div className="w-8 h-8 border-2 border-oracle-red/30 border-t-oracle-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-oracle-red mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
          <p className="text-dark-muted mb-6">The course you are looking for does not exist or has been removed.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const courseTopics = (course.topics as string[]) || [];
  const courseTags = (course.tags as string[]) || [];
  const levelColor = course.level === 'Beginner' ? 'bg-green-500/10 text-green-400' : course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400';
  const price = (course.price as number) || 0;
  const originalPrice = (course.original_price as number) || 0;

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-16">
      <AnimatePresence>
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
      </AnimatePresence>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-dark-muted mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{(course.title as string)}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${levelColor}`}>
                {course.level as string}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-2">{(course.title as string)}</h1>
              <p className="text-xl text-dark-muted mb-6">{(course.subtitle as string)}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-muted mb-8">
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{(course.duration as string)}</div>
                <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{(course.lessons_count as number)} lessons</div>
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{(course.rating as number)} rating</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />{(course.students_count as number)?.toLocaleString()} students</div>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-oracle-red" /> About This Course
                </h2>
                <p className="text-dark-muted leading-relaxed">{(course.description as string)}</p>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-oracle-red" /> What You Will Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {courseTopics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-dark-muted text-sm">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-oracle-red" /> Course Syllabus
                </h2>
                <div className="space-y-2">
                  {[
                    { week: 'Week 1-2', title: 'Foundations & Setup', lessons: 8, time: '6 hours' },
                    { week: 'Week 3-4', title: 'Core Concepts & Practice', lessons: 12, time: '10 hours' },
                    { week: 'Week 5-6', title: 'Advanced Techniques', lessons: 10, time: '8 hours' },
                    { week: 'Week 7-8', title: 'Real-World Projects & Review', lessons: 6, time: '8 hours' },
                  ].map((module, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50 hover:bg-dark-surface transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-oracle-red/10 flex items-center justify-center text-sm font-bold text-oracle-red flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{module.week}: {module.title}</p>
                        <p className="text-dark-muted text-xs">{module.lessons} lessons &bull; {module.time}</p>
                      </div>
                      <Lock className="w-4 h-4 text-dark-muted" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-oracle-red" /> Instructor
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-oracle-red/20 flex items-center justify-center text-xl font-bold text-oracle-red">
                    {(course.instructor_name as string)?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{(course.instructor_name as string)}</p>
                    <p className="text-oracle-red text-sm">Oracle Expert Instructor</p>
                    <p className="text-dark-muted text-sm mt-2 leading-relaxed">
                      Expert Oracle instructor with years of real-world enterprise experience building and optimizing database solutions for Fortune 500 companies.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">${price}</span>
                  {originalPrice > 0 && (
                    <span className="text-dark-muted line-through">${originalPrice}</span>
                  )}
                </div>
                {originalPrice > 0 && (
                  <div className="mb-4 px-3 py-1 rounded-full bg-oracle-red/10 text-oracle-red text-xs font-bold inline-block">
                    SAVE {Math.round((1 - price / originalPrice) * 100)}%
                  </div>
                )}

                {enrolled ? (
                  <div className="space-y-3">
                    <Link
                      to={`/play/${course.id}`}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors"
                    >
                      <Play className="w-5 h-5" /> Start Learning
                    </Link>
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-dark-border text-sm text-dark-muted hover:text-white hover:bg-dark-surface transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    {checkoutLoading ? 'Processing...' : price > 0 ? 'Enroll Now' : 'Enroll Free'}
                  </button>
                )}

                <p className="text-dark-muted text-xs text-center mt-3">
                  {enrolled ? 'Lifetime access active' : '30-day money-back guarantee'}
                </p>

                <div className="mt-6 pt-6 border-t border-dark-border space-y-3">
                  <div className="flex items-center gap-2 text-sm text-dark-muted">
                    <Globe className="w-4 h-4" /> Full lifetime access
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-muted">
                    <BarChart3 className="w-4 h-4" /> Access on mobile & desktop
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-muted">
                    <Award className="w-4 h-4" /> Certificate of completion
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-muted">
                    <Zap className="w-4 h-4" /> Hands-on Oracle sandbox
                  </div>
                </div>
              </div>

              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3">This course includes</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-dark-muted">
                    <Play className="w-4 h-4 text-oracle-red" /> {(course.lessons_count as number)} on-demand lessons
                  </div>
                  <div className="flex items-center gap-2 text-dark-muted">
                    <BookOpen className="w-4 h-4 text-oracle-red" /> Downloadable resources
                  </div>
                  <div className="flex items-center gap-2 text-dark-muted">
                    <GraduationCap className="w-4 h-4 text-oracle-red" /> Hands-on labs
                  </div>
                  <div className="flex items-center gap-2 text-dark-muted">
                    <Users className="w-4 h-4 text-oracle-red" /> Community access
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {courseTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-xs text-dark-muted">
                    <Tag className="w-3 h-3 inline mr-1" />{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
