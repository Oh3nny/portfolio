import { readFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { CHAT_MAX_HISTORY_MESSAGES, CHAT_MAX_MESSAGE_LENGTH } from "@/lib/chat";
import { env } from "@/lib/env";
import { applyNoStoreHeaders, applySecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

type ChatMessage = {
  content: string;
  role: "assistant" | "user";
};

type KnowledgeSections = Map<string, string>;

type ChatRequestBody = {
  history?: ChatMessage[];
  message?: string;
};

const CAPABILITIES_REPLY =
  "i can talk about my background, where i'm from, architecture education, ai thesis work, early interest in tech, the tools i use, how i prototype with ai, travel, and what i'm like outside work too.";
const MAX_OUTPUT_TOKENS = 120;
const MAX_REPLY_SENTENCES = 2;
const MAX_REQUEST_SIZE_BYTES = 16_384;
const MODERATION_REPLY =
  "i can't help with that request. ask me something about my background, work, or interests instead.";
const OFF_TOPIC_REPLY =
  "i'm here to talk about me, my background, tools, travel, and interests. ask me something in that lane.";
const CHAT_PERSONA_PROMPT = [
  "You are Ohenny, chatting directly with someone on your portfolio site.",
  "Always speak in first person as Ohenny.",
  "Never refer to Ohenny as 'he', 'him', or 'Ohenny' when answering about yourself.",
  "If the user asks about 'Ohenny' in third person, still answer as 'I' or 'me'.",
  "Speak in first person and sound natural, warm, thoughtful, and lightly informal.",
  "Keep it conversational, not polished or performative.",
  "You are allowed to have normal conversation, not just answer biography questions.",
  "If someone is just chatting, chat back like a real person and do not force it back to design, architecture, or career.",
  "For casual chat like 'how are you', 'what's up', banter, or light jokes, keep it simple and do not volunteer portfolio topics unless asked.",
  "Sound like an actual chat, not a written profile.",
  "Answer the actual question first.",
  "Use 1 sentence when you can and 2 sentences when you need them. Do not go beyond 2 sentences.",
  "Do not write full paragraphs.",
  "Use simple everyday phrasing, like how two people would actually talk.",
  "Use plain English only.",
  "Never use em dashes.",
  "Vary your phrasing and sentence rhythm so the conversation does not feel scripted.",
  "Use concrete details from the biography when they help, but paraphrase them naturally instead of echoing the original wording.",
  "Avoid CV language, grand statements, and inspirational closing lines unless the user asks for a fuller answer.",
  "Not every answer needs to connect back to design, work, or career growth.",
  "Do not bring up design, architecture, or career unless the user asked about it or it genuinely helps answer the question.",
  "If the user asks about personality, free time, hobbies, travel, friends, or family, answer that directly and casually.",
  "Have a light sense of humour when it fits, more dry and casual than performative.",
  "A small cheeky aside is fine sometimes, but never force the joke.",
  "Avoid awkward wordplay, forced metaphors, or trying too hard to sound clever.",
  "Avoid assistant-y phrases like 'happy to chat', 'great question', 'i'd love to', or 'honestly, it came down to'.",
  "Do not start replies with 'honestly', 'to be honest', or anything like that.",
  "Do not restate the user's question in the first clause of your reply.",
  "Avoid stiff openings like 'I moved from architecture into digital product design because...' or 'Architecture school was a mix of...'",
  "Do not end most replies with a follow-up question. Only ask one if the user clearly wants to keep digging into that exact topic.",
  "Short answers should feel like spoken conversation, not memoir excerpts.",
  "Style reference: instead of 'I moved from architecture into digital product design because...', say something closer to 'for me it was mostly about pace.'",
  "Style reference: instead of 'Architecture school was a mix of...', say something closer to 'it was intense, and there were bits i really liked, but i also knew it wasn't fully me.'",
  "For factual questions about my life, background, tools, or experience, stay grounded in the supplied biography facts.",
  "If the user asks whether I code, answer clearly that I do not code in the traditional sense and that I use AI tools to speed up my workflow and prototype ideas.",
  "For casual conversation, humour, or general chat, you can answer naturally without forcing biography facts in.",
  "If the user asks something unrelated to me, my background, work, tools, travel, or interests, briefly say you're here to chat about me and my portfolio.",
  "If a user asks for a specific personal fact that is not in the context, say you don't have that detail here yet.",
  "Do not invent employers, project names, dates, awards, locations, or qualifications.",
].join(" ");
const COMMON_SEARCH_TERMS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "being",
  "from",
  "have",
  "into",
  "just",
  "like",
  "more",
  "really",
  "that",
  "their",
  "them",
  "they",
  "this",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your",
  "you",
  "tell",
]);

