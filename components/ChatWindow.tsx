"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  CHAT_ERROR_MESSAGE,
  CHAT_MAX_HISTORY_MESSAGES,
  CHAT_WINDOW,
  INTRO_ASSISTANT_MESSAGE,
  chatTextMatchesSearch,
  formatChatDayTime,
  formatChatTime,
  normalizeChatSearchQuery,
} from "@/lib/chat";
import ChatSidebar from "./ChatSidebar";
import ChatMessages, { type Message } from "./ChatMessages";
import ChatInput from "./ChatInput";

const MIN_TYPING_STATE_MS = 700;
const MAX_TYPING_STATE_MS = 1800;

interface ChatWindowProps {
  onClose?: () => void;
  fullScreen?: boolean;
}

export default function ChatWindow({
  onClose,
  fullScreen = false,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: INTRO_ASSISTANT_MESSAGE,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const showTypingState =
    isLoading && messages[messages.length - 1]?.role === "user";
  const timeLabel = formatChatTime(now);
  const dayTimeLabel = formatChatDayTime(now);
  const previewMessage =
    messages[messages.length - 1]?.content ?? INTRO_ASSISTANT_MESSAGE;
  const normalizedSearchQuery =
    normalizeChatSearchQuery(deferredSearchQuery);
  const hasActiveSearch = normalizedSearchQuery.length > 0;
  const matchedMessages = hasActiveSearch
    ? messages.filter((message) =>
        chatTextMatchesSearch(message.content, normalizedSearchQuery)
      )
    : [];
  const searchMatchCount = matchedMessages.length;
  const sidebarPreviewMessage = hasActiveSearch
    ? matchedMessages[matchedMessages.length - 1]?.content ?? "No messages found"
    : previewMessage;
  const sidebarTimeLabel = hasActiveSearch
    ? `${searchMatchCount} ${searchMatchCount === 1 ? "hit" : "hits"}`
    : timeLabel;

  useEffect(() => {
    if (fullScreen) {
      return;
    }

    const updateScale = () => {
      const widthScale =
        (window.innerWidth - CHAT_WINDOW.viewportPadding) / CHAT_WINDOW.width;
      const heightScale =
        (window.innerHeight - CHAT_WINDOW.viewportPadding) / CHAT_WINDOW.height;
      const nextScale = Math.min(1, widthScale, heightScale);
      const clampedScale = Math.max(nextScale, 0.01);

      setScale((currentScale) =>
        currentScale === clampedScale ? currentScale : clampedScale
      );
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, [fullScreen]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const getTypingDelayMs = (reply: string) =>
    Math.min(
      MAX_TYPING_STATE_MS,
      Math.max(MIN_TYPING_STATE_MS, 550 + reply.trim().length * 12)
    );

  const handleSend = async (content: string) => {
    const nextHistory = [...messages, { role: "user" as const, content }];
    const requestStartedAt = Date.now();

    setMessages(nextHistory);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: nextHistory.slice(-CHAT_MAX_HISTORY_MESSAGES),
          message: content,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { reply?: string }
        | null;
      const reply =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : CHAT_ERROR_MESSAGE;

      if (!response.ok && reply === CHAT_ERROR_MESSAGE) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const remainingDelay =
        getTypingDelayMs(reply) - (Date.now() - requestStartedAt);

      if (remainingDelay > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remainingDelay);
        });
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      const remainingDelay =
        getTypingDelayMs(CHAT_ERROR_MESSAGE) - (Date.now() - requestStartedAt);

      if (remainingDelay > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remainingDelay);
        });
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: CHAT_ERROR_MESSAGE,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatFrame = (
    <div
      className="relative"
      style={{
        width: fullScreen ? "100vw" : CHAT_WINDOW.width,
        height: fullScreen ? "100dvh" : CHAT_WINDOW.height,
        borderRadius: fullScreen ? 0 : 26.5,
      }}
    >
      <section
        className={`relative h-full w-full overflow-hidden ${fullScreen ? "flex" : ""}`}
        style={{
          borderRadius: "inherit",
          background: "rgba(26, 26, 26, 0.2)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: fullScreen ? "none" : "0.762px solid rgba(213, 213, 213, 0.29)",
          boxShadow: fullScreen ? "none" : "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          className="absolute"
          style={{
            left: fullScreen ? 0 : CHAT_WINDOW.padding,
            top: fullScreen ? 0 : CHAT_WINDOW.padding,
            width: fullScreen ? "clamp(180px, 26.35vw, 289px)" : CHAT_WINDOW.sidebarWidth,
            height: fullScreen ? "100%" : CHAT_WINDOW.sidebarHeight,
          }}
        >
          <ChatSidebar
            onClose={onClose}
            fullScreen={fullScreen}
            previewMessage={sidebarPreviewMessage}
            timeLabel={sidebarTimeLabel}
            isThinking={showTypingState}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>

        <div
          className="absolute overflow-hidden"
          style={{
            left: fullScreen ? "clamp(180px, 26.35vw, 289px)" : 301,
            top: fullScreen ? 0 : CHAT_WINDOW.padding,
            width: fullScreen ? "calc(100vw - clamp(180px, 26.35vw, 289px))" : CHAT_WINDOW.contentWidth,
            height: fullScreen ? "100%" : CHAT_WINDOW.contentHeight,
            borderRadius: fullScreen ? 0 : 23,
            background: "#1A1A1A",
          }}
        >
          <ChatMessages
            messages={messages}
            showTypingBubble={showTypingState}
            fullScreen={fullScreen}
            dayTimeLabel={dayTimeLabel}
            searchQuery={deferredSearchQuery}
          />
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            fullScreen={fullScreen}
          />
        </div>
      </section>
    </div>
  );

  if (fullScreen) {
    return chatFrame;
  }

  return (
    <div
      style={{
        width: CHAT_WINDOW.width * scale,
        height: CHAT_WINDOW.height * scale,
      }}
    >
      <div
        className="origin-top-left"
        style={{
          width: CHAT_WINDOW.width,
          height: CHAT_WINDOW.height,
          transform: `scale(${scale})`,
        }}
      >
        {chatFrame}
      </div>
    </div>
  );
}
