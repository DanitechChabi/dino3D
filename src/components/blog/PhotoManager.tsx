"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { deletePhoto, movePhoto, setPostCover, updatePhotoCaption, uploadPostPhoto } from "@/actions/posts";

export type ManagedPhoto = { id: string; mediaId: string; src: string; caption: string; width: number; height: number };

const MAX_SIDE = 2000;

/** Réduit la photo dans le navigateur avant l'envoi (les photos de téléphone font souvent 5 à 10 Mo). */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (blob) return blob;
  } catch {
    // Format non lu par le navigateur : on envoie l'original, le serveur tentera de le lire
  }
  return file;
}

export function PhotoManager({ postId, coverId, photos }: { postId: string; coverId: string | null; photos: ManagedPhoto[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();

  async function upload(files: FileList) {
    const list = [...files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return;
    setErrors([]);
    setProgress({ done: 0, total: list.length });
    const failed: string[] = [];
    for (const [i, file] of list.entries()) {
      const fd = new FormData();
      fd.append("photo", await shrink(file), file.name.replace(/\.\w+$/, ".jpg"));
      try {
        const res = await uploadPostPhoto(postId, fd);
        if (!res.ok) failed.push(`${file.name} : ${res.message}`);
      } catch {
        failed.push(`${file.name} : envoi interrompu (photo trop lourde ou connexion coupée)`);
      }
      setProgress({ done: i + 1, total: list.length });
      router.refresh();
    }
    setErrors(failed);
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!!progress}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 px-5 py-2.5 text-sm font-bold text-night-950 disabled:opacity-60"
        >
          {progress ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {progress ? `Envoi ${progress.done}/${progress.total}…` : "Ajouter des photos"}
        </button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        <p className="text-sm text-night-800/60">Les photos sont retouchées automatiquement : lumière, couleurs, netteté.</p>
      </div>
      {progress && (
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-night-900/10" role="progressbar" aria-valuenow={progress.done} aria-valuemax={progress.total}>
          <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
        </div>
      )}
      {errors.length > 0 && (
        <ul className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {photos.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-night-900/15 p-10 text-center text-night-800/60">Aucune photo pour l&apos;instant.</p>
      ) : (
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${pending ? "opacity-70" : ""}`}>
          {photos.map((p, i) => (
            <li key={p.id} className="overflow-hidden rounded-2xl border border-night-900/10 bg-white">
              <div className="relative aspect-[4/3] bg-night-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.caption} className="size-full object-contain" loading="lazy" />
                {p.mediaId === coverId && <span className="absolute left-2 top-2 rounded-full bg-gold-400 px-2.5 py-0.5 text-xs font-bold text-night-950">Couverture</span>}
              </div>
              <div className="p-3">
                <input
                  defaultValue={p.caption}
                  placeholder="Légende de la photo"
                  aria-label={`Légende de la photo ${i + 1}`}
                  className="field py-2 text-sm"
                  onBlur={(e) => e.target.value !== p.caption && run(() => updatePhotoCaption(p.id, e.target.value))}
                />
                <div className="mt-2 flex items-center gap-1">
                  <button type="button" title="Monter" aria-label="Monter" disabled={i === 0 || pending} onClick={() => run(() => movePhoto(p.id, -1))} className="rounded-full p-2 text-night-800 hover:bg-night-900/5 disabled:opacity-30"><ArrowUp className="size-4" /></button>
                  <button type="button" title="Descendre" aria-label="Descendre" disabled={i === photos.length - 1 || pending} onClick={() => run(() => movePhoto(p.id, 1))} className="rounded-full p-2 text-night-800 hover:bg-night-900/5 disabled:opacity-30"><ArrowDown className="size-4" /></button>
                  {p.mediaId !== coverId && (
                    <button type="button" disabled={pending} onClick={() => run(() => setPostCover(postId, p.mediaId))} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-gold-600 hover:bg-gold-300/20"><Star className="size-3.5" /> Couverture</button>
                  )}
                  <button type="button" disabled={pending} onClick={() => confirm("Supprimer cette photo ?") && run(() => deletePhoto(p.id))} className="ml-auto rounded-full p-2 text-red-700 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
