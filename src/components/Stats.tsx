import { motion } from 'framer-motion';
import { Users, BookOpen, Briefcase, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '10,000+', label: 'Students Enrolled' },
  { icon: BookOpen, value: '25+', label: 'Expert Courses' },
  { icon: Briefcase, value: '500+', label: 'Internships Placed' },
  { icon: Award, value: '95%', label: 'Hiring Success Rate' },
];

export default function Stats() {
  return (
    <section className="py-16 border-y border-dark-border bg-dark-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-oracle-red/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-oracle-red" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-dark-muted text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
