import React, { useEffect, useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from '@/utils/axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser, setToken } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const [errors, setErrors] = useState({});
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateInput = () => {
        const newErrors = {};
        
        // Email validation
        if (!input.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            newErrors.email = "Invalid email format";
        }
        
        // Password validation
        if (!input.password) {
            newErrors.password = "Password is required";
        } else if (input.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        // Role validation
        if (!input.role) {
            newErrors.role = "Please select a role";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateInput()) {
            return;
        }

        try {
            dispatch(setLoading(true));
            
            const loginData = {
                email: input.email.trim(),
                password: input.password,
                role: input.role
            };
            
            const res = await axios.post('/login', loginData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                dispatch(setUser(res.data.user));
                dispatch(setToken(res.data.token));
                toast.success(res.data.message);
                
                // Navigate based on role
                navigate(res.data.user.role === 'recruiter' ? "/admin/companies" : "/");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            toast.error(errorMessage);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                setErrors(prev => ({ ...prev, email: "Invalid credentials", password: "Invalid credentials" }));
            } else if (error.response?.status === 403) {
                setErrors(prev => ({ ...prev, role: "Invalid role selected" }));
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
            navigate(user.role === 'recruiter' ? "/admin/companies" : "/");
        }
    }, [user, navigate]);

    return (
        <div>
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Login</h1>
                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            className={errors.email ? 'border-red-500' : ''}
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            className={errors.password ? 'border-red-500' : ''}
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div className='my-2'>
                        <Label>Select Role</Label>
                        <RadioGroup className='flex gap-4 mt-2'>
                            <div className='flex items-center gap-2'>
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className={`cursor-pointer ${errors.role ? 'border-red-500' : ''}`}
                                />
                                <Label htmlFor="r1">Student</Label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className={`cursor-pointer ${errors.role ? 'border-red-500' : ''}`}
                                />
                                <Label htmlFor="r2">Recruiter</Label>
                            </div>
                        </RadioGroup>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full my-4" 
                        disabled={loading}
                    >
                        {loading ? (
                            <div className='flex items-center gap-2'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                <span>Logging in...</span>
                            </div>
                        ) : (
                            'Login'
                        )}
                    </Button>
                    <p className='text-center'>
                        Don't have an account?{' '}
                        <Link to="/signup" className='text-blue-500 hover:underline'>
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;