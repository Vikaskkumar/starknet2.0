import React, { useContext, useEffect, useState } from "react";
import PostDetails from "../components/PostDetails";
import ProfilePic from "../components/ProfilePic";
import profilepic from "../assets/pics/images (13).jpeg";
import { LoginContext } from "../context/LoginContext";

const API_URL = import.meta.env.VITE_API_URL || "";


export default function Profile() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [changePic, setChangePic] = useState(false);
  const { setuserLogin } = useContext(LoginContext);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const headers = { Authorization: "Bearer " + localStorage.getItem("jwt") };
        const [postsResponse, profileResponse] = await Promise.all([
          fetch(API_URL + "/myposts", { headers }),
          fetch(API_URL + "/myprofile", { headers }),
        ]);
        const [postsData, profileData] = await Promise.all([
          postsResponse.json(),
          profileResponse.json(),
        ]);

        if (!postsResponse.ok || !profileResponse.ok) {
          throw new Error(postsData.error || profileData.error || "Unable to load profile");
        }
        if (!cancelled) {
          setPosts(Array.isArray(postsData) ? postsData : []);
          setUser(profileData);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("user");
          setuserLogin(false);
        }
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [setuserLogin]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-24 max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-6 border-b border-gray-800 pb-6">
          <img
            src={user?.Photo || profilepic}
            alt="profile"
            onClick={() => setChangePic(true)}
            className="h-28 w-28 rounded-full object-cover cursor-pointer hover:opacity-90"
          />

          <div>
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
            <p className="text-gray-400 text-sm">Full-stack Developer</p>
            <div className="flex gap-6 mt-3 text-sm">
              <p><span className="font-semibold">{posts.length}</span> posts</p>
              <p><span className="font-semibold">{user?.followers?.length || 0}</span> followers</p>
              <p><span className="font-semibold">{user?.following?.length || 0}</span> following</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {posts.map((post) => (
            <img
              key={post._id}
              src={post.photo}
              alt="post"
              onClick={() => setSelectedPost(post)}
              className="aspect-square object-cover cursor-pointer hover:opacity-80"
            />
          ))}
        </div>

        {selectedPost && (
          <PostDetails post={selectedPost} close={() => setSelectedPost(null)} setPosts={setPosts} />
        )}
        {changePic && (
          <ProfilePic close={() => setChangePic(false)} onSaved={setUser} />
        )}
      </div>
    </div>
  );
}
