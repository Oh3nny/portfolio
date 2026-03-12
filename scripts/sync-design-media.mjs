import { access, cp, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { randomInt } from "node:crypto";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");
const execFileAsync = promisify(execFile);

const SOURCE_DIR = path.join(process.cwd(), "designs");
const TARGET_DIR = path.join(process.cwd(), "public", "designs-media");
const PROFILE_ROOT_DIR = process.cwd();
const PROFILE_BASE_SOURCE = path.join(process.cwd(), "public", "profile-hover.mp4");
const PROFILE_SEQUENCE_TARGET = path.join(process.cwd(), "public", "profile-hover-sequence.mp4");
const PROFILE_CLIPS_DIR = path.join(process.cwd(), "public", "profile-clips");
const PROFILE_MANIFEST_DIR = path.join(process.cwd(), "lib", "generated");
const LEGACY_PROFILE_ALT_TARGET = path.join(process.cwd(), "public", "profile-hover-alt.mp4");
const PROFILE_SEQUENCE_REPEATS = 3;
const PROFILE_SEQUENCE_FADE_SECONDS = 0.35;
const PROFILE_SEQUENCE_SIZE = 480;
const SUPPORTED_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".jpe",
  ".mp4",
  ".png",
  ".webm",
  ".webp",
]);
const PROFILE_VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);

function isSupportedFile(name) {
  return SUPPORTED_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function isProfileVideoFile(name) {
  return PROFILE_VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase());
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function syncDesignMedia() {
  await mkdir(TARGET_DIR, { recursive: true });

  let sourceEntries = [];

  try {
    sourceEntries = await readdir(SOURCE_DIR, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }

    throw error;
  }

  const mediaFiles = sourceEntries
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && isSupportedFile(entry.name))
    .map((entry) => entry.name);
  const keep = new Set(mediaFiles);

  await Promise.all(
    mediaFiles.map((fileName) =>
      cp(path.join(SOURCE_DIR, fileName), path.join(TARGET_DIR, fileName), {
        force: true,
      }),
    ),
  );

  const targetEntries = await readdir(TARGET_DIR, { withFileTypes: true });

  await Promise.all(
    targetEntries
      .filter((entry) => entry.isFile() && !keep.has(entry.name))
      .map((entry) => rm(path.join(TARGET_DIR, entry.name))),
  );
}

async function getProfileVideoSources() {
  const profileSources = [];

  if (await fileExists(PROFILE_BASE_SOURCE)) {
    profileSources.push(PROFILE_BASE_SOURCE);
  }

  const rootEntries = await readdir(PROFILE_ROOT_DIR, { withFileTypes: true });
  const rootVideoSources = rootEntries
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && isProfileVideoFile(entry.name))
    .map((entry) => path.join(PROFILE_ROOT_DIR, entry.name))
    .sort((left, right) => path.basename(left).localeCompare(path.basename(right)));

  return [...new Set([...profileSources, ...rootVideoSources])];
}

function parseDurationSeconds(output) {
  const match = output.match(/Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)/);

  if (!match) {
    return null;
  }

  const [, hours, minutes, seconds] = match;

  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

async function getVideoDurationSeconds(filePath) {
  try {
    await execFileAsync(ffmpegPath, ["-i", filePath]);
  } catch (error) {
    const output = `${error?.stdout ?? ""}${error?.stderr ?? ""}`;
    const duration = parseDurationSeconds(output);

    if (duration) {
      return duration;
    }
  }

  throw new Error(`Unable to determine video duration for ${filePath}`);
}

function buildRandomProfileSequence(sources) {
  if (sources.length <= 1) {
    return sources;
  }

  const counts = new Map(sources.map((source) => [source, PROFILE_SEQUENCE_REPEATS]));
  const sequence = [];
  let previousSource = null;
  const totalClips = sources.length * PROFILE_SEQUENCE_REPEATS;

  while (sequence.length < totalClips) {
    const nonRepeatingCandidates = sources.filter(
      (source) => (counts.get(source) ?? 0) > 0 && source !== previousSource,
    );
    const remainingCandidates = sources.filter((source) => (counts.get(source) ?? 0) > 0);
    const choicePool = nonRepeatingCandidates.length ? nonRepeatingCandidates : remainingCandidates;
    const nextSource = choicePool[randomInt(choicePool.length)];

    sequence.push(nextSource);
    counts.set(nextSource, (counts.get(nextSource) ?? 0) - 1);
    previousSource = nextSource;
  }

  return sequence;
}

