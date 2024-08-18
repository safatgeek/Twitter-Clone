// @ts-nocheck
import React, { useState } from "react";
import XSvg from "../../../components/svgs/X";

import { Link } from "react-router-dom";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";

import { useQueryClient, useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const queryClient = useQueryClient()

  const {mutate, isError, isPending, error} = useMutation({
    mutationFn: async({ email, username, fullName, password }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, username, fullName, password })
        })

        if (!res.ok) {
          // Handle HTTP errors
          const errorData = await res.json();
          console.log("Server responded with an error:", errorData);
          throw new Error(errorData.error);
        }
  
        const data = await res.json();

        console.log("User created successfully:", data);
  
        return data;
      } catch (error) {
        console.error("Error in mutationFn:", error);
        throw error
      }
    },

    onSuccess: () => {
      toast.success("Account created successfully")
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      console.error("onError callback:", error); // Log entire error object
      const message = error.message || "Something went wrong";
      console.log("Error message to be shown:", message); // Log the message being passed to toast
      toast.error(message);
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault(); //page won't reload
    mutate(formData)
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div className="w-screen mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Join today</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              className="grow"
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <FaUser />
            <input
              className="grow"
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdDriveFileRenameOutline />
            <input
              className="grow"
              type="text"
              name="fullName"
              placeholder="Full Name"
              onChange={handleInputChange}
              value={formData.fullName}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2"> 
            <MdPassword />
            <input
              className="grow"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>

          <button className="btn rounded-full btn-primary text-white btn-outline w-full">
            {isPending ? "Loading..." : "Sign up"}
          </button>

          {isError && <p className="text-red-500">{error.message}</p>}
        </form>

        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
