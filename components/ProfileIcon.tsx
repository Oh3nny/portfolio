"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IOS_APP_ICON_MASK_STYLE } from "@/lib/iosIcon";

export default function ProfileIcon() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [supportsHover, setSupportsHover] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handlePlayError = (error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    console.error(error);
    setIsPlaying(false);
  };

  useEffect(() => {
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPreferences = () => {
      setSupportsHover(hoverMedia.matches);
      setPrefersReducedMotion(motionMedia.matches);
    };

    syncPreferences();

    if (typeof hoverMedia.addEventListener === "function") {
      hoverMedia.addEventListener("change", syncPreferences);
      motionMedia.addEventListener("change", syncPreferences);
    } else {
      hoverMedia.addListener(syncPreferences);
      motionMedia.addListener(syncPreferences);
    }

    return () => {
      if (typeof hoverMedia.removeEventListener === "function") {
        hoverMedia.removeEventListener("change", syncPreferences);
        motionMedia.removeEventListener("change", syncPreferences);
      } else {
        hoverMedia.removeListener(syncPreferences);
        motionMedia.removeListener(syncPreferences);
      }
    };
  }, []);

  const playVideo = () => {
    const video = videoRef.current;

    if (!video || prefersReducedMotion) {
      return;
    }

    video.currentTime = 0;
    const playPromise = video.play();

    if (playPromise) {
      void playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(handlePlayError);
      return;
    }

    setIsPlaying(true);
  };

  const resetVideo = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!hasLoaded || supportsHover || prefersReducedMotion) {
      resetVideo();
      return;
    }

    playVideo();
  }, [hasLoaded, prefersReducedMotion, supportsHover]);

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
      onMouseEnter={supportsHover ? playVideo : undefined}
      onMouseLeave={supportsHover ? resetVideo : undefined}
    >
      <Image
        src="/profile.png"
        alt="Portrait of Ohenny"
        fill
        sizes="87px"
        priority
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        src="/profile-hover.mp4"
        poster="/profile.png"
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => {
          setHasLoaded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          supportsHover && !isPlaying ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
