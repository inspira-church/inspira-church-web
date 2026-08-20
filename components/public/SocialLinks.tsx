import { cn } from "@/lib/utils";

interface SocialLinksProps {
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  className?: string;
  /** Clases del enlace individual — permite adaptar el color al fondo donde se use. */
  linkClassName?: string;
}

interface IconProps {
  className?: string;
}

export function FacebookIcon({ className = "h-5 w-5" }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: IconProps = {}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.5 3c.4 2.2 2 3.8 4.2 4.1v3a7 7 0 0 1-4.2-1.4v6.8a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.1a2.7 2.7 0 1 0 1.9 2.6V3h2.9Z" />
    </svg>
  );
}

export function XIcon({ className = "h-5 w-5" }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.3 3H21l-6.9 7.9L22 21h-6.4l-5-6.5L4.7 21H2l7.4-8.4L2 3h6.5l4.5 6 5.3-6Zm-1.1 16.2h1.8L7.9 4.7H6l11.2 14.5Z" />
    </svg>
  );
}

export function YouTubeIcon({ className = "h-5 w-5" }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M23 12s0-3.4-.4-5a3 3 0 0 0-2.1-2.1C18.9 4.5 12 4.5 12 4.5s-6.9 0-8.5.4A3 3 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a3 3 0 0 0 2.1 2.1c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4A3 3 0 0 0 22.6 17c.4-1.6.4-5 .4-5ZM9.8 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

const SOCIAL_PLATFORMS = [
  { key: "facebookUrl" as const, label: "Facebook", Icon: FacebookIcon },
  { key: "instagramUrl" as const, label: "Instagram", Icon: InstagramIcon },
  { key: "tiktokUrl" as const, label: "TikTok", Icon: TikTokIcon },
  { key: "xUrl" as const, label: "X (Twitter)", Icon: XIcon },
  { key: "youtubeUrl" as const, label: "YouTube", Icon: YouTubeIcon },
];

export function SocialLinks({ className, linkClassName, ...urls }: SocialLinksProps) {
  const active = SOCIAL_PLATFORMS.filter((platform) => urls[platform.key]);
  if (active.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {active.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={urls[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-accent",
            linkClassName
          )}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
