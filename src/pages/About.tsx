import { motion } from 'framer-motion';
import { Target, Heart, Lightbulb, Users, Award, BookOpen, TrendingUp, Shield } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'Every course is designed with a single goal: make you job-ready for Oracle database roles. No fluff, no filler.',
  },
  {
    icon: Heart,
    title: 'Student-First',
    description: 'We listen. Our curriculum evolves based on real student feedback and industry hiring trends.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'From interactive SQL sandboxes to AI-powered code review, we leverage cutting-edge tools for learning.',
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'Transparent pricing, honest outcomes, and no false promises. We measure success by your career growth.',
  },
];

const team = [
  {
    name: 'Dr. Maria Chen',
    role: 'Founder & Lead Instructor',
    bio: 'Oracle ACE Director with 20+ years in database architecture. Former Oracle Principal Engineer.',
    initial: 'M',
  },
  {
    name: "James O'Connell",
    role: 'Head of Curriculum',
    bio: 'Senior Oracle Architect who led PL/SQL development for Oracle Cloud Infrastructure.',
    initial: 'J',
  },
  {
    name: 'Rajesh Patel',
    role: 'Performance Specialist',
    bio: 'Database performance tuning expert who has optimized queries for Fortune 100 companies.',
    initial: 'R',
  },
  {
    name: 'Lisa Zhang',
    role: 'APEX Champion',
    bio: 'Oracle APEX product champion and low-code advocate with 50+ enterprise deployments.',
    initial: 'L',
  },
];

const stats = [
  { icon: BookOpen, value: '25+', label: 'Courses' },
  { icon: Users, value: '50+', label: 'Partner Companies' },
  { icon: Award, value: '10,000+', label: 'Graduates' },
  { icon: TrendingUp, value: '95%', label: 'Placement Rate' },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            About <span className="gradient-text">OraclePath</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-3xl mx-auto">
            A division of <span className="text-oracle-red font-medium">Ervion Technologies</span>, OraclePath is the only platform dedicated exclusively to Oracle SQL and PL/SQL education.
            We bridge the gap between academic learning and real-world industry requirements with enterprise-grade training and guaranteed internship pathways.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-oracle-red" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-dark-muted text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
            <div className="space-y-4 text-dark-muted leading-relaxed">
              <p>
                OraclePath is a division of <strong className="text-white">Ervion Technologies</strong>, a global technology company specializing in enterprise software training and talent development. Ervion identified a critical gap: while there are thousands of courses for Python, JavaScript, and web development, there was a severe shortage of quality, modern Oracle SQL and PL/SQL training at enterprise scale.
              </p>
              <p>
                Dr. Maria Chen, OraclePath's founding lead, spent two decades as a Principal Engineer at Oracle. She saw brilliant developers struggle with database concepts because they had no structured, production-grade path to learn Oracle-specific technologies. Ervion Technologies brought together Oracle ACEs, senior architects, and industry hiring managers to build the curriculum every developer wishes they had.
              </p>
              <p>
                Today, OraclePath by Ervion Technologies is the trusted platform for Oracle database education, serving Fortune 500 training programs, university partnerships, and individual learners worldwide. Our mission is to make Oracle expertise accessible, practical, and career-defining.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-card border border-dark-border rounded-xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Why OraclePath is Different</h3>
            <div className="space-y-4">
              {[
                'Exclusively Oracle-focused curriculum',
                'Courses designed by Oracle ACEs and architects',
                'Guaranteed internship placement for top students',
                'Real enterprise projects, not toy examples',
                'Active community of 10,000+ learners',
                'Lifetime access with continuous updates',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-oracle-red/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-oracle-red" />
                  </div>
                  <span className="text-dark-muted">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-oracle-red" />
                </div>
                <h3 className="text-white font-semibold mb-2">{value.title}</h3>
                <p className="text-dark-muted text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-10">Meet Our Instructors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-xl p-6 text-center hover:border-oracle-red/30 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-oracle-red/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-oracle-red">{member.initial}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{member.name}</h3>
                <p className="text-oracle-red text-sm font-medium mb-3">{member.role}</p>
                <p className="text-dark-muted text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
