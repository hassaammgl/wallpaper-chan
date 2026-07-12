"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";

function Boards({ userId }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await apiRequest.get(`/api/boards/${userId}`);
        setBoards(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-[3/4] rounded-[20px] bg-panel" />
            <div className="h-4 w-2/3 rounded bg-panel" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-danger">Failed to load boards</p>;

  if (!boards.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-line glass py-16 text-center">
        <p className="text-fog font-medium">No boards yet</p>
        <p className="text-sm text-muted">
          Saved collections will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {boards.map((board) => (
        <Link
          href={`/search?boardId=${board._id}`}
          key={board._id}
          className="group space-y-3"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] ring-1 ring-line transition-all group-hover:-translate-y-1 group-hover:ring-accent/30 group-hover:shadow-xl group-hover:shadow-accent/10">
            {board.firstPin?.media ? (
              <Image
                src={board.firstPin.media}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-panel">
                <span className="text-muted">Empty</span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div>
            <h3 className="truncate text-sm font-semibold text-fog">
              {board.title}
            </h3>
            <span className="text-xs text-muted">
              {board.pinCount} pins
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Boards;
