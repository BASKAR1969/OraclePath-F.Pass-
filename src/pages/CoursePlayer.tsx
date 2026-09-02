import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { courseService, enrollmentService } from '../services';
import {
  Play, CheckCircle, Circle, Lock, ChevronLeft, ChevronRight, Clock,
  BookOpen, FileText, Zap, Code2, Award, ArrowLeft, AlertCircle, Loader2
} from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, any>>({});
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;
    setLoading(true);

    try {
      // Check enrollment
      const enrollResult = await enrollmentService.getEnrollment(user.id, id);
      if (enrollResult.error || !enrollResult.data) {
        navigate('/courses');
        return;
      }
      setEnrollment(enrollResult.data as unknown as Record<string, unknown>);

      // Get course
      const courseResult = await courseService.getCourseById(id);
      if (courseResult.data) setCourse(courseResult.data as unknown as Record<string, unknown>);

      // Get lessons
      const lessonsResult = await courseService.getCourseLessons(id);
      const sortedLessons = lessonsResult.data || [];
      setLessons(sortedLessons as unknown as Record<string, unknown>[]);

      if (sortedLessons.length > 0) {
        setCurrentLesson(sortedLessons[0] as unknown as Record<string, unknown>);
      }

      // Get progress
      const progressResult = await enrollmentService.getLessonProgress(user.id, id);
      const progressMap: Record<string, any> = {};
      (progressResult.data || []).forEach((p: any) => {
        progressMap[p.lesson_id as string] = p;
      });
      setLessonProgress(progressMap);
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markComplete = async () => {
    if (!currentLesson || !user?.id || !id) return;

    const result = await enrollmentService.upsertLessonProgress(
      user.id,
      id,
      currentLesson.id,
      true
    );

    if (!result.error) {
      setLessonProgress((prev) => ({
        ...prev,
        [currentLesson.id]: { ...prev[currentLesson.id], is_completed: true },
      }));
    }
  };

  const goToNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setQuizAnswers({});
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setQuizAnswers({});
    }
  };

  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const completedCount = lessons.filter((l) => lessonProgress[l.id]?.is_completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20">
        <Loader2 className="w-8 h-8 text-oracle-red animate-spin" />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-oracle-red mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Course Not Available</h1>
          <p className="text-dark-muted mb-6">This course may not have lessons yet or you are not enrolled.</p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = lessonProgress[currentLesson.id]?.is_completed;

  return (
    <div className="min-h-screen bg-dark-bg pt-16">
      {/* Top Bar */}
      <div className="bg-dark-surface border-b border-dark-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-dark-border text-dark-muted hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </button>
          <Link to={`/courses/${id}`} className="text-sm text-dark-muted hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {course.title}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-dark-muted">
            <div className="w-32 h-2 bg-dark-border rounded-full overflow-hidden">
              <div className="h-full bg-oracle-red rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <span>{progressPercent}%</span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-dark-border overflow-y-auto bg-dark-surface flex-shrink-0"
            >
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1">Course Content</h3>
                <p className="text-dark-muted text-xs mb-4">{completedCount} of {lessons.length} completed</p>

                <div className="space-y-1">
                  {lessons.map((lesson, index) => {
                    const isActive = lesson.id === currentLesson.id;
                    const isLessonCompleted = lessonProgress[lesson.id]?.is_completed;
                    const lessonTypeIcons: Record<string, any> = {
                      video: Play,
                      text: FileText,
                      quiz: Zap,
                      lab: Code2,
                    };
                    const LessonIcon = lessonTypeIcons[lesson.lesson_type] || BookOpen;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLesson(lesson);
                          setShowQuiz(false);
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-oracle-red/10 border border-oracle-red/20'
                            : 'hover:bg-dark-card border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isLessonCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : isActive ? (
                            <Circle className="w-5 h-5 text-oracle-red" />
                          ) : (
                            <LessonIcon className="w-5 h-5 text-dark-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-dark-muted'}`}>
                            {index + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-dark-muted mt-0.5 capitalize">{lesson.lesson_type}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-dark-muted mb-2">
                <span className="capitalize">{currentLesson.lesson_type}</span>
                <span>&bull;</span>
                <span>Lesson {currentIndex + 1} of {lessons.length}</span>
                {currentLesson.video_duration && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{Math.floor(currentLesson.video_duration / 60)} min</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{currentLesson.title}</h1>
            </div>

            {/* Video Placeholder */}
            {currentLesson.lesson_type === 'video' && (
              <div className="aspect-video bg-dark-card rounded-xl border border-dark-border flex items-center justify-center mb-6 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-oracle-red/5 to-transparent" />
                <button className="relative z-10 w-20 h-20 rounded-full bg-oracle-red/20 border border-oracle-red/30 flex items-center justify-center group-hover:bg-oracle-red/30 transition-all group-hover:scale-110">
                  <Play className="w-10 h-10 text-oracle-red fill-oracle-red" />
                </button>
                <p className="absolute bottom-4 left-4 text-dark-muted text-sm">Video content would load here from your video CDN</p>
              </div>
            )}

            {/* Lab/Sandbox */}
            {currentLesson.lesson_type === 'sql_lab' && (
              <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-dark-surface border-b border-dark-border">
                  <Code2 className="w-4 h-4 text-oracle-red" />
                  <span className="text-xs text-dark-muted font-mono">Oracle SQL Sandbox</span>
                </div>
                <div className="p-4 font-mono text-sm">
                  <div className="text-dark-muted mb-2">-- Write your SQL query here:</div>
                  <div className="bg-dark-surface rounded-lg p-4 border border-dark-border text-dark-muted">
                    SELECT * FROM employees WHERE department_id = 10;
                  </div>
                </div>
                <div className="px-4 py-3 bg-dark-surface border-t border-dark-border flex items-center justify-between">
                  <span className="text-xs text-dark-muted">Run your query to test your skills</span>
                  <button className="px-4 py-1.5 rounded-md bg-oracle-red text-white text-xs font-medium hover:bg-oracle-dark transition-colors">
                    Run Query
                  </button>
                </div>
              </div>
            )}

            {/* Text Content */}
            {(currentLesson.lesson_type === 'text' || currentLesson.content_body) && (
              <div className="prose prose-invert max-w-none mb-6">
                <div className="text-dark-muted leading-relaxed whitespace-pre-wrap">
                  {currentLesson.content_body || 'This lesson contains text content explaining Oracle SQL and PL/SQL concepts. In a production environment, this would be rich markdown content with code examples, diagrams, and interactive elements.'}
                </div>
              </div>
            )}

            {/* Quiz */}
            {currentLesson.lesson_type === 'quiz' && (
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-oracle-red" />
                  <h3 className="text-white font-semibold">Knowledge Check</h3>
                </div>

                {quizSubmitted ? (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      quizScore >= 70 ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      <Award className={`w-8 h-8 ${quizScore >= 70 ? 'text-green-500' : 'text-yellow-500'}`} />
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2">{quizScore}%</h4>
                    <p className="text-dark-muted text-sm">
                      {quizScore >= 70 ? 'Great job! You passed this quiz.' : 'Review the material and try again.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-dark-muted text-sm">Sample quiz question: Which SQL clause is used to filter rows after aggregation?</p>
                    <div className="space-y-2">
                      {['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'].map((option) => (
                        <label key={option} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50 border border-dark-border/50 hover:border-oracle-red/30 cursor-pointer transition-all">
                          <input
                            type="radio"
                            name="quiz-answer"
                            value={option}
                            checked={quizAnswers['q1'] === option}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, q1: e.target.value })}
                            className="w-4 h-4 text-oracle-red border-dark-border bg-dark-surface"
                          />
                          <span className="text-white text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setQuizSubmitted(true);
                        setQuizScore(quizAnswers['q1'] === 'HAVING' ? 100 : 0);
                      }}
                      className="px-4 py-2 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-colors"
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-dark-border">
              <button
                onClick={goToPrevLesson}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dark-border text-sm text-dark-muted hover:text-white hover:bg-dark-card transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-3">
                {!isCompleted && currentLesson.lesson_type !== 'quiz' && (
                  <button
                    onClick={markComplete}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all border border-green-500/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Complete
                  </button>
                )}
                <button
                  onClick={goToNextLesson}
                  disabled={currentIndex === lessons.length - 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-oracle-red text-white text-sm font-medium hover:bg-oracle-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
