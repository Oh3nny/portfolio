"use client";

import { useEffect, useId, useState, type Ref } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import ChatLauncherArtwork from "./ChatLauncherArtwork";

const MotionLink = motion.create(Link);

export interface AppIconPreviewItem {
  src: string;
  bottom: number;
  centerX: number;
  width: number;
  hoverY: number;
  rotate: number;
  zIndex?: number;
}

interface AppIconProps {
  icon: string;
  label: string;
  href: string;
  isChat?: boolean;
  notificationCount?: number;
  iconWidth?: number | string;
  iconHeight?: number | string;
  iconRef?: Ref<HTMLDivElement>;
  previewItems?: readonly AppIconPreviewItem[];
  onClick?: () => void;
}

function FolderPreviewArtwork({
  previewItems,
  previewCardVariants,
}: {
  previewItems: readonly AppIconPreviewItem[];
  previewCardVariants: Variants;
}) {
  const idBase = useId().replace(/:/g, "");
  const gradientId = `${idBase}-folder-front-gradient`;
  const shadowId = `${idBase}-folder-front-shadow`;

  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-visible">
      <svg
        viewBox="0 0 103.063 73.9748"
        className="absolute inset-0 z-10 h-full w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.00609 5.01523V68.9595C2.00609 71.7293 4.25148 73.9747 7.02132 73.9747H96.0418C98.8116 73.9747 101.057 71.7294 101.057 68.9595V14.0028C101.057 11.233 98.8116 8.98759 96.0418 8.98759H56.2625C53.7815 8.98759 51.3564 8.25157 49.2939 6.87269L42.0193 2.00916C40.06 0.699219 37.7561 0 35.3992 0H7.02132C4.25149 0 2.00609 2.24539 2.00609 5.01523Z"
          fill="#0084D1"
        />
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[3%] top-[9%] z-20 h-[70%] w-[91%] overflow-visible"
      >
        {previewItems.slice(0, 3).map((item) => (
          <div
            key={item.src}
            className="absolute"
            style={{
              left: `${item.centerX}%`,
              bottom: `${item.bottom}%`,
              width: `${item.width}%`,
              transform: "translateX(-50%)",
              zIndex: item.zIndex ?? 0,
            }}
          >
            <motion.div
              custom={item}
              variants={previewCardVariants}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 26,
                mass: 0.7,
              }}
              className="origin-bottom"
            >
              <div className="aspect-square overflow-hidden rounded-[9px] border border-white/18 bg-[#111] shadow-[0_16px_28px_rgba(0,0,0,0.32)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt=""
                  draggable={false}
                  className="block h-full w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <svg
        viewBox="0 0 103.063 73.9748"
        className="absolute inset-0 z-30 h-full w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={shadowId}
            x="0"
            y="12.4128"
            width="103.063"
            height="61.562"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="-3.13452" />
            <feGaussianBlur stdDeviation="1.00305" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"
            />
            <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          <linearGradient
            id={gradientId}
            x1="51.5316"
            y1="73.9748"
            x2="51.5316"
            y2="17.5534"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.653846" stopColor="#0096DF" />
            <stop offset="0.807692" stopColor="#00A1F0" />
            <stop offset="1" stopColor="#38BEFF" />
          </linearGradient>
        </defs>
        <g filter={`url(#${shadowId})`}>
          <rect
            x="2.0061"
            y="17.5534"
            width="99.0509"
            height="56.4214"
            rx="5.01524"
            fill={`url(#${gradientId})`}
          />
        </g>
      </svg>
    </div>
  );
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
  previewItems,
  onClick,
}: AppIconProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [supportsHover, setSupportsHover] = useState(false);
  const [prefersDirectTap, setPrefersDirectTap] = useState(true);
  const hasPreviewStack = !isChat && Boolean(previewItems?.length);

  useEffect(() => {
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const coarseMedia = window.matchMedia("(hover: none), (pointer: coarse)");

    const syncHoverSupport = () => {
      const touchCapable =
        coarseMedia.matches ||
        navigator.maxTouchPoints > 0 ||
        "ontouchstart" in window;

      setSupportsHover(hoverMedia.matches && !touchCapable);
      setPrefersDirectTap(touchCapable);
    };

    syncHoverSupport();

    if (typeof hoverMedia.addEventListener === "function") {
      hoverMedia.addEventListener("change", syncHoverSupport);
      coarseMedia.addEventListener("change", syncHoverSupport);
    } else {
      hoverMedia.addListener(syncHoverSupport);
      coarseMedia.addListener(syncHoverSupport);
    }

    return () => {
      if (typeof hoverMedia.removeEventListener === "function") {
        hoverMedia.removeEventListener("change", syncHoverSupport);
        coarseMedia.removeEventListener("change", syncHoverSupport);
      } else {
        hoverMedia.removeListener(syncHoverSupport);
        coarseMedia.removeListener(syncHoverSupport);
      }
    };
  }, []);

  const showPreviewStack = hasPreviewStack && !prefersDirectTap;
  const baseClassName =
    "flex min-w-0 w-full max-w-[120px] flex-col items-center gap-1.5 px-2 py-1 text-center touch-manipulation sm:gap-2";
  const iconStyle = {
    width:
      iconWidth ?? (isChat ? "clamp(78px, 25vw, 87px)" : "clamp(88px, 28vw, 99px)"),
    height:
      iconHeight ?? (isChat ? "clamp(78px, 25vw, 87px)" : "clamp(66px, 22vw, 74px)"),
  };

  const shellVariants: Variants = prefersReducedMotion
    ? {
        rest: { scale: 1, y: 0 },
        hover: { scale: 1, y: 0 },
        tap: { scale: 0.98, y: 0 },
        focus: { scale: 1, y: 0 },
      }
    : {
        rest: { scale: 1, y: 0 },
        hover: { scale: 1.03, y: -6 },
        tap: { scale: 0.95, y: -2 },
        focus: { scale: 1.02, y: -4 },
      };
  const iconVariants: Variants = prefersReducedMotion
    ? {
        rest: { filter: "brightness(1)" },
        hover: { filter: "brightness(1.08)" },
        tap: { filter: "brightness(0.98)" },
        focus: { filter: "brightness(1.05)" },
      }
    : {
        rest: { scale: 1, rotate: 0, filter: "brightness(1)" },
        hover: {
          scale: 1.08,
          rotate: 0,
          filter: "brightness(1.08)",
        },
        tap: { scale: 0.97, rotate: 0, filter: "brightness(0.97)" },
        focus: { scale: 1.04, rotate: 0, filter: "brightness(1.06)" },
      };
  const labelVariants: Variants = prefersReducedMotion
    ? {
        rest: { opacity: 0.88 },
        hover: { opacity: 1 },
        tap: { opacity: 1 },
        focus: { opacity: 1 },
      }
    : {
        rest: { opacity: 0.88, y: 0 },
        hover: { opacity: 1, y: -1 },
        tap: { opacity: 1, y: 0 },
        focus: { opacity: 1, y: -1 },
      };
  const badgeVariants: Variants = prefersReducedMotion
    ? {
        rest: { scale: 1 },
        hover: { scale: 1 },
        tap: { scale: 0.96 },
        focus: { scale: 1 },
      }
    : {
        rest: { scale: 1, y: 0 },
        hover: { scale: 1.08, y: -1 },
        tap: { scale: 0.94, y: 0 },
        focus: { scale: 1.04, y: -1 },
      };
  const previewCardVariants: Variants = prefersReducedMotion
    ? {
        rest: { opacity: 0, y: 8, scale: 0.98 },
        hover: { opacity: 1, y: 0, scale: 1 },
        tap: { opacity: 0.96, y: -2, scale: 0.99 },
        focus: { opacity: 1, y: 0, scale: 1 },
      }
    : {
        rest: { opacity: 0, y: 18, scale: 0.9 },
        hover: (item: AppIconPreviewItem) => ({
          opacity: 1,
          y: item.hoverY,
          scale: 1,
          rotate: item.rotate,
        }),
        tap: (item: AppIconPreviewItem) => ({
          opacity: 1,
          y: item.hoverY - 2,
          scale: 0.98,
          rotate: item.rotate,
        }),
        focus: (item: AppIconPreviewItem) => ({
          opacity: 1,
          y: item.hoverY,
          scale: 1,
          rotate: item.rotate,
        }),
      };
  const gestureProps = {
    initial: false,
    animate: "rest",
    whileHover: supportsHover ? "hover" : undefined,
    whileTap: "tap",
    whileFocus: supportsHover ? "focus" : undefined,
    variants: shellVariants,
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 26,
      mass: 0.8,
    },
  };
  const content = (
    <>
      <motion.div
        ref={iconRef}
        variants={iconVariants}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 28,
          mass: 0.8,
        }}
        className="relative"
        style={iconStyle}
      >
        {isChat ? (
          <ChatLauncherArtwork />
        ) : showPreviewStack && previewItems ? (
          <FolderPreviewArtwork
            previewItems={previewItems}
            previewCardVariants={previewCardVariants}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={icon}
            alt={label}
            className="relative z-10 h-full w-full object-contain"
          />
        )}
        {typeof notificationCount === "number" && notificationCount > 0 ? (
          <motion.span
            aria-label={`${notificationCount} unread notification${notificationCount === 1 ? "" : "s"}`}
            className="pointer-events-none absolute -right-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[13px] font-semibold leading-none text-white shadow-[0_8px_20px_rgba(255,59,48,0.5)]"
            variants={badgeVariants}
            transition={{
              type: "spring",
              stiffness: 460,
              damping: 24,
            }}
          >
            {notificationCount}
          </motion.span>
        ) : null}
      </motion.div>
      <motion.span
        variants={labelVariants}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="text-[14px] text-white sm:text-[15px]"
      >
        {label}
      </motion.span>
    </>
  );
  const plainContent = (
    <>
      <div ref={iconRef} className="relative" style={iconStyle}>
        {isChat ? (
          <ChatLauncherArtwork />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={icon}
            alt={label}
            className="relative z-10 h-full w-full object-contain"
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
      <span className="text-[14px] text-white opacity-90 sm:text-[15px]">
        {label}
      </span>
    </>
  );

  if (prefersDirectTap) {
    return (
      <button
        type="button"
        onClick={onClick ?? (() => router.push(href))}
        className={baseClassName}
      >
        {plainContent}
      </button>
    );
  }

  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        {...gestureProps}
        className={baseClassName}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <MotionLink
      href={href}
      {...gestureProps}
      className={baseClassName}
    >
      {content}
    </MotionLink>
  );
}
