import React, { useState, useEffect } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, FileText } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfile from './UpdateProfile'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

const Profile = () => {
  useGetAppliedJobs();
  const { user } = useSelector(store => store.auth);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeError, setResumeError] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Handle resume URL - ensure it's properly formatted for public access
  useEffect(() => {
    if (user?.profile?.resume) {
      // Transform the URL if needed to ensure public access
      // For Cloudinary, you might need to use a different access pattern
      // Example: replace "image/upload" with "image/upload/fl_attachment" for forcing download
      
      // Option 1: Try adding fl_attachment for downloadable content
      const formattedUrl = user.profile.resume.replace('/upload/', '/upload/fl_attachment/');
      setResumeUrl(formattedUrl);
    }
  }, [user?.profile?.resume]);

  // Handle resume click with error fallback
  const handleResumeClick = (e) => {
    if (resumeError) {
      e.preventDefault();
      alert('Unable to access resume. Please contact support.');
    }
  };

  // Test the URL accessibility
  useEffect(() => {
    if (resumeUrl) {
      const checkAccess = async () => {
        try {
          const response = await fetch(resumeUrl, { method: 'HEAD' });
          if (!response.ok) {
            setResumeError(true);
          }
        } catch (error) {
          setResumeError(true);
        }
      };
      
      checkAccess();
    }
  }, [resumeUrl]);

  return (
    <div>
      <Navbar />
      <div className='max-w-4xl mx-auto p-4'>
        <div className='flex justify-between items-center'>
          <h1 className='font-bold text-2xl'>Profile</h1>
          <Button onClick={() => setShowUpdateForm(!showUpdateForm)}>
            {showUpdateForm ? 'Close' : 'Update Profile'}
          </Button>
        </div>
        
        {showUpdateForm ? (
          <div className="mt-6">
            <UpdateProfile />
          </div>
        ) : (
          <div className='grid gap-4 mt-6'>
            {/* Profile details */}
            <div className='grid gap-4'>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Name</Label>
                <p>{user?.fullname}</p>
              </div>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Email</Label>
                <p>{user?.email}</p>
              </div>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Phone Number</Label>
                <p>{user?.phoneNumber || 'NA'}</p>
              </div>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Bio</Label>
                <p>{user?.profile?.bio || 'NA'}</p>
              </div>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Skills</Label>
                <p>{user?.profile?.skills?.join(', ') || 'NA'}</p>
              </div>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Resume</Label>
                {user?.profile?.resume ? (
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    <a 
                      target='_blank' 
                      rel="noopener noreferrer"
                      href={resumeUrl} 
                      className={`${resumeError ? 'text-red-500' : 'text-blue-500'} hover:underline cursor-pointer`}
                      onClick={handleResumeClick}
                    >
                      {resumeError ? 'Unable to access resume' : (user?.profile?.resumeOriginalName || 'View Resume')}
                    </a>
                    {resumeError && (
                      <Badge variant="destructive" className="text-xs">Access Error</Badge>
                    )}
                  </div>
                ) : (
                  <span>NA</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className='max-w-4xl mx-auto bg-white rounded-2xl mt-8'>
          <h1 className='font-bold text-lg my-5'>Applied Jobs</h1>
          <AppliedJobTable />
        </div>
      </div>
    </div>
  )
}

export default Profile