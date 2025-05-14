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
import { setLoading } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: null
    });
    const [errors, setErrors] = useState({});
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateInput = () => {
        const newErrors = {};
        
        // Fullname validation
        if (!input.fullname) {
            newErrors.fullname = "Full name is required";
        } else if (input.fullname.length < 3) {
            newErrors.fullname = "Full name must be at least 3 characters";
        }
        
        // Email validation
        if (!input.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            newErrors.email = "Invalid email format";
        }
        
        // Phone number validation
        if (!input.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10}$/.test(input.phoneNumber)) {
            newErrors.phoneNumber = "Phone number must be 10 digits";
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
        
        // File validation
        if (!input.file) {
            newErrors.file = "Profile photo is required";
        } else {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(input.file.type)) {
                newErrors.file = "Only JPG, JPEG & PNG files are allowed";
            } else if (input.file.size > 5 * 1024 * 1024) { // 5MB
                newErrors.file = "File size must be less than 5MB";
            }
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

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput(prev => ({ ...prev, file }));
            // Clear file error when new file is selected
            if (errors.file) {
                setErrors(prev => ({ ...prev, file: "" }));
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateInput()) {
            return;
        }

        try {
            dispatch(setLoading(true));
            
            const formData = new FormData();
            formData.append("fullname", input.fullname.trim());
            formData.append("email", input.email.trim());
            formData.append("phoneNumber", input.phoneNumber);
            formData.append("password", input.password);
            formData.append("role", input.role);
            formData.append("file", input.file);

            const res = await axios.post('/register', formData, {
                headers: { 'Content-Type': "multipart/form-data" }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMessage);
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                if (error.response.data.message.includes("email")) {
                    setErrors(prev => ({ ...prev, email: "Email already exists" }));
                }
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div>
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Sign Up</h1>
                    <div className='my-2'>
                        <Label>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            className={errors.fullname ? 'border-red-500' : ''}
                            placeholder="Enter your full name"
                        />
                        {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
                    </div>
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
                        <Label>Phone Number</Label>
                        <Input
                            type="tel"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            className={errors.phoneNumber ? 'border-red-500' : ''}
                            placeholder="Enter your phone number"
                        />
                        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
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
                    <div className='my-2'>
                        <Label>Profile Photo</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={changeFileHandler}
                            className={errors.file ? 'border-red-500' : ''}
                        />
                        {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                        <p className="text-sm text-gray-500 mt-1">
                            Max file size: 5MB. Supported formats: JPG, JPEG, PNG
                        </p>
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full my-4"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className='flex items-center gap-2'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                    <p className='text-center'>
                        Already have an account?{' '}
                        <Link to="/login" className='text-blue-500 hover:underline'>
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;