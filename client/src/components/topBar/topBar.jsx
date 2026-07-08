import UserButton from '../userButton/userButton'
import { HiMagnifyingGlass, HiSparkles } from 'react-icons/hi2'
import { useNavigate } from 'react-router'

function TopBar() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = e.target[0].value.trim()
    if (value) navigate(`/search?search=${value}`)
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-4 py-5">
      <form
        onSubmit={handleSubmit}
        className="group flex flex-1 items-center gap-3 rounded-[20px] border border-line bg-panel/60 px-5 py-3.5 transition-all focus-within:border-accent/40 focus-within:glow-ring"
      >
        <HiMagnifyingGlass size={20} className="text-muted transition-colors group-focus-within:text-accent" />
        <input
          type="text"
          placeholder="Search wallpapers, tags, artists..."
          className="flex-1 bg-transparent text-base text-fog outline-none placeholder:text-muted"
        />
        <kbd className="hidden rounded-lg border border-line bg-canvas px-2 py-0.5 font-mono text-[10px] text-muted sm:inline">
          /
        </kbd>
      </form>

      <div className="hidden items-center gap-2 rounded-[20px] border border-line bg-panel/60 px-4 py-3 text-sm text-muted md:flex">
        <HiSparkles size={16} className="text-lime" />
        <span>Discover</span>
      </div>

      <UserButton />
    </header>
  )
}

export default TopBar
