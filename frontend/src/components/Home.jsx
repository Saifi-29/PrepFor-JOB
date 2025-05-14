import React, { useEffect } from 'react'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import TestNotification from './student/TestNotification'
import JobChatbot from './JobChatbot'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if user is logged in and is a recruiter
    if (user && user.role === 'recruiter') {
      navigate("/admin/companies", { replace: true });
      return;
    }
  }, [user, navigate]);

  return (
    <div>
      {/* Show hero section and other content for non-recruiters */}
      {(!user || user.role === 'student') && (
        <>
          <HeroSection />
          <CategoryCarousel />
          <LatestJobs />
          <JobChatbot />
        </>
      )}
      
      {/* Show test notifications only for logged-in students */}
      {user?.role === 'student' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Other student content */}
            </div>
            <div className="md:col-span-1">
              <TestNotification />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default Home