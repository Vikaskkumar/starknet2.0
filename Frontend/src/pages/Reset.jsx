import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";


export default function Reset() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const resetPassword = () => {
    if (!email || !password) {
      toast.error("Please enter both email and new password");
      return;
    }
    
    fetch(API_URL + "/direct-reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success(data.message);
          navigate("/Signin");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-[#0b0b0b] p-8 rounded-2xl border border-white/10 w-full max-w-sm shadow-xl">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Reset Password</h2>
        
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full bg-[#111] text-white p-3 rounded outline-none border border-white/5 focus:border-cyan-500 transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full bg-[#111] text-white p-3 rounded outline-none border border-white/5 focus:border-cyan-500 transition"
          />
          <button
            onClick={resetPassword}
            className="w-full bg-cyan-500 text-black font-bold py-3 rounded hover:bg-cyan-400 transition"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
