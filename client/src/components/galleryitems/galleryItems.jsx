import React from 'react'
import { Link } from 'react-router'
import Image from '../Image/Image'
import { HiShare, HiEllipsisHorizontal } from 'react-icons/hi2'

function GalleryItem({item}) {
  const optimizedHeight =(372 * item.height)/item.width
  return (
    <div className="flex relative group" style={{gridRowEnd:`span ${Math.ceil(item.height/100)}`}}>
      <Image path={item.media} w={372} h={optimizedHeight} alt="" className="w-full rounded-2xl object-cover" />
      <Link to={`/pins/${item._id}`} className="hidden group-hover:block absolute w-full h-full top-0 left-0 bg-black/30 rounded-2xl"/>
      <button className="hidden group-hover:block bg-[#e50829] text-white rounded-3xl px-4 py-3 font-medium cursor-pointer w-max absolute top-4 right-4 border-none"> Save </button>
      <div className="hidden group-hover:flex absolute bottom-4 right-4 items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-none cursor-pointer hover:bg-[#f1f1f1]">
          <HiShare size={20}/>
        </button>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-none cursor-pointer hover:bg-[#f1f1f1]">
          <HiEllipsisHorizontal size={20}/>
        </button>
      </div>
    </div>
  )
}

export default GalleryItem
