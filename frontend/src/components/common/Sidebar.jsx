// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {

  const queryClient = useQueryClient()

  const {mutate: logout, isError, isPending, error} = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST"
        })

        const data = await res.json()

        if(!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
      } catch (error) {
        throw new Error(error)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["authUser"]})
    },

    onError: () => {
      toast.error("Logout failed")
    }
  })
  const {data: authUser} = useQuery({queryKey: ["authUser"]})

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>

        <ul className="flex flex-col mt-4 gap-3">
          <li className="flex justify-center md:justify-center">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-900 rounded-full transition-all duration-300 py-2 pl-2 pr-4 max-w-fit"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-center">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 rounded-full transition-all duration-300 py-2 pl-2 pr-4 max-w-fit"
            >
              <IoNotifications className="w-8 h-8" />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-center">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-stone-900 rounded-full transition-all duration-300 py-2 pl-2 pr-4 max-w-fit"
            >
              <FaUser className="h-6 w-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>

        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-full">
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>

            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser.username}</p>
              </div>
              <BiLogOut className="w-5 h-5" onClick={(e) => {
                e.preventDefault()
                logout()
              }}/>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
