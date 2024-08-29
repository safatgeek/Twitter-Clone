import React from "react";

import { IoSettingsOutline } from "react-icons/io5";
import { FaHeart, FaUser } from "react-icons/fa";
import LoadingSpinner from "./../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const NotificationPage = () => {

  const queryClient = useQueryClient()

  const {data:notification} = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications")

        const data = await res.json()

        if(!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }

        return data
      } catch (error) {
        throw new Error(error.message)
      }
    }

  })
 const {mutate: deleteNotification, isPending} = useMutation({
  mutationFn: async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE"
      })

      const data = await res.json()

      if(!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      return data
    } catch (error) {
      throw new Error(error.message)
    }
  },

  onSuccess: () => {
    toast.success("Notifications deleted successfully")
    queryClient.invalidateQueries({queryKey: ["notifications"]})
  }
 })

 const handleDeleteNotifications = () => {
  deleteNotification()
 }


  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold">Notifications</p>
        <div className="dropdown dropdown-left">
          <div tabIndex={0} role="button" className="m-1">
            <IoSettingsOutline className="w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={handleDeleteNotifications}>Delete all notifications</a>
            </li>
          </ul>
        </div>
      </div>

      {isPending && (
        <div className="flex justify-center h-full items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {notification?.length === 0 && (
        <div className="text-center p-4 font-bold">No notifications</div>
      )}

      {notification?.map((notification) => (
        <div className="border-b border-gray-700" key={notification.
// @ts-ignore
        _id}>
          <div className="flex gap-2 p-4">
            {notification.type === "follow" && (
              <FaUser className="w-7 h-7 text-primary" />
            )}

            {notification.type === "like" && (
              <FaHeart className="w-7 h-7 text-red-500" />
            )}

            <Link to={`/profile/${notification.from.username}`}>
              <div className="avatar">
                <div className="w-8 rounded-full ">
                    <img src={notification.from.profileImg || "/avatar-placeholder.png"}/>
                </div>
              </div>

              <div className="flex gap-1">
                <span className="font-bold">@{notification.from.username}</span>
                {notification.type === "follow" ? "followed you" : "liked your post"}
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
