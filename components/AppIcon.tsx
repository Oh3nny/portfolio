"use client";

import type { Ref } from "react";
import Link from "next/link";
import ChatLauncherArtwork from "./ChatLauncherArtwork";

interface AppIconProps {
  icon: string;
  label: string;
  href: string;
  isChat?: boolean;
  notificationCount?: number;
  iconWidth?: number;
  iconHeight?: number;
  iconRef?: Ref<HTMLDivElement>;
  onClick?: () => void;
}

export default function AppIcon({
  icon,
  label,
  href,
  isChat,
  notificationCount,
  iconWidth,
  iconHeight,
  iconRef,
  onClick,
}: AppIconProps) {
  const content = (
    <>
      <div
        ref={iconRef}
        className="relative transition-all duration-200 ease-out group-hover:scale-110 group-hover:brightness-110"
        style={{
          width: iconWidth ?? (isChat ? 87 : 99),
          height: iconHeight ?? (isChat ? 87 : 74),
        }}
      >
        {isChat ? (
          <ChatLauncherArtwork />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={icon}
            alt={label}
            className="w-full h-full object-contain"
          />
        )}
        {typeof notificationCount === "number" && notificationCount > 0 ? (
          <span
            aria-label={`${notificationCount} unread notification${notificationCount === 1 ? "" : "s"}`}
            className="pointer-events-none absolute -right-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[13px] font-semibold leading-none text-white shadow-[0_8px_20px_rgba(255,59,48,0.5)]"
          >
            {notificationCount}
          </span>
        ) : null}
      </div>
      <span className="text-[15px] text-white opacity-90 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-2 group"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className="flex flex-col items-center gap-2 group">
      {content}
    </Link>
  );
}
