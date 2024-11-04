import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hook/useGetAllPost'
import useGetSuggestedUsers from '@/hook/useGetSuggestedUsers'

const Home = () => {
  useGetAllPost()
  useGetSuggestedUsers()
  return (
    <div className='flex'>
            <div className='flex-grow'>
                <Feed/>
                <Outlet />
            </div>
            <RightSidebar />
        </div>
  )
}

export default Home
