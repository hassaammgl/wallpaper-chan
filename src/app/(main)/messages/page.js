"use client";

import { HiChatBubbleLeftRight } from "react-icons/hi2";

function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
          <HiChatBubbleLeftRight size={14} />
          Messages
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-fog">
          Messages
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-line glass py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel">
          <HiChatBubbleLeftRight size={28} className="text-muted" />
        </div>
        <p className="text-lg font-medium text-fog">No messages yet</p>
        <p className="max-w-sm text-sm text-muted">
          Start a conversation with other wallpaper creators. Messaging coming
          soon.
        </p>
      </div>
    </div>
  );
}

export default MessagesPage;
