import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const current = testimonials[currentIndex];

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
            Student <span className="gradient-text">Success Stories</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-dark-muted text-lg max-w-2xl mx-auto"
          >
            Real developers, real careers, real results.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-dark-card border border-dark-border rounded-2xl p-8 sm:p-12">
            <Quote className="w-12 h-12 text-oracle-red/20 absolute top-6 left-6" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                <p className="text-white text-lg sm:text-xl leading-relaxed mb-8">
                  "{current.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-oracle-red/20 flex items-center justify-center text-lg font-bold text-oracle-red">
                    {current.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{current.name}</div>
                    <div className="text-dark-muted text-sm">
                      {current.role} at {current.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-dark-border">
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentIndex ? 'bg-oracle-red w-6' : 'bg-dark-border hover:bg-dark-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-lg border border-dark-border flex items-center justify-center text-dark-muted hover:text-white hover:border-oracle-red/30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-lg border border-dark-border flex items-center justify-center text-dark-muted hover:text-white hover:border-oracle-red/30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
