"use client";

function AdminPagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-muted">
        Page {page} of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl border border-line px-4 py-2 text-sm text-muted disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default AdminPagination;
