import React, { useEffect, useState } from "react";
import PostDetails from "../components/PostDetails";
import profilepic from "../assets/pics/images (13).jpeg";
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
    <div className="min-h-screen bg-black text-white">
      <div className="pt-10 max-w-5xl mx-auto px-4">

        {/* PROFILE */}
        <div className="flex items-center gap-6 border-b border-gray-800 pb-6">
          <img
            src={user.Photo || profilepic}
            alt=""
            className="h-28 w-28 rounded-full object-cover"
          />

          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <p className="text-gray-400 text-sm">Full-stack Developer</p>

            <div className="flex gap-6 mt-3 text-sm">
              <p><span className="font-semibold">{posts.length}</span> posts</p>
              <p><span className="font-semibold">{user.followers?.length || 0}</span> followers</p>
              <p><span className="font-semibold">{user.following?.length || 0}</span> following</p>
            </div>
          </div>

          {currentUser._id !== user._id && (
            following ? (
              <button
                onClick={unfollowUser}
                className="px-4 py-1 border rounded text-sm text-gray-300"
              >
                Following
              </button>
            ) : (
              <button
                onClick={followUser}
                className="px-4 py-1 bg-white text-black rounded text-sm"
              >
                Follow
              </button>
            )
          )}
        </div>

        {/* POSTS */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {posts.map(post => (
            <img
              key={post._id}
              src={post.photo}
              onClick={() => setSelectedPost(post)}
              alt="post"
              className="aspect-square object-cover cursor-pointer"
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
