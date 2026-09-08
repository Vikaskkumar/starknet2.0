import React, { useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";


const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/debcictpi/image/upload";

export default function ProfilePic({ close, onSaved }) {
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef(null);

  const uploadPhoto = async (file) => {
    if (!file) return;

    setIsSaving(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
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

      const response = await fetch(API_URL + "/uploadProfilePic", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({ pic: imageUrl }),
      });
      const savedUser = await response.json();
      if (!response.ok) {
        throw new Error(savedUser.error || "Unable to save profile picture");
      }

      onSaved?.(savedUser);
      close();
    } catch (error) {
      window.alert(error.message || "Unable to update profile picture");
    } finally {
      setIsSaving(false);
    }
  };

  const removePic = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(API_URL + "/removeProfilePic", {
        method: "PUT",
        headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
      });
      const savedUser = await response.json();
      if (!response.ok) {
        throw new Error(savedUser.error || "Unable to remove profile picture");
      }
      onSaved?.(savedUser);
      close();
    } catch (error) {
      window.alert(error.message || "Unable to remove profile picture");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-black w-72 rounded-lg overflow-hidden">
        <h2 className="text-center font-semibold py-3 border-b">Change Profile Photo</h2>
        <button disabled={isSaving} onClick={() => fileRef.current?.click()} className="w-full py-3 hover:bg-gray-100 disabled:opacity-50">
          Upload Photo
        </button>
        <button disabled={isSaving} className="w-full py-3 text-red-500 hover:bg-gray-100 disabled:opacity-50" onClick={removePic}>
          Remove Photo
        </button>
        <button disabled={isSaving} onClick={close} className="w-full py-3 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
          Cancel
        </button>
        <input type="file" hidden ref={fileRef} accept="image/*" onChange={(event) => uploadPhoto(event.target.files?.[0])} />
      </div>
    </div>
  );
}
