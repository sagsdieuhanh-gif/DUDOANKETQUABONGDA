import Image from "next/image";

export function TeamBadge({ name, logo, size = 46 }: { name: string; logo?: string; size?: number }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <span className="teamBadge" style={{ width: size, height: size }}>
      {logo ? <Image src={logo} alt={name} width={size} height={size} /> : <b>{initials || "FC"}</b>}
    </span>
  );
}
