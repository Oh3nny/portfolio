"use client";

import ChatDesktop from "@/components/ChatDesktop";
import { CHAT_ASSETS } from "@/lib/chat";

export default function ChatPage() {
  return (
    <main
      className="flex h-screen w-screen items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${CHAT_ASSETS.background})` }}
    >
      <ChatDesktop />
    </main>
  );
}
