import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import apiRequest from '../../utils/apiRequest'

const followUser = async(userName)=>{
  const res = await apiRequest.post(`/users/follow/${userName}`)
  return res.data
}

function FollowButton({isFollowing , userName}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: followUser , 
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["profile" , userName]})
    }
  })
  return (
    <div>
      <button onClick={()=>mutation.mutate(userName)} disabled={mutation.isPending}
        className="rounded-[32px] border-none p-4 font-bold cursor-pointer bg-[#cf1010] text-white hover:bg-[#840d0d] disabled:opacity-50 disabled:cursor-not-allowed">
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  )
}

export default FollowButton
