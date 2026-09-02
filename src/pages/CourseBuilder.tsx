import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  BookOpen, Plus, Edit2, Trash2, ChevronRight, ChevronDown, GripVertical,
  Save, X, AlertCircle, CheckCircle, Eye, EyeOff, Lock, Unlock,
  Video, FileText, FlaskConical, HelpCircle, Layers, ArrowLeft,
  Loader2, MoveUp, MoveDown
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Module = { id: string; course_id: string; title: string; description: string | null; sort_order: number; };
type Lesson = { id: string; course_id: string; module_id: string | null; title: string; description: string | null; lesson_type: string; video_url: string | null; video_duration: number | null; content_body: string | null; sort_order: number; is_free_preview: boolean; is_published: boolean; };

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'sql_lab', label: 'SQL Lab', icon: FlaskConical },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'assignment', label: 'Assignment', icon: FileText },
];

export default function CourseBuilder() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
      <CourseBuilderContent />
    </ProtectedRoute>
  );
}

function CourseBuilderContent() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [defaultModuleId, setDefaultModuleId] = useState<string | null>(null);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const getToken = async () => {
    const s = await supabase?.auth.getSession();
    return s?.data?.session?.access_token;
  };

  const api = async (url: string, opts: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
    });
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/api/courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch { setCourses([]); }
    setLoading(false);
  }, []);

  const fetchCourseStructure = useCallback(async (courseId: string) => {
    const token = await getToken();
    const [mRes, lRes] = await Promise.all([
      fetch(`/api/courses?target=module&course_id=${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`/api/courses?target=lesson&course_id=${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const mData = await mRes.json();
    const lData = await lRes.json();
    setModules(Array.isArray(mData) ? mData : []);
    setLessons(Array.isArray(lData) ? lData : []);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const selectCourse = async (course: any) => {
    setSelectedCourse(course);
    await fetchCourseStructure(course.id);
    setExpandedModules(new Set());
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getModuleLessons = (moduleId: string) => lessons.filter(l => l.module_id === moduleId).sort((a, b) => a.sort_order - b.sort_order);
  const getUnassignedLessons = () => lessons.filter(l => !l.module_id).sort((a, b) => a.sort_order - b.sort_order);

  // ─── Course CRUD ───
  const saveCourse = async (data: any) => {
    const isEdit = !!data.id;
    const url = isEdit ? '/api/courses?target=course' : '/api/courses?target=course';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await api(url, { method, body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) { showNotif('error', result.error || 'Failed'); return; }
    showNotif('success', isEdit ? 'Course updated' : 'Course created');
    setShowCourseModal(false); setEditingCourse(null);
    await fetchCourses();
    if (isEdit && selectedCourse?.id === data.id) setSelectedCourse(result);
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its modules/lessons?')) return;
    const res = await api('/api/courses?target=course', { method: 'DELETE', body: JSON.stringify({ id }) });
    if (!res.ok) { showNotif('error', 'Delete failed'); return; }
    showNotif('success', 'Course deleted');
    if (selectedCourse?.id === id) { setSelectedCourse(null); setModules([]); setLessons([]); }
    await fetchCourses();
  };

  // ─── Module CRUD ───
  const saveModule = async (data: any) => {
    const isEdit = !!data.id;
    const body = isEdit ? { id: data.id, title: data.title, description: data.description, sort_order: data.sort_order } : { ...data, course_id: selectedCourse.id };
    const res = await api('/api/courses?target=module', { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(body) });
    const result = await res.json();
    if (!res.ok) { showNotif('error', result.error || 'Failed'); return; }
    showNotif('success', isEdit ? 'Module updated' : 'Module added');
    setShowModuleModal(false); setEditingModule(null);
    await fetchCourseStructure(selectedCourse.id);
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Delete this module? Lessons will become unassigned.')) return;
    const res = await api('/api/courses?target=module', { method: 'DELETE', body: JSON.stringify({ id }) });
    if (!res.ok) { showNotif('error', 'Delete failed'); return; }
    showNotif('success', 'Module deleted');
    await fetchCourseStructure(selectedCourse.id);
  };

  // ─── Lesson CRUD ───
  const saveLesson = async (data: any) => {
    const isEdit = !!data.id;
    const body = isEdit
      ? { id: data.id, title: data.title, description: data.description, lesson_type: data.lesson_type, video_url: data.video_url, video_duration: data.video_duration, content_body: data.content_body, sort_order: data.sort_order, is_free_preview: data.is_free_preview, is_published: data.is_published, module_id: data.module_id }
      : { ...data, course_id: selectedCourse.id };
    const res = await api('/api/courses?target=lesson', { method: isEdit ? 'PUT' : 'POST', body: JSON.stringify(body) });
    const result = await res.json();
    if (!res.ok) { showNotif('error', result.error || 'Failed'); return; }
    showNotif('success', isEdit ? 'Lesson updated' : 'Lesson added');
    setShowLessonModal(false); setEditingLesson(null);
    await fetchCourseStructure(selectedCourse.id);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    const res = await api('/api/courses?target=lesson', { method: 'DELETE', body: JSON.stringify({ id }) });
    if (!res.ok) { showNotif('error', 'Delete failed'); return; }
    showNotif('success', 'Lesson deleted');
    await fetchCourseStructure(selectedCourse.id);
  };

  const reorderItems = async (items: any[], target: string, idField: string) => {
    const updates = items.map((item, i) => ({ id: item[idField], sort_order: i + 1 }));
    await Promise.all(updates.map(u => api(`/api/courses?target=${target}`, { method: 'PUT', body: JSON.stringify(u) })));
    if (selectedCourse) await fetchCourseStructure(selectedCourse.id);
  };

  // ─── Render ───
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20"><Loader2 className="w-8 h-8 text-oracle-red animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-16">
      <AnimatePresence>{notif && (() => { const Icon = notif.type === 'success' ? CheckCircle : AlertCircle; return <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg flex items-center gap-2 shadow-lg ${notif.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}><Icon className="w-5 h-5" />{notif.message}</motion.div>; })()}</AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Course <span className="gradient-text">Builder</span></h1>
            <p className="text-dark-muted mt-1">Create and manage courses, modules, and lessons</p>
          </div>
          <button onClick={() => { setEditingCourse(null); setShowCourseModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark transition-colors"><Plus className="w-4 h-4" /> New Course</button>
        </div>

        {!selectedCourse ? (
          /* Course list */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <motion.div key={c.id} whileHover={{ y: -2 }} className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-oracle-red/30 transition-all cursor-pointer" onClick={() => selectCourse(c)}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.level === 'Beginner' ? 'bg-green-500/10 text-green-400' : c.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{c.level}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'published' ? 'bg-green-500/10 text-green-400' : c.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400'}`}>{c.status}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{c.title}</h3>
                <p className="text-dark-muted text-sm mb-3 line-clamp-2">{c.subtitle}</p>
                <div className="flex items-center gap-3 text-xs text-dark-muted">
                  <span>${c.price}</span>
                  <span>{c.lessons_count || 0} lessons</span>
                  <span>{c.students_count || 0} students</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-border">
                  <button onClick={e => { e.stopPropagation(); setEditingCourse(c); setShowCourseModal(true); }} className="text-oracle-red hover:text-oracle-light text-sm"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={e => { e.stopPropagation(); deleteCourse(c.id); }} className="text-red-400 hover:text-red-300 text-sm"><Trash2 className="w-4 h-4" /></button>
                  <span className="ml-auto text-dark-muted text-xs flex items-center gap-1"><ChevronRight className="w-4 h-4" /> Edit structure</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Course structure editor */
          <div>
            <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-1 text-dark-muted hover:text-white mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back to courses</button>
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                  <p className="text-dark-muted text-sm">{selectedCourse.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingCourse(selectedCourse); setShowCourseModal(true); }} className="p-2 rounded-lg text-dark-muted hover:text-white hover:bg-white/5"><Edit2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-dark-muted">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCourse.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{selectedCourse.status}</span>
                <span>{modules.length} modules</span>
                <span>{lessons.length} lessons</span>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-oracle-red" /> Modules</h3>
                <button onClick={() => { setEditingModule(null); setShowModuleModal(true); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-oracle-red/10 text-oracle-red text-sm font-medium hover:bg-oracle-red/20"><Plus className="w-4 h-4" /> Add Module</button>
              </div>

              {modules.sort((a, b) => a.sort_order - b.sort_order).map((mod, idx) => (
                <div key={mod.id} className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-dark-card/50 transition-colors" onClick={() => toggleModule(mod.id)}>
                    <GripVertical className="w-4 h-4 text-dark-muted" />
                    <div className="w-7 h-7 rounded-lg bg-oracle-red/10 flex items-center justify-center text-xs font-bold text-oracle-red">{idx + 1}</div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{mod.title}</p>
                      {mod.description && <p className="text-dark-muted text-xs mt-0.5">{mod.description}</p>}
                    </div>
                    <span className="text-xs text-dark-muted">{getModuleLessons(mod.id).length} lessons</span>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditingModule(mod); setShowModuleModal(true); }} className="p-1.5 rounded text-dark-muted hover:text-oracle-red"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteModule(mod.id)} className="p-1.5 rounded text-dark-muted hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-dark-muted" /> : <ChevronRight className="w-4 h-4 text-dark-muted" />}
                  </div>

                  <AnimatePresence>
                    {expandedModules.has(mod.id) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-dark-border">
                        <div className="p-4 space-y-2">
                          {getModuleLessons(mod.id).map((lesson, lIdx) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-card/50 hover:bg-dark-card transition-colors">
                              <GripVertical className="w-3 h-3 text-dark-muted/50" />
                              <div className="w-6 h-6 rounded flex items-center justify-center bg-oracle-red/10 text-xs text-oracle-red">{lIdx + 1}</div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium flex items-center gap-2">
                                  {lesson.title}
                                  {lesson.is_published ? <Eye className="w-3 h-3 text-green-400" /> : <EyeOff className="w-3 h-3 text-dark-muted" />}
                                  {lesson.is_free_preview && <Unlock className="w-3 h-3 text-yellow-400" />}
                                </p>
                                <p className="text-dark-muted text-xs flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-dark-surface text-xs">{lesson.lesson_type}</span>
                                  {lesson.video_duration && <span>{lesson.video_duration}min</span>}
                                </p>
                              </div>
                              <button onClick={() => { setEditingLesson(lesson); setShowLessonModal(true); }} className="p-1 rounded text-dark-muted hover:text-oracle-red"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteLesson(lesson.id)} className="p-1 rounded text-dark-muted hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                          <button onClick={() => { setEditingLesson(null); setDefaultModuleId(mod.id); setShowLessonModal(true); }} className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-dashed border-dark-border text-dark-muted text-sm hover:border-oracle-red/30 hover:text-oracle-red transition-colors"><Plus className="w-4 h-4" /> Add Lesson</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Unassigned lessons */}
              {getUnassignedLessons().length > 0 && (
                <div className="bg-dark-surface border border-yellow-500/20 rounded-xl p-4 mt-3">
                  <p className="text-yellow-400 text-sm font-medium mb-2">Unassigned Lessons (no module)</p>
                  <div className="space-y-2">
                    {getUnassignedLessons().map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-card/50">
                        <span className="text-white text-sm flex-1">{lesson.title}</span>
                        <button onClick={() => { setEditingLesson(lesson); setShowLessonModal(true); }} className="p-1 rounded text-dark-muted hover:text-oracle-red"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteLesson(lesson.id)} className="p-1 rounded text-dark-muted hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Course Modal ─── */}
      <AnimatePresence>{showCourseModal && <CourseModal course={editingCourse} onSave={saveCourse} onClose={() => { setShowCourseModal(false); setEditingCourse(null); }} />}</AnimatePresence>

      {/* ─── Module Modal ─── */}
      <AnimatePresence>{showModuleModal && <ModuleModal module={editingModule} sortOrder={modules.length + 1} onSave={saveModule} onClose={() => { setShowModuleModal(false); setEditingModule(null); }} />}</AnimatePresence>

      {/* ─── Lesson Modal ─── */}
      <AnimatePresence>{showLessonModal && <LessonModal lesson={editingLesson} modules={modules} defaultModuleId={defaultModuleId} sortOrder={lessons.length + 1} onSave={saveLesson} onClose={() => { setShowLessonModal(false); setEditingLesson(null); setDefaultModuleId(null); }} />}</AnimatePresence>
    </div>
  );
}

// ─── Course Modal ───
function CourseModal({ course, onSave, onClose }: { course: any | null; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    id: course?.id || '', title: course?.title || '', subtitle: course?.subtitle || '', slug: course?.slug || '',
    description: course?.description || '', level: course?.level || 'Beginner', duration: course?.duration || '8 weeks',
    price: course?.price || 0, original_price: course?.original_price || 0, instructor_name: course?.instructor_name || '',
    status: course?.status || 'draft', featured: course?.featured || false, tags: course?.tags || '', topics: course?.topics || '',
  });

  useEffect(() => { if (!form.slug && form.title) setForm(f => ({ ...f, slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })); }, [form.title]);

  return (
    <ModalWrapper onClose={onClose} title={course ? 'Edit Course' : 'New Course'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <Input label="Subtitle" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} />
        <Input label="Slug" value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} required />
        <Textarea label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Level" value={form.level} onChange={v => setForm(f => ({ ...f, level: v }))} options={['Beginner', 'Intermediate', 'Advanced']} />
          <Input label="Duration" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price ($)" type="number" value={String(form.price)} onChange={v => setForm(f => ({ ...f, price: Number(v) }))} />
          <Input label="Original Price" type="number" value={String(form.original_price)} onChange={v => setForm(f => ({ ...f, original_price: Number(v) }))} />
        </div>
        <Input label="Instructor Name" value={form.instructor_name} onChange={v => setForm(f => ({ ...f, instructor_name: v }))} />
        <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} />
        <Input label="Topics (comma-separated)" value={form.topics} onChange={v => setForm(f => ({ ...f, topics: v }))} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={['draft', 'published', 'archived']} />
          <label className="flex items-center gap-2 text-sm text-white mt-6"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded" /> Featured</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-dark-muted hover:text-white">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
      </div>
    </ModalWrapper>
  );
}

// ─── Module Modal ───
function ModuleModal({ module, sortOrder, onSave, onClose }: { module: Module | null; sortOrder: number; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ id: module?.id || '', title: module?.title || '', description: module?.description || '', sort_order: module?.sort_order || sortOrder });
  return (
    <ModalWrapper onClose={onClose} title={module ? 'Edit Module' : 'New Module'}>
      <div className="space-y-4">
        <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <Textarea label="Description" value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <Input label="Sort Order" type="number" value={String(form.sort_order)} onChange={v => setForm(f => ({ ...f, sort_order: Number(v) }))} />
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-dark-muted hover:text-white">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
      </div>
    </ModalWrapper>
  );
}

// ─── Lesson Modal ───
function LessonModal({ lesson, modules, defaultModuleId, sortOrder, onSave, onClose }: { lesson: Lesson | null; modules: Module[]; defaultModuleId: string | null; sortOrder: number; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    id: lesson?.id || '', title: lesson?.title || '', description: lesson?.description || '', lesson_type: lesson?.lesson_type || 'video',
    video_url: lesson?.video_url || '', video_duration: lesson?.video_duration || 0, content_body: lesson?.content_body || '',
    sort_order: lesson?.sort_order || sortOrder, is_free_preview: lesson?.is_free_preview || false, is_published: lesson?.is_published || false,
    module_id: lesson?.module_id || defaultModuleId || '',
  });
  return (
    <ModalWrapper onClose={onClose} title={lesson ? 'Edit Lesson' : 'New Lesson'}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
        <Textarea label="Description" value={form.description || ''} onChange={v => setForm(f => ({ ...f, description: v }))} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" value={form.lesson_type} onChange={v => setForm(f => ({ ...f, lesson_type: v }))} options={['video', 'text', 'sql_lab', 'quiz', 'assignment']} />
          <Select label="Module" value={form.module_id} onChange={v => setForm(f => ({ ...f, module_id: v }))} options={['', ...modules.map(m => m.id)]} optionLabels={['None', ...modules.map(m => m.title)]} />
        </div>
        {form.lesson_type === 'video' && (
          <>
            <Input label="Video URL" value={form.video_url || ''} onChange={v => setForm(f => ({ ...f, video_url: v }))} placeholder="https://..." />
            <Input label="Duration (min)" type="number" value={String(form.video_duration)} onChange={v => setForm(f => ({ ...f, video_duration: Number(v) }))} />
          </>
        )}
        {(form.lesson_type === 'text' || form.lesson_type === 'assignment') && (
          <Textarea label="Content" value={form.content_body || ''} onChange={v => setForm(f => ({ ...f, content_body: v }))} rows={8} />
        )}
        <Input label="Sort Order" type="number" value={String(form.sort_order)} onChange={v => setForm(f => ({ ...f, sort_order: Number(v) }))} />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" /> Published</label>
          <label className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={form.is_free_preview} onChange={e => setForm(f => ({ ...f, is_free_preview: e.target.checked }))} className="rounded" /> Free Preview</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-dark-muted hover:text-white">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
      </div>
    </ModalWrapper>
  );
}

// ─── Shared UI Components ───
function ModalWrapper({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-dark-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Input({ label, value, onChange, type = 'text', required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1">{label}{required && ' *'}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 text-sm" />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 text-sm resize-y" />
    </div>
  );
}

function Select({ label, value, onChange, options, optionLabels }: { label: string; value: string; onChange: (v: string) => void; options: string[]; optionLabels?: string[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white focus:outline-none focus:border-oracle-red/50 text-sm">
        {options.map((opt, i) => <option key={opt} value={opt}>{optionLabels?.[i] || opt}</option>)}
      </select>
    </div>
  );
}
