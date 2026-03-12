"use client";

import { ChangeEvent, Fragment } from "react";
import Image from "next/image";
import { CHAT_ASSETS } from "@/lib/chat";

interface ChatSidebarProps {
  onClose?: () => void;
  fullScreen?: boolean;
  mobileLayout?: boolean;
  uiScale?: number;
  previewMessage: string;
  timeLabel: string;
  isThinking: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export default function ChatSidebar({
  onClose,
  fullScreen = false,
  mobileLayout = false,
  uiScale = 1,
  previewMessage,
  timeLabel,
  isThinking,
  searchQuery,
  onSearchQueryChange,
}: ChatSidebarProps) {
  const scaleBy = (value: number) => Number((value * uiScale).toFixed(3));
  const centeredWidth = fullScreen
    ? mobileLayout
      ? `calc(100% - ${scaleBy(28)}px)`
      : `calc(100% - ${scaleBy(35.32)}px)`
    : scaleBy(253.68);
  const searchHeight = mobileLayout ? scaleBy(36) : scaleBy(23.62);
  const previewHeight = mobileLayout ? scaleBy(78) : scaleBy(67.8);
  const avatarSize = mobileLayout ? scaleBy(44) : scaleBy(41.14);
  const previewWidth = fullScreen
    ? mobileLayout
      ? `calc(100% - ${scaleBy(40)}px)`
      : `calc(100% - ${scaleBy(58.22)}px)`
    : scaleBy(231.6);
  const closeButtonSize = mobileLayout ? scaleBy(32) : scaleBy(18);
  const topPosition = (value: number) =>
    mobileLayout ? `calc(env(safe-area-inset-top) + ${scaleBy(value)}px)` : scaleBy(value);
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
        borderRadius: fullScreen ? (mobileLayout ? "0 0 24px 24px" : 0) : 23,
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
          style={{
            left: mobileLayout ? scaleBy(20) : scaleBy(26.66),
            top: topPosition(mobileLayout ? 18 : 25.14),
            width: scaleBy(46.47),
            height: scaleBy(10.67),
          }}
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
            className="absolute left-0 top-1/2 cursor-pointer rounded-full touch-manipulation"
            style={{
              width: closeButtonSize,
              height: closeButtonSize,
              transform: "translate(-28%, -50%)",
            }}
          />
        </div>

        <label
          className="absolute flex items-center"
          style={{
            left: "50%",
            top: topPosition(mobileLayout ? 44 : 52.56),
            transform: "translateX(-50%)",
            width: centeredWidth,
            height: searchHeight,
            paddingLeft: mobileLayout ? scaleBy(10) : scaleBy(6.09),
            paddingRight: mobileLayout ? scaleBy(10) : scaleBy(6.09),
            gap: scaleBy(2.29),
            borderRadius: mobileLayout ? scaleBy(18) : scaleBy(13.71),
            background: "rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAT_ASSETS.search}
            alt=""
            aria-hidden="true"
            style={{
              width: mobileLayout ? scaleBy(12) : scaleBy(9.9),
              height: mobileLayout ? scaleBy(12) : scaleBy(9.9),
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
              fontSize: mobileLayout ? scaleBy(16) : scaleBy(9.903),
              lineHeight: "normal",
            }}
            placeholder="Search"
          />
        </label>

        <div
          className="absolute"
          style={{
            left: "50%",
            top: topPosition(mobileLayout ? 90 : 90.65),
            transform: "translateX(-50%)",
            width: centeredWidth,
            height: previewHeight,
            borderRadius: mobileLayout ? scaleBy(12) : scaleBy(6.47),
            background: "rgba(0, 0, 0, 0.4)",
          }}
        />

        <div
          className="absolute flex items-center"
          style={{
            left: "50%",
            top: topPosition(mobileLayout ? 104 : 103.61),
            transform: "translateX(-50%)",
            width: previewWidth,
            gap: scaleBy(10.67),
          }}
        >
          <div
            className="overflow-hidden rounded-full"
            style={{ width: avatarSize, height: avatarSize }}
          >
            <Image
              src={CHAT_ASSETS.avatar}
              alt="Ohenny"
              width={Math.round(avatarSize)}
              height={Math.round(avatarSize)}
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
              rowGap: scaleBy(1.9),
              columnGap: scaleBy(10),
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#FFF",
                fontSize: mobileLayout ? scaleBy(13.5) : scaleBy(12.189),
                lineHeight: "normal",
              }}
            >
              Ohenny
            </span>
            <span
              style={{
                color: "#BDBDBD",
                fontSize: mobileLayout ? scaleBy(11) : scaleBy(9.903),
                lineHeight: "normal",
                justifySelf: "end",
              }}
            >
              {timeLabel}
            </span>
            <span
              style={{
                color: "#BDBDBD",
                fontSize: mobileLayout ? scaleBy(11) : scaleBy(9.903),
                lineHeight: "normal",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: mobileLayout ? "normal" : "nowrap",
                display: mobileLayout ? "-webkit-box" : "block",
                WebkitBoxOrient: mobileLayout ? "vertical" : undefined,
                WebkitLineClamp: mobileLayout ? 2 : undefined,
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
