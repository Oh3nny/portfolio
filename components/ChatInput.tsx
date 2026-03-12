"use client";

import {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { CHAT_ASSETS, CHAT_MAX_MESSAGE_LENGTH } from "@/lib/chat";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  fullScreen?: boolean;
  mobileLayout?: boolean;
  uiScale?: number;
}

const EMOJI_OPTIONS = [
  "🙂",
  "😂",
  "😍",
  "🥹",
  "😎",
  "🔥",
  "🎉",
  "🤍",
  "🙌",
  "✨",
  "😭",
  "👍",
] as const;

const ATTACHMENT_OPTIONS = [
  {
    id: "photos",
    label: "Photos",
    badge: "PH",
    badgeBackground: "rgba(53, 154, 255, 0.2)",
    badgeColor: "#7CC2FF",
  },
  {
    id: "camera",
    label: "Camera",
    badge: "CA",
    badgeBackground: "rgba(91, 246, 118, 0.18)",
    badgeColor: "#89FF9A",
  },
  {
    id: "files",
    label: "Files",
    badge: "FI",
    badgeBackground: "rgba(255, 255, 255, 0.12)",
    badgeColor: "#F5F5F5",
  },
] as const;

type AttachmentOptionId = (typeof ATTACHMENT_OPTIONS)[number]["id"];

