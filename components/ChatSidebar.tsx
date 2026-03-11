"use client";

import { ChangeEvent, Fragment } from "react";
import Image from "next/image";
import { CHAT_ASSETS } from "@/lib/chat";

interface ChatSidebarProps {
  onClose?: () => void;
  fullScreen?: boolean;
  previewMessage: string;
  timeLabel: string;
  isThinking: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export default function ChatSidebar({
  onClose,
  fullScreen = false,
  previewMessage,
  timeLabel,
  isThinking,
  searchQuery,
  onSearchQueryChange,
}: ChatSidebarProps) {
  const centeredWidth = fullScreen ? "calc(100% - 35.32px)" : 253.68;
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchQueryChange(event.target.value);
  };

  return (
    <aside
      className={`chat-sidebar-shell relative shrink-0 overflow-hidden ${
        isThinking ? "chat-sidebar-shell--thinking" : ""
      }`}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: fullScreen ? 0 : 23,
        border: fullScreen
          ? "0.762px solid rgba(213, 213, 213, 0.18)"
          : "0.762px solid rgba(213, 213, 213, 0.29)",
        borderRight: "0.762px solid rgba(213, 213, 213, 0.29)",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(66px)",
        WebkitBackdropFilter: "blur(66px)",
      }}
    >
      <div className="chat-sidebar-content h-full w-full">
        <div
          className="absolute"
          style={{ left: 26.66, top: 25.14, width: 46.47, height: 10.67 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAT_ASSETS.trafficLights}
            alt=""
            className="block h-full w-full"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="absolute left-0 top-0 cursor-pointer rounded-full"
            style={{ width: 10.67, height: 10.67 }}
          />
        </div>

        <label
          className="absolute flex items-center"
          style={{
            left: "50%",
            top: 52.56,
            transform: "translateX(-50%)",
            width: centeredWidth,
            height: 23.62,
            paddingLeft: 6.09,
            paddingRight: 6.09,
            gap: 2.29,
            borderRadius: 13.71,
            background: "rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAT_ASSETS.search}
            alt=""
            aria-hidden="true"
            style={{
              width: 9.9,
              height: 9.9,
              flexShrink: 0,
              transform: "scaleY(-1)",
            }}
          />
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search messages"
            autoComplete="off"
            spellCheck={false}
            className="chat-sidebar-search-input"
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#BDBDBD",
              fontSize: 9.903,
              lineHeight: "normal",
            }}
            placeholder="Search"
          />
        </label>

        <div
          className="absolute"
          style={{
            left: "50%",
            top: 90.65,
            transform: "translateX(-50%)",
            width: centeredWidth,
            height: 67.8,
            borderRadius: 6.47,
            background: "rgba(0, 0, 0, 0.4)",
          }}
        />

        <div
          className="absolute flex items-center"
          style={{
            left: "50%",
            top: 103.61,
            transform: "translateX(-50%)",
            width: fullScreen ? "calc(100% - 58.22px)" : 231.6,
            gap: 10.67,
          }}
        >
          <div
            className="overflow-hidden rounded-full"
            style={{ width: 41.14, height: 41.14 }}
          >
            <Image
              src={CHAT_ASSETS.avatar}
              alt="Ohenny"
              width={41}
              height={41}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div
            className="grid"
            style={{
              flex: 1,
              gridTemplateColumns: "1fr auto",
              gridTemplateRows: "auto auto",
              rowGap: 1.9,
              columnGap: 10,
              alignItems: "center",
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
            <span
              style={{
                color: "#BDBDBD",
                fontSize: 9.903,
                lineHeight: "normal",
                justifySelf: "end",
              }}
            >
              {timeLabel}
            </span>
            <span
              style={{
                color: "#BDBDBD",
                fontSize: 9.903,
                lineHeight: "normal",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <HighlightedText
                text={previewMessage}
                query={searchQuery}
              />
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(query.trim())})`, "ig"));

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLocaleLowerCase() !== normalizedQuery) {
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
