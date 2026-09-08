import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";


export default function NewPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  const updatePassword = () => {
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }
    
    fetch(API_URL + "/new-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, token }),
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
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Set New Password</h2>
        
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full bg-[#111] text-white p-3 rounded outline-none border border-white/5 focus:border-cyan-500 transition"
          />
          <button
            onClick={updatePassword}
            className="w-full bg-cyan-500 text-black font-bold py-3 rounded hover:bg-cyan-400 transition"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
