import React, { useState, useEffect } from 'react';
import { Bell, Clock, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { TEST_API_END_POINT } from '@/utils/constant';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const { token, user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && user?.role === 'student') {
            fetchNotifications();
            // Poll for new notifications every 15 seconds
            const interval = setInterval(fetchNotifications, 15000);
            return () => clearInterval(interval);
        }
    }, [token, user]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${TEST_API_END_POINT}/student/available`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            if (response.data.success) {
                const tests = response.data.data || [];
                const currentTime = new Date();
                
                const newNotifications = tests.map(test => {
                    const isNew = lastFetchTime && new Date(test.createdAt) > lastFetchTime;
                    return {
                        id: test._id,
                        title: test.title,
                        message: `New test available: ${test.title}`,
                        description: test.description || 'No description available',
                        duration: test.duration,
                        totalMarks: test.totalMarks,
                        company: test.jobId?.company?.name || 'Unknown Company',
                        jobTitle: test.jobId?.title,
                        time: new Date(test.createdAt).toLocaleDateString(),
                        createdAt: test.createdAt,
                        unread: isNew || !lastFetchTime,
                        type: 'test',
                        isNew
                    };
                });

                // Sort notifications by date (newest first)
                newNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setNotifications(newNotifications);
                setUnreadCount(newNotifications.filter(n => n.unread).length);
                setLastFetchTime(currentTime);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        navigate(`/tests/${notification.id}`);
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, unread: false }
                    : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-500">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Test Notifications
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>No tests available right now</p>
                            <p className="text-sm text-gray-400">Check back later for new tests</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors ${
                                    notification.unread ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                                            {notification.title}
                                            {notification.isNew && (
                                                <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-600 bg-red-100 rounded-full animate-pulse">
                                                    New
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {notification.company}
                                            {notification.jobTitle && ` • ${notification.jobTitle}`}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {formatTimeAgo(notification.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {notification.duration} minutes
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        {notification.totalMarks} marks
                                    </div>
                                    {notification.unread && (
                                        <div className="flex items-center gap-1 ml-auto text-blue-600">
                                            <AlertCircle className="h-3 w-3" />
                                            Click to take test
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationIcon; 