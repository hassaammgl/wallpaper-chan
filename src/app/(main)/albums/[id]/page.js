"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Gallery from "@/components/gallery/gallery";
import Comments from "@/components/comments/Comments";
import AlbumFeedItem from "@/components/albums/AlbumFeedItem";
import AlbumHeader from "@/components/albums/AlbumHeader";
import apiRequest from "@/lib/apiRequest";

function AlbumPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await apiRequest.get(`/api/albums/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-danger py-12">{error}</p>;
  }

  if (!data) {
    return <p className="text-center text-muted py-12">Album not found</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-up">
      <AlbumHeader data={data} view={view} onViewChange={setView} />

      {view === "grid" && (
        data.pinCount > 0 ? (
          <Gallery boardId={id} userId={data.user} />
        ) : (
          <div className="rounded-[28px] border border-line glass py-16 text-center">
            <p className="text-muted">This album is empty</p>
            <p className="mt-1 text-sm text-muted">
              Publish wallpapers to this album from the create page
            </p>
          </div>
        )
      )}

      {view === "feed" && (
        <div className="space-y-5">
          {data.pins?.length > 0 ? (
            data.pins.map((pin) => <AlbumFeedItem key={pin._id} pin={pin} />)
          ) : (
            <div className="rounded-[28px] border border-line glass py-16 text-center">
              <p className="text-muted">No posts in this album yet</p>
            </div>
          )}
        </div>
      )}

      {view === "comments" && (
        <div className="rounded-[28px] border border-line glass p-6">
          <Comments albumId={id} />
        </div>
      )}
    </div>
  );
}

export default AlbumPage;