export default function ChatInput({
  onSend,
  disabled,
  fullScreen = false,
  mobileLayout = false,
  uiScale = 1,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  const focusInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !shellRef.current) {
        return;
      }

      if (!shellRef.current.contains(event.target)) {
        setIsAttachmentMenuOpen(false);
        setIsEmojiPickerOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsAttachmentMenuOpen(false);
      setIsEmojiPickerOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!disabled) {
      if (!shouldRestoreFocusRef.current) {
        return;
      }

      shouldRestoreFocusRef.current = false;
      focusInput();
      return;
    }

    setIsAttachmentMenuOpen(false);
    setIsEmojiPickerOpen(false);
  }, [disabled]);

  const handleSend = () => {
    if (!value.trim() || disabled) {
      return;
    }

    shouldRestoreFocusRef.current = true;
    onSend(value.trim());
    setValue("");
    setIsAttachmentMenuOpen(false);
    setIsEmojiPickerOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const appendSnippet = (snippet: string) => {
    setValue((current) => {
      if (!current.trim()) {
        return snippet;
      }

      return `${current.trimEnd()} ${snippet}`;
    });
    focusInput();
  };

  const handleAttachmentOptionClick = (option: AttachmentOptionId) => {
    if (disabled) {
      return;
    }

    setIsEmojiPickerOpen(false);

    if (option === "photos") {
      photoInputRef.current?.click();
      return;
    }

    if (option === "camera") {
      cameraInputRef.current?.click();
      return;
    }

    fileInputRef.current?.click();
  };

  const handleAttachmentSelection =
    (label: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      appendSnippet(`${label}: ${file.name}`);
      setIsAttachmentMenuOpen(false);
      event.target.value = "";
    };

  const handleEmojiSelect = (emoji: string) => {
    setValue((current) => {
      if (!current.trim()) {
        return emoji;
      }

      const separator = /\s$/.test(current) ? "" : " ";
      return `${current}${separator}${emoji}`;
    });
    setIsEmojiPickerOpen(false);
    focusInput();
  };

  const toggleAttachmentMenu = () => {
    if (disabled) {
      return;
    }

    setIsAttachmentMenuOpen((current) => !current);
    setIsEmojiPickerOpen(false);
  };

  const toggleEmojiPicker = () => {
    if (disabled) {
      return;
    }

    setIsEmojiPickerOpen((current) => !current);
    setIsAttachmentMenuOpen(false);
    focusInput();
  };

  const scaleBy = (value: number) => Number((value * uiScale).toFixed(3));
  const actionButtonSize = mobileLayout ? scaleBy(34) : scaleBy(27.43);
  const actionArtworkSize = scaleBy(27.43);
  const inputHeight = mobileLayout ? scaleBy(31) : scaleBy(26.66);
  const inputFontSize = mobileLayout ? scaleBy(16) : scaleBy(11.462);

  return (
    <div
      ref={shellRef}
      className="absolute flex items-center"
      style={{
        left: mobileLayout ? scaleBy(12) : scaleBy(19.72),
        bottom: mobileLayout
          ? `max(${scaleBy(12)}px, env(safe-area-inset-bottom))`
          : scaleBy(20.24),
        right: fullScreen
          ? mobileLayout
            ? scaleBy(12)
            : scaleBy(19.72)
          : undefined,
        width: fullScreen ? undefined : 719.14,
        height: actionButtonSize,
        gap: mobileLayout ? scaleBy(7) : scaleBy(12.19),
      }}
    >
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleAttachmentSelection("Attached photo")}
        className="sr-only"
        tabIndex={-1}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleAttachmentSelection("Attached camera shot")}
        className="sr-only"
        tabIndex={-1}
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleAttachmentSelection("Attached file")}
        className="sr-only"
        tabIndex={-1}
      />

      <div
        className="relative"
        style={{ width: actionButtonSize, height: actionButtonSize }}
      >
        {isAttachmentMenuOpen ? (
          <div
            className="chat-input-popover"
            style={{
              position: "absolute",
              left: 0,
              bottom: `calc(100% + ${scaleBy(10)}px)`,
              width: mobileLayout
                ? `min(${scaleBy(184)}px, calc(100vw - ${scaleBy(28)}px))`
                : scaleBy(184),
              padding: scaleBy(8),
              borderRadius: scaleBy(18),
              transformOrigin: "bottom left",
            }}
          >
            {ATTACHMENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAttachmentOptionClick(option.id)}
                className="chat-input-menu-item"
              >
                <span
                  className="chat-input-menu-badge"
                  style={{
                    background: option.badgeBackground,
                    color: option.badgeColor,
                  }}
                >
                  {option.badge}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleAttachmentMenu}
          disabled={disabled}
          aria-label="Open attachment options"
          aria-haspopup="menu"
          aria-expanded={isAttachmentMenuOpen}
          className="relative cursor-pointer touch-manipulation transition-opacity duration-200 hover:opacity-85 disabled:cursor-default disabled:opacity-70"
          style={{ width: actionButtonSize, height: actionButtonSize }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAT_ASSETS.addButton}
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: actionArtworkSize,
              height: actionArtworkSize,
              transform: "translate(-50%, -50%)",
            }}
          />
        </button>
      </div>

      <div
        className="relative flex items-center"
        style={{
          width: fullScreen ? undefined : scaleBy(639.92),
          flex: 1,
          height: inputHeight,
          borderRadius: mobileLayout ? scaleBy(18) : scaleBy(27.04),
          border: `${scaleBy(0.762)}px solid #606060`,
          background: "rgba(33, 33, 33, 0.2)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={CHAT_MAX_MESSAGE_LENGTH}
          disabled={disabled}
          placeholder="chat"
          enterKeyHint="send"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="h-full w-full bg-transparent outline-none placeholder:text-[rgba(91,89,89,0.72)]"
          style={{
            paddingLeft: mobileLayout ? scaleBy(14) : scaleBy(14.3),
            paddingRight: mobileLayout ? scaleBy(14) : scaleBy(14.3),
            color: "#FFF",
            fontSize: inputFontSize,
            lineHeight: "normal",
          }}
        />
      </div>

      <div
        className="relative"
        style={{ width: actionButtonSize, height: actionButtonSize }}
      >
        {isEmojiPickerOpen ? (
          <div
            className="chat-input-popover"
            style={{
              position: "absolute",
              right: 0,
              bottom: `calc(100% + ${scaleBy(10)}px)`,
              width: mobileLayout
                ? `min(${scaleBy(232)}px, calc(100vw - ${scaleBy(28)}px))`
                : scaleBy(232),
              padding: scaleBy(10),
              borderRadius: scaleBy(20),
              transformOrigin: "bottom right",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: scaleBy(8),
              }}
            >
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="chat-input-emoji-option"
                  aria-label={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleEmojiPicker}
          disabled={disabled}
          aria-label="Open emoji picker"
          aria-haspopup="menu"
          aria-expanded={isEmojiPickerOpen}
          className="relative cursor-pointer touch-manipulation transition-opacity duration-200 hover:opacity-85 disabled:cursor-default disabled:opacity-70"
          style={{ width: actionButtonSize, height: actionButtonSize }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAT_ASSETS.actionButton}
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: actionArtworkSize,
              height: actionArtworkSize,
              transform: "translate(-50%, -50%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHAT_ASSETS.smile}
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: scaleBy(12.06),
              height: scaleBy(12.06),
              transform: "translate(-50%, -50%) scaleY(-1)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
