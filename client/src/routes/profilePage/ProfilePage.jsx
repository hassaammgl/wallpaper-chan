import React, { useState } from 'react'
import Image from '../../components/Image/Image'
import Gallery from '../../components/gallery/gallery'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import apiRequest from '../../utils/apiRequest'
import Boards from '../../components/boards/Boards'
import FollowButton from  "./followButton"
import { HiShare, HiEllipsisHorizontal } from 'react-icons/hi2'

function ProfilePage() {
  const [type , setType] = useState("saved")
  const {userName} = useParams()

  const {isPending , error , data} = useQuery({
    queryKey:["profile",userName],
    queryFn: () => apiRequest.get(`/users/${userName}`).then((res)=>res.data)
  })

  if (isPending) return "Loading..."
  if(error) return "An error has occured: " + error.message
  if(!data) return "user not found!"

  console.log(data)

  return (
    <div className="flex flex-col items-center gap-[5px] mt-2">
      <Image w={100} h={100} path={data.img || "/general/noAvatar.png"} alt="data.displayName"
        className="rounded-full object-cover" />
      <h1 className="text-4xl font-medium">{data.displayName}</h1>
      <span className="font-light text-gray-500">@{data.userName}</span>
      <div className="font-medium">{data.followerCounts} . {data.followingCounts}</div>
      <div className="flex items-center gap-8">
        <HiShare size={20}/>
        <div className="flex gap-4">
          <button className="rounded-[32px] border-none p-4 font-bold cursor-pointer">Message</button>
          <FollowButton isFollowing={data.isFollowing} userName={data.userName}/>
        </div>
        <HiEllipsisHorizontal size={20}/>
      </div>
      <div className="flex gap-4 mt-8 mb-4 font-medium">
        <span onClick={() =>setType("created")}
          className={`cursor-pointer px-0 py-2 hover:text-gray-500 ${type==="created" ? "border-b-3 border-black" : ""}`}>Created</span>
        <span onClick={() =>setType("saved")}
          className={`cursor-pointer px-0 py-2 hover:text-gray-500 ${type==="saved" ? "border-b-3 border-black" : ""}`}>Saved</span>
      </div>
      {type==="created" ? <Gallery userId={data._id}/> : <Boards userId={data._id}/>}
    </div>
  )
}

export default ProfilePage
