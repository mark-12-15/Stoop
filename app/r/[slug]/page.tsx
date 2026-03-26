import { createAdminClient } from "@/lib/supabase/admin";
import TenantReportClient, { PropertyNotFoundClient } from "@/components/tenant/TenantReportClient";

export const metadata = { title: "Submit a Repair — StoopKeep" };

export default async function TenantReportPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, address, unit_number, status")
    .eq("slug", params.slug)
    .single();

  if (!property) {
    return <PropertyNotFoundClient slug={params.slug} />;
  }

  if (property.status !== "active") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Maintenance Portal Paused
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            This maintenance portal is currently paused.
            Please contact your landlord directly for repair requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TenantReportClient
      property={{ id: property.id, address: property.address, unit_number: property.unit_number }}
      slug={params.slug}
    />
  );
}
