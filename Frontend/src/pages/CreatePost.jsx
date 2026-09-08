import React, { useEffect, useState } from "react";
import profilepic from "../assets/pics/defaultPic.svg";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/debcictpi/image/upload";

export default function CreatePost() {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const postData = async () => {
    if (!body.trim() || !image) {
      toast.error("Add a caption and an image before sharing");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", image);
      uploadData.append("upload_preset", "starknet");

      const uploadResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: uploadData,
      });
      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url || uploadResult.url;
      if (!uploadResponse.ok || !imageUrl) {
        throw new Error(uploadResult.error?.message || "Image upload failed");
      }

      const response = await fetch(API_URL + "/createPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({ body: body.trim(), pic: imageUrl }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to create post");
      }

      toast.success("Post created successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Unable to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center pt-16 md:pt-24 px-0 md:px-4 pb-20 md:pb-0">
      <div className="w-full max-w-md bg-[#0b0b0b] rounded-none md:rounded-2xl shadow-xl border-y md:border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h4 className="text-white font-semibold">Create new post</h4>
          <button
            onClick={postData}
            disabled={isSubmitting}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 px-4 py-1.5 rounded-lg text-black text-sm font-semibold transition"
          >
            {isSubmitting ? "Sharing..." : "Share"}
          </button>
        </div>

        <div className="relative w-full h-72 bg-black flex items-center justify-center overflow-hidden border-b border-white/10">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          {previewUrl ? (
            <img src={previewUrl} alt="Selected post" className="w-full h-full object-cover" />
          ) : (
            <p className="text-sm text-gray-400">Tap to select an image</p>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <img src={currentUser.Photo || profilepic} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/50" />
            <h5 className="text-white font-medium">{currentUser.name || "You"}</h5>
          </div>

          <textarea
            placeholder="Write a caption..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full h-28 bg-black/50 text-white p-3 rounded-xl resize-none outline-none border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-gray-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
