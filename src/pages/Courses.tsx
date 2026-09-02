import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, BookOpen, Star, Users, Tag, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { courses, type Course } from '../data/courses';

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Courses() {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const filtered = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            All <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Comprehensive Oracle SQL and PL/SQL courses designed by industry experts.
            From beginner basics to advanced performance tuning.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" />
            <input
              type="text"
              placeholder="Search courses, topics, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-card border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-dark-muted" />
            <div className="flex gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedLevel === level
                      ? 'bg-oracle-red text-white'
                      : 'bg-dark-card border border-dark-border text-dark-muted hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-dark-muted text-sm mb-6">
          Showing {filtered.length} of {courses.length} courses
        </p>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-oracle-red/30 glow-card transition-all flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    course.level === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                    course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {course.level}
                  </span>
                  {course.originalPrice && (
                    <span className="px-2 py-1 rounded-md bg-oracle-red/10 text-oracle-red text-xs font-bold">
                      SAVE {Math.round((1 - course.price / course.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                <p className="text-dark-muted text-sm mb-3">{course.subtitle}</p>
                <p className="text-dark-muted text-sm leading-relaxed mb-4">{course.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-dark-surface border border-dark-border text-xs text-dark-muted">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-dark-muted mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.lessons} lessons
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {course.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students.toLocaleString()}
                  </div>
                </div>

                {/* Expandable topics */}
                <div className="border-t border-dark-border pt-3">
                  <button
                    onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                    className="flex items-center gap-1 text-sm text-oracle-red hover:text-oracle-light transition-colors"
                  >
                    {expandedCourse === course.id ? 'Hide' : 'Show'} course topics
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedCourse === course.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedCourse === course.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-2"
                    >
                      {course.topics.map((topic, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-dark-muted">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {topic}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-dark-surface/50 border-t border-dark-border flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">${course.price}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-dark-muted line-through">${course.originalPrice}</span>
                  )}
                </div>
                <Link to={`/courses/${course.id}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-oracle-red/10 text-oracle-red text-sm font-medium hover:bg-oracle-red hover:text-white transition-all">
                  View Course
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-dark-muted text-lg">No courses match your search criteria.</p>
            <button
              onClick={() => { setSearch(''); setSelectedLevel('All'); }}
              className="mt-4 text-oracle-red hover:text-oracle-light transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
