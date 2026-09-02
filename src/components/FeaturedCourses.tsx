import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Star, Users, ArrowRight, Tag } from 'lucide-react';
import { featuredCourses } from '../data/courses';

export default function FeaturedCourses() {
  return (
    <section className="py-20 bg-dark-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-14">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
            >
              Featured <span className="gradient-text">Courses</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-dark-muted"
            >
              Start with our most popular Oracle database courses
            </motion.p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-oracle-red hover:text-oracle-light font-medium transition-colors"
          >
            View all courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-oracle-red/30 glow-card transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
                      course.level === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                      course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {course.level}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-oracle-red transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-dark-muted text-sm mt-1">{course.subtitle}</p>
                  </div>
                </div>

                <p className="text-dark-muted text-sm leading-relaxed mb-5">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {course.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-dark-surface border border-dark-border text-xs text-dark-muted">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-dark-muted mb-5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons} lessons
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {course.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">${course.price}</span>
                    {course.originalPrice && (
                      <span className="text-sm text-dark-muted line-through">${course.originalPrice}</span>
                    )}
                  </div>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-oracle-red/10 text-oracle-red text-sm font-medium hover:bg-oracle-red hover:text-white transition-all"
                  >
                    Enroll Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
