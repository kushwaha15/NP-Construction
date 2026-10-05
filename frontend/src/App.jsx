import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import BrochurePopup from './components/BrochurePopup';

// Lazy-loaded pages
const Home         = lazy(() => import('./pages/Home'));
const About        = lazy(() => import('./pages/About'));
const Services     = lazy(() => import('./pages/Services'));
const Projects     = lazy(() => import('./pages/Projects'));
const Reviews      = lazy(() => import('./pages/Reviews'));
const Contact      = lazy(() => import('./pages/Contact'));
const Estimator    = lazy(() => import('./pages/Estimator'));
const Blog         = lazy(() => import('./pages/Blog'));
const BlogPost     = lazy(() => import('./pages/BlogPost'));
const FAQ          = lazy(() => import('./pages/FAQ'));
const Referral     = lazy(() => import('./pages/Referral'));
const NotFound     = lazy(() => import('./pages/NotFound'));
const ServiceArea  = lazy(() => import('./pages/services/ServiceArea'));
const AdminApp     = lazy(() => import('./pages/admin/AdminApp'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-6" aria-busy="true">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-2/3 rounded bg-mist-200 animate-pulse" />
        <div className="h-4 w-full rounded bg-mist-200 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-mist-200 animate-pulse" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin panel — no shared layout */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Public website — shared layout */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/"               element={<Home />} />
                <Route path="/about"          element={<About />} />
                <Route path="/services"       element={<Services />} />
                <Route path="/services/:city" element={<ServiceArea />} />
                <Route path="/projects"       element={<Projects />} />
                <Route path="/reviews"        element={<Reviews />} />
                <Route path="/testimonials"   element={<Navigate to="/reviews" replace />} />
                <Route path="/portfolio"      element={<Navigate to="/projects" replace />} />
                <Route path="/contact"        element={<Contact />} />
                <Route path="/estimator"      element={<Estimator />} />
                <Route path="/blog"           element={<Blog />} />
                <Route path="/blog/:slug"     element={<BlogPost />} />
                <Route path="/faq"            element={<FAQ />} />
                <Route path="/refer"          element={<Referral />} />
                <Route path="*"                element={<NotFound />} />
              </Routes>
              <Footer />
              <BackToTop />
              <BrochurePopup />
            </>
          } />
        </Routes>
      </Suspense>
    </>
  );
}
