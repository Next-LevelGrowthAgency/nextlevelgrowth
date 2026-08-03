import { redirect } from "next/navigation";

/** Growth Audit submissions are just leads with source="growth-audit" — reuse the one filterable leads table instead of a second, near-duplicate view. */
export default function AdminAuditsPage() {
  redirect("/admin/leads?source=growth-audit");
}
