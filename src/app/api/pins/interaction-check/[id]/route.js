export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Like from "@/lib/models/like.model";
import Save from "@/lib/models/save.model";
import { getSession } from "@/lib/getSession";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const session = await getSession();

    const likeCount = await Like.countDocuments({ pin: id });

    let isLiked = false;
    let isSaved = false;

    if (session) {
      isLiked = !!(await Like.findOne({ pin: id, user: session.user.id }));
      isSaved = !!(await Save.findOne({ pin: id, user: session.user.id }));
    }

    return Response.json({ likeCount, isLiked, isSaved });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to check interactions" },
      { status: 500 }
    );
  }
}
