"use client";

import ChatWindow from "./ChatWindow";

interface ChatDesktopProps {
  onClose?: () => void;
}

export default function ChatDesktop({ onClose }: ChatDesktopProps) {
  return (
    <div className="h-screen w-screen">
      <ChatWindow onClose={onClose} fullScreen />
    </div>
  );
}
