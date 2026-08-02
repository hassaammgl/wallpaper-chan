import Board from "@/lib/models/board.model";
import { getSession } from "@/lib/getSession";

/**
 * Returns album if viewer may access it, otherwise null + HTTP status.
 */
export async function getAccessibleAlbum(albumId) {
  if (!albumId) {
    return { album: null, status: 400, message: "Album id is required" };
  }

  const album = await Board.findById(albumId);
  if (!album) {
    return { album: null, status: 404, message: "Album not found" };
  }

  if (album.isPublic !== false) {
    return { album, status: 200 };
  }

  const session = await getSession();
  const isOwner = session?.user?.id === album.user;
  const isAdmin = session?.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    return { album: null, status: 403, message: "Album is private" };
  }

  return { album, status: 200, isOwner: true };
}

export function albumPinQuery(album) {
  const boardId = album._id.toString();
  return {
    user: album.user,
    $or: [{ board: boardId }, { board: album.title }],
  };
}
