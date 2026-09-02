import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import Internships from './pages/Internships';
import InternshipDetails from './pages/InternshipDetails';
import About from './pages/About';
import Resources from './pages/Resources';
import FAQ from './pages/FAQ';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseBuilder from './pages/CourseBuilder';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-dark-bg text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/play/:id" element={<CoursePlayer />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/:id" element={<InternshipDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Role Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['student', 'instructor', 'admin', 'super_admin', 'manager']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/instructor" element={
              <ProtectedRoute allowedRoles={['instructor', 'admin', 'super_admin', 'manager']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/course-builder" element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'instructor']}>
                <CourseBuilder />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
