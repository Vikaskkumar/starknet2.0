import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, Code2 } from "lucide-react";
import userimg from "../assets/pics/defaultPic.svg";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Myfollowingpost() {

  const [data, setData] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [openComments, setOpenComments] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup");
      return;
    }

    fetch(API_URL + "/myfollowingpost", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(res => res.json())
      .then(result => setData(Array.isArray(result) ? result : []))
      .catch(err => console.log(err));
  }, [navigate]);

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
        setData(prev => prev.map(p => (p._id === result._id ? result : p)));
      });
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
        setData(prev => prev.map(p => (p._id === result._id ? result : p)));
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
      body: JSON.stringify({ postId: id, text }),
    })
      .then(res => res.json())
      .then(updatedPost => {
        setData(prev => prev.map(p => (p._id === updatedPost._id ? updatedPost : p)));
        setCommentText(prev => ({ ...prev, [id]: "" }));
      });
  };

  return (
    <div className="pt-16 md:pt-20 pb-20 md:pb-6 min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-xl px-0 md:px-3 space-y-4 md:space-y-6">

        {data.map(post => (
          <div
            key={post._id}
            className="bg-[#0b0b0b] border-y md:border border-white/10 rounded-none md:rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition"
          >

            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <img src={post.postedBy?.Photo || userimg} alt="" className="h-9 w-9 rounded-full ring-2 ring-cyan-500/20" />
              <div>
                <Link
                  to={`/profile/${post.postedBy?._id}`}
                  className="text-white text-sm font-semibold hover:text-cyan-400"
                >
                  {post.postedBy?.name || "Unknown"}
                </Link>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Code2 size={12} /> Developer
                </p>
              </div>
            </div>

            {/* IMAGE */}
            <img
              src={post.photo}
              alt="post"
              className="w-full object-cover"
            />

            {/* ACTIONS */}
            <div className="px-4 py-3 space-y-3">
              <div className="flex justify-between items-center text-slate-400">
                <div className="flex gap-5">
                  <Heart
                    onClick={() =>
                      post.likes?.includes(user._id)
                        ? unlikepost(post._id)
                        : likepost(post._id)
                    }
                    className={`cursor-pointer transition-transform hover:scale-110 ${
                      post.likes?.includes(user._id)
                        ? "text-red-500 fill-red-500"
                        : "hover:text-red-400"
                    }`}
                  />
                  <MessageCircle
                    className="cursor-pointer hover:text-cyan-400"
                    onClick={() =>
                      setOpenComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))
                    }
                  />
                  <Send className="hover:text-green-400 cursor-pointer" />
                </div>
                <Bookmark className="hover:text-yellow-400 cursor-pointer" />
              </div>

              <p className="text-white text-sm font-semibold">
                {post.likes?.length || 0} developers liked this
              </p>

              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="text-white font-semibold mr-1">
                  {post.postedBy?.name || "Unknown"}
                </span>
                {post.body}
              </p>
            </div>

            {/* COMMENTS */}
            {openComments[post._id] && (
              <div className="bg-black/70 border-t border-white/10 px-4 py-4 space-y-4">

                <p className="text-xs text-slate-400 uppercase tracking-widest">
                  Comments
                </p>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {post.comments?.map((c) => (
                    <div key={c._id} className="flex gap-3 items-start group">
                      <img
                        src={userimg}
                        className="h-8 w-8 rounded-full ring-2 ring-cyan-500/20 object-cover"
                      />

                      <div className="flex-1 bg-white/5 rounded-2xl px-3 py-2 group-hover:bg-white/10 transition">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">
                            {c.postedBy?.name || "User"}
                          </p>
                          <span className="text-xs text-slate-500">now</span>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed mt-0.5">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <img
                    src={userimg}
                    className="h-8 w-8 rounded-full ring-2 ring-cyan-500/20"
                  />
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
                    className="flex-1 bg-transparent text-sm text-slate-200 outline-none border-b border-white/10 focus:border-cyan-400 transition pb-1"
                  />
                  <button
                    onClick={() => makeComment(commentText[post._id], post._id)}
                    className="text-cyan-400 text-sm font-semibold hover:text-cyan-300"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}
