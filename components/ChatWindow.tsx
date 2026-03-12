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
  uiScale?: number;
}

export default function ChatWindow({
  onClose,
  fullScreen = false,
  uiScale = 1,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: INTRO_ASSISTANT_MESSAGE,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
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
  const scaleBy = (value: number) => Number((value * uiScale).toFixed(3));

  useEffect(() => {
    if (fullScreen) {
      const updateLayoutMode = () => {
        setIsMobileLayout(
          Math.min(window.innerWidth, window.innerHeight) < 768
        );
      };

      updateLayoutMode();
      window.addEventListener("resize", updateLayoutMode);

      return () => {
        window.removeEventListener("resize", updateLayoutMode);
      };
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
    setIsMobileLayout(false);

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

  const mobileSidebarHeight = `calc(${scaleBy(176)}px + env(safe-area-inset-top))`;
  const mobilePanelInset = scaleBy(12);
  const mobilePanelTop = `max(${mobilePanelInset}px, env(safe-area-inset-top))`;
  const showMobileMinimalLayout = fullScreen && isMobileLayout;
  const showMobileThinkingGlow = showMobileMinimalLayout && showTypingState;
  const showMobileCloseButton = showMobileMinimalLayout && Boolean(onClose);
  const fullScreenSidebarWidth = isMobileLayout
    ? "100%"
    : "clamp(180px, 26.35vw, 289px)";
  const contentLeft = fullScreen
    ? isMobileLayout
      ? mobilePanelInset
      : "clamp(180px, 26.35vw, 289px)"
    : 301;
  const contentTop = fullScreen
    ? isMobileLayout
      ? mobilePanelTop
      : 0
    : CHAT_WINDOW.padding;
  const contentWidth = fullScreen
    ? isMobileLayout
      ? `calc(100% - ${mobilePanelInset * 2}px)`
      : "calc(100vw - clamp(180px, 26.35vw, 289px))"
    : CHAT_WINDOW.contentWidth;
  const contentHeight = fullScreen
    ? isMobileLayout
      ? `calc(100% - ${mobilePanelInset * 2}px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
      : "100%"
    : CHAT_WINDOW.contentHeight;
  const contentBorderRadius = isMobileLayout
    ? scaleBy(30)
    : fullScreen
      ? 0
      : 23;

  const chatFrame = (
    <div
      className="relative"
      style={{
        ["--chat-ui-scale" as string]: uiScale,
        width: fullScreen ? "100%" : CHAT_WINDOW.width,
        height: fullScreen ? "100%" : CHAT_WINDOW.height,
        borderRadius: fullScreen ? 0 : 26.5,
      }}
    >
      <section
        className={`chat-window-shell relative h-full w-full overflow-hidden ${
          fullScreen ? "flex" : ""
        } ${
          showMobileThinkingGlow
            ? "chat-window-shell--thinking chat-window-shell--mobile-thinking"
            : ""
        }`}
        style={{
          borderRadius: "inherit",
          background: "rgba(26, 26, 26, 0.2)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: fullScreen ? "none" : "0.762px solid rgba(213, 213, 213, 0.29)",
          boxShadow: fullScreen ? "none" : "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        {!showMobileMinimalLayout ? (
          <div
            className="absolute"
            style={{
              left: fullScreen ? 0 : CHAT_WINDOW.padding,
              top: fullScreen ? 0 : CHAT_WINDOW.padding,
              width: fullScreen ? fullScreenSidebarWidth : CHAT_WINDOW.sidebarWidth,
              height: fullScreen
                ? isMobileLayout
                  ? mobileSidebarHeight
                  : "100%"
                : CHAT_WINDOW.sidebarHeight,
            }}
          >
            <ChatSidebar
              onClose={onClose}
              fullScreen={fullScreen}
              mobileLayout={isMobileLayout}
              uiScale={uiScale}
              previewMessage={sidebarPreviewMessage}
              timeLabel={sidebarTimeLabel}
              isThinking={showTypingState}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          </div>
        ) : null}

        <div
          className="absolute overflow-hidden"
          style={{
            left: contentLeft,
            top: contentTop,
            width: contentWidth,
            height: contentHeight,
            borderRadius: contentBorderRadius,
            border: showMobileMinimalLayout
              ? "0.762px solid rgba(213, 213, 213, 0.18)"
              : undefined,
            backgroundColor: showMobileMinimalLayout
              ? showMobileThinkingGlow
                ? "rgba(20, 20, 20, 0.34)"
                : "rgba(24, 24, 24, 0.62)"
              : "#1A1A1A",
            backdropFilter: showMobileMinimalLayout ? "blur(40px)" : undefined,
            WebkitBackdropFilter: showMobileMinimalLayout
              ? "blur(40px)"
              : undefined,
            boxShadow: showMobileMinimalLayout
              ? showMobileThinkingGlow
                ? "0 24px 56px rgba(0, 0, 0, 0.38)"
                : "0 18px 40px rgba(0, 0, 0, 0.32)"
              : undefined,
            transition:
              "background-color 760ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 760ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className={`chat-window-mobile-panel relative h-full w-full overflow-hidden ${
              showMobileThinkingGlow
                ? "chat-window-mobile-panel--thinking"
                : ""
            }`}
            style={{
              borderRadius: contentBorderRadius,
              backgroundColor: showMobileThinkingGlow
                ? "rgba(17, 17, 17, 0.72)"
                : "#1A1A1A",
            }}
          >
            {showMobileCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="absolute z-20 flex items-center justify-center border border-white/10 bg-[rgba(18,18,18,0.74)] text-white/88 backdrop-blur-md transition-opacity duration-200 hover:opacity-85"
                style={{
                  left: scaleBy(16),
                  top: scaleBy(16),
                  width: scaleBy(40),
                  height: scaleBy(40),
                  borderRadius: scaleBy(999),
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: scaleBy(22),
                    lineHeight: 1,
                    transform: `translateY(${-scaleBy(1)}px)`,
                  }}
                >
                  ×
                </span>
              </button>
            ) : null}

            <ChatMessages
              messages={messages}
              showTypingBubble={showTypingState}
              fullScreen={fullScreen}
              mobileLayout={isMobileLayout}
              dayTimeLabel={dayTimeLabel}
              searchQuery={deferredSearchQuery}
              uiScale={uiScale}
            />
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              fullScreen={fullScreen}
              mobileLayout={isMobileLayout}
              uiScale={uiScale}
            />
          </div>
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
