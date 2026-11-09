import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PENDING_COMPANY = "kyzmat-pending-company";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const cookieStore = await cookies();
      const pending = cookieStore.get(PENDING_COMPANY)?.value?.trim();

      if (pending) {
        const { data } = await supabase.from("members").select("user_id").maybeSingle();

        if (!data) {
          await supabase.rpc("create_company", {
            company_name: pending,
            tz: "Asia/Bishkek",
          });
        }

        cookieStore.delete(PENDING_COMPANY);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
