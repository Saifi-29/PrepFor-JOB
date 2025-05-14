import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import ResumeBuilder from './components/ResumeBuilder'
import CreateTest from './components/admin/CreateTest'
import TakeTest from './components/student/TakeTest'
import TestResults from './components/student/TestResults'
import Tests from './components/admin/Tests'
import { Toaster } from "@/components/ui/toaster"
import RootLayout from './components/layouts/RootLayout'

const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <Signup />
      },
      {
        path: "/jobs",
        element: <Jobs />
      },
      {
        path: "/description/:id",
        element: <JobDescription />
      },
      {
        path: "/browse",
        element: <Browse />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/resume-builder",
        element: <ResumeBuilder />
      },
      // admin routes
      {
        path:"/admin/companies",
        element: <ProtectedRoute><Companies/></ProtectedRoute>
      },
      {
        path:"/admin/companies/create",
        element: <ProtectedRoute><CompanyCreate/></ProtectedRoute> 
      },
      {
        path:"/admin/companies/:id",
        element:<ProtectedRoute><CompanySetup/></ProtectedRoute> 
      },
      {
        path:"/admin/jobs",
        element:<ProtectedRoute><AdminJobs/></ProtectedRoute> 
      },
      {
        path:"/admin/jobs/create",
        element:<ProtectedRoute><PostJob/></ProtectedRoute> 
      },
      {
        path:"/admin/jobs/:id/applicants",
        element:<ProtectedRoute><Applicants/></ProtectedRoute> 
      },
      {
        path:"/admin/companies/:id/test/create",
        element:<ProtectedRoute><CreateTest/></ProtectedRoute> 
      },
      {
        path:"/admin/tests/create",
        element:<ProtectedRoute><CreateTest/></ProtectedRoute> 
      },
      {
        path:"/tests/:id",
        element:<ProtectedRoute><TakeTest/></ProtectedRoute> 
      },
      {
        path:"/test-results",
        element:<ProtectedRoute><TestResults/></ProtectedRoute> 
      },
      {
        path:"/admin/tests",
        element:<ProtectedRoute><Tests/></ProtectedRoute> 
      }
    ]
  }
])

function App() {
  return (
    <div>
      <RouterProvider router={appRouter} />
      <Toaster />
    </div>
  )
}

export default App
