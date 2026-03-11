import Link from "next/link";

export default function WorkPage() {
  return (
    <main
      className="flex w-full flex-col items-center justify-center gap-6 px-6 text-center"
      style={{
        minHeight: "100dvh",
        background: "#1a1a1a",
        paddingTop: "max(32px, env(safe-area-inset-top))",
        paddingRight: "max(24px, env(safe-area-inset-right))",
        paddingBottom: "max(32px, env(safe-area-inset-bottom))",
        paddingLeft: "max(24px, env(safe-area-inset-left))",
      }}
    >
      <h1 className="text-[24px] text-white">work</h1>
      <p className="text-[15px] text-[#bdbdbd]">coming soon.</p>
      <Link
        href="/"
        className="text-[13px] text-[#359aff] hover:underline transition-all"
      >
        ← back
      </Link>
    </main>
  );
}
