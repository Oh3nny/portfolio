"use client";

import { useState } from "react";
import ProfileIcon from "@/components/ProfileIcon";
import AppIcon from "@/components/AppIcon";
import ChatDesktop from "@/components/ChatDesktop";
import { CHAT_ASSETS } from "@/lib/chat";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(true);

  const handleChatOpen = () => {
    setShowChatNotification(false);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  return (
    <main
      className="relative w-full overflow-x-hidden overflow-y-auto"
      style={{ minHeight: "100dvh", background: "#1A1A1A" }}
    >
      <div
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-10 md:gap-16"
        style={{
          pointerEvents: chatOpen ? "none" : "auto",
          paddingTop: "max(32px, env(safe-area-inset-top))",
          paddingRight: "max(24px, env(safe-area-inset-right))",
          paddingBottom: "max(32px, env(safe-area-inset-bottom))",
          paddingLeft: "max(24px, env(safe-area-inset-left))",
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <ProfileIcon />
          <span className="text-[14px] text-white md:text-[15px]">@im_oaa</span>
        </div>

        <div className="grid w-full max-w-[420px] grid-cols-2 justify-items-center gap-x-8 gap-y-10 sm:max-w-[480px] sm:gap-x-10 md:flex md:max-w-none md:items-end md:gap-16 lg:gap-24">
          <AppIcon
            icon="/icons/folder-work.svg"
            label="work"
            href="/work"
          />
          <AppIcon
            icon="/icons/folder-play.svg"
            label="play"
            href="/play"
          />
          <AppIcon
            icon=""
            label="chat"
            href="#"
            isChat
            notificationCount={showChatNotification ? 1 : undefined}
            onClick={handleChatOpen}
          />
          <AppIcon
            icon="/icons/document.svg"
            label="cv.md"
            href="/cv"
            iconWidth={61}
            iconHeight={87}
          />
        </div>
      </div>

      <div
        aria-hidden={!chatOpen}
        className="fixed inset-0 z-20"
        style={{
          backgroundImage: `url(${CHAT_ASSETS.background})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: chatOpen ? 1 : 0,
          visibility: chatOpen ? "visible" : "hidden",
          pointerEvents: chatOpen ? "auto" : "none",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(13, 16, 20, 0.08)" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <ChatDesktop onClose={handleChatClose} />
        </div>
      </div>
    </main>
  );
}
