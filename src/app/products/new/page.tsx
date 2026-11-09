import Link from "next/link";
import { ProductForm } from "@/components/product-form";
import { messagesFor } from "@/i18n/messages";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NewProductPage() {
  const membership = await requireMembership();
  const messages = messagesFor(membership.locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("unit")
    .eq("tenant_id", membership.tenantId)
    .not("unit", "is", null);
  const extraUnits = [...new Set((data ?? []).map((row) => String(row.unit ?? "")).filter(Boolean))];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/products" className="inline-flex min-h-12 items-center text-sm font-semibold text-stamp">
        {messages.back}
      </Link>
      <h1 className="text-pretty text-3xl font-semibold tracking-tight">{messages.addProduct}</h1>
      {membership.role === "owner" ? (
        <ProductForm messages={messages} locale={membership.locale} extraUnits={extraUnits} />
      ) : (
        <p className="text-base text-mute">{messages.ownerOnly}</p>
      )}
    </div>
  );
}
