// Liens vidéo des directs et prédications : YouTube ou Facebook.

export type ParsedVideo = { platform: "YOUTUBE" | "FACEBOOK"; videoId: string | null };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Reconnaît un lien YouTube (watch, youtu.be, live, shorts, embed) ou Facebook ; null sinon. */
export function parseVideoUrl(raw: string): ParsedVideo | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^(www|m)\./, "");

  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return YT_ID.test(id) ? { platform: "YOUTUBE", videoId: id } : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = u.searchParams.get("v");
    if (v && YT_ID.test(v)) return { platform: "YOUTUBE", videoId: v };
    const m = u.pathname.match(/^\/(?:live|embed|shorts)\/([A-Za-z0-9_-]{11})/);
    return m ? { platform: "YOUTUBE", videoId: m[1] } : null;
  }
  if (host === "facebook.com" || host === "fb.watch") return { platform: "FACEBOOK", videoId: null };
  return null;
}

/** Adresse du lecteur intégré (YouTube sans cookies publicitaires). */
export function embedUrl(platform: "YOUTUBE" | "FACEBOOK", url: string, videoId: string | null) {
  if (platform === "YOUTUBE" && videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
}

export function thumbnailUrl(videoId: string | null) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}
