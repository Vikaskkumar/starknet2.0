import React, { useState } from "react";
import signuplogo from "../assets/signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "";


export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const notifyError = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const postData = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    

    if (!name || !userName || !email || !password) {
      notifyError("All fields are required");
      return;
    }

    if (!emailRegex.test(email)) {
      notifyError("Invalid email address");
      return;
    }

   
    fetch(API_URL + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        userName,
        email,
        password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          notifyError(data.error);
        } else {
          notifySuccess(data.message || "Account created successfully");
          navigate("/signin");
        }
      })
      .catch(() => notifyError("Something went wrong"));
  };

  return (
    <div
      className="relative min-h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${signuplogo})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 w-[90%] max-w-[384px] p-6 md:p-8 bg-black/80 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.25)]">
        <h1 className="text-2xl font-bold text-center text-cyan-300 mb-6">
          Create Account
        </h1>

        <form autoComplete="off" className="space-y-4">
          <input
            type="text"
            name="name_fake"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-2 rounded-lg bg-black/60 text-white outline-none border border-cyan-500/20 focus:border-cyan-400 transition"
          />

          <input
            type="text"
            name="username_fake"
            autoComplete="off"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 rounded-lg bg-black/60 text-white outline-none border border-cyan-500/20 focus:border-cyan-400 transition"
          />

          <input
            type="email"
            name="email_fake"
            autoComplete="new-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-black/60 text-white outline-none border border-cyan-500/20 focus:border-cyan-400 transition"
          />

          <input
            type="password"
            name="password_fake"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-black/60 text-white outline-none border border-cyan-500/20 focus:border-cyan-400 transition"
          />

          <button
            type="button"
            onClick={postData}
            className="w-full py-2.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Already have an account?{" "}
          <Link to="/Signin" className="text-cyan-300 hover:text-cyan-400">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
