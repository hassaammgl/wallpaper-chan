export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Pin from "@/lib/models/pin.model";
import Follow from "@/lib/models/follow.model";
import { getSession } from "@/lib/getSession";
import { getAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { userName } = await params;

    const user = await getAuth().api.listUsers({
      query: { userName },
    });

    if (!user || !user.users || user.users.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userData = user.users[0];
    const followerCounts = await Follow.countDocuments({ following: userData.id });
    const followingCounts = await Follow.countDocuments({ follower: userData.id });

    const session = await getSession();
    let isFollowing = false;
    if (session) {
      isFollowing = !!(await Follow.findOne({
        follower: session.user.id,
        following: userData.id,
      }));
    }

    return Response.json({
      _id: userData.id,
      displayName: userData.displayName || userData.name,
      userName: userData.userName,
      img: userData.img,
      followerCounts,
      followingCounts,
      isFollowing,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
