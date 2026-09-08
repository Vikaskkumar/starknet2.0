import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

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

    // 1. Initialize socket and fetch users
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

    // 2. Fetch messages when a user is selected
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

    // Filter messages to only show ones between currentUser and selectedUser
    const displayedMessages = messages.filter(
        msg =>
            (msg.sender?._id === currentUser._id && msg.receiver === selectedUser?._id) ||
            (msg.sender?._id === selectedUser?._id && msg.receiver === currentUser._id) ||
            (msg.sender === currentUser._id && msg.receiver === selectedUser?._id) ||
            (msg.sender === selectedUser?._id && msg.receiver === currentUser._id)
    );

    return (
        <div className="pt-20 min-h-screen bg-black flex justify-center pb-6">
            <div className="w-full max-w-4xl bg-[#111] p-5 rounded-lg border border-gray-700 h-[80vh] flex gap-4">

                {/* Left Side: Users List */}
                <div className="w-1/3 border-r border-gray-700 pr-4 flex flex-col">
                    <h2 className="text-cyan-400 font-bold text-xl mb-4 border-b border-gray-700 pb-2">Chats</h2>
                    <div className="flex-1 overflow-y-auto">
                        {users.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`p-3 mb-2 rounded cursor-pointer ${selectedUser?._id === user._id ? 'bg-cyan-900' : 'bg-black hover:bg-gray-800'} text-white`}
                            >
                                <p className="font-bold">{user.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedUser ? (
                        <>
                            <h2 className="text-cyan-400 font-bold text-xl mb-4 border-b border-gray-700 pb-2">
                                Chat with {selectedUser.name}
                            </h2>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto mb-4 text-white pr-2">
                                {displayedMessages.map((msg, index) => (
                                    <div key={index} className={`mb-2 flex flex-col ${msg.sender?._id === currentUser._id || msg.sender === currentUser._id ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-2 rounded max-w-[80%] ${msg.sender?._id === currentUser._id || msg.sender === currentUser._id ? 'bg-cyan-700' : 'bg-gray-700'}`}>
                                            <span>{msg.content}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 rounded bg-black text-white border border-gray-600 outline-none"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-cyan-500 text-black px-4 py-2 rounded font-bold hover:bg-cyan-400"
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
