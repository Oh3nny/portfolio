import "server-only";

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DESIGNS_DIR = path.join(process.cwd(), "designs");
const PLAY_POSTERS_DIR = path.join(process.cwd(), "public", "play-posters");
const STATIC_MEDIA_PATH = "/designs-media";

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".jpe",
  ".png",
  ".webp",
]);

const PREVIEW_LAYOUT = [
  {
    centerX: 24,
    bottom: 12,
    width: 34,
    hoverY: -30,
    rotate: -14,
    zIndex: 1,
  },
  {
    centerX: 50,
    bottom: 14,
    width: 38,
    hoverY: -46,
    rotate: -3,
    zIndex: 3,
  },
  {
    centerX: 76,
    bottom: 12,
    width: 34,
    hoverY: -28,
    rotate: 11,
    zIndex: 2,
  },
] as const;
const PHOTO_FILE_NAME_PATTERNS = [
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^img[_-]?\d+/i,
  /^dsc[_-]?\d+/i,
  /^pxl[_-]?\d+/i,
] as const;

export type DesignMediaItem = {
  fileName: string;
  title: string;
  category: "design" | "video" | "photo";
  type: "image" | "video";
  src: string;
  updatedAt: number;
  width?: number;
  height?: number;
  posterSrc?: string;
};

export type DesignPreviewItem = {
  src: string;
  bottom: number;
  centerX: number;
  width: number;
  hoverY: number;
  rotate: number;
  zIndex?: number;
};

function getMediaTitle(fileName: string) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMediaType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video" as const;
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image" as const;
  }

  return null;
}

function getGalleryCategory(fileName: string, type: "image" | "video") {
  if (type === "video") {
    return "video" as const;
  }

  const baseName = path.basename(fileName, path.extname(fileName));

  return PHOTO_FILE_NAME_PATTERNS.some((pattern) => pattern.test(baseName))
    ? ("photo" as const)
    : ("design" as const);
}

async function getPosterSrc(fileName: string) {
  const posterExtensions = [".jpg", ".png"];

  for (const extension of posterExtensions) {
    const posterFileName = `${fileName}${extension}`;
    const posterPath = path.join(PLAY_POSTERS_DIR, posterFileName);

    try {
      await stat(posterPath);
      return `/play-posters/${encodeURIComponent(posterFileName)}`;
    } catch {
      continue;
    }
  }

  return undefined;
}

export async function getDesignMediaItems(): Promise<DesignMediaItem[]> {
  let entries;

  try {
    entries = await readdir(DESIGNS_DIR, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const items: Array<DesignMediaItem | null> = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map(async (entry) => {
        const type = getMediaType(entry.name);

        if (!type) {
          return null;
        }

        const filePath = path.join(DESIGNS_DIR, entry.name);
        const { mtimeMs } = await stat(filePath);
        const category = getGalleryCategory(entry.name, type);
        const metadata =
          type === "image" ? await sharp(filePath).metadata() : undefined;
        const posterSrc = type === "video" ? await getPosterSrc(entry.name) : undefined;

        return {
          fileName: entry.name,
          title: getMediaTitle(entry.name),
          category,
          type,
          src: `${STATIC_MEDIA_PATH}/${encodeURIComponent(entry.name)}`,
          updatedAt: mtimeMs,
          width: metadata?.width,
          height: metadata?.height,
          posterSrc,
        };
      }),
  );

  return items
    .filter((item): item is DesignMediaItem => item !== null)
    .sort(
      (left, right) =>
        right.updatedAt - left.updatedAt ||
        left.fileName.localeCompare(right.fileName, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
    );
}

export async function getDesignPreviewItems(
  limit = PREVIEW_LAYOUT.length,
): Promise<DesignPreviewItem[]> {
  const mediaItems = await getDesignMediaItems();

  return mediaItems
    .filter((item) => item.type === "image")
    .slice(0, limit)
    .map((item, index) => ({
      src: item.src,
      ...PREVIEW_LAYOUT[index],
    }));
}
