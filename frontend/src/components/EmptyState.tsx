interface EmptyStateProps {
  title: string
  description?: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return <div className="px-4 py-12 text-center"><p className="font-semibold text-gray-800">{title}</p>{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}</div>
}
