import React, { useContext, useState } from "react";
import logo from "../assets/mainlogo.png";
import { Link, useLocation } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { Menu, X, Home, PlusSquare, MessageCircle, User, LogOut } from "lucide-react";

function Navbar({ login }) {
  
  const { setmodalOpen } = useContext(LoginContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem("jwt");
  const isLoggedIn = login || token;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/80 border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
          
          
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="logo"
              className="h-8 md:h-10 object-contain bg-white p-1 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            />
            <p className="font-extrabold text-lg md:text-xl tracking-wide text-cyan-300 hidden sm:block">
              Stark<span className="text-white">Net</span>
            </p>
          </Link>

          
          <button
            onClick={() => setOpen(true)}
            className="text-cyan-400 hover:text-white transition"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 w-full h-14 bg-black/90 backdrop-blur-lg border-t border-cyan-500/10 z-50 flex justify-around items-center px-2">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-cyan-400' : 'text-gray-500'}`}>
            <Home size={22} className={isActive('/') ? 'fill-cyan-400/20' : ''} />
          </Link>
          
          <Link to="/CreatePost" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/CreatePost') ? 'text-cyan-400' : 'text-gray-500'}`}>
            <PlusSquare size={22} className={isActive('/CreatePost') ? 'fill-cyan-400/20' : ''} />
          </Link>
          
          <Link to="/Chat" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/Chat') ? 'text-cyan-400' : 'text-gray-500'}`}>
            <MessageCircle size={22} className={isActive('/Chat') ? 'fill-cyan-400/20' : ''} />
          </Link>
          
          <Link to="/Profile" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/Profile') ? 'text-cyan-400' : 'text-gray-500'}`}>
            <User size={22} className={isActive('/Profile') ? 'fill-cyan-400/20' : ''} />
          </Link>

          <button onClick={() => setmodalOpen(true)} className="flex flex-col items-center justify-center w-full h-full text-red-500/70 hover:text-red-400">
            <LogOut size={22} />
          </button>
        </div>
      )}

      
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-[55]"
        ></div>
      )}

      
      <div
        className={`fixed top-0 right-0 h-full w-64 md:w-72 bg-[#0b0b0b] z-[60] transform transition-transform duration-300
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
              <Link to="/" onClick={() => setOpen(false)} className="hover:text-cyan-400">Home</Link>
              <Link to="/Profile" onClick={() => setOpen(false)} className="hover:text-cyan-400">Profile</Link>
              <Link to="/CreatePost" onClick={() => setOpen(false)} className="hover:text-cyan-400">Create Post</Link>
              <Link to="/Chat" onClick={() => setOpen(false)} className="hover:text-cyan-400">Chat</Link>
              <Link to="/followingpost" onClick={() => setOpen(false)} className="hover:text-cyan-400">Following Posts</Link>
              <button
                onClick={() => { setOpen(false); setmodalOpen(true); }}
                className="mt-4 px-4 py-2 rounded-md bg-red-500/10 text-red-400 border border-red-400/30 hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/Signup" onClick={() => setOpen(false)} className="hover:text-cyan-400">Signup</Link>
              <Link to="/Signin" onClick={() => setOpen(false)} className="hover:text-cyan-400">Signin</Link>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;
