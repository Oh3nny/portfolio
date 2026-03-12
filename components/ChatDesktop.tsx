"use client";

import ChatWindow from "./ChatWindow";

interface ChatDesktopProps {
  onClose?: () => void;
  uiScale?: number;
}

export default function ChatDesktop({
  onClose,
  uiScale = 1,
}: ChatDesktopProps) {
  return (
    <div className="h-[100dvh] w-full">
      <ChatWindow onClose={onClose} fullScreen uiScale={uiScale} />
    </div>
  );
}
