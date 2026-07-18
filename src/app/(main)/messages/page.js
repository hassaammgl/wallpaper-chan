"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "@/components/Image/Image";
import apiRequest from "@/lib/apiRequest";
import useAuthStore from "@/stores/authStore";
import {
  HiChatBubbleLeftRight,
  HiPaperAirplane,
  HiArrowLeft,
} from "react-icons/hi2";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuthStore();
  const targetUser = searchParams.get("user");

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeOther, setActiveOther] = useState(null);
  const [text, setText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!currentUser) router.push("/auth");
  }, [currentUser, router]);

  const loadConversations = useCallback(async () => {
    try {
      const res = await apiRequest.get("/api/messages/conversations");
      setConversations(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load conversations");
      return [];
    } finally {
      setLoadingList(false);
    }
  }, []);

  const openConversation = useCallback(async (id, otherUser) => {
    if (!id) return;
    setActiveId(id);
    setActiveOther(otherUser || null);
    setMobileShowChat(true);
    setLoadingThread(true);
    setError("");
    try {
      const res = await apiRequest.get(`/api/messages/conversations/${id}`);
      setMessages(res.data.messages || []);
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  const startWithUser = useCallback(
    async (userName) => {
      try {
        const res = await apiRequest.post("/api/messages/conversations", {
          userName,
        });
        const convo = res.data;
        setConversations((prev) => {
          const without = prev.filter((c) => c._id !== convo._id);
          return [convo, ...without];
        });
        await openConversation(convo._id, convo.otherUser);
        router.replace("/messages");
      } catch (err) {
        setError(err.response?.data?.message || "Could not start conversation");
      }
    },
    [openConversation, router]
  );

  useEffect(() => {
    if (!currentUser) return;
    loadConversations().then((list) => {
      if (targetUser) {
        startWithUser(targetUser);
        return;
      }
      if (list.length && !activeId) {
        // keep empty selection on desktop until user picks
      }
    });
  }, [currentUser, targetUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeId) return;

    const refresh = async () => {
      try {
        const res = await apiRequest.get(
          `/api/messages/conversations/${activeId}`
        );
        setMessages(res.data.messages || []);
        await loadConversations();
      } catch {
        // ignore poll errors
      }
    };

    pollRef.current = window.setInterval(refresh, 8000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [activeId, loadConversations]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeId || !text.trim() || sending) return;
    setSending(true);
    const outgoing = text.trim();
    setText("");
    try {
      const res = await apiRequest.post(
        `/api/messages/conversations/${activeId}`,
        { text: outgoing }
      );
      setMessages((prev) => [...prev, res.data]);
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === activeId
            ? {
                ...c,
                lastMessage: outgoing,
                lastMessageAt: res.data.createdAt,
                lastSender: currentUser.id,
              }
            : c
        );
        return updated.sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });
    } catch (err) {
      setText(outgoing);
      setError(err.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
          <HiChatBubbleLeftRight size={14} />
          Messages
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-fog">Messages</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid h-[min(70vh,720px)] overflow-hidden rounded-[28px] border border-line glass lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <aside
          className={`flex flex-col border-line lg:border-r ${
            mobileShowChat ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-line px-4 py-3 text-sm font-medium text-fog">
            Inbox
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted">
                No conversations yet. Message someone from their profile.
              </div>
            ) : (
              conversations.map((convo) => {
                const other = convo.otherUser;
                const active = convo._id === activeId;
                return (
                  <button
                    key={convo._id}
                    type="button"
                    onClick={() => openConversation(convo._id, other)}
                    className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors ${
                      active
                        ? "bg-accent-soft/60"
                        : "hover:bg-panel-hover"
                    }`}
                  >
                    <Image
                      path={other?.img || "/general/noAvatar.svg"}
                      alt={other?.displayName || "User"}
                      w={44}
                      h={44}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-fog">
                          {other?.displayName || other?.userName || "Unknown"}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted">
                          {formatTime(convo.lastMessageAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="truncate text-xs text-muted">
                          {convo.lastMessage || "Say hello"}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="ml-auto shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Thread */}
        <section
          className={`flex min-h-0 flex-col ${
            mobileShowChat ? "flex" : "hidden lg:flex"
          }`}
        >
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel">
                <HiChatBubbleLeftRight size={28} className="text-muted" />
              </div>
              <p className="text-lg font-medium text-fog">Select a conversation</p>
              <p className="max-w-sm text-sm text-muted">
                Pick a chat from the inbox, or open someone&apos;s profile and tap
                Message.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-panel-hover lg:hidden"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back to inbox"
                >
                  <HiArrowLeft size={18} />
                </button>
                {activeOther ? (
                  <Link
                    href={`/${activeOther.userName}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Image
                      path={activeOther.img || "/general/noAvatar.svg"}
                      alt={activeOther.displayName || "User"}
                      w={40}
                      h={40}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fog">
                        {activeOther.displayName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        @{activeOther.userName}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <p className="text-sm text-muted">Conversation</p>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loadingThread ? (
                  <div className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted">
                    No messages yet — say hi.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const senderId = msg.sender?.id || msg.senderId || msg.sender;
                    const mine = String(senderId) === String(currentUser.id);
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            mine
                              ? "rounded-br-md bg-accent text-ink"
                              : "rounded-bl-md border border-line bg-panel text-fog"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                          <p
                            className={`mt-1 text-[10px] ${
                              mine ? "text-ink/60" : "text-muted"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-end gap-2 border-t border-line p-3"
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  rows={1}
                  placeholder="Write a message…"
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-sm text-fog outline-none placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="btn-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl disabled:opacity-50"
                  aria-label="Send"
                >
                  <HiPaperAirplane size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

export default MessagesPage;
