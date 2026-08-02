"use client";

import { useState } from "react";
import apiRequest from "@/lib/apiRequest";

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

export default FollowButton;
