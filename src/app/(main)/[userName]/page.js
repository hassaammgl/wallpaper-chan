"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Gallery from "@/components/gallery/gallery";
import Albums from "@/components/albums/Albums";
import { SavedPins, HistoryFeed } from "@/components/albums/SavedHistory";
import ProfileHeader from "@/components/profile/ProfileHeader";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";

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
      <ProfileHeader
        data={data}
        isOwner={isOwner}
        currentUser={currentUser}
        onRefresh={fetchProfile}
      />

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
      {type === "albums" && <Albums userId={data._id} isOwner={isOwner} />}
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
