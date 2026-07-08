import { useState } from 'react'
import Image from '../Image/Image'
import apiRequest from '../../utils/apiRequest'
import { useNavigate } from 'react-router'
import UseAuthStore from '../../utils/authStore'
import { Link } from 'react-router'
import { HiChevronDown, HiArrowRightOnRectangle, HiUser, HiCog6Tooth, HiShieldCheck } from 'react-icons/hi2'

function UserButton() {
  const { currentUser, removeCurrentUser } = UseAuthStore()
  const [open, setopen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiRequest.post("/api/auth/logout", {})
    } finally {
      removeCurrentUser()
      navigate("/auth")
    }
  }

  return currentUser ? (
    <div className="relative max-[475px]:hidden">
      <button
        onClick={() => setopen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-[20px] border border-line bg-panel/80 py-1.5 pl-1.5 pr-3 transition-all hover:border-accent/30 hover:bg-panel-hover"
      >
        <Image
          path={currentUser.img || '/general/noAvatar.png'}
          alt="avatar"
          className="h-9 w-9 rounded-xl object-cover ring-2 ring-accent/20"
        />
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-fog lg:block">
          {currentUser.displayName || currentUser.userName}
        </span>
        <HiChevronDown size={14} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setopen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-2xl border border-line glass p-1.5 shadow-2xl shadow-black/50">
            <Link
              to={`/${currentUser.userName}`}
              onClick={() => setopen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fog transition-colors hover:bg-panel-hover"
            >
              <HiUser size={16} className="text-muted" /> Profile
            </Link>
            {currentUser.role === 'admin' && (
              <a
                href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'}
                target="_blank"
                rel="noreferrer"
                onClick={() => setopen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent-soft"
              >
                <HiShieldCheck size={16} /> Admin Panel
              </a>
            )}
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-fog transition-colors hover:bg-panel-hover cursor-pointer">
              <HiCog6Tooth size={16} className="text-muted" /> Settings
            </div>
            <div className="my-1 h-px bg-line" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <HiArrowRightOnRectangle size={16} /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <Link
      to="/auth"
      className="btn-primary hidden px-5 py-3 text-sm max-[475px]:inline-flex sm:inline-flex"
    >
      Sign in
    </Link>
  )
}

export default UserButton
