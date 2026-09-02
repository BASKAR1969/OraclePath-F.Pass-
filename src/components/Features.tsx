import { motion } from 'framer-motion';
import { Code2, Monitor, Users, FileCheck, Clock, Layers, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Hands-On Labs',
    description: 'Practice on real Oracle databases with guided exercises, live coding environments, and instant feedback.',
  },
  {
    icon: Monitor,
    title: 'Live Virtual Classes',
    description: 'Join interactive sessions with Oracle ACEs. Ask questions, share screens, and get real-time mentorship.',
  },
  {
    icon: Users,
    title: 'Internship Guarantee',
    description: 'Top-performing students get guaranteed internship placements with our 50+ partner companies.',
  },
  {
    icon: FileCheck,
    title: 'Industry Certification',
    description: 'Prepare for Oracle certification exams with mock tests, study guides, and instructor-led review sessions.',
  },
  {
    icon: Clock,
    title: 'Lifetime Access',
    description: 'All course materials, recordings, and updates are yours forever. Learn at your own pace.',
  },
  {
    icon: Layers,
    title: 'Project Portfolio',
    description: 'Build real-world projects that showcase your skills to employers. Get code reviews from industry experts.',
  },
  {
    icon: Shield,
    title: 'Career Support',
    description: 'Resume reviews, mock interviews, salary negotiation tips, and direct referrals to hiring managers.',
  },
  {
    icon: Zap,
    title: 'Community Access',
    description: 'Join our private Discord community. Network with peers, find study groups, and get job leads.',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Why Developers Choose <span className="gradient-text">OraclePath</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-dark-muted text-lg max-w-2xl mx-auto"
          >
            We go beyond tutorials. Every course is designed to get you job-ready with real-world skills.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group p-6 rounded-xl bg-dark-card border border-dark-border hover:border-oracle-red/30 glow-card transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center mb-4 group-hover:bg-oracle-red/20 transition-colors">
                <feature.icon className="w-5 h-5 text-oracle-red" />
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-dark-muted text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
