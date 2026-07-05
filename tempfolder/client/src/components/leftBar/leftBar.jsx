import React from 'react'
import Image from '../Image/Image'
import { Link } from 'react-router'
import { HiHome, HiPlusCircle, HiBell, HiChatBubbleLeftRight, HiCog6Tooth } from 'react-icons/hi2'

function LeftBar() {
  return (
    <div className="flex flex-col items-center justify-between h-screen fixed top-0 left-0 w-[72px] py-7 z-[1000] border-r border-[#e9e9e9]">
      <div className="flex flex-col items-center gap-[25px]">
        <Link to='/' className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-[#f1f1f1]">
          <Image path='/general/logo.png' alt='logo'/>
        </Link>
        <Link to='/' className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-[#f1f1f1]">
          <HiHome size={24}/>
        </Link>
        <Link to='/create' className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-[#f1f1f1]">
          <HiPlusCircle size={24}/>
        </Link>
        <Link to='/' className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-[#f1f1f1]">
          <HiBell size={24}/>
        </Link>
        <Link to='/' className="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-[#f1f1f1]">
          <HiChatBubbleLeftRight size={24}/>
        </Link>
      </div>
      <Link to='/'>
        <HiCog6Tooth size={24}/>
      </Link>
    </div>
  )
}

export default LeftBar
