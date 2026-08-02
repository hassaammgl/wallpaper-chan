"use client";

import { useRouter } from "next/navigation";
import Image from "@/components/Image/Image";
import ShareButton from "@/components/ShareButton";
import OptionsMenu from "@/components/OptionsMenu";
import FollowButton from "@/components/profile/FollowButton";
import apiRequest from "@/lib/apiRequest";
import { shareContent } from "@/lib/share";
import { HiLink, HiFlag, HiUserPlus, HiPencilSquare } from "react-icons/hi2";

function ProfileHeader({ data, isOwner, currentUser, onRefresh }) {
  const router = useRouter();

  return (
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
          {!isOwner && (
            <FollowButton
              isFollowing={data.isFollowing}
              userName={data.userName}
              onFollowChange={onRefresh}
            />
          )}
          <ShareButton
            title={data.displayName || data.userName}
            text={`Check out @${data.userName} on Wallpaper-chan`}
            url={`/${data.userName}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-panel-hover hover:text-fog disabled:opacity-50"
          />
          <OptionsMenu
            align="right"
            buttonClassName="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-panel-hover hover:text-fog"
            items={[
              {
                label: "Copy profile link",
                icon: <HiLink size={16} />,
                onClick: async () => {
                  await shareContent({
                    title: data.displayName || data.userName,
                    text: `Check out @${data.userName} on Wallpaper-chan`,
                    url: `/${data.userName}`,
                  });
                },
              },
              !isOwner && {
                label: data.isFollowing ? "Following" : "Follow",
                icon: <HiUserPlus size={16} />,
                onClick: async () => {
                  if (!currentUser) {
                    router.push("/auth");
                    return;
                  }
                  try {
                    await apiRequest.post(`/api/users/follow/${data.userName}`);
                    onRefresh();
                  } catch {
                    // ignore
                  }
                },
              },
              isOwner && {
                label: "Edit profile",
                icon: <HiPencilSquare size={16} />,
                onClick: () => router.push("/settings"),
              },
              !isOwner && {
                label: "Report user",
                icon: <HiFlag size={16} />,
                onClick: () => alert("Thanks — report noted"),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
