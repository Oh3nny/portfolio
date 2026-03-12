"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CHAT_ASSETS,
  INTRO_ASSISTANT_MESSAGE,
  chatTextMatchesSearch,
  normalizeChatSearchQuery,
} from "@/lib/chat";

export interface Message {
  role: "assistant" | "user";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  showTypingBubble: boolean;
  fullScreen?: boolean;
  mobileLayout?: boolean;
  dayTimeLabel: string;
  searchQuery: string;
  uiScale?: number;
}

export default function ChatMessages({
  messages,
  showTypingBubble,
  fullScreen = false,
  mobileLayout = false,
  dayTimeLabel,
  searchQuery,
  uiScale = 1,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [showTopEdgeFade, setShowTopEdgeFade] = useState(false);
  const scaleBy = (value: number) => Number((value * uiScale).toFixed(3));
  const horizontalInset = mobileLayout ? scaleBy(14) : scaleBy(19.72);
  const messageViewportStyle = {
    left: horizontalInset,
    right: horizontalInset,
  } as const;
  const mobileIntroDayBottom = `calc(env(safe-area-inset-bottom) + ${scaleBy(196)}px)`;
  const mobileIntroBubbleBottom = `calc(env(safe-area-inset-bottom) + ${scaleBy(108)}px)`;
  const mobileScrollBottom = `calc(env(safe-area-inset-bottom) + ${scaleBy(84)}px)`;
  const normalizedSearchQuery = normalizeChatSearchQuery(searchQuery);
  const firstMatchIndex = messages.findIndex((message) =>
    chatTextMatchesSearch(message.content, normalizedSearchQuery)
  );
  const isIntroState =
    !showTypingBubble &&
    messages.length === 1 &&
    messages[0]?.role === "assistant" &&
    messages[0]?.content === INTRO_ASSISTANT_MESSAGE;

  useEffect(() => {
    if (isIntroState || normalizedSearchQuery) {
      return;
    }

    const node = scrollRef.current;

    if (node) {
      node.scrollTop = node.scrollHeight;
      setShowTopEdgeFade(node.scrollTop > 6);
    }
  }, [isIntroState, messages, normalizedSearchQuery, showTypingBubble]);

  useEffect(() => {
    if (normalizedSearchQuery.length === 0 || firstMatchIndex < 0) {
      return;
    }

    matchRefs.current[firstMatchIndex]?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [firstMatchIndex, normalizedSearchQuery]);

  useEffect(() => {
    if (isIntroState) {
      setShowTopEdgeFade(false);
      return;
    }

    const node = scrollRef.current;

    if (!node) {
      setShowTopEdgeFade(false);
      return;
    }

    const syncTopEdgeFade = () => {
      setShowTopEdgeFade(node.scrollTop > 6);
    };

    syncTopEdgeFade();
    node.addEventListener("scroll", syncTopEdgeFade, { passive: true });
    window.addEventListener("resize", syncTopEdgeFade);

    return () => {
      node.removeEventListener("scroll", syncTopEdgeFade);
      window.removeEventListener("resize", syncTopEdgeFade);
    };
  }, [isIntroState, messages.length, normalizedSearchQuery, showTypingBubble]);

  return (
    <>
      <div
        className="absolute"
        style={{
          left: "50%",
          top: scaleBy(31.23),
          width: scaleBy(41.14),
          height: scaleBy(41.14),
          transform: "translateX(-50%)",
        }}
      >
        <Image
          src={CHAT_ASSETS.avatar}
          alt="Ohenny"
          width={Math.round(scaleBy(41.14))}
          height={Math.round(scaleBy(41.14))}
          className="h-full w-full rounded-full object-cover"
          priority
        />
      </div>

      <div
        className="absolute flex items-center justify-center"
        style={{
          left: "50%",
          top: scaleBy(89.89),
          width: scaleBy(83.8),
          height: scaleBy(26.66),
          transform: "translateX(-50%)",
          borderRadius: scaleBy(27.04),
          border: `${scaleBy(0.762)}px solid #606060`,
          background: "rgba(33, 33, 33, 0.2)",
        }}
      >
        <span
          style={{
            color: "#FFF",
            fontSize: scaleBy(12.189),
            lineHeight: "normal",
          }}
        >
          Ohenny
        </span>
      </div>

      {isIntroState ? (
        <>
          <p
            className="absolute"
            style={{
              left: "50%",
              top: fullScreen ? undefined : scaleBy(553.17),
              bottom: fullScreen
                ? mobileLayout
                  ? mobileIntroDayBottom
                  : scaleBy(205.93)
                : undefined,
              transform: "translateX(-50%)",
              color: "#7A7979",
              fontSize: scaleBy(9.903),
              lineHeight: "normal",
            }}
          >
            {dayTimeLabel}
          </p>

          <div
            className="absolute"
            style={{
              ...messageViewportStyle,
              top: fullScreen ? undefined : scaleBy(620.2),
              bottom: fullScreen
                ? mobileLayout
                  ? mobileIntroBubbleBottom
                  : scaleBy(116.04)
                : undefined,
            }}
          >
            <div className="chat-message-row chat-message-row--assistant">
              <MessageBubble
                message={messages[0]}
                searchQuery={normalizedSearchQuery}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="chat-scroll absolute overflow-y-auto"
            style={{
              ...messageViewportStyle,
              top: scaleBy(148),
              width: fullScreen ? undefined : scaleBy(751.56),
              height: fullScreen ? undefined : scaleBy(543),
              bottom: fullScreen
                ? mobileLayout
                  ? mobileScrollBottom
                  : scaleBy(63)
                : undefined,
              overflowX: "hidden",
              overscrollBehaviorX: "none",
              touchAction: mobileLayout ? "pan-y" : "auto",
              WebkitOverflowScrolling: "touch",
              paddingBottom: scaleBy(4),
              paddingRight: mobileLayout ? 0 : scaleBy(4),
            }}
          >
            <div
              className="flex min-h-full flex-col justify-end"
              style={{ gap: scaleBy(13) }}
            >
              <p
                className="self-center"
                style={{
                  color: "#7A7979",
                  fontSize: scaleBy(9.903),
                  lineHeight: "normal",
                  marginBottom: mobileLayout ? scaleBy(32) : scaleBy(54),
                }}
              >
                {dayTimeLabel}
              </p>

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  ref={(node) => {
                    matchRefs.current[index] = node;
                  }}
                  className={`chat-message-row ${
                    message.role === "user"
                      ? "chat-message-row--user"
                      : "chat-message-row--assistant"
                  }`}
                >
                  <MessageBubble
                    message={message}
                    searchQuery={normalizedSearchQuery}
                  />
                </div>
              ))}

              {showTypingBubble && (
                <div className="chat-message-row chat-message-row--assistant">
                  <TypingBubble />
                </div>
              )}
            </div>
          </div>
          <div
            aria-hidden="true"
            className={`chat-scroll-edge-fade ${
              showTopEdgeFade ? "chat-scroll-edge-fade--visible" : ""
            }`}
            style={{
              ...messageViewportStyle,
              top: scaleBy(148),
              width: fullScreen ? undefined : scaleBy(751.56),
              height: mobileLayout ? scaleBy(104) : scaleBy(88),
            }}
          />
        </>
      )}
    </>
  );
}

