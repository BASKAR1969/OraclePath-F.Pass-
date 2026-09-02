import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, HelpCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Have questions about our courses, internships, or enterprise training?
            Our team is here to help you on your Oracle journey.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-oracle-red" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Email</p>
                    <p className="text-dark-muted text-sm">hello@oraclepath.com</p>
                    <p className="text-dark-muted text-sm">support@oraclepath.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-oracle-red" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Phone</p>
                    <p className="text-dark-muted text-sm">+1 (555) 123-4567</p>
                    <p className="text-dark-muted text-sm">Mon-Fri, 9am-6pm PST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-oracle-red" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Office</p>
                    <p className="text-dark-muted text-sm">500 Oracle Parkway</p>
                    <p className="text-dark-muted text-sm">Redwood City, CA 94065</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Quick Support</h3>
              <div className="space-y-3">
                {[
                  { icon: MessageSquare, text: 'Live Chat', desc: 'Available 24/7' },
                  { icon: HelpCircle, text: 'Help Center', desc: 'Browse FAQs & guides' },
                  { icon: Clock, text: 'Response Time', desc: 'Usually under 2 hours' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3 rounded-lg bg-dark-surface/50">
                    <item.icon className="w-5 h-5 text-oracle-red" />
                    <div>
                      <p className="text-white text-sm font-medium">{item.text}</p>
                      <p className="text-dark-muted text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8">
              <h3 className="text-white font-semibold mb-6">Send us a Message</h3>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                  <p className="text-dark-muted">We'll get back to you within 2 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white focus:outline-none focus:border-oracle-red/50 transition-colors"
                    >
                      <option value="" className="bg-dark-card">Select a topic...</option>
                      <option value="courses" className="bg-dark-card">Course Inquiry</option>
                      <option value="internship" className="bg-dark-card">Internship Application</option>
                      <option value="enterprise" className="bg-dark-card">Enterprise Training</option>
                      <option value="support" className="bg-dark-card">Technical Support</option>
                      <option value="other" className="bg-dark-card">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-dark-border text-white placeholder-dark-muted focus:outline-none focus:border-oracle-red/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-oracle-red text-white font-semibold hover:bg-oracle-dark transition-colors w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
