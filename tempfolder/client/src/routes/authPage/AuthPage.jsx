import Image from '../../components/Image/Image'
import { useState } from 'react'
import { useNavigate } from "react-router"
import apiRequest from "../../utils/apiRequest"
import UseAuthStore from '../../utils/authStore'

function AuthPage() {
  const [isRegister , setIsRegister] = useState(false)
  const [error , setError] = useState("")
  const navigate = useNavigate()
  const {setCurrentUser} =  UseAuthStore()

  const handleSubmit = async (e)=>{
       e.preventDefault()
       const formData = new FormData(e.target)
       const data = Object.fromEntries(formData)

      try {
        const res = await apiRequest.post(`/users/auth/${isRegister ? "register" : "login"}` , data)
        setCurrentUser(res.data)
        navigate("/")
      } catch(err){
        setError(err.response.data.message)
      }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8 p-8 rounded-[32px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
        <div className="">
          <Image path='/general/logo.png' alt="" />
          <h1 className="font-normal">{isRegister ? "Create an account" : "Login to Pinterset"}</h1>
        </div>

        {isRegister ? (
          <form key="register" onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor='userName' className="text-sm">username</label>
              <input type="userName" placeholder='username' id='userName' required name='userName'
                className="p-4 border-2 border-[#e0e0e0] rounded-2xl" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="displayName" className="text-sm">Name</label>
              <input type="displayName" placeholder="Name" required name="displayName" id="displayName"
                className="p-4 border-2 border-[#e0e0e0] rounded-2xl" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <input type="email" placeholder="Email" required name="email" id="email"
                className="p-4 border-2 border-[#e0e0e0] rounded-2xl" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm">Password</label>
              <input type="password" placeholder="Password" required name="password" id="password"
                className="p-4 border-2 border-[#e0e0e0] rounded-2xl" />
            </div>
            <button type="submit" className="bg-[#e50829] p-4 border-none rounded-[32px] text-white cursor-pointer font-bold">Register</button>
            <p onClick={() => setIsRegister(false)} className="text-sm text-center cursor-pointer">
              Do you have an account? <b>Login</b>
            </p>
            {error && <p className="text-[#e50829]">{error}</p>}
          </form>
        ) : (
          <form key="loginForm" onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <input type="email" placeholder="Email" required name="email" id="email"
                className="p-4 border-2 border-[#e0e0e0] rounded-2xl" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm">Password</label>
              <input type="password" placeholder="Password" required name="password" id="password"
                className="p-4 border-2 border-[#e0e0e0] rounded-2xl" />
            </div>
            <button type="submit" className="bg-[#e50829] p-4 border-none rounded-[32px] text-white cursor-pointer font-bold">Login</button>
            <p onClick={() => setIsRegister(true)} className="text-sm text-center cursor-pointer">
              Don&apos;t have an account? <b>Register</b>
            </p>
            {error && <p className="text-[#e50829]">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthPage
