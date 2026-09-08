import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ArrowLeft, Send } from "lucide-react";
import defaultPic from "../assets/pics/defaultPic.svg";

const API_URL = import.meta.env.VITE_API_URL || "";
const API_URL_SOCKET = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL_SOCKET);

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isBotTyping]);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("jwt");

    useEffect(() => {
        if (currentUser._id) {
            socket.emit("register", currentUser._id);
        }

        fetch(API_URL + "/allusers", {
            headers: { Authorization: "Bearer " + token }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Inject Universal AI Bot at the top
                    const aiBot = {
                        _id: "universal_ai_bot",
                        name: "StarkBot AI",
                        email: "bot@starknet.ai",
                        Photo: "https://api.dicebear.com/7.x/bottts/svg?seed=StarkBot&backgroundColor=06b6d4"
                    };
                    // Filter out any accidentally created bot users from DB, then inject the universal one
                    const filteredData = data.filter(u => u.email !== "bot@starknet.ai");
                    setUsers([aiBot, ...filteredData]);
                }
            })
            .catch(err => console.log(err));

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
            // If we receive a message from the bot, stop the typing indicator
            if (data.sender?._id && data.sender._id !== currentUser._id) {
                setIsBotTyping(false);
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, []);

    useEffect(() => {
        if (!selectedUser) return;

        fetch(API_URL + `/messages/${selectedUser._id}`, {
            headers: { Authorization: "Bearer " + token }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMessages(data);
            })
            .catch(err => console.log(err));
    }, [selectedUser]);

    const sendMessage = () => {
        if (currentMessage.trim() !== "" && selectedUser) {
            const messageData = {
                senderId: currentUser._id,
                receiverId: selectedUser._id,
                text: currentMessage.trim()
            };

            socket.emit("send_message", messageData);
            setCurrentMessage("");
            
            if (selectedUser?.email === 'bot@starknet.ai') {
                setIsBotTyping(true);
            }
        }
    };

    const displayedMessages = messages.filter(
        msg =>
            (msg.sender?._id === currentUser._id && msg.receiver === selectedUser?._id) ||
            (msg.sender?._id === selectedUser?._id && msg.receiver === currentUser._id) ||
            (msg.sender === currentUser._id && msg.receiver === selectedUser?._id) ||
            (msg.sender === selectedUser?._id && msg.receiver === currentUser._id)
    );

    return (
        <div className="pt-14 md:pt-20 min-h-screen bg-black flex justify-center pb-20 md:pb-6">
            <div className="w-full max-w-5xl bg-black md:bg-[#0b0b0b] rounded-none md:rounded-2xl md:border border-white/10 h-[calc(100vh-120px)] md:h-[80vh] flex overflow-hidden shadow-2xl">

                {/* Left Side: Users List */}
                <div className={`w-full md:w-1/3 border-r-0 md:border-r border-white/10 flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-white font-bold text-xl tracking-wide">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {users.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition ${selectedUser?._id === user._id ? 'bg-white/10' : 'hover:bg-white/5'} border-b border-white/5`}
                            >
                                <img src={user.Photo || defaultPic} className="w-12 h-12 rounded-full object-cover border border-cyan-500/30" alt={user.name} />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-white truncate">{user.name}</p>
                                        {user.email === 'bot@starknet.ai' && (
                                            <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border border-cyan-500/30">AI</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">Tap to chat</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Chat Window */}
                <div className={`w-full md:w-2/3 flex-col bg-black md:bg-transparent ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="md:hidden text-cyan-400 hover:text-white transition"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <img src={selectedUser.Photo || defaultPic} className="w-10 h-10 rounded-full object-cover" alt={selectedUser.name} />
                                <div className="flex items-center gap-2">
                                    <h2 className="text-white font-semibold text-lg">
                                        {selectedUser.name}
                                    </h2>
                                    {selectedUser.email === 'bot@starknet.ai' && (
                                        <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border border-cyan-500/30">AI</span>
                                    )}
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
                                {displayedMessages.length === 0 && (
                                    <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                                        Say hi to {selectedUser.name}!
                                    </div>
                                )}
                                {displayedMessages.map((msg, index) => {
                                    const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
                                    return (
                                        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 max-w-[75%] shadow-md ${isMe ? 'bg-cyan-600 text-white rounded-2xl rounded-br-sm' : 'bg-zinc-800 text-gray-100 rounded-2xl rounded-bl-sm'}`}>
                                                <span className="text-sm md:text-base leading-relaxed break-words">{msg.content}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {isBotTyping && selectedUser?.email === 'bot@starknet.ai' && (
                                    <div className="flex flex-col items-start">
                                        <div className="px-4 py-3 bg-zinc-800 text-gray-400 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-md">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-black/50 border-t border-white/10">
                                <div className="flex items-center gap-2 bg-zinc-900 rounded-full p-1 border border-white/10 focus-within:border-cyan-500/50 transition">
                                    <input
                                        type="text"
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-transparent text-white px-4 py-2 outline-none text-sm placeholder-gray-500"
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!currentMessage.trim()}
                                        className="bg-cyan-500 text-black p-2 rounded-full hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 mr-1"
                                    >
                                        <Send size={18} className="-ml-[1px] mt-[1px]" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                                <Send size={32} className="text-gray-700" />
                            </div>
                            <p className="text-sm font-medium">Select a user to start chatting</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Chat;
