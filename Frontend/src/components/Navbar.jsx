import React, { useContext, useState } from "react";
import logo from "../assets/mainlogo.png";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { Menu, X } from "lucide-react";

function Navbar({ login }) {
  const { setmodalOpen } = useContext(LoginContext);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("jwt");
  const isLoggedIn = login || token;

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/60 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-8">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="logo"
              className="h-10 object-contain bg-white p-1 rounded-lg
              shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            />
            <p className="font-extrabold text-xl tracking-wide text-cyan-300">
              Stark<span className="text-white">Net</span>
            </p>
          </Link>

          {/* MENU ICON */}
          <button
            onClick={() => setOpen(true)}
            className="text-cyan-400 hover:text-white transition"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        ></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#0b0b0b] z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <p className="text-cyan-400 font-bold text-lg">Menu</p>
          <button onClick={() => setOpen(false)}>
            <X size={22} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <ul className="flex flex-col p-5 gap-4 text-gray-300 text-sm">

          {isLoggedIn ? (
            <>
              <Link to="/" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Home
              </Link>

              <Link to="/Profile" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Profile
              </Link>

              <Link to="/CreatePost" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Create Post
              </Link>

              <Link to="/Chat" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Chat
              </Link>



              <Link to="/followingpost" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Myfollowing Posts
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  setmodalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-md bg-red-500/10 text-red-400 border border-red-400/30
                hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/Signup" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Signup
              </Link>

              <Link to="/Signin" onClick={() => setOpen(false)} className="hover:text-cyan-400">
                Signin
              </Link>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;