function MessageBubble({
  message,
  searchQuery,
}: {
  message: Message;
  searchQuery: string;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`chat-bubble-shell ${
        isUser ? "chat-bubble-shell--user" : "chat-bubble-shell--assistant"
      }`}
    >
      <div
        className={`chat-bubble-body ${
          isUser ? "chat-bubble-body--user" : "chat-bubble-body--assistant"
        }`}
        style={{ whiteSpace: "pre-wrap" }}
      >
        <HighlightedText text={message.content} query={searchQuery} />
      </div>
      <BubbleTail isUser={isUser} />
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="chat-bubble-shell chat-bubble-shell--assistant">
      <div className="chat-bubble-body chat-bubble-body--assistant flex items-end gap-1">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
      </div>
      <BubbleTail isUser={false} />
    </div>
  );
}

function BubbleTail({ isUser }: { isUser: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 12"
      className={`chat-bubble-tail ${
        isUser ? "chat-bubble-tail--user" : "chat-bubble-tail--assistant"
      }`}
    >
      <path
        d="M14 0C9.1 0.2 6.1 2.7 4.9 6.7C4.2 9 2.5 10.8 0 12.2C3.2 12.1 6.2 10.9 8.6 9C10.3 7.6 12.1 6.8 14 6.5V0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "ig"));

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLocaleLowerCase() !== query) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <mark
            key={`${part}-${index}`}
            className="chat-search-highlight"
          >
            {part}
          </mark>
        );
      })}
    </>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
