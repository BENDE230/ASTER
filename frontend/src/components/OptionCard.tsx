interface OptionCardProps {
  icon: string
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}

export default function OptionCard({ icon, label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`option-card text-left ${selected ? 'selected' : ''}`}
    >
      <span className="text-lg w-7 flex-shrink-0 text-center">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-slate-100">{label}</span>
        {description && (
          <span className="block text-xs text-slate-500 mt-0.5">{description}</span>
        )}
      </span>
      <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
        selected ? 'border-periwinkle-500 bg-periwinkle-500' : 'border-slate-600'
      }`}>
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
      </span>
    </button>
  )
}
