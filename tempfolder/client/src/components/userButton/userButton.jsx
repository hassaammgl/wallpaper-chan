import React, { useState } from 'react'
import Image from '../Image/Image'
import apiRequest from '../../utils/apiRequest'
import { useNavigate } from 'react-router'
import UseAuthStore from '../../utils/authStore'
import { Link } from 'react-router'
import { HiChevronDown } from 'react-icons/hi2'

function UserButton() {
  const {currentUser , removeCurrentUser} =  UseAuthStore()
  console.log(currentUser)
  const [open , setopen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async ()=>{
    try{
      await apiRequest.post("/users/auth/logout" ,{} )
      removeCurrentUser()
      navigate("/auth")
    } catch(err){
      console.log(err)
    }
  }
  return currentUser ? (
    <div className="flex items-center gap-4 relative max-[475px]:hidden">
      <Image path={currentUser.img || '/general/noAvatar.png'} alt='avatar' className="w-9 h-9 rounded-full object-cover"/>
      <div onClick={()=>setopen((prev)=>!prev)} className="cursor-pointer">
        <HiChevronDown size={16}/>
      </div>
      {open && (
        <div className="absolute right-0 top-[120%] p-4 rounded-lg bg-white z-[999] flex flex-col text-sm shadow-[0px_0px_4px_1px_rgba(0,0,0,0.177)]">
          <Link to={`/profile${currentUser.userName}`} className="cursor-pointer p-2 rounded-lg hover:bg-[#f1f1f1] hover:text-gray-500">Profile</Link>
          <div className="cursor-pointer p-2 rounded-lg hover:bg-[#f1f1f1] hover:text-gray-500">Setting</div>
          <div className="cursor-pointer p-2 rounded-lg hover:bg-[#f1f1f1] hover:text-gray-500" onClick={handleLogout}>Logout</div>
        </div>
      )}
    </div>
  ) : (
    <Link to='/auth' className="text-lg px-4 py-4 rounded-[32px] hover:bg-[#f1f1f1]">
      Login/signup
    </Link>
  )
}

export default UserButton
