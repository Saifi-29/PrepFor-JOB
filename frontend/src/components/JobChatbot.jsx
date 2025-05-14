import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, ChevronDown, Check, Clock, Image } from 'lucide-react';

// Helper function to format time
const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);
};

const predefinedResponses = {
    welcome: "👋 Hi! I'm your job preparation assistant. How can I help you today?\n\nYou can ask me anything about:\n• Resume writing\n• Interview tips\n• Job search help\n• Career advice\n• Skill development\n\nOr type a number to explore specific topics:\n1. Resume Tips\n2. Interview Preparation\n3. Job Search Strategy\n4. Skill Development\n5. Career Advice",
    "1": "📄 Here are some resume tips:\n• Keep it concise (1-2 pages)\n• Use action verbs\n• Quantify achievements\n• Customize for each job\n• Include relevant keywords\n• Proofread carefully\n\nWould you like to:\n1. See resume templates\n2. Get more tips\n3. Go back to main menu",
    "2": "🎯 Interview preparation tips:\n• Research the company\n• Practice common questions\n• Prepare STAR examples\n• Have questions ready\n• Dress professionally\n• Follow up after\n\nWould you like to:\n1. Practice questions\n2. Get more tips\n3. Go back to main menu",
    "3": "🔍 Job search strategies:\n• Update your LinkedIn\n• Network actively\n• Set job alerts\n• Follow companies\n• Attend job fairs\n• Use multiple platforms\n\nWould you like to:\n1. Get networking tips\n2. Learn about job boards\n3. Go back to main menu",
    "4": "💡 Skill development advice:\n• Identify key skills\n• Take online courses\n• Build projects\n• Get certifications\n• Join communities\n• Practice regularly\n\nWould you like to:\n1. Find learning resources\n2. Get project ideas\n3. Go back to main menu",
    "5": "🚀 Career advice:\n• Set clear goals\n• Find a mentor\n• Build your brand\n• Stay updated\n• Network regularly\n• Keep learning\n\nWould you like to:\n1. Goal setting tips\n2. Mentorship advice\n3. Go back to main menu",
    default: "I'm not sure about that. You can:\n• Type a number to select an option\n• Ask me about jobs, interviews, or resumes\n• Type 'menu' to see the main menu",
};

// Natural language patterns for common questions
const patterns = [
    {
        matches: ['how to prepare', 'prepare for interview', 'interview tips', 'interview preparation'],
        response: "Here are key interview preparation tips:\n\n1. Research the Company:\n• Study their products/services\n• Know their values and culture\n• Read recent news about them\n\n2. Practice Common Questions:\n• Tell me about yourself\n• Why do you want this job?\n• What are your strengths/weaknesses?\n\n3. Use the STAR Method:\n• Situation\n• Task\n• Action\n• Result\n\nWould you like specific examples for any of these?"
    },
    {
        matches: ['resume', 'cv', 'how to write resume', 'resume tips'],
        response: "Here's how to create a strong resume:\n\n1. Essential Sections:\n• Contact information\n• Professional summary\n• Work experience\n• Education\n• Skills\n\n2. Best Practices:\n• Use action verbs\n• Include numbers and achievements\n• Keep it concise\n• Tailor it to each job\n\nWould you like to see our resume builder tool?"
    },
    {
        matches: ['find job', 'job search', 'looking for job', 'get job'],
        response: "Here's a strategic approach to job searching:\n\n1. Online Platforms:\n• LinkedIn\n• Indeed\n• Company websites\n• Industry-specific job boards\n\n2. Networking:\n• Professional events\n• LinkedIn connections\n• Alumni networks\n\n3. Application Tips:\n• Customize each application\n• Follow up professionally\n• Track your applications\n\nWould you like more specific tips for your industry?"
    },
    {
        matches: ['salary', 'negotiate', 'pay', 'compensation'],
        response: "Tips for salary negotiation:\n\n1. Research:\n• Industry standards\n• Company pay scales\n• Your market value\n\n2. Negotiation Strategies:\n• Wait for their offer\n• Consider the total package\n• Be confident but professional\n\n3. What to Discuss:\n• Base salary\n• Bonuses\n• Benefits\n• Growth opportunities\n\nWould you like specific negotiation phrases?"
    },
    {
        matches: ['skills', 'learn', 'improve', 'develop'],
        response: "Here's how to develop your professional skills:\n\n1. Technical Skills:\n• Online courses (Coursera, Udemy)\n• Certification programs\n• Practice projects\n\n2. Soft Skills:\n• Communication\n• Leadership\n• Problem-solving\n• Time management\n\n3. Resources:\n• Industry blogs\n• YouTube tutorials\n• Professional workshops\n\nWould you like recommendations for specific skills?"
    }
];

const JobChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        if (messages.length === 0 && isOpen) {
            const welcomeMessage = {
                type: 'bot',
                text: predefinedResponses.welcome,
                time: new Date(),
                status: 'sent'
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const findMatchingPattern = (input) => {
        const lowercaseInput = input.toLowerCase();
        return patterns.find(pattern => 
            pattern.matches.some(match => lowercaseInput.includes(match))
        );
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = {
            type: 'user',
            text: inputMessage,
            time: new Date(),
            status: 'sent'
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputMessage('');

        // Show typing indicator
        setIsTyping(true);

        // Get bot response
        let response;
        if (inputMessage.toLowerCase() === 'menu') {
            response = predefinedResponses.welcome;
        } else {
            response = predefinedResponses[inputMessage];
            if (!response) {
                const matchingPattern = findMatchingPattern(inputMessage);
                response = matchingPattern ? matchingPattern.response : predefinedResponses.default;
            }
        }

        // Add bot response with a realistic typing delay
        const typingDelay = Math.min(response.length * 20, 2000); // Delay based on message length
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response,
                time: new Date(),
                status: 'sent'
            }]);
        }, typingDelay);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 rounded-full w-12 h-12 bg-gradient-to-r from-[#6A38C2] to-[#9F67E4] hover:from-[#5b30a6] hover:to-[#8f5dd4] shadow-lg"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {/* Chat window */}
            {isOpen && (
                <div className={`fixed right-5 ${isMinimized ? 'bottom-5' : 'bottom-5'} w-80 bg-[#f0f2f5] rounded-lg shadow-xl transition-all duration-300 z-50 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#6A38C2] to-[#9F67E4] rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Job Assistant</h3>
                                {isTyping && (
                                    <span className="text-xs text-white/80">typing...</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:text-white/80"
                                onClick={() => setIsMinimized(!isMinimized)}
                            >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isMinimized ? '' : 'rotate-180'}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:text-white/80"
                                onClick={() => {
                                    setIsOpen(false);
                                    setMessages([]);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div 
                                className="h-[380px] overflow-y-auto p-4 space-y-4"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'repeat'
                                }}
                            >
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`relative max-w-[80%] p-3 rounded-lg ${
                                                message.type === 'user'
                                                    ? 'bg-[#6A38C2] text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 rounded-bl-none'
                                            } shadow-sm`}
                                        >
                                            <pre className="whitespace-pre-wrap font-sans text-sm">{message.text}</pre>
                                            <div className={`flex items-center gap-1 text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                                                <span>{formatTime(message.time)}</span>
                                                {message.type === 'user' && (
                                                    <div className="flex">
                                                        <Check className="h-3 w-3" />
                                                        <Check className="h-3 w-3 -ml-1" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-white border-t">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        className="flex-1 p-2 bg-[#f0f2f5] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6A38C2] text-sm"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        className="bg-[#6A38C2] hover:bg-[#5b30a6] rounded-full w-10 h-10 p-0 flex items-center justify-center"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default JobChatbot; 