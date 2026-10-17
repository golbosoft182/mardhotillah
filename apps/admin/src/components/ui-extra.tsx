"use client";

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    SUPER_ADMIN: "bg-gold-100 text-gold-500",
    ADMIN: "bg-brand-100 text-brand-700",
    EDITOR: "bg-blue-100 text-blue-700",
    OSIS: "bg-purple-100 text-purple-700",
  };
  const label: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    EDITOR: "Editor",
    OSIS: "OSIS",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${map[role] ?? "bg-gray-100 text-gray-600"}`}>
      {label[role] ?? role}
    </span>
  );
}
