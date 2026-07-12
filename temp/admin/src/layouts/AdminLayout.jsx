import { NavLink, Outlet, useNavigate } from 'react-router'
import useAuthStore from '../utils/authStore'
import apiRequest from '../utils/apiRequest'
import {
  HiChartBarSquare,
  HiUsers,
  HiPhoto,
  HiChatBubbleLeftRight,
  HiArrowRightOnRectangle,
  HiShieldCheck,
  HiCog6Tooth,
} from 'react-icons/hi2'

const navItems = [
  { to: '/', label: 'Overview', icon: HiChartBarSquare, end: true },
  { to: '/users', label: 'Users', icon: HiUsers },
  { to: '/pins', label: 'Pins', icon: HiPhoto },
  { to: '/comments', label: 'Comments', icon: HiChatBubbleLeftRight },
  { to: '/settings', label: 'Upload CDN', icon: HiCog6Tooth },
]

function AdminLayout() {
  const { currentUser, removeCurrentUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiRequest.post('/api/auth/logout')
    } finally {
      removeCurrentUser()
      navigate('/login')
    }
  }

  return (
    <div className="mesh-bg flex min-h-screen">
      <aside className="fixed top-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-line glass">
        <div className="border-b border-line p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <HiShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-fog">Admin Panel</p>
              <p className="text-[11px] text-muted">Wallpaper-chan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-muted hover:bg-panel-hover hover:text-fog'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <p className="mb-3 truncate text-xs text-muted">
            <span className="text-fog">{currentUser?.displayName}</span>
            <br />{currentUser?.email}
          </p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
          >
            <HiArrowRightOnRectangle size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
