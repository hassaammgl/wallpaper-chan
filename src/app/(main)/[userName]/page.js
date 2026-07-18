"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "@/components/Image/Image";
import Gallery from "@/components/gallery/gallery";
import Albums from "@/components/albums/Albums";
import { SavedPins, HistoryFeed } from "@/components/albums/SavedHistory";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import ShareButton from "@/components/ShareButton";
import { HiEllipsisHorizontal } from "react-icons/hi2";

function FollowButton({ isFollowing, userName, onFollowChange }) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.post(`/api/users/follow/${userName}`);
      setFollowing(res.data.following);
      onFollowChange?.();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
        following
          ? "border border-line bg-panel text-fog hover:bg-panel-hover"
          : "btn-primary"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

const TABS = [
  { key: "created", label: "Created" },
  { key: "albums", label: "Albums" },
  { key: "saved", label: "Saved" },
  { key: "history", label: "History" },
];

function ProfilePage() {
  const { userName } = useParams();
  const searchParams = useSearchParams();
  const { currentUser } = useAuthStore();
  const tabParam = searchParams.get("tab");
  const initialTab = TABS.some((t) => t.key === tabParam) ? tabParam : "created";
  const [type, setType] = useState(initialTab);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwner = currentUser?.id === data?._id;

  const visibleTabs = TABS.filter(
    (tab) => tab.key === "created" || tab.key === "albums" || isOwner
  );

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest.get(`/api/users/${userName}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userName]);

  useEffect(() => {
    if (TABS.some((t) => t.key === tabParam)) {
      setType(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (!isOwner && (type === "saved" || type === "history")) {
      setType("created");
    }
  }, [isOwner, type]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 animate-pulse">
        <div className="h-28 w-28 rounded-full bg-panel ring-2 ring-line" />
        <div className="h-8 w-48 rounded-xl bg-panel" />
        <div className="h-4 w-32 rounded-lg bg-panel" />
      </div>
    );
  }

  if (error) return <p className="text-center text-danger py-12">Error: {error}</p>;
  if (!data) return <p className="text-center text-muted py-12">User not found</p>;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="relative overflow-hidden rounded-[28px] border border-line glass p-8 md:p-10">
        <div className="absolute inset-0 bg-linear-to-br from-parrot/10 via-transparent to-lime/8" />

        <div className="relative flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <Image
              w={112}
              h={112}
              path={data.img || "/general/noAvatar.svg"}
              alt={data.displayName}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-accent/25 shadow-2xl shadow-accent/15"
            />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-panel bg-parrot" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-fog md:text-4xl">
              {data.displayName}
            </h1>
            <span className="mt-1 block font-mono text-sm text-muted">
              @{data.userName}
            </span>
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
            {!isOwner && (
              <FollowButton
                isFollowing={data.isFollowing}
                userName={data.userName}
                onFollowChange={fetchProfile}
              />
            )}
            <ShareButton
              title={data.displayName || data.userName}
              text={`Check out @${data.userName} on Wallpaper-chan`}
              url={`/${data.userName}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-panel-hover hover:text-fog disabled:opacity-50"
            />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-panel-hover hover:text-fog"
              aria-label="More options"
            >
              <HiEllipsisHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-2xl border border-line bg-panel/50 p-1 w-fit">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setType(tab.key)}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              type === tab.key
                ? "bg-accent-soft text-accent shadow-sm"
                : "text-muted hover:text-fog"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {type === "created" && <Gallery userId={data._id} />}
      {type === "albums" && (
        <Albums userId={data._id} isOwner={isOwner} />
      )}
      {type === "saved" && isOwner && <SavedPins userId={data._id} />}
      {type === "history" && isOwner && <HistoryFeed userId={data._id} />}
    </div>
  );
}

export default function ProfilePageWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 py-12 animate-pulse">
          <div className="h-28 w-28 rounded-full bg-panel ring-2 ring-line" />
          <div className="h-8 w-48 rounded-xl bg-panel" />
          <div className="h-4 w-32 rounded-lg bg-panel" />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}
