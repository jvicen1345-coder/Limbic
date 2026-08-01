import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ensureNexusSeedData } from "@/lib/nexus-seed";
import { getConnectionStates } from "@/lib/nexus";
import { NEXUS_TABS } from "@/lib/section-nav";
import { SubTabs } from "@/components/SubTabs";
import { DirectoryList, type DirectoryPerson } from "@/components/DirectoryList";

export default async function NexusDirectoryPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await ensureNexusSeedData();

  const [users, states] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: user.id }, isGuest: false },
      select: { id: true, name: true, headline: true, bio: true, specialty: true, practiceState: true },
      orderBy: { name: "asc" },
    }),
    getConnectionStates(user.id),
  ]);

  const people: DirectoryPerson[] = users.map((u) => ({
    ...u,
    state: states.get(u.id) ?? { status: "none" },
  }));

  return (
    <div className="screen-pad">
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Nexus</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        A feed for PTs, OTs, and the wider healthcare & wellness community.
      </p>
      <SubTabs tabs={NEXUS_TABS} />
      <DirectoryList people={people} />
    </div>
  );
}
