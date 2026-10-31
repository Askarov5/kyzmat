import { redirect } from "next/navigation";
import { getUserId, getMembership } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function Home() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const userId = await getUserId();

  if (!userId) {
    redirect("/login");
  }

  const membership = await getMembership();
  redirect(membership ? "/clients" : "/company");
}
