import { useState } from 'react'
import { Dropdown, type DropdownOption } from '../../components/form'
import { DemoCard, PageHeader } from '../../components/ui/Page'
import { sleep } from '../../lib/utils'

const ROLES: DropdownOption[] = [
  { value: 'admin', label: 'Admin', description: 'Full access, including billing' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  { value: 'owner', label: 'Owner', description: 'Only one per workspace', disabled: true },
]

const STATES: DropdownOption[] = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal',
].map((s) => ({ value: s.toLowerCase().replace(/\s+/g, '-'), label: s }))

const STACK: DropdownOption[] = [
  { value: 'react', label: 'React', group: 'Frontend', icon: '⚛️' },
  { value: 'vue', label: 'Vue', group: 'Frontend', icon: '🟩' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend', icon: '🔥' },
  { value: 'node', label: 'Node.js', group: 'Backend', icon: '🟢' },
  { value: 'express', label: 'Express', group: 'Backend', icon: '🚂' },
  { value: 'nest', label: 'NestJS', group: 'Backend', icon: '🐱' },
  { value: 'mongo', label: 'MongoDB', group: 'Database', icon: '🍃' },
  { value: 'postgres', label: 'PostgreSQL', group: 'Database', icon: '🐘' },
  { value: 'redis', label: 'Redis', group: 'Database', icon: '🟥' },
]

const PRIORITIES: DropdownOption<number>[] = [
  { value: 1, label: 'P1 — Urgent' },
  { value: 2, label: 'P2 — High' },
  { value: 3, label: 'P3 — Normal' },
  { value: 4, label: 'P4 — Low' },
]

export default function DropdownPage() {
  const [role, setRole] = useState<string | null>('editor')
  const [state, setState] = useState<string | null>(null)
  const [stack, setStack] = useState<string[]>(['react', 'node', 'mongo'])
  const [top3, setTop3] = useState<string[]>([])
  const [priority, setPriority] = useState<number | null>(3)
  const [team, setTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState<DropdownOption[]>([])
  const [teamsLoading, setTeamsLoading] = useState(false)

  // Lazy-load options the first time the menu opens.
  const loadTeams = async () => {
    if (teams.length || teamsLoading) return
    setTeamsLoading(true)
    await sleep(1200)
    setTeams(['Platform', 'Growth', 'Design', 'Payments', 'Infra'].map((t) => ({ value: t.toLowerCase(), label: t })))
    setTeamsLoading(false)
  }

  return (
    <>
      <PageHeader
        title="Dropdown"
        description={
          <>
            Accessible combobox + listbox. Try it with only the keyboard. Source: <code>src/components/form/Dropdown.tsx</code>
          </>
        }
      />
      <div className="demo-grid">
        <DemoCard title="Single, with descriptions" description="Disabled option is skipped by arrow keys. Type a letter to jump." value={role}>
          <Dropdown label="Role" options={ROLES} value={role} onChange={setRole} required />
        </DemoCard>

        <DemoCard title="Searchable + clearable" description="Matches are highlighted. Backspace on the closed field clears it." value={state}>
          <Dropdown label="State" options={STATES} value={state} onChange={setState} searchable clearable placeholder="Choose a state" />
        </DemoCard>

        <DemoCard title="Multi-select with groups & icons" description="Stays open while you pick. Backspace removes the last chip." value={stack}>
          <Dropdown label="Tech stack" options={STACK} multiple value={stack} onChange={setStack} searchable clearable />
        </DemoCard>

        <DemoCard title="Max selections" description="maxSelected={3}: other options lock once you hit the limit." value={top3}>
          <Dropdown
            label="Top 3 states"
            options={STATES}
            multiple
            maxSelected={3}
            value={top3}
            onChange={setTop3}
            searchable
            helperText="Pick up to three."
          />
        </DemoCard>

        <DemoCard title="Numeric values (generic)" description="Dropdown<number> — the value type flows through onChange." value={priority}>
          <Dropdown label="Priority" options={PRIORITIES} value={priority} onChange={setPriority} />
        </DemoCard>

        <DemoCard title="Async options" description="Options fetched on first open (1.2s fake delay)." value={team}>
          <Dropdown label="Team" options={teams} value={team} onChange={setTeam} loading={teamsLoading} onOpen={loadTeams} searchable />
        </DemoCard>

        <DemoCard title="Error & disabled">
          <div className="form-stack">
            <Dropdown label="Country" options={[]} value={null} onChange={() => {}} error="Country is required" required />
            <Dropdown label="Plan" options={[{ value: 'pro', label: 'Pro' }]} value="pro" onChange={() => {}} disabled />
          </div>
        </DemoCard>

        <DemoCard title="Sizes">
          <div className="form-stack">
            <Dropdown label="Small" size="sm" options={ROLES} value={role} onChange={setRole} />
            <Dropdown label="Large" size="lg" options={ROLES} value={role} onChange={setRole} />
          </div>
        </DemoCard>
      </div>
    </>
  )
}
