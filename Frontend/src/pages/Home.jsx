import React, { useContext, useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, X } from "lucide-react";
import UserProfile from "../components/UserProfile";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import userimg from "../assets/pics/defaultPic.svg";

const API_URL = import.meta.env.VITE_API_URL || "";


export default function Home() {
  const [data, setData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [openUser, setOpenUser] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();
  const { setuserLogin } = useContext(LoginContext);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup");
      return;
    }

    fetch(API_URL + "/allposts", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Unable to load posts");
        setData(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setuserLogin(false);
        navigate("/Signin", { replace: true });
      });

    // Fetch user suggestions
    fetch(API_URL + "/allusers", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(res => res.json())
      .then(usersData => {
        if (Array.isArray(usersData)) setSuggestions(usersData);
      })
      .catch(console.log);
  }, [navigate, setuserLogin]);

  const likepost = (id) => {
    fetch(API_URL + "/like", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then(res => res.json())
      .then(result => {
        setData(prev =>
          prev.map(p => (p._id === result._id ? result : p))
        );
      });
  };

  const followSuggestedUser = (followId) => {
    fetch(API_URL + "/follow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId }),
    })
      .then(res => res.json())
      .then(() => {
        // Remove from suggestions once followed
        setSuggestions(prev => prev.filter(u => u._id !== followId));
      })
      .catch(console.log);
  };

  const unlikepost = (id) => {
    fetch(API_URL + "/unlike", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then(res => res.json())
      .then(result => {
        setData(prev =>
          prev.map(p => (p._id === result._id ? result : p))
        );
      });
  };

  const makeComment = (text, id) => {
    if (!text?.trim()) return;

    fetch(API_URL + "/comment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id, text: text.trim() }),
    })
      .then(res => res.json())
      .then(updatedPost => {
        setData(prev =>
          prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
        );
        setCommentText(prev => ({ ...prev, [id]: "" }));
      });
  };

  return (
    <div className="pt-16 md:pt-20 pb-20 md:pb-6 min-h-screen bg-black flex justify-center gap-8 px-0 md:px-4">
      
      {/* LEFT COLUMN: POSTS */}
      <div className="w-full max-w-xl space-y-4 md:space-y-6">

        {data.map(post => {
          const liked = post.likes?.includes(currentUser._id);

          return (
            <div
              key={post._id}
              className="bg-[#0b0b0b] border-y md:border border-white/10 rounded-none md:rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <img
                  src={post.postedBy?.Photo || userimg}
                  alt=""
                  className="h-9 w-9 rounded-full cursor-pointer object-cover"
                  onClick={() => post.postedBy?._id && setOpenUser(post.postedBy._id)}
                />

                <span
                  onClick={() => setOpenUser(post.postedBy._id)}
                  className="text-white text-sm font-semibold cursor-pointer hover:text-cyan-400"
                >
                  {post.postedBy?.name || "Unknown"}
                </span>
              </div>

              <img src={post.photo} alt="post" className="w-full object-cover" />

              <div className="px-4 py-3 space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <div className="flex gap-5">
                    <Heart
                      onClick={() => liked ? unlikepost(post._id) : likepost(post._id)}
                      className={`cursor-pointer ${
                        liked ? "text-red-500 fill-red-500" : ""
                      }`}
                    />
                    <MessageCircle
                      className="cursor-pointer"
                      onClick={() =>
                        setOpenComments(prev => ({
                          ...prev,
                          [post._id]: !prev[post._id],
                        }))
                      }
                    />
                    <Send className="cursor-pointer" />
                  </div>
                  <Bookmark className="cursor-pointer" />
                </div>

                <p className="text-white text-sm font-semibold">
                  {post.likes?.length || 0} developers liked this
                </p>

                <p className="text-slate-300 text-sm">
                  <span
                    className="text-white font-semibold mr-1 cursor-pointer"
                    onClick={() => post.postedBy?._id && setOpenUser(post.postedBy._id)}
                  >
                    {post.postedBy?.name || "Unknown"}
                  </span>
                  {post.body}
                </p>
              </div>

              {openComments[post._id] && (
                <div className="bg-black/70 border-t border-white/10 px-4 py-4 space-y-4">
                  {post.comments?.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <p className="text-white text-sm font-semibold">
                        {c.postedBy?.name}
                      </p>
                      <p className="text-slate-300 text-sm">
                        {c.comment}
                      </p>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={commentText[post._id] || ""}
                      onChange={(e) =>
                        setCommentText(prev => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 bg-transparent text-sm text-slate-200 outline-none border-b border-white/10"
                    />
                    <button
                      onClick={() =>
                        makeComment(commentText[post._id], post._id)
                      }
                      className="text-cyan-400 text-sm font-semibold"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT COLUMN: SUGGESTIONS */}
      <div className="hidden lg:block w-[320px]">
        <div className="sticky top-24">
          <div className="flex items-center gap-4 mb-6">
            <img src={currentUser.Photo || userimg} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="text-white text-sm font-semibold">{currentUser.userName || currentUser.name}</p>
              <p className="text-gray-400 text-xs">{currentUser.name}</p>
            </div>
          </div>

          <h3 className="text-gray-400 font-semibold mb-4 text-sm">Suggested for you</h3>
          
          <div className="space-y-4">
            {suggestions.map(user => (
              <div key={user._id} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer" 
                  onClick={() => setOpenUser(user._id)}
                >
                  <img src={user.Photo || userimg} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-semibold hover:text-cyan-400">{user.name}</span>
                    <span className="text-gray-400 text-xs">Suggested for you</span>
                  </div>
                </div>
                <button 
                  onClick={() => followSuggestedUser(user._id)} 
                  className="text-cyan-400 text-xs font-semibold hover:text-white transition"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {openUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
          <div className="bg-black w-full h-[100dvh] md:max-w-3xl md:h-[90vh] md:rounded-2xl relative overflow-y-auto">
            <button
              onClick={() => setOpenUser(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-black/80"
            >
              <X size={24} />
            </button>

            <UserProfile userid={openUser} />
          </div>
        </div>
      )}

    </div>
  );
}
