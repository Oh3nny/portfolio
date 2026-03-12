import Link from "next/link";

const SKILL_SECTIONS = [
  {
    title: "Design",
    items: ["Figma", "Photoshop", "Illustrator", "InDesign"],
  },
  {
    title: "Video",
    items: ["DaVinci Resolve", "Premier Pro"],
  },
  {
    title: "AI & Prototyping",
    items: [
      "Midjourney",
      "Claude Code",
      "OpenAI Codex",
      "Kling",
      "Gemini's Nano Banana",
      "Chat GPT",
    ],
  },
  {
    title: "Productivity",
    items: ["Microsoft Office (Excel, Word, PowerPoint)"],
  },
] as const;

export default function CvPage() {
  return (
    <main
      className="relative flex w-full items-center justify-center px-6 text-white"
      style={{
        minHeight: "100dvh",
        background: "#1a1a1a",
        paddingTop: "max(32px, env(safe-area-inset-top))",
        paddingRight: "max(24px, env(safe-area-inset-right))",
        paddingBottom: "max(40px, env(safe-area-inset-bottom))",
        paddingLeft: "max(24px, env(safe-area-inset-left))",
      }}
    >
      <Link
        href="/"
        className="absolute text-[13px] text-[#bdbdbd] transition-all hover:text-white hover:underline"
        style={{
          left: "max(24px, env(safe-area-inset-left))",
          top: "max(24px, env(safe-area-inset-top))",
        }}
      >
        ← back
      </Link>

      <div className="mx-auto flex w-full max-w-3xl flex-col justify-center">
        <div className="flex flex-col gap-2 text-left">
          <h1 className="font-mono text-[30px] tracking-[-0.04em] text-white sm:text-[34px]">
            skills.md
          </h1>
          <p className="text-[15px] leading-6 text-[#7f7f7f]">
            Tools across design, video, AI prototyping, and workflow.
          </p>
        </div>

        <div className="mt-10 h-px w-full bg-white/10" />

        <section className="mt-10 flex flex-col gap-8">
          {SKILL_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8"
            >
              <h2 className="font-mono text-[13px] uppercase tracking-[0.14em] text-[#7f7f7f]">
                {section.title}
              </h2>
              <p className="text-left text-[15px] leading-7 text-white sm:text-right sm:text-[16px]">
                {section.items.join(", ")}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
