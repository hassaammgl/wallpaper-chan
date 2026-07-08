import { useState } from 'react'
import Image from '../../components/Image/Image'
import Gallery from '../../components/gallery/gallery'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import apiRequest from '../../utils/apiRequest'
import Boards from '../../components/boards/Boards'
import FollowButton from "./followButton"
import { HiShare, HiEllipsisHorizontal } from 'react-icons/hi2'

function ProfilePage() {
  const [type, setType] = useState("saved")
  const { userName } = useParams()

  const { isPending, error, data } = useQuery({
    queryKey: ["profile", userName],
    queryFn: () => apiRequest.get(`/users/${userName}`).then((res) => res.data)
  })

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 animate-pulse">
        <div className="h-28 w-28 rounded-full bg-panel ring-2 ring-line" />
        <div className="h-8 w-48 rounded-xl bg-panel" />
        <div className="h-4 w-32 rounded-lg bg-panel" />
      </div>
    )
  }
  if (error) return <p className="text-center text-danger py-12">Error: {error.message}</p>
  if (!data) return <p className="text-center text-muted py-12">User not found</p>

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Profile header card */}
      <div className="relative overflow-hidden rounded-[28px] border border-line glass p-8 md:p-10">
        <div className="absolute inset-0 bg-linear-to-br from-parrot/10 via-transparent to-lime/8" />

        <div className="relative flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <Image
              w={112} h={112}
              path={data.img || "/general/noAvatar.png"}
              alt={data.displayName}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-accent/25 shadow-2xl shadow-accent/15"
            />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-panel bg-parrot" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-fog md:text-4xl">{data.displayName}</h1>
            <span className="mt-1 block font-mono text-sm text-muted">@{data.userName}</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-fog">{data.followerCounts}</p>
              <p className="text-muted">Followers</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center">
              <p className="text-xl font-bold text-fog">{data.followingCounts}</p>
              <p className="text-muted">Following</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-line bg-panel px-6 py-2.5 text-sm font-medium text-fog transition-colors hover:bg-panel-hover">
              Message
            </button>
            <FollowButton isFollowing={data.isFollowing} userName={data.userName} />
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-panel-hover hover:text-fog">
              <HiShare size={18} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-panel-hover hover:text-fog">
              <HiEllipsisHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-line bg-panel/50 p-1 w-fit">
        {['created', 'saved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setType(tab)}
            className={`rounded-xl px-6 py-2.5 text-sm font-medium capitalize transition-all ${
              type === tab
                ? 'bg-accent-soft text-accent shadow-sm'
                : 'text-muted hover:text-fog'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {type === "created" ? <Gallery userId={data._id} /> : <Boards userId={data._id} />}
    </div>
  )
}

export default ProfilePage
