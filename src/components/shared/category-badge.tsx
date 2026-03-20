import type { EventCategory } from "@/types";

const categoryColors: Record<string, string> = {
  social: "bg-pink-100 text-pink-700",
  academic: "bg-blue-100 text-blue-700",
  workshop: "bg-violet-100 text-violet-700",
  cultural: "bg-amber-100 text-amber-700",
  sports: "bg-emerald-100 text-emerald-700",
  meeting: "bg-slate-100 text-slate-700",
};

export function CategoryBadge({ category }: { category: EventCategory }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${categoryColors[category] || "bg-gray-100 text-gray-700"}`}>
      {category}
    </span>
  );
}
