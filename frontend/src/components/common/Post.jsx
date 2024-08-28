// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegBookmark, FaRegComment, FaTrash } from "react-icons/fa";
import { GoHeartFill } from "react-icons/go";
import { BiRepost } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { useRef } from "react";

import { format } from "date-fns";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");

      //invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: (updatedLikes) => {
      // This is not the best user experience bcz it will refetch all posts
      // queryClient.invalidateQueries({ queryKey: ["posts"] });

      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              likes: updatedLikes,
            };
          }

          return p;
        });
      });
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: (updatedComments) => {
      setComment('')
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, comments: updatedComments };
          }

          return p;
        });
      });
    },
  });

  const postOwner = post.user;

  const isLiked = post.likes.includes(authUser._id);

  const isMyPost = authUser._id === post.user._id;
  const formattedDate = "1h";

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = (e) => {
    if (isLiking) return;
    likePost();
  };

  console.log(postOwner);

  if (!postOwner) {
    return <p>Post owner information is missing.</p>;
  }

  const commentsRef = useRef(null);

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [post.comments]);

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link
          to={`/profile/${postOwner.username}`}
          className="w-8 rounded-full overflow-hidden"
        >
          <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
        </Link>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner.username}`} className="font-bold">
            {postOwner.fullName}
          </Link>

          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username}`}>
              @{postOwner.username}
            </Link>
            <span>.</span>
            <span>{formattedDate}</span>
          </span>

          {isMyPost && (
            <span className="flex justify-end flex-1">
              {!isDeleting && (
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              )}

              {isDeleting && <LoadingSpinner size="sm" />}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
            />
          )}
        </div>

        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() =>
                document.getElementById("comments_modal" + post._id).showModal()
              }
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {post.comments.length}
              </span>
            </div>

            <dialog
              id={`comments_modal${post._id}`}
              className="modal border-none outline-none"
            >
              <div className="modal-box rounded border border-gray-600">
                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                <div
                  className="flex flex-col gap-3 max-h-60 overflow-auto"
                  ref={commentsRef}
                >
                  {post.comments.length === 0 && (
                    <p>No comments yet 🤔 Be the first one 😉</p>
                  )}

                  {post.comments.map((comment) => {
                    console.log("here is time:", comment.createdAt)
                    let formattedTime = "Invalid Date";

                    if (comment.createdAt) {
                      try {
                        formattedTime = format(
                          new Date(comment.createdAt),
                          "MMMM yyyy"
                        )
                      } catch (error) {
                        console.error("Date formatting error:", error);
                      }
                    }

                    return (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>

                            <span className="text-gray-700 text-sm">
                              @{comment.user.username}
                            </span>

                            <span className="text-gray-500 text-xs">
                              • {formattedTime}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form
                  className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                  onSubmit={handlePostComment}
                >
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                    {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                  </button>
                </form>
              </div>

              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">Close</button>
              </form>
            </dialog>

            <div className="flex gap-1 items-center cursor-pointer group">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">
                0
              </span>
            </div>

            {isLiking && <LoadingSpinner size="sm" />}

            {!isLiking && (
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={handleLikePost}
              >
                {!isLiked && !isLiking && (
                  <GoHeartFill className="w-[18px] h-[18px] cursor-pointer text-slate-500 group-hover:text-pink-600" />
                )}

                {isLiked && !isLiking && (
                  <GoHeartFill className="w-[18px] h-[18px] cursor-pointer text-pink-600" />
                )}

                <span
                  className={`text-sm  group-hover:text-pink-600 ${
                    isLiked ? "text-pink-600 " : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            )}
          </div>

          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
