export function SourceBadge({ name, active }: { name: string; active: boolean }) {
  return <span className={`sourceBadge ${active ? "sourceOn" : "sourceOff"}`}><span className="dot" />{name}</span>;
}
