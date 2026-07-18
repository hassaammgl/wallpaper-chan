export const dynamic = "force-dynamic";

import connectDB from "@/lib/db";
import Conversation from "@/lib/models/conversation.model";
import Message from "@/lib/models/message.model";
import { getSession } from "@/lib/getSession";
import { enrichWithUsers } from "@/lib/users";

async function getOwnedConversation(id, userId) {
  const conversation = await Conversation.findById(id);
  if (!conversation) return null;
  if (!conversation.participants.includes(userId)) return false;
  return conversation;
}

export async function GET(_request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const conversation = await getOwnedConversation(id, session.user.id);

    if (conversation === null) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }
    if (conversation === false) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .limit(200);

    const withUsers = await enrichWithUsers(messages, {
      userField: "sender",
      fields: ["id", "displayName", "userName", "img"],
    });

    // Mark incoming as read
    await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: session.user.id },
        readBy: { $ne: session.user.id },
      },
      { $addToSet: { readBy: session.user.id } }
    );

    return Response.json({
      conversation: conversation.toObject(),
      messages: withUsers,
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const conversation = await getOwnedConversation(id, session.user.id);

    if (conversation === null) {
      return Response.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }
    if (conversation === false) {
      return Response.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { text } = await request.json();
    const trimmed = text?.trim();
    if (!trimmed) {
      return Response.json(
        { success: false, message: "Message text is required" },
        { status: 400 }
      );
    }
    if (trimmed.length > 2000) {
      return Response.json(
        { success: false, message: "Message is too long" },
        { status: 400 }
      );
    }

    const message = await Message.create({
      conversation: id,
      sender: session.user.id,
      text: trimmed,
      readBy: [session.user.id],
    });

    conversation.lastMessage = trimmed;
    conversation.lastMessageAt = message.createdAt;
    conversation.lastSender = session.user.id;
    await conversation.save();

    const [withUser] = await enrichWithUsers([message], {
      userField: "sender",
      fields: ["id", "displayName", "userName", "img"],
    });
    return Response.json(withUser, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return Response.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}
