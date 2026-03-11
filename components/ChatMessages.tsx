"use client";

import { Fragment, useEffect, useRef } from "react";
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
}

export default function ChatMessages({
  messages,
  showTypingBubble,
  fullScreen = false,
  mobileLayout = false,
  dayTimeLabel,
  searchQuery,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Array<HTMLDivElement | null>>([]);
  const messageViewportStyle = {
    left: 19.72,
    right: 19.72,
  } as const;
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

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

  return (
    <>
      <div
        className="absolute"
        style={{
          left: "50%",
          top: 31.23,
          width: 41.14,
          height: 41.14,
          transform: "translateX(-50%)",
        }}
      >
        <Image
          src={CHAT_ASSETS.avatar}
          alt="Ohenny"
          width={41}
          height={41}
          className="h-full w-full rounded-full object-cover"
          priority
        />
      </div>

      <div
        className="absolute flex items-center justify-center"
        style={{
          left: "50%",
          top: 89.89,
          width: 83.8,
          height: 26.66,
          transform: "translateX(-50%)",
          borderRadius: 27.04,
          border: "0.762px solid #606060",
          background: "rgba(33, 33, 33, 0.2)",
        }}
      >
        <span
          style={{
            color: "#FFF",
            fontSize: 12.189,
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
              top: fullScreen ? undefined : 553.17,
              bottom: fullScreen
                ? mobileLayout
                  ? "calc(env(safe-area-inset-bottom) + 182px)"
                  : 205.93
                : undefined,
              transform: "translateX(-50%)",
              color: "#7A7979",
              fontSize: 9.903,
              lineHeight: "normal",
            }}
          >
            {dayTimeLabel}
          </p>

          <div
            className="absolute"
            style={{
              ...messageViewportStyle,
              top: fullScreen ? undefined : 620.2,
              bottom: fullScreen
                ? mobileLayout
                  ? "calc(env(safe-area-inset-bottom) + 96px)"
                  : 116.04
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
        <div
          ref={scrollRef}
          className="chat-scroll absolute overflow-y-auto"
          style={{
            ...messageViewportStyle,
            top: 148,
            width: fullScreen ? undefined : 751.56,
            height: fullScreen ? undefined : 543,
            bottom: fullScreen
              ? mobileLayout
                ? "calc(env(safe-area-inset-bottom) + 72px)"
                : 63
              : undefined,
            paddingBottom: 4,
            paddingRight: 4,
          }}
        >
          <div className="flex min-h-full flex-col justify-end gap-[13px]">
            <p
              className="self-center"
              style={{
                color: "#7A7979",
                fontSize: 9.903,
                lineHeight: "normal",
                marginBottom: 54,
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
