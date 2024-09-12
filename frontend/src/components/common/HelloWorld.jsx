import { useQuery } from '@tanstack/react-query';
import React from 'react'

const HelloWorld = ({ post }) => {

    const {
        data: commentsObject,
        error,
        isLoading,
      } = useQuery({
        queryKey: ["getComments", post._id],
        queryFn: async () => {
          try {
            console.log("comments Fetch called");
            const res = await fetch(`/api/posts/moreComments/${post._id}`);
            console.log("Before Fetch called");
    
            const data = await res.json();
    
            if (!res.ok) {
              throw new Error(data.error);
            }
    
            console.log("commentsObject is here", data);
    
            return data;
          } catch (error) {
            console.log("error in query:", error);
            throw new Error(error.message);
          }
        },
      });

      const comments = commentsObject?.comments
    
  return (
    <div>HelloWorld: {comments}</div>
  )
}

export default HelloWorld