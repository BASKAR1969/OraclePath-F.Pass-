import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Features from '../components/Features';
import FeaturedCourses from '../components/FeaturedCourses';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <FeaturedCourses />
      <Testimonials />
      <CTA />
    </div>
  );
}
