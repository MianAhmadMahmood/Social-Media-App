import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import logo from '../assets/logo-no-background.png';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ];

    return (
        <div className='fixed top-0 left-0 z-10 w-[16%] min-w-[80px] h-screen bg-gradient-to-b  shadow-lg px-4 lg:w-64 md:w-24 sm:w-20'>
            <div className='flex flex-col items-center py-6'>
                <img src={logo} alt="Logo" className='w-32 mb-8 lg:block md:hidden sm:hidden' />
                <div className='flex flex-col w-full space-y-2'>
                    {sidebarItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => sidebarHandler(item.text)}
                            className='flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:scale-105 cursor-pointer my-1 text-gray-700 hover:text-blue-600 group'
                        >
                            <span className="text-lg group-hover:text-blue-500">{item.icon}</span>
                            <span className='lg:inline-block md:hidden sm:hidden font-medium group-hover:text-blue-500'>{item.text}</span>
                            {
                                item.text === "Notifications" && likeNotification.length > 0 && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button size='icon' className="absolute top-1 right-1 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-md">{likeNotification.length}</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='p-3 bg-white border rounded-lg shadow-lg'>
                                            {
                                                likeNotification.length === 0 ? (
                                                    <p className='text-sm'>No new notifications</p>
                                                ) : (
                                                    likeNotification.map((notification) => (
                                                        <div key={notification.userId} className='flex items-center gap-2 py-2'>
                                                            <Avatar>
                                                                <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                <AvatarFallback>CN</AvatarFallback>
                                                            </Avatar>
                                                            <p className='text-sm'><span className='font-semibold'>{notification.userDetails?.username}</span> liked your post</p>
                                                        </div>
                                                    ))
                                                )
                                            }
                                        </PopoverContent>
                                    </Popover>
                                )
                            }
                        </div>
                    ))}
                </div>
            </div>
            <CreatePost open={open} setOpen={setOpen} />
        </div>
    );
}

export default LeftSidebar;
