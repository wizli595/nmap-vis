import { ALL_FLAG_GROUPS, type FlagDefinition } from '../../data/flags'
import { FlagToggle } from './FlagToggle'

export function FlagPicker() {
  return (
    <div className="space-y-6">
      {ALL_FLAG_GROUPS.map((group) => (
        <FlagGroup key={group.label} label={group.label} flags={group.flags} />
      ))}
    </div>
  )
}

interface FlagGroupProps {
  label: string
  flags: { id: string }[]
}

function FlagGroup({ label, flags }: FlagGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm text-[var(--text-dim)] uppercase tracking-widest">
        {label}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {flags.map((flag) => (
          <FlagToggle key={flag.id} flag={flag as FlagDefinition} />
        ))}
      </div>
    </div>
  )
}
