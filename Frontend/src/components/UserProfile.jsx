import React, { useEffect, useState } from "react";
import PostDetails from "../components/PostDetails";
import profilepic from "../assets/pics/defaultPic.svg";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";


export default function UserProfile({ userid }) {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { userid: routeUserId } = useParams();
  const profileId = userid || routeUserId;

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id;

  useEffect(() => {
    if (!profileId) return;

    fetch(API_URL + `/user/${profileId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Unable to load profile");
        return result;
      })
      .then(result => {
        setUser(result.user);
        setPosts(Array.isArray(result.posts) ? result.posts : []);
        setFollowing(result.user.followers?.includes(currentUserId));
      })
      .catch(console.log);
  }, [profileId, currentUserId]);

  if (!profileId) return null;
  if (!user) return null;

  const followUser = () => {
    fetch(API_URL + "/follow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: profileId }),
    })
      .then(res => res.json())
      .then(() => {
        setFollowing(true);
        setUser(prev => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser._id],
        }));
      });
  };

  const unfollowUser = () => {
    fetch(API_URL + "/unfollow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: profileId }),
    })
      .then(res => res.json())
      .then(() => {
        setFollowing(false);
        setUser(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(
            id => id !== currentUser._id
          ),
        }));
      });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-6">
      <div className="pt-20 md:pt-10 max-w-5xl mx-auto px-4 md:px-6">

        {/* PROFILE */}
        <div className="flex items-center gap-4 md:gap-6 border-b border-gray-800 pb-6">
          <img
            src={user.Photo || profilepic}
            alt=""
            className="h-20 w-20 md:h-28 md:w-28 rounded-full object-cover"
          />

          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold">{user.name}</h1>
            <p className="text-gray-400 text-xs md:text-sm">Full-stack Developer</p>

            <div className="flex gap-4 md:gap-6 mt-2 md:mt-3 text-xs md:text-sm">
              <p><span className="font-semibold">{posts.length}</span> posts</p>
              <p><span className="font-semibold">{user.followers?.length || 0}</span> followers</p>
              <p><span className="font-semibold">{user.following?.length || 0}</span> following</p>
            </div>
          </div>

          {currentUser._id !== user._id && (
            following ? (
              <button
                onClick={unfollowUser}
                className="px-3 py-1 md:px-4 border rounded text-xs md:text-sm text-gray-300"
              >
                Following
              </button>
            ) : (
              <button
                onClick={followUser}
                className="px-3 py-1 md:px-4 bg-white text-black rounded text-xs md:text-sm font-semibold"
              >
                Follow
              </button>
            )
          )}
        </div>

        {/* POSTS */}
        <div className="mt-4 md:mt-8 grid grid-cols-3 gap-1 md:gap-2">
          {posts.map(post => (
            <img
              key={post._id}
              src={post.photo}
              onClick={() => setSelectedPost(post)}
              alt="post"
              className="aspect-square object-cover cursor-pointer hover:opacity-80 transition"
            />
          ))}
        </div>
      </div>
      
      {selectedPost && (
        <PostDetails
          post={selectedPost}
          close={() => setSelectedPost(null)}
          setPosts={setPosts}
          showDelete={currentUser._id === user._id}
        />
      )}
    </div>
  );
}