async function normalizeProfileVideoSource(sourcePath, targetPath) {
  await execFileAsync(ffmpegPath, [
    "-y",
    "-i",
    sourcePath,
    "-an",
    "-vf",
    `scale=${PROFILE_SEQUENCE_SIZE}:${PROFILE_SEQUENCE_SIZE}:force_original_aspect_ratio=increase,crop=${PROFILE_SEQUENCE_SIZE}:${PROFILE_SEQUENCE_SIZE},fps=30,format=yuv420p,setsar=1`,
    "-c:v",
    "libx264",
    "-crf",
    "24",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    targetPath,
  ]);
}

async function renderSingleProfileSequence(sourcePath) {
  await cp(sourcePath, PROFILE_SEQUENCE_TARGET, {
    force: true,
  });
}

async function renderMultiClipProfileSequence(sequenceSources) {
  const durations = await Promise.all(sequenceSources.map((source) => getVideoDurationSeconds(source)));
  const filterParts = sequenceSources.map(
    (_, index) =>
      `[${index}:v]fps=30,settb=1/30,setpts=N/30/TB,format=yuv420p[v${index}]`,
  );
  let previousLabel = "v0";
  let nextOffset = Math.max(durations[0] - PROFILE_SEQUENCE_FADE_SECONDS, 0);

  for (let index = 1; index < sequenceSources.length; index += 1) {
    const outputLabel = index === sequenceSources.length - 1 ? "vout" : `x${index}`;

    filterParts.push(
      `[${previousLabel}][v${index}]xfade=transition=fade:duration=${PROFILE_SEQUENCE_FADE_SECONDS}:offset=${nextOffset.toFixed(3)}[${outputLabel}]`,
    );
    previousLabel = outputLabel;
    nextOffset = Math.max(nextOffset + durations[index] - PROFILE_SEQUENCE_FADE_SECONDS, 0);
  }

  await execFileAsync(ffmpegPath, [
    "-y",
    ...sequenceSources.flatMap((source) => ["-i", source]),
    "-filter_complex",
    filterParts.join(";"),
    "-map",
    `[${previousLabel}]`,
    "-an",
    "-c:v",
    "libx264",
    "-crf",
    "24",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    PROFILE_SEQUENCE_TARGET,
  ]);
}

async function syncProfileSequence() {
  await rm(LEGACY_PROFILE_ALT_TARGET, { force: true });
  await rm(PROFILE_CLIPS_DIR, { recursive: true, force: true });
  await rm(PROFILE_MANIFEST_DIR, { recursive: true, force: true });

  const profileVideoSources = await getProfileVideoSources();

  if (!profileVideoSources.length) {
    await rm(PROFILE_SEQUENCE_TARGET, { force: true });
    return;
  }

  if (process.env.VERCEL === "1") {
    if (await fileExists(PROFILE_SEQUENCE_TARGET)) {
      return;
    }

    await cp(profileVideoSources[0], PROFILE_SEQUENCE_TARGET, {
      force: true,
    });
    return;
  }

  if (!ffmpegPath) {
    await cp(profileVideoSources[0], PROFILE_SEQUENCE_TARGET, {
      force: true,
    });
    return;
  }

  const normalizedDirectory = await mkdtemp(path.join(os.tmpdir(), "profile-sequence-"));

  try {
    const normalizedProfileSources = await Promise.all(
      profileVideoSources.map(async (sourcePath, index) => {
        const normalizedPath = path.join(normalizedDirectory, `clip-${index}.mp4`);

        await normalizeProfileVideoSource(sourcePath, normalizedPath);

        return normalizedPath;
      }),
    );
    const sequenceSources = buildRandomProfileSequence(normalizedProfileSources);

    if (sequenceSources.length === 1) {
      await renderSingleProfileSequence(sequenceSources[0]);
      return;
    }

    await renderMultiClipProfileSequence(sequenceSources);
  } finally {
    await rm(normalizedDirectory, { recursive: true, force: true });
  }
}

await syncDesignMedia();
await syncProfileSequence();
