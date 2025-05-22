import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { logout } from "@/redux/authSlice";
import { toast } from "sonner";
import NotificationIcon from "./NotificationIcon";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const logoutHandler = async () => {
    try {
      // First clear all local state
      dispatch(logout());
      localStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Then make the logout API call
      await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true
      });

      // Force reload the page to ensure all state is cleared
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we should still clear local state
      dispatch(logout());
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#6A38C2] to-[#9F67E4] shadow-lg">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16">
        <div>
          <Link to="/">
            <h1 className="text-2xl font-bold text-white">
              PrepFor<span className="text-[#F83002]">JOB</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-12">
          <ul className="flex font-medium items-center gap-5 text-white">
            {user && user.role === "student" && (
              <>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/">Home</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/resume-builder">Resume Builder</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/jobs">Jobs</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/browse">Browse</Link>
                </li>
              </>
            )}
            {user && user.role === "recruiter" && (
              <>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/admin/companies">Companies</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/admin/tests">Take Test</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/admin/jobs">Jobs</Link>
                </li>
              </>
            )}

            {!user && (
              <>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/">Home</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/resume-builder">Resume Builder</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/jobs">Jobs</Link>
                </li>
                <li className="hover:text-[#F83002] transition duration-300">
                  <Link to="/browse">Browse</Link>
                </li>
              </>
            )}
          </ul>
          
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button className="bg-[#6A38C2] text-white hover:bg-[#5b30a6] transition duration-300">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#6A38C2] text-white hover:bg-[#5b30a6] transition duration-300">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {user.role === "student" && <NotificationIcon />}
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white shadow-lg rounded-md">
                  <div>
                    <div className="flex gap-2 space-y-2">
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user?.fullname}</h4>
                        <p className="text-sm text-muted-foreground">{user?.profile?.bio}</p>
                      </div>
                    </div>
                    <div className="flex flex-col my-2 text-gray-600">
                      {user && user.role === "student" && (
                        <div className="flex w-fit items-center gap-2 cursor-pointer">
                          <User2 />
                          <Button variant="link">
                            <Link to="/profile">View Profile</Link>
                          </Button>
                        </div>
                      )}
                      <div className="flex w-fit items-center gap-2 cursor-pointer">
                        <LogOut />
                        <Button onClick={logoutHandler} variant="link">
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
