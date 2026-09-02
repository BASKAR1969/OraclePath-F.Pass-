import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-oracle-red/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-oracle-red/20 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-oracle-red/10 border border-oracle-red/20 text-oracle-red text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Limited time offer
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Become an{' '}
            <span className="gradient-text">Oracle Expert</span>?
          </h2>

          <p className="text-dark-muted text-lg mb-8 max-w-2xl mx-auto">
            Join 10,000+ developers who started their Oracle journey with us.
            Get lifetime access, hands-on labs, and a guaranteed internship pathway.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors shadow-lg shadow-oracle-red/30"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-dark-border text-white font-semibold hover:bg-white/5 transition-colors"
            >
              Talk to an Advisor
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
