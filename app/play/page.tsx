import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "#1a1a1a" }}
    >
      <h1 className="text-[24px] text-white">play</h1>
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
