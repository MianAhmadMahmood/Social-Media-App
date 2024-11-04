import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import logo from '../assets/logo-no-background.png';

const Login = () => {
    const [input, setInput] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({ email: "", password: "" });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4'>
            <form onSubmit={signupHandler} className='bg-white shadow-2xl rounded-lg p-8 w-full max-w-md sm:w-96'>
                <div className='flex flex-col items-center mb-6'>
                    <img src={logo} alt="Logo" className='w-32 h-auto mb-2' />
                    <p className='text-center text-gray-600 text-sm'>Login to see photos & videos from your friends</p>
                </div>
                <div className='mt-4'>
                    <label className='block font-medium text-gray-700'>Email</label>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                    />
                </div>
                <div className='mt-4'>
                    <label className='block font-medium text-gray-700'>Password</label>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                    />
                </div>
                <div className='mt-6'>
                    {loading ? (
                        <Button className='w-full flex items-center justify-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit' className='w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition'>
                            Login
                        </Button>
                    )}
                </div>
                <div className='mt-6 text-center text-black'>
                    Don't have an account? <Link to="/signup" className='text-black hover:underline'>Signup</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
