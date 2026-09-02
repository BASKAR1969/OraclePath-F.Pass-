import { Link } from 'react-router-dom';
import { Code2, Github, Twitter, Linkedin, Youtube, Mail, MapPin, Phone, ArrowUpRight, Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Ervion Technologies parent company banner */}
        <div className="mb-10 p-4 rounded-xl bg-dark-card border border-dark-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-oracle-red/10 flex items-center justify-center border border-oracle-red/20">
              <Building2 className="w-5 h-5 text-oracle-red" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Ervion Technologies</p>
              <p className="text-dark-muted text-xs">Parent Company of OraclePath</p>
            </div>
          </div>
          <a href="https://erviontech.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-oracle-red hover:text-oracle-light transition-colors">
            erviontech.com <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-oracle-red flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white">
                  Oracle<span className="text-oracle-red">Path</span>
                </span>
                <span className="text-[10px] text-dark-muted tracking-wide uppercase">Ervion Technologies</span>
              </div>
            </Link>
            <p className="text-dark-muted text-sm leading-relaxed mb-4">
              The premier platform for mastering Oracle SQL and PL/SQL. An Ervion Technologies company bridging the gap between learning and real-world enterprise application.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-dark-muted hover:text-oracle-red hover:border-oracle-red/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/courses', label: 'Courses' },
                { to: '/internships', label: 'Internships' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/resources', label: 'Resources' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
                { to: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-dark-muted text-sm hover:text-oracle-red transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Courses */}
          <div>
            <h3 className="text-white font-semibold mb-4">Top Courses</h3>
            <ul className="space-y-2.5">
              {['Oracle SQL Fundamentals', 'PL/SQL Masterclass', 'SQL Tuning & Optimization', 'Oracle DBA Essentials', 'Oracle APEX Development', 'SQL for Data Analytics'].map((course) => (
                <li key={course}>
                  <Link to="/courses" className="text-dark-muted text-sm hover:text-oracle-red transition-colors">{course}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-oracle-red mt-0.5 flex-shrink-0" />
                <span className="text-dark-muted text-sm">hello@oraclepath.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-oracle-red mt-0.5 flex-shrink-0" />
                <span className="text-dark-muted text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-oracle-red mt-0.5 flex-shrink-0" />
                <span className="text-dark-muted text-sm">
                  500 Oracle Parkway<br />Redwood City, CA 94065<br />
                  <span className="text-xs">Ervion Technologies HQ</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-muted text-sm">
            &copy; {new Date().getFullYear()} OraclePath by Ervion Technologies. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text) => (
              <a key={text} href="#" className="text-dark-muted text-sm hover:text-oracle-red transition-colors">{text}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
