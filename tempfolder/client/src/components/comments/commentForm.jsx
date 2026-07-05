import React from 'react'
import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';

import apiRequest from '../../utils/apiRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CommentForm({id}) {
  const [open,setOpen] = useState(false);
  const [desc , setDesc] = useState("");

  const handleEmojiClick = (emoji)=>{
      setDesc(prev=>prev+emoji.emoji);
      setOpen(false)
    }

  const addComment = async (comment) =>{
    const res = await apiRequest.post("/comments" , comment);
    return res.data;
  }

  const queyClient = useQueryClient()

  const mutation = useMutation({
     mutationFn : addComment , 
     onSuccess: ()=>{
      queyClient.invalidateQueries({queryKey: ["comments" , id]})
      setDesc("")
      setOpen(false)
     }
  })

  const handleSubmit = async (e)=>{
      e.preventDefault()
      mutation.mutate({
        description: desc,
        pin : id
      })
  }

  return (
    <form className="bg-[#f0f8ff] p-4 rounded-[32px] flex items-center gap-4" onSubmit={handleSubmit}>
      <input type='text' placeholder="Add a comment" 
        onChange={(e)=>setDesc(e.target.value)} 
        value={desc}
        className="flex-1 border-none outline-none bg-transparent text-base"
      />
      <div className="cursor-pointer text-xl relative">
        <div onClick={() => setOpen((prev) => !prev)}>😒</div>
        {open && (
          <div className="absolute bottom-12 right-0">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="15em" height="18em"/>
          </div>
        )}
      </div>
    </form>
  )
}

export default CommentForm;
