"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import AppIcon, { type AppIconPreviewItem } from "@/components/AppIcon";
import ChatDesktop from "@/components/ChatDesktop";
import ProfileIcon from "@/components/ProfileIcon";
import { CHAT_ASSETS } from "@/lib/chat";

type HomePageClientProps = {
  playPreviewItems?: readonly AppIconPreviewItem[];
};

export default function HomePageClient({
  playPreviewItems,
}: HomePageClientProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(true);
  const [isPhoneLayout, setIsPhoneLayout] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const updateLayoutMode = () => {
      setIsPhoneLayout(Math.min(window.innerWidth, window.innerHeight) < 768);
    };

    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);

    return () => {
      window.removeEventListener("resize", updateLayoutMode);
    };
  }, []);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    const { documentElement, body } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlOverscroll = documentElement.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [chatOpen]);

  const handleChatOpen = () => {
    setShowChatNotification(false);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  const stackVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? undefined
        : {
            staggerChildren: 0.14,
          },
    },
  };
  const entryVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }
    : {
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };
  const gridVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? undefined
        : {
            staggerChildren: 0.07,
            delayChildren: 0.06,
          },
    },
  };

  return (
    <main
      className="relative w-full overflow-x-hidden overflow-y-auto"
      style={{ minHeight: "100dvh", background: "#1A1A1A" }}
    >
      <div
        className={`relative z-10 mx-auto flex min-h-[100dvh] w-full flex-col items-center justify-center ${
          isPhoneLayout ? "max-w-[420px]" : ""
        }`}
        style={{
          pointerEvents: chatOpen ? "none" : "auto",
          paddingTop: "max(28px, env(safe-area-inset-top))",
          paddingRight: "max(18px, env(safe-area-inset-right))",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
          paddingLeft: "max(18px, env(safe-area-inset-left))",
        }}
      >
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={stackVariants}
          className={`flex flex-col items-center ${
            isPhoneLayout ? "w-full gap-14" : "w-fit gap-10 md:gap-16"
          }`}
        >
          <motion.div
            variants={entryVariants}
            className="flex flex-col items-center gap-2.5 text-center sm:gap-3"
          >
            <ProfileIcon />
            <span className="text-[14px] text-white md:text-[15px]">@im_oaa</span>
          </motion.div>

          <motion.div
            variants={gridVariants}
            className={`w-full ${
              isPhoneLayout
                ? "grid max-w-[340px] grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:max-w-[420px] sm:gap-x-8 sm:gap-y-10"
                : "flex w-fit items-end justify-center gap-16 lg:gap-24"
            }`}
          >
            <motion.div variants={entryVariants}>
              <AppIcon
                icon="/icons/folder-work.svg"
                label="work"
                href="/work"
              />
            </motion.div>
            <motion.div variants={entryVariants}>
              <AppIcon
                icon="/icons/folder-play.svg"
                label="play"
                href="/play"
                previewItems={playPreviewItems}
              />
            </motion.div>
            <motion.div variants={entryVariants}>
              <AppIcon
                icon=""
                label="chat"
                href="#"
                isChat
                notificationCount={showChatNotification ? 1 : undefined}
                onClick={handleChatOpen}
              />
            </motion.div>
            <motion.div variants={entryVariants}>
              <AppIcon
                icon="/icons/document.svg"
                label="skills.md"
                href="/cv"
                iconWidth={61}
                iconHeight={87}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div
        aria-hidden={!chatOpen}
        className="fixed inset-0 z-20"
        style={{
          backgroundImage: `url(${CHAT_ASSETS.background})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: chatOpen ? 1 : 0,
          visibility: chatOpen ? "visible" : "hidden",
          pointerEvents: chatOpen ? "auto" : "none",
          overflow: "hidden",
          overscrollBehavior: "none",
          touchAction: isPhoneLayout ? "pan-y" : "auto",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "rgba(13, 16, 20, 0.08)" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <ChatDesktop onClose={handleChatClose} />
        </div>
      </div>
    </main>
  );
}
