import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AgentClient } from "@/components/AgentClient";

export default async function AgentPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Hard redirect rather than an inline upsell — non-Pro users land straight back on the
  // Pro page instead of a dead-end page under /agent (see app/actions/agent.ts for the
  // matching Server Action-level check, since a page redirect alone doesn't stop someone
  // from calling the action directly). Limbic Threads' "Prompt Agent" node (see
  // components/ThreadsWeb.tsx) never gets a viewer here in the first place when they're
  // not Pro — it gates and shows an upsell in place instead — but this redirect is what
  // actually stops a direct/typed-in-URL visit too.
  if (!user.isPro) redirect("/pro");

  const { topic } = await searchParams;
  return <AgentClient initialQuestion={topic} />;
}
