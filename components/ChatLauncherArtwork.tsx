"use client";

import type { CSSProperties } from "react";
import { IOS_APP_ICON_MASK_STYLE } from "@/lib/iosIcon";

interface ChatLauncherArtworkProps {
  className?: string;
  size?: number;
  style?: CSSProperties;
}

export default function ChatLauncherArtwork({
  className,
  size = 87,
  style,
}: ChatLauncherArtworkProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "22%",
        overflow: "hidden",
        position: "relative",
        ...IOS_APP_ICON_MASK_STYLE,
        ...style,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #5bf676 0%, #0bbd29 100%)",
        }}
      />
      <svg
        viewBox="0 0 61 53"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute"
        style={{
          width: "70%",
          height: "60%",
          top: "20%",
          left: "15%",
        }}
      >
        <path
          d="M30.5 0C13.7 0 0 10.7 0 24c0 7.4 4.2 14 10.8 18.4C10 47.2 5.5 52 5.5 52s12-2.6 17.4-6.4c2.4.3 5 .4 7.6.4 16.8 0 30.5-10.7 30.5-24S47.3 0 30.5 0z"
          fill="white"
        />
      </svg>
    </div>
  );
}
