import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Play, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-grid">
      {/* Background gradient orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-oracle-red/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-oracle-red/10 border border-oracle-red/20 text-oracle-red text-sm font-medium mb-6"
            >
              <Database className="w-4 h-4" />
              Oracle SQL & PL/SQL Specialists
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-[10px] text-dark-muted tracking-widest uppercase mb-4"
            >
              An Ervion Technologies Company
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Master Oracle{' '}
              <span className="gradient-text">SQL</span> &{' '}
              <span className="gradient-text">PL/SQL</span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-dark-muted">
                From First Query to Production
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-dark-muted text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Expert-led courses, hands-on projects, and guaranteed internships.
              Join 10,000+ developers who transformed their careers with Oracle database expertise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors shadow-lg shadow-oracle-red/25"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/internships"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-dark-border text-white font-semibold hover:bg-white/5 transition-colors"
              >
                <Play className="w-4 h-4" />
                View Internships
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-dark-muted"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-dark-bg bg-dark-card flex items-center justify-center text-xs font-semibold text-white"
                  >
                    {['S', 'D', 'P', 'M'][i - 1]}
                  </div>
                ))}
              </div>
              <p>
                <span className="text-white font-semibold">10,000+</span> students enrolled
              </p>
            </motion.div>
          </div>

          {/* Right content - code card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 px-4 py-3 bg-dark-surface border-b border-dark-border">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-dark-muted font-mono">oracle_sql.sql</span>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed">
                <div className="text-dark-muted">
                  <span className="text-purple-400">SELECT</span>{' '}
                  <span className="text-orange-400">e.employee_id</span>,
                </div>
                <div className="text-dark-muted">
                  {'       '}<span className="text-orange-400">e.first_name</span>,
                </div>
                <div className="text-dark-muted">
                  {'       '}<span className="text-orange-400">d.department_name</span>,
                </div>
                <div className="text-dark-muted">
                  {'       '}<span className="text-orange-400">AVG</span>(
                  <span className="text-orange-400">s.salary</span>){' '}
                  <span className="text-purple-400">AS</span>{' '}
                  <span className="text-green-400">avg_salary</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">FROM</span>{' '}
                  <span className="text-blue-400">employees</span>{' '}
                  <span className="text-orange-400">e</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">JOIN</span>{' '}
                  <span className="text-blue-400">departments</span>{' '}
                  <span className="text-orange-400">d</span>{' '}
                  <span className="text-purple-400">ON</span>{' '}
                  <span className="text-orange-400">e.dept_id</span> ={' '}
                  <span className="text-orange-400">d.dept_id</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">JOIN</span>{' '}
                  <span className="text-blue-400">salaries</span>{' '}
                  <span className="text-orange-400">s</span>{' '}
                  <span className="text-purple-400">ON</span>{' '}
                  <span className="text-orange-400">e.emp_id</span> ={' '}
                  <span className="text-orange-400">s.emp_id</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">WHERE</span>{' '}
                  <span className="text-orange-400">e.hire_date</span>{' '}
                  <span className="text-purple-400">BETWEEN</span>{' '}
                  <span className="text-green-400">'2020-01-01'</span>{' '}
                  <span className="text-purple-400">AND</span>{' '}
                  <span className="text-green-400">'2025-12-31'</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">GROUP BY</span>{' '}
                  <span className="text-orange-400">e.employee_id</span>,{' '}
                  <span className="text-orange-400">e.first_name</span>,{' '}
                  <span className="text-orange-400">d.department_name</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">HAVING</span>{' '}
                  <span className="text-orange-400">AVG</span>(
                  <span className="text-orange-400">s.salary</span>) {'>'}{' '}
                  <span className="text-cyan-400">75000</span>
                </div>
                <div className="text-dark-muted">
                  <span className="text-purple-400">ORDER BY</span>{' '}
                  <span className="text-orange-400">avg_salary</span>{' '}
                  <span className="text-purple-400">DESC</span>;
                </div>
              </div>
              <div className="px-4 py-2 bg-dark-surface border-t border-dark-border flex items-center gap-2">
                <Terminal className="w-4 h-4 text-oracle-red" />
                <span className="text-xs text-dark-muted">Executing... 42 rows returned in 0.023s</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
