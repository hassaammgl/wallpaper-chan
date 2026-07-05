import React from 'react'
import Image from '../../components/Image/Image'
import PostInteractions from '../../components/postInteractions/PostInteractions'
import Comments from '../../components/comments/Comments'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import apiRequest from '../../utils/apiRequest'

function PostPage() {
  const {id} = useParams()

  const {isPending , error , data} = useQuery({
    queryKey:["pin",id],
    queryFn: () => apiRequest.get(`/pins/${id}`).then((res)=>res.data)
  })

  if (isPending) return "Loading..."
  if(error) return "An error has occured: " + error.message
  if(!data) return "pin not found!"

  console.log(data)

  return (
    <div className="flex justify-center gap-8 m-9">
      <svg height="20"
        viewBox='0 0 24 24'
        width="20"
        style={{ cursor: "pointer" , width: "24px", height: "24px" }}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
      <div className="w-[70%] max-h-[520px] flex border border-[#e9e9e9] rounded-[32px] overflow-hidden max-[1127px]:w-full max-[1127px]:mr-4 max-[751px]:flex-col max-[751px]:max-h-none">
        <div className="flex-1 bg-[#e9e9e9] flex w-full h-full justify-center items-center">
          <Image path={data.media} alt="" w={736} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-1 h-full flex flex-col gap-8 p-4 overflow-hidden">
          <PostInteractions postId={id}/>
          {data?.user ? (
            <Link to={`/${data.user.userName}`} className="flex items-center gap-2">
              <Image path={data.user.img || "/general/noAvatar.png"} className="w-8 h-8 rounded-full" />
              <span className="text-sm">{data.user.displayName}</span>
            </Link>
          ) : (
            <span>Loading user info...</span>
          )}
          <Comments id={data._id}/>
        </div>
      </div>
    </div>
  )
}

export default PostPage
