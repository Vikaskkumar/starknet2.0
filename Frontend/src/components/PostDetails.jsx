import React from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function PostDetails({ post, close, setPosts, showDelete = true }) {

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        API_URL + `/deletepost/${post._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
        }
      );

      if (res.ok) {
        setPosts(prevPosts => prevPosts.filter(p => p._id !== post._id));
        close();
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // safety: if no post, render nothing
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">

      {/* backdrop */}
      <div
        className="absolute inset-0"
        onClick={close}
      />

      {/* modal */}
      <div className="relative flex w-[90%] max-w-4xl overflow-hidden rounded-xl bg-[#0b0b0b] shadow-2xl">

        {/* image */}
        <div className="w-1/2 bg-black">
          <img
            src={post.photo}
            alt="post"
            className="h-full w-full object-contain"
          />
        </div>

        {/* details */}
        <div className="flex w-1/2 flex-col p-4 text-white">

          {/* header */}
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="font-semibold">{post.postedBy?.name || "Unknown"}</h2>
            <button
              onClick={close}
              className="text-xl hover:opacity-70"
            >
              ✕
            </button>
          </div>

          {/* caption */}
          <p className="mt-4 text-gray-300">{post.body}</p>

          {/* likes */}
          <p className="mt-2 text-sm text-gray-400">
            {post.likes?.length || 0} likes
          </p>

          {/* delete */}
          {showDelete && (
            <button
              onClick={handleDelete}
              className="mt-auto rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700"
            >
              Delete Post
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
