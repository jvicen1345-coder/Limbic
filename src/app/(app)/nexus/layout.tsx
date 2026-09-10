import { notFound } from "next/navigation";
import "@/styles/nexus.css";
import { getCurrentUser } from "@/lib/session";
import { nexusVisibleTo } from "@/lib/nexus-visibility";

/** Nexus is admin-only while its future is being decided (see lib/nexus-visibility.ts).
 *  Everyone else gets a 404 from every route under /nexus — feed, directory, connections,
 *  messages, a profile — rather than a "coming soon" screen. A waitlist advertises a
 *  feature that may never ship; a 404 says nothing at all, which is the honest answer while
 *  the decision is open. Nothing about the stored data changes, so this is reversible. */
export default async function NexusLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!nexusVisibleTo(user)) notFound();
  return <>{children}</>;
}
