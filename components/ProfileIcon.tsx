"use client";

import { useRef } from "react";
import { IOS_APP_ICON_MASK_STYLE } from "@/lib/iosIcon";

export default function ProfileIcon() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayError = (error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    console.error(error);
  };

  const handleMouseEnter = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    const playPromise = video.play();

    if (playPromise) {
      void playPromise.catch(handlePlayError);
    }
  };

  const resetVideo = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  };

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: 87,
        height: 87,
        borderRadius: "22%",
        overflow: "hidden",
        background: "linear-gradient(to top, #6d6d6d, #373a3d)",
        ...IOS_APP_ICON_MASK_STYLE,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={resetVideo}
    >
      <video
        ref={videoRef}
        src="/profile-hover.mp4"
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={resetVideo}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
