"use client";

import { useState, useEffect } from "react";
import apiRequest from "@/lib/apiRequest";
import Comment from "./comment";
import CommentForm from "./commentForm";

function Comments({ id }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      const res = await apiRequest.get(`/api/comments?pinId=${id}`);
      setComments(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-xl bg-panel" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-panel" />
              <div className="h-3 w-full rounded bg-panel" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error)
    return <p className="text-sm text-danger">Failed to load comments</p>;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {comments.length === 0
            ? "No comments yet"
            : `${comments.length} comment${comments.length > 1 ? "s" : ""}`}
        </span>
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            pinId={id}
            onDelete={(commentId) =>
              setComments((prev) => prev.filter((c) => c._id !== commentId))
            }
          />
        ))}
      </div>
      <CommentForm
        id={id}
        onAdd={(newComment) =>
          setComments((prev) => [newComment, ...prev])
        }
      />
    </div>
  );
}

export default Comments;
