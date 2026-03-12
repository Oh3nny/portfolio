"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { IOS_APP_ICON_MASK_STYLE } from "@/lib/iosIcon";

const PROFILE_VIDEO_SOURCE = "/profile-hover-sequence.mp4";

export default function ProfileIcon() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRandomizedStartRef = useRef(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const [prefersDirectTap, setPrefersDirectTap] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const canAnimateVideo = !prefersReducedMotion;
  const shouldAutoPlay = canAnimateVideo && !prefersDirectTap;
  const shouldPlayOnTap = canAnimateVideo && prefersDirectTap && isActive;
  const showVideo = hasLoaded && (shouldAutoPlay || shouldPlayOnTap);

  useEffect(() => {
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const coarseMedia = window.matchMedia("(hover: none), (pointer: coarse)");

    const syncPreferences = () => {
      const touchCapable =
        coarseMedia.matches ||
        navigator.maxTouchPoints > 0 ||
        "ontouchstart" in window;

      setSupportsHover(hoverMedia.matches && !touchCapable);
      setPrefersDirectTap(touchCapable);
    };

    syncPreferences();

    if (typeof hoverMedia.addEventListener === "function") {
      hoverMedia.addEventListener("change", syncPreferences);
      coarseMedia.addEventListener("change", syncPreferences);
    } else {
      hoverMedia.addListener(syncPreferences);
      coarseMedia.addListener(syncPreferences);
    }

    return () => {
      if (typeof hoverMedia.removeEventListener === "function") {
        hoverMedia.removeEventListener("change", syncPreferences);
        coarseMedia.removeEventListener("change", syncPreferences);
      } else {
        hoverMedia.removeListener(syncPreferences);
        coarseMedia.removeListener(syncPreferences);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsActive(false);
      hasRandomizedStartRef.current = false;
      return;
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!hasLoaded) {
      return;
    }

    if (!shouldAutoPlay && !shouldPlayOnTap) {
      video.pause();
      video.currentTime = 0;
      hasRandomizedStartRef.current = false;
      return;
    }

    if (shouldAutoPlay) {
      if (!hasRandomizedStartRef.current && Number.isFinite(video.duration) && video.duration > 1) {
        video.currentTime = Math.random() * Math.max(video.duration - 1, 0);
        hasRandomizedStartRef.current = true;
      }
    } else {
      video.currentTime = 0;
    }

    const playPromise = video.play();

    if (typeof playPromise?.catch === "function") {
      playPromise.catch(() => {
        return;
      });
    }
  }, [hasLoaded, shouldAutoPlay, shouldPlayOnTap]);

  const handleTap = () => {
    if (!canAnimateVideo || !prefersDirectTap) {
      return;
    }

    setIsActive((currentState) => !currentState);
  };

  const shellVariants: Variants = prefersReducedMotion
    ? {
        rest: {
          scale: 1,
          y: 0,
          filter: "brightness(1)",
        },
        hover: {
          scale: 1,
          y: 0,
          filter: "brightness(1)",
        },
      }
    : {
        rest: {
          scale: 1,
          y: 0,
          rotate: 0,
          filter: "brightness(1)",
        },
        hover: {
          scale: 1.03,
          y: -6,
          rotate: 0,
          filter: "brightness(1.05)",
        },
      };

  return (
    <motion.div
      initial={false}
      animate="rest"
      whileHover={supportsHover ? "hover" : undefined}
      variants={shellVariants}
      transition={{
        type: "spring",
        stiffness: 360,
        damping: 28,
        mass: 0.9,
      }}
      className="relative cursor-pointer"
      style={{
        width: "clamp(78px, 24vw, 87px)",
        height: "clamp(78px, 24vw, 87px)",
        borderRadius: "22%",
        overflow: "hidden",
        background: "linear-gradient(to top, #6d6d6d, #373a3d)",
        ...IOS_APP_ICON_MASK_STYLE,
      }}
      aria-label="Portrait of Ohenny"
      tabIndex={0}
      onFocus={prefersDirectTap && canAnimateVideo ? () => setIsActive(true) : undefined}
      onBlur={() => setIsActive(false)}
      onClick={handleTap}
    >
      <img
        src="/profile.png"
        alt="Portrait of Ohenny"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        src={PROFILE_VIDEO_SOURCE}
        poster="/profile.png"
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => {
          setHasLoaded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
          showVideo ? "opacity-100" : "opacity-0"
        }`}
      />
    </motion.div>
  );
}
