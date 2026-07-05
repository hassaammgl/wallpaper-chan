import React from 'react'
import UserButton from '../userButton/userButton'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { useNavigate } from 'react-router'
function TopBar() {
  const navigate = useNavigate()
  const handleSubmit = (e)=>{
    e.preventDefault()
    navigate(`/search?search=${e.target[0].value}`)
  }
  return (
    <div className="flex items-center gap-4 sticky top-0 z-[900]">
      <form onSubmit={handleSubmit} className="flex-1 bg-[#f1f1f1] p-4 rounded-2xl flex items-center gap-4 hover:bg-[#e1dada]">
        <HiMagnifyingGlass size={20} className="text-gray-500"/>
        <input type='text' placeholder='Search' className="flex-1 bg-transparent border-none outline-none text-lg"/>
      </form>
      <UserButton/>
    </div>
  )
}

export default TopBar
