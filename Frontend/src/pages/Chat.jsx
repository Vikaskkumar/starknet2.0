import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";
const API_URL_SOCKET = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL_SOCKET);

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");

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
                if (Array.isArray(data)) setUsers(data);
            })
            .catch(err => console.log(err));

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
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
        if (currentMessage !== "" && selectedUser) {
            const messageData = {
                senderId: currentUser._id,
                receiverId: selectedUser._id,
                text: currentMessage
            };

            socket.emit("send_message", messageData);
            setCurrentMessage("");
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
            <div className="w-full max-w-4xl bg-black md:bg-[#111] p-0 md:p-5 rounded-none md:rounded-lg md:border border-gray-700 h-[calc(100vh-120px)] md:h-[80vh] flex gap-0 md:gap-4">

                {/* Left Side: Users List */}
                <div className={`w-full md:w-1/3 border-r-0 md:border-r border-gray-700 pr-0 md:pr-4 flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <h2 className="text-cyan-400 font-bold text-xl mb-4 border-b border-gray-700 pb-2 px-4 md:px-0 mt-4 md:mt-0">Chats</h2>
                    <div className="flex-1 overflow-y-auto px-2 md:px-0">
                        {users.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-4 md:p-3 mb-2 rounded-lg cursor-pointer ${selectedUser?._id === user._id ? 'bg-cyan-900/50' : 'bg-[#111] md:bg-black hover:bg-gray-800'} text-white border border-gray-800 md:border-0`}
                            >
                                <p className="font-bold">{user.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Chat Window */}
                <div className={`w-full md:w-2/3 flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            <div className="flex items-center gap-3 border-b border-gray-700 pb-2 mb-4 px-4 md:px-0 mt-4 md:mt-0">
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="md:hidden text-cyan-400 hover:text-white"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <h2 className="text-cyan-400 font-bold text-xl">
                                    {selectedUser.name}
                                </h2>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto mb-4 text-white px-4 md:px-2">
                                {displayedMessages.map((msg, index) => (
                                    <div key={index} className={`mb-3 flex flex-col ${msg.sender?._id === currentUser._id || msg.sender === currentUser._id ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-2xl max-w-[80%] ${msg.sender?._id === currentUser._id || msg.sender === currentUser._id ? 'bg-cyan-700 rounded-br-sm' : 'bg-gray-700 rounded-bl-sm'}`}>
                                            <span className="text-sm md:text-base">{msg.content}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="flex gap-2 px-4 md:px-0 mb-4 md:mb-0">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 p-3 rounded-full bg-[#111] md:bg-black text-white border border-gray-600 outline-none focus:border-cyan-500"
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-cyan-500 text-black px-6 py-2 rounded-full font-bold hover:bg-cyan-400"
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a user to start chatting
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Chat;
