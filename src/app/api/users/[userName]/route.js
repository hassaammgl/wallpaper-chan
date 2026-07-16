export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Follow from "@/lib/models/follow.model";
import { getSession } from "@/lib/getSession";
import { findUserByUserName } from "@/lib/users";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { userName } = await params;

    const userData = await findUserByUserName(userName);
    if (!userData) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const followerCounts = await Follow.countDocuments({
      following: userData.id,
    });
    const followingCounts = await Follow.countDocuments({
      follower: userData.id,
    });

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
      displayName: userData.displayName,
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
