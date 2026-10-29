import "server-only";
import sharp from "sharp";
import { db } from "./db";

const MAX_INPUT = 12 * 1024 * 1024;
const ACCEPTED = new Set(["jpeg", "png", "webp", "avif", "gif", "tiff"]);

/**
 * Retouche automatique d'une photo, comme celles du site :
 * orientation corrigée, 1600 px maximum, niveaux automatiques, couleurs ravivées,
 * léger contraste et netteté, puis compression WebP.
 */
export async function processPhoto(input: Buffer) {
  if (input.length > MAX_INPUT) throw new Error("Photo trop lourde (12 Mo maximum)");
  const meta = await sharp(input, { failOn: "none" }).metadata();
  if (!meta.format || !ACCEPTED.has(meta.format)) throw new Error("Format d'image non pris en charge");

  const { data, info } = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .normalise({ lower: 1, upper: 99 })
    .modulate({ saturation: 1.15 })
    .linear(1.04, -4)
    .sharpen({ sigma: 0.9 })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height, mime: "image/webp", size: data.length };
}

export async function saveMedia(input: Buffer, uploadedById?: string) {
  const p = await processPhoto(input);
  return db.media.create({
    data: { mime: p.mime, width: p.width, height: p.height, size: p.size, data: new Uint8Array(p.data), uploadedById },
    select: { id: true, width: true, height: true },
  });
}

export const mediaUrl = (id: string) => `/media/${id}`;
