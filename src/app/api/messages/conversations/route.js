export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Conversation from "@/lib/models/conversation.model";
import Message from "@/lib/models/message.model";
import { getSession } from "@/lib/getSession";
import { findUserById, findUserByUserName } from "@/lib/users";

function pairKey(a, b) {
  return [String(a), String(b)].sort();
}

async function enrichConversation(doc, currentUserId) {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const otherId = plain.participants.find((id) => id !== currentUserId);
  const otherUser = await findUserById(otherId);
  const unreadCount = await Message.countDocuments({
    conversation: plain._id.toString(),
    sender: { $ne: currentUserId },
    readBy: { $ne: currentUserId },
  });

  return {
    ...plain,
    otherUser,
    unreadCount,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = session.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ lastMessageAt: -1 });

    const enriched = await Promise.all(
      conversations.map((c) => enrichConversation(c, userId))
    );

    return Response.json(enriched);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return Response.json(
      { success: false, message: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { userId, userName } = body;

    let other = null;
    if (userId) other = await findUserById(userId);
    else if (userName) other = await findUserByUserName(userName);

    if (!other) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (other.id === session.user.id) {
      return Response.json(
        { success: false, message: "Cannot message yourself" },
        { status: 400 }
      );
    }

    if (other.blocked) {
      return Response.json(
        { success: false, message: "User unavailable" },
        { status: 403 }
      );
    }

    const participants = pairKey(session.user.id, other.id);
    const participantKey = participants.join(":");
    let conversation = await Conversation.findOne({ participantKey });
    let created = false;

    if (!conversation) {
      try {
        conversation = await Conversation.create({
          participants,
          participantKey,
          lastMessage: "",
          lastMessageAt: new Date(),
        });
        created = true;
      } catch (err) {
        if (err?.code === 11000) {
          conversation = await Conversation.findOne({ participantKey });
        } else {
          throw err;
        }
      }
    }

    if (!conversation) {
      return Response.json(
        { success: false, message: "Failed to start conversation" },
        { status: 500 }
      );
    }

    const enriched = await enrichConversation(conversation, session.user.id);
    return Response.json(enriched, { status: created ? 201 : 200 });
  } catch (error) {
    console.error("Failed to start conversation:", error);
    return Response.json(
      { success: false, message: "Failed to start conversation" },
      { status: 500 }
    );
  }
}
