interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-medium text-neutral-700 mb-1">{title}</p>
      {description && <p className="text-sm text-neutral-500">{description}</p>}
    </div>
  );
}