const openai = env.openAiApiKey
  ? new OpenAI({ apiKey: env.openAiApiKey })
  : null;

const INTENT_RULES = [
  {
    keywords: [
      "name",
      "who are you",
      "who re you",
      "who is ohenny",
      "call you",
      "about yourself",
      "tell me about yourself",
      "tell me about you",
      "about you",
      "yourself",
      "background",
    ],
    sections: ["Who I Am", "Where I'm From"],
  },
  {
    keywords: [
      "where are you from",
      "where are u from",
      "where do you live",
      "where do u live",
      "where do you stay",
      "ghana",
      "uk",
      "britain",
      "british",
      "grew up",
      "grown up",
      "brought up",
      "raised",
      "moved to the uk",
      "move to the uk",
      "roots",
      "origin",
      "home",
      "based",
      "live in",
    ],
    sections: ["Where I'm From"],
  },
  {
    keywords: ["start", "childhood", "creative", "drawing", "draw", "mum", "mother"],
    sections: ["Where It All Started"],
  },
  {
    keywords: [
      "tech",
      "technology",
      "iphone",
      "jailbreak",
      "cydia",
      "apple",
      "apps",
      "youtube",
    ],
    sections: ["Technology Finds Me Early"],
  },
  {
    keywords: ["school", "secondary", "education", "university", "subjects"],
    sections: ["The Creative Kid in School"],
  },
  {
    keywords: ["architecture", "bachelor", "2:1", "degree", "pandemic", "critique"],
    sections: ["Architecture School: The Hard Road to Clarity"],
  },
  {
    keywords: ["masters", "master's", "thesis", "ai", "generative ai", "research"],
    sections: ["Masters, AI, and the Pivot"],
  },
  {
    keywords: [
      "tools",
      "tool",
      "workflow",
      "software",
      "stack",
      "code",
      "coding",
      "developer",
      "engineer",
      "do you code",
      "can you code",
      "what do you use",
      "what tools do you use",
      "layout",
      "present",
      "presentation",
      "presenting",
      "defend your decisions",
      "defend decisions",
      "design decisions",
      "crit",
      "critique",
      "prototype",
      "prototyping",
      "ai prototype",
      "ai prototyping",
      "photoshop",
      "illustrator",
      "figma",
      "claude code",
      "codex",
      "openai codex",
      "davinci",
      "davinci resolve",
      "midjourney",
      "nano banana",
      "gemini",
      "kling",
      "video tools",
      "ai video",
    ],
    sections: ["Tools and Creative Workflow"],
  },
  {
    keywords: [
      "ui",
      "ux",
      "digital",
      "product design",
      "digital design",
      "pivot",
      "switch",
      "why digital",
      "why leave architecture",
      "future",
      "goal",
      "interested",
      "claude code",
    ],
    sections: ["The Digital Environment"],
  },
  {
    keywords: [
      "travel",
      "travelling",
      "traveling",
      "trip",
      "trips",
      "countries",
      "places",
      "been to",
      "visited",
      "visit",
      "japan",
      "brazil",
      "dubai",
      "italy",
      "switzerland",
      "new york",
      "paris",
      "free time",
      "outside work",
      "outside of work",
      "outside design",
      "hobby",
      "hobbies",
      "basketball",
      "cinematography",
      "film",
      "movies",
      "family",
      "friends",
      "travel",
      "travelling",
      "traveling",
      "weekend",
      "fun",
      "personality",
      "what are you like",
      "what do you do for fun",
    ],
    sections: ["Travel and Perspective", "Outside of Design"],
  },
];

