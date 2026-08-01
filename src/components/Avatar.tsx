import { initials } from "@/lib/nexus-utils";

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </div>
  );
}
