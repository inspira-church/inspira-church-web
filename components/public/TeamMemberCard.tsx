import Image from "next/image";
import { anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  fullName: string;
  roleTitle: string;
  photoUrl?: string | null;
  bio?: string | null;
  /** Color de acento rotativo (CAMPAIGN_COLORS) para el cargo. */
  accentColor?: string;
}

export function TeamMemberCard({
  fullName,
  roleTitle,
  photoUrl,
  bio,
  accentColor = "#FF7F50",
}: TeamMemberCardProps) {
  return (
    <div>
      <div className="relative aspect-square overflow-hidden border border-white/10 bg-[#0d0d0d]">
        {photoUrl && (
          <Image
            src={photoUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        )}
      </div>
      <p className={cn(anton.className, "mt-4 text-lg uppercase leading-tight text-white")}>
        {fullName}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
        {roleTitle}
      </p>
      {bio && <p className={cn(hind.className, "mt-2 text-sm text-white/60")}>{bio}</p>}
    </div>
  );
}
