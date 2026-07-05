import React from 'react'
import Image from '../Image/Image';
import { format } from 'timeago.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiRequest from '../../utils/apiRequest';
import { HiTrash } from 'react-icons/hi2';

function Comment({comment , pinId}) {
  const deleteComment = async (id)=>{
    const res = await apiRequest.delete(`/comments/${id}`);
    return res.data;
  }

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn : deleteComment,
    onSuccess : ()=>{
      queryClient.invalidateQueries({queryKey: ["comments" , pinId]});
    }
  })
  const handleDelete = (id)=>{
    mutation.mutate(id);
  }

  return (
    <div className="flex items-start justify-between w-full" key={comment._id}>
      <div className="flex gap-[10px] flex-1">
        <Image path={comment.user.img || "/general/noAvatar.png"} alt="" className="w-8 h-8 rounded-full object-cover"/>
        <div className="flex flex-col gap-[4px]">
          <span className="font-medium text-sm">{comment.user.displayName}</span>
          <p className="text-sm">{comment.description}</p>
          <span className="text-xs text-gray-500">{format(comment.createdAt.trim())}</span>
        </div>
      </div>
      <div onClick={()=>handleDelete(comment._id)} className="cursor-pointer">
        <HiTrash size={16}/>
      </div>
    </div>
  )
}

export default Comment
