import Image from "next/image";

interface TeamMemberCardProps {
  fullName: string;
  roleTitle: string;
  photoUrl?: string | null;
  bio?: string | null;
}

export function TeamMemberCard({
  fullName,
  roleTitle,
  photoUrl,
  bio,
}: TeamMemberCardProps) {
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-paper-raised">
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
      <p className="mt-4 font-display text-lg font-semibold text-ink">
        {fullName}
      </p>
      <p className="text-sm text-accent">{roleTitle}</p>
      {bio && <p className="mt-2 text-sm text-ink-soft">{bio}</p>}
    </div>
  );
}