let knowledgePromise: Promise<KnowledgeSections> | null = null;

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitIntoSentences(content: string) {
  return content
    .replace(/^---$/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getSearchTerms(content: string) {
  return normalizeText(content)
    .split(" ")
    .filter((term) => term.length > 2 && !COMMON_SEARCH_TERMS.has(term));
}

function summarizeSection(content: string, sentenceCount = 2) {
  return splitIntoSentences(content).slice(0, sentenceCount).join(" ");
}

function clampReplyText(content: string) {
  const normalizedContent = content
    .replace(/[—–]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedContent) {
    return "";
  }

  return splitIntoSentences(normalizedContent)
    .slice(0, MAX_REPLY_SENTENCES)
    .join(" ")
    .trim();
}

function parseKnowledgeBase(markdown: string) {
  const matches = [...markdown.matchAll(/^## (.+)$/gm)];
  const sections: KnowledgeSections = new Map();

  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const title = match[1].trim();
    const content = markdown.slice(start, end).trim();

    sections.set(title, content);
  });

  return sections;
}

async function loadKnowledgeBase() {
  if (!knowledgePromise) {
    knowledgePromise = readFile(
      path.join(process.cwd(), "ohenny-bio-knowledge-base.md"),
      "utf8"
    ).then(parseKnowledgeBase);
  }

  return knowledgePromise;
}

function createJsonResponse(body: Record<string, string>, status = 200) {
  const response = NextResponse.json(body, { status });

  applySecurityHeaders(response.headers);
  applyNoStoreHeaders(response.headers);

  return response;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidChatRole(value: unknown): value is ChatMessage["role"] {
  return value === "assistant" || value === "user";
}

function parseChatRequestBody(body: unknown) {
  if (!isRecord(body)) {
    return null;
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message || message.length > CHAT_MAX_MESSAGE_LENGTH) {
    return null;
  }

  const history = Array.isArray(body.history)
    ? body.history.slice(-CHAT_MAX_HISTORY_MESSAGES)
    : [];
  const sanitizedHistory: ChatMessage[] = [];

  for (const entry of history) {
    if (!isRecord(entry) || !isValidChatRole(entry.role)) {
      return null;
    }

    const content = typeof entry.content === "string" ? entry.content.trim() : "";

    if (!content) {
      continue;
    }

    if (content.length > CHAT_MAX_MESSAGE_LENGTH) {
      return null;
    }

    sanitizedHistory.push({
      role: entry.role,
      content,
    });
  }

  return {
    message,
    history: sanitizedHistory,
  };
}

function includesAny(normalizedMessage: string, keywords: string[]) {
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) {
      return false;
    }

    return new RegExp(`(^|\\s)${escapeRegExp(normalizedKeyword)}(?=\\s|$)`).test(
      normalizedMessage
    );
  });
}

function needsFollowUpContext(normalizedMessage: string) {
  return includesAny(normalizedMessage, [
    "that",
    "it",
    "this",
    "more",
    "tell me more",
    "go deeper",
    "elaborate",
  ]);
}

function isCasualConversation(normalizedMessage: string) {
  return includesAny(normalizedMessage, [
    "hi",
    "hello",
    "hey",
    "yo",
    "how are you",
    "how re you",
    "how r you",
    "you good",
    "what s up",
    "whats up",
    "sup",
    "you funny",
    "are you funny",
    "thanks",
    "thank you",
    "cheers",
  ]);
}

function getMatchedSectionTitlesFromContext(contextualMessage: string) {
  return INTENT_RULES.flatMap((rule) =>
    includesAny(contextualMessage, rule.keywords) ? rule.sections : []
  );
}

function isRelevantConversation(message: string, history: ChatMessage[]) {
  const contextualMessage = getContextualMessage(message, history);

  if (!contextualMessage) {
    return true;
  }

  if (
    isCasualConversation(contextualMessage) ||
    includesAny(contextualMessage, ["help", "what can you answer", "what can you tell me"])
  ) {
    return true;
  }

  return getMatchedSectionTitlesFromContext(contextualMessage).length > 0;
}

function getContextualMessage(message: string, history: ChatMessage[]) {
  const normalizedMessage = normalizeText(message);

  if (!needsFollowUpContext(normalizedMessage)) {
    return normalizedMessage;
  }

  const previousUserMessage = [...history]
    .reverse()
    .find((entry) => entry.role === "user" && normalizeText(entry.content) !== normalizedMessage);

  return previousUserMessage
    ? `${normalizeText(previousUserMessage.content)} ${normalizedMessage}`
    : normalizedMessage;
}

function getRelevantSectionTitles(message: string, history: ChatMessage[]) {
  const contextualMessage = getContextualMessage(message, history);
  const matchedTitles = getMatchedSectionTitlesFromContext(contextualMessage);

  if (matchedTitles.length > 0) {
    return [...new Set(matchedTitles)];
  }

  return ["Who I Am", "The Digital Environment"];
}

function buildKnowledgeContext(
  message: string,
  history: ChatMessage[],
  sections: KnowledgeSections
) {
  const contextualMessage = getContextualMessage(message, history);

  if (isCasualConversation(contextualMessage)) {
    return "";
  }

  const searchTerms = getSearchTerms(contextualMessage);
  const sectionTitles = getRelevantSectionTitles(message, history);
  const candidates = sectionTitles.flatMap((sectionTitle) => {
    const content = sections.get(sectionTitle);

    if (!content) {
      return [];
    }

    return splitIntoSentences(content).map((sentence, index) => {
      const normalizedSentence = normalizeText(sentence);
      const termMatches = searchTerms.reduce(
        (score, term) => score + (normalizedSentence.includes(term) ? 1 : 0),
        0
      );

      return {
        sentence,
        score: termMatches * 3 + (index === 0 ? 1 : 0),
      };
    });
  });

  const topSentences = candidates
    .sort((left, right) => right.score - left.score)
    .filter((candidate, index, list) => {
      if (index === 0) {
        return true;
      }

      return list.findIndex((item) => item.sentence === candidate.sentence) === index;
    })
    .slice(0, 6)
    .map((candidate) => candidate.sentence);

  if (topSentences.length === 0) {
    return "";
  }

  return ["Relevant facts from Ohenny's biography:", ...topSentences.map((sentence) => `- ${sentence}`)].join(
    "\n"
  );
}

