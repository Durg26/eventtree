import { TreesIcon } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <TreesIcon className="h-12 w-12 text-primary/30 mb-4" />
      <h3 className="text-lg font-medium text-on-surface-variant">{title}</h3>
      <p className="text-sm text-on-surface-variant/70 mt-1 max-w-md">
        {description}
      </p>
    </div>
  );
}
