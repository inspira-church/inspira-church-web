import { getYouTubeId } from "@/lib/format";

interface YouTubeEmbedProps {
  url: string;
  title: string;
  className?: string;
}

export function YouTubeEmbed({ url, title, className }: YouTubeEmbedProps) {
  const id = getYouTubeId(url);

  if (!id) return null;

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-lg bg-ink ${className ?? ""}`}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
