import React from 'react'
import Image from '../Image/Image'
import { useQuery } from '@tanstack/react-query'
import apiRequest from '../../utils/apiRequest'
import {format} from "timeago.js";
import { Link } from 'react-router'

function Boards({userId}) {
  const {isPending , error , data} = useQuery({
    queryKey: ["boards" , userId],
    queryFn: ()=>apiRequest.get(`/boards/${userId}`).then((res)=>res.data)
  })
  if(isPending) return "Loading..."
  if(error) return "An error has occurred: " + error.message

  console.log(data)

  return (
    <div className="w-[calc(100%-100px)] grid grid-cols-7 gap-4 gap-y-[50px] mr-[50px]">
      {data?.map((board)=>(
        <Link
          to={`/search?boardId=${board._id}`}
          className="mb-8 cursor-pointer" key={board._id}>
          <Image src={board.firstPin?.media} alt="" className="w-full h-full object-cover rounded-2xl"/>
          <div className="flex flex-col gap-[5px]">
            <h1 className="text-base font-medium">{board.title}</h1>
            <span className="text-gray-500 text-sm mb-[0.5cm]">{board.pinCount} Pins . {format(board.createdAt)} </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Boards;