function formatConversationHistory(history: ChatMessage[]) {
  if (history.length === 0) {
    return "No prior conversation.";
  }

  return history
    .slice(-CHAT_MAX_HISTORY_MESSAGES)
    .map((entry) => `${entry.role === "assistant" ? "Assistant" : "User"}: ${entry.content}`)
    .join("\n");
}

function buildReply(message: string, history: ChatMessage[], sections: KnowledgeSections) {
  const contextualMessage = getContextualMessage(message, history);

  if (!contextualMessage) {
    return CAPABILITIES_REPLY;
  }

  if (includesAny(contextualMessage, ["hi", "hello", "hey", "yo"])) {
    return "hey, i'm ohenny. ask whatever you want about my background, tools, travel, or what i'm into outside work.";
  }

  if (includesAny(contextualMessage, ["help", "what can you answer", "what can you tell me"])) {
    return CAPABILITIES_REPLY;
  }

  if (includesAny(contextualMessage, ["how are you", "how're you", "how r you", "you good"])) {
    return "i'm good. just here, chatting and trying not to sound like a linkedin post.";
  }

  if (includesAny(contextualMessage, ["what's up", "whats up", "sup", "yo"])) {
    return "not much, just here for a proper convo.";
  }

  if (includesAny(contextualMessage, ["thanks", "thank you", "cheers"])) {
    return "anytime.";
  }

  const matchedRule = INTENT_RULES.find((rule) =>
    includesAny(contextualMessage, rule.keywords)
  );

  if (matchedRule) {
    return matchedRule.sections
      .map((sectionTitle) => sections.get(sectionTitle))
      .filter((section): section is string => Boolean(section))
      .map((section) => summarizeSection(section))
      .join("\n\n");
  }

  return OFF_TOPIC_REPLY;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLengthHeader = request.headers.get("content-length");

  if (!contentType.toLowerCase().includes("application/json")) {
    return createJsonResponse(
      { error: "Expected an application/json request body." },
      415
    );
  }

  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);

    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE_BYTES) {
      return createJsonResponse({ error: "Request body is too large." }, 413);
    }
  }

  const rawBody = (await request.json().catch(() => null)) as ChatRequestBody | null;
  const parsedBody = parseChatRequestBody(rawBody);

  if (!parsedBody) {
    return createJsonResponse(
      {
        error:
          "Invalid chat payload. Send a message string and an optional history array.",
      },
      400
    );
  }

  const { history, message } = parsedBody;
  const normalizedHistory =
    history[history.length - 1]?.role === "user" &&
    history[history.length - 1]?.content === message
      ? history.slice(0, -1)
      : history;

  if (!isRelevantConversation(message, normalizedHistory)) {
    return createJsonResponse({ reply: OFF_TOPIC_REPLY });
  }

  const knowledgeBase = await loadKnowledgeBase();

  if (!openai) {
    return createJsonResponse({
      reply: buildReply(message, normalizedHistory, knowledgeBase),
    });
  }

  try {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: message,
    });

    if (moderation.results[0]?.flagged) {
      return createJsonResponse({ reply: MODERATION_REPLY }, 200);
    }

    const context = buildKnowledgeContext(message, normalizedHistory, knowledgeBase);
    const response = await openai.responses.create({
      model: env.openAiModel,
      max_output_tokens: MAX_OUTPUT_TOKENS,
      store: false,
      reasoning: {
        effort: "minimal",
      },
      text: {
        verbosity: "low",
      },
      instructions: CHAT_PERSONA_PROMPT,
      input: [
        "Biography context:",
        context || "No relevant context found.",
        "",
        "Recent conversation:",
        formatConversationHistory(normalizedHistory),
        "",
        `Latest user message: ${message}`,
      ].join("\n"),
    });

    const reply = response.output_text.trim();

    return createJsonResponse({
      reply:
        clampReplyText(reply) ||
        clampReplyText(buildReply(message, normalizedHistory, knowledgeBase)),
    });
  } catch (error) {
    console.error("OpenAI chat request failed", error);

    return createJsonResponse({
      reply: clampReplyText(buildReply(message, normalizedHistory, knowledgeBase)),
    });
  }
}
