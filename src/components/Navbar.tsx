import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SupabaseStatus from '../components/SupabaseStatus';
import {
  Menu, X, Code2, GraduationCap, Briefcase, Users, Mail, LogIn, UserPlus, LayoutDashboard, Shield, LogOut, User, ChevronDown, HelpCircle, BookOpen, CreditCard, Newspaper, Layers
} from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: Code2 },
  { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/internships', label: 'Internships', icon: Briefcase },
  { to: '/resources', label: 'Resources', icon: Newspaper },
  { to: '/pricing', label: 'Pricing', icon: CreditCard },
  { to: '/about', label: 'About', icon: Users },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, isSuperAdmin, isInstructor, role, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-oracle-red flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-white">
                Oracle<span className="text-oracle-red">Path</span>
              </span>
              <span className="text-[10px] text-dark-muted tracking-wide uppercase">An Ervion Technologies Company</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-oracle-red/15 text-oracle-red'
                      : 'text-dark-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link to="/faq" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/faq' ? 'bg-oracle-red/15 text-oracle-red' : 'text-dark-muted hover:text-white hover:bg-white/5'
            }`}>
              <HelpCircle className="w-4 h-4" /> FAQ
            </Link>

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <div className="hidden xl:block">
                    <SupabaseStatus />
                  </div>
                )}
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-oracle-red/20 flex items-center justify-center text-xs font-bold text-oracle-red">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden xl:block">{profile?.full_name || user.email?.split('@')[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-dark-border">
                      <p className="text-white font-medium text-sm">{profile?.full_name || 'User'}</p>
                      <p className="text-dark-muted text-xs">{user.email}</p>
                      {role && (
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          isSuperAdmin ? 'bg-purple-500/10 text-purple-400' : isAdmin ? 'bg-oracle-red/10 text-oracle-red' : isInstructor ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                        }`}>
                          {role.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      {isInstructor && !isAdmin && (
                        <Link to="/instructor" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors">
                          <BookOpen className="w-4 h-4" /> Instructor Panel
                        </Link>
                      )}
                      {(isAdmin || isInstructor) && (
                        <Link to="/course-builder" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-muted hover:text-white hover:bg-white/5 transition-colors">
                          <Layers className="w-4 h-4" /> Course Builder
                        </Link>
                      )}
                    </div>
                    <div className="p-2 border-t border-dark-border">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white border border-dark-border hover:bg-white/5 transition-all"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-oracle-red text-white hover:bg-oracle-dark transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-dark-muted hover:text-white hover:bg-white/5"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-oracle-red/15 text-oracle-red' : 'text-dark-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {link.label}
                </Link>
              );
            })}
            <Link to="/faq" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === '/faq' ? 'bg-oracle-red/15 text-oracle-red' : 'text-dark-muted hover:text-white hover:bg-white/5'}`}>
              <HelpCircle className="w-4 h-4" /> FAQ
            </Link>

            {user ? (
              <>
                <div className="border-t border-dark-border mt-2 pt-2">
                  <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-dark-muted hover:text-white hover:bg-white/5 transition-all">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-dark-muted hover:text-white hover:bg-white/5 transition-all">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="border-t border-dark-border mt-2 pt-2 space-y-1">
                <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-dark-muted hover:text-white hover:bg-white/5 transition-all">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link to="/register" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-oracle-red hover:bg-oracle-red/10 transition-all">
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
