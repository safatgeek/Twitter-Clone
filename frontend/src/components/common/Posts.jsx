import React, { useEffect } from 'react'
import PostSkeleton from '../skeletons/PostSkeleton'
import Post from './Post'
import { useQuery } from '@tanstack/react-query';

const Posts = ({ feedType, username, userId }) => {


  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "posts":
        return `/api/posts/user/${username}`;
      case "likes":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  }

  const POST_ENDPOINT = getPostEndpoint()
  console.log("Before fetched", POST_ENDPOINT)

  const { data:posts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        console.log("fetch called", POST_ENDPOINT)
        const res = await fetch(POST_ENDPOINT)
        const data = await res.json()

        if(!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
        console.log("Data is here",data)
        console.log("here is userId:::", userId, POST_ENDPOINT, feedType)
        return data
        
      } catch (error) {
        throw new Error(error)
      }
    },
  })

  useEffect(() => {
    refetch()
  }, [refetch, feedType, username, userId])

  
  return (
    <>
      {isLoading || isRefetching && (
        <div>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && <p>No post in this tab. Switch 👻</p>}

      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post}/>
          ))}
        </div>
      )}
    </>
  )
}

export default Posts