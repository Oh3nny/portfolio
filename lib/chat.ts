export const CHAT_WINDOW = {
  width: 1097,
  height: 780.089,
  padding: 6,
  sidebarWidth: 289,
  contentWidth: 791,
  sidebarHeight: 768,
  contentHeight: 769,
  viewportPadding: 32,
} as const;

export const CHAT_DESKTOP = {
  width: 1440,
  height: 1024,
  windowLeft: 171,
  windowTop: 122,
  backgroundLeft: -99,
  backgroundTop: 0,
  backgroundWidth: 1638,
  backgroundHeight: 1024,
  viewportPadding: 32,
} as const;

export const CHAT_ASSETS = {
  actionButton: "/figma-chat/action-button.svg",
  addButton: "/figma-chat/add-button.svg",
  assistantBubble: "/figma-chat/assistant-bubble.svg",
  avatar: "/figma-chat/avatar.png",
  background: "/figma-chat/background.png",
  search: "/figma-chat/search.svg",
  smile: "/figma-chat/smile.svg",
  trafficLights: "/figma-chat/traffic-lights.svg",
  userTail: "/figma-chat/user-tail.svg",
} as const;

export const CHAT_MAX_MESSAGE_LENGTH = 1000;
export const CHAT_MAX_HISTORY_MESSAGES = 6;
export const INTRO_ASSISTANT_MESSAGE =
  "hey, i'm ohenny. ask whatever you want about my background, tools, travel, or what i'm into outside work.";
export const CHAT_ERROR_MESSAGE =
  "something went wrong on my side. try asking again in a second.";

export function formatChatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatChatDayTime(date: Date) {
  return `Today ${formatChatTime(date)}`;
}

export function normalizeChatSearchQuery(query: string) {
  return query.trim().toLocaleLowerCase();
}

export function chatTextMatchesSearch(text: string, normalizedQuery: string) {
  if (!normalizedQuery) {
    return false;
  }

  return text.toLocaleLowerCase().includes(normalizedQuery);
}
