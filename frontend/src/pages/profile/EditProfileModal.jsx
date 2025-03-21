import React, { useState, useRef, useEffect } from "react";
import useUpdateProfile from "../../hooks/useUpdateProfile";

const EditProfileModal = ({ authUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const { updateProfile, isUpadatingProfile } = useUpdateProfile();
  // Create a ref for the dialog element
  const dialogRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // @ts-ignore
    updateProfile(formData)
    if (dialogRef.current) {
      // @ts-ignore
      dialogRef.current.close();
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // @ts-ignore
    setFormData({
      fullName: authUser.fullName,
      username: authUser.username,
      email: authUser.email,
      bio: authUser.bio,
      newPassword: "",
      currentPassword: ""
      
    })
  }, [authUser])

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() => {
          if (dialogRef.current) {
            // @ts-ignore
            dialogRef.current.showModal();
          }
          console.log("Clicked");
        }}
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal" ref={dialogRef}>
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullName}
                name="fullName"
                onChange={handleInputChange}
              />

              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />

              <input
                type="text"
                placeholder="Link"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.link}
                name="link"
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />

              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
            </div>

            <textarea
              placeholder="Bio"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.bio}
              name="bio"
              onChange={handleInputChange}
            />

            <button
              className="btn btn-primary rounded-full btn-sm text-white"
            >
              {isUpadatingProfile ? "Updating..." : "Update"}
            </button>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">Close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal;
