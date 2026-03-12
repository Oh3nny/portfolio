import Image from "next/image";
import Link from "next/link";

import { getDesignMediaItems, type DesignMediaItem } from "@/lib/designs";

const GALLERY_GAP = "1.5rem";

function getStableShuffleValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getGalleryItems(items: DesignMediaItem[]) {
  const stillItems = items
    .filter((item) => item.type === "image")
    .sort(
      (left, right) =>
        getStableShuffleValue(left.fileName) - getStableShuffleValue(right.fileName) ||
        left.fileName.localeCompare(right.fileName, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
    );
  const videoItems = items.filter((item) => item.type === "video");

  if (videoItems.length === 0) {
    return stillItems;
  }

  const combined: DesignMediaItem[] = [];
  const sliceSize = Math.max(2, Math.ceil(stillItems.length / (videoItems.length + 1)));

  for (let index = 0; index < stillItems.length; index += 1) {
    combined.push(stillItems[index]);

    const shouldInsertVideo =
      (index + 1) % sliceSize === 0 && videoItems[combined.filter((item) => item.type === "video").length];

    if (shouldInsertVideo) {
      const nextVideoIndex = combined.filter((item) => item.type === "video").length;
      combined.push(videoItems[nextVideoIndex]);
    }
  }

  for (let index = combined.filter((item) => item.type === "video").length; index < videoItems.length; index += 1) {
    combined.push(videoItems[index]);
  }

  return combined;
}

function MediaCard({
  item,
  index,
}: {
  item: DesignMediaItem;
  index: number;
}) {
  return (
    <article
      className="inline-block w-full break-inside-avoid overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
      style={{ marginBottom: GALLERY_GAP }}
    >
      <div className="overflow-hidden bg-black/20">
        {item.type === "video" ? (
          <video
            src={item.src}
            poster={item.posterSrc}
            controls
            playsInline
            preload={index === 0 ? "metadata" : "none"}
            className="block h-auto w-full bg-[#111]"
            aria-label={item.title}
          />
        ) : item.width && item.height ? (
          <Image
            src={item.src}
            alt={item.title}
            width={item.width}
            height={item.height}
            sizes="(min-width: 1280px) 31vw, (min-width: 640px) 47vw, 100vw"
            priority={index < 2}
            className="block h-auto w-full"
          />
        ) : (
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        )}
      </div>
    </article>
  );
}

export default async function PlayPage() {
  const mediaItems = await getDesignMediaItems();
  const galleryItems = getGalleryItems(mediaItems);
  const hasItems = mediaItems.length > 0;

  return (
    <main
      className="w-full px-6 text-white"
      style={{
        minHeight: "100dvh",
        background: "#1a1a1a",
        paddingTop: "max(32px, env(safe-area-inset-top))",
        paddingRight: "max(24px, env(safe-area-inset-right))",
        paddingBottom: "max(40px, env(safe-area-inset-bottom))",
        paddingLeft: "max(24px, env(safe-area-inset-left))",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-4 text-left">
          <Link
            href="/"
            className="w-fit text-[13px] text-[#bdbdbd] transition-all hover:text-white hover:underline"
          >
            ← back
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-white">
              play
            </h1>
            <p className="max-w-2xl text-[15px] leading-6 text-[#bdbdbd]">
              A mixed wall of work, motion, and photos pulled directly from the
              project&apos;s `designs` folder.
            </p>
          </div>
        </div>

        {hasItems ? (
          <div className="flex w-full justify-center">
            <section
              className="w-full max-w-[1080px] columns-1 sm:columns-2 xl:columns-3"
              style={{ columnGap: GALLERY_GAP }}
            >
              {galleryItems.map((item, index) => (
                <MediaCard
                  key={item.fileName}
                  item={item}
                  index={index}
                />
              ))}
            </section>
          </div>
        ) : (
          <section className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-[15px] text-[#bdbdbd]">
              No supported media files were found in `designs/` yet.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
