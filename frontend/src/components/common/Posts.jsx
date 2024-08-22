import React from 'react'
import PostSkeleton from '../skeletons/PostSkeleton'
import Post from './Post'
import { useQuery } from '@tanstack/react-query';

const Posts = ({ feedType }) => {

  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      default:
        return "/api/posts/all";
    }
  }

  const POST_ENDPOINT = getPostEndpoint()

  const {data:posts, isLoading} = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT)
        const data = await res.json()

        if(!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
        console.log("Data is here",data)
        return data
        
      } catch (error) {
        throw new Error(error)
      }
    }
  })

  
  return (
    <>
      {isLoading && (
        <div>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && <p>No post in this tab. Switch 👻</p>}

      {!isLoading && posts && (
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