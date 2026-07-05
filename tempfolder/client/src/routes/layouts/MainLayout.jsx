import React from 'react'
import LeftBar from '../../components/leftBar/leftBar'
import TopBar from '../../components/topBar/topBar'
import { Outlet } from 'react-router'

function MainLayout() {
  return (
    <div className="flex w-full gap-4 m-[3px]">
      <LeftBar/>
      <div className="flex flex-col flex-1 mr-4 ml-[100px] h-screen">
        <TopBar/>
        <Outlet/>
      </div>
    </div>
  )
}

export default MainLayout
