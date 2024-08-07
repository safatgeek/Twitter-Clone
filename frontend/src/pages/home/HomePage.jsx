import React from 'react'
import CreatePost from './CreatePost'
import Posts from '../../components/common/Posts'

const HomePage = () => {
  return (
    <div>
      <CreatePost />
      <Posts />
    </div>
  )
}

export default HomePage