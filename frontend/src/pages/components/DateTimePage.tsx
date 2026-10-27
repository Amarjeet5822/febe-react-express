import { useState } from 'react'
import { DateTimeInputField, TimeInputField } from '../../components/form'
import { DemoCard, PageHeader } from '../../components/ui/Page'
import { addDays, toDateKey, toDateTimeString } from '../../lib/datetime'

export default function DateTimePage() {
  const [time12, setTime12] = useState<string | null>('09:30')
  const [time24, setTime24] = useState<string | null>('21:45')
  const [office, setOffice] = useState<string | null>(null)
  const [shiftStart, setShiftStart] = useState<string | null>('09:00')
  const [shiftEnd, setShiftEnd] = useState<string | null>('18:00')

  const now = new Date()
  const todayKey = toDateKey(now)
  const [meeting, setMeeting] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<string | null>(toDateTimeString(addDays(now, 3)).slice(0, 11) + '17:00')
  const [dob, setDob] = useState<string | null>('1998-05-14')
  const [trip, setTrip] = useState<string | null>(null)

  const endBeforeStart = shiftStart && shiftEnd && shiftEnd <= shiftStart

  return (
    <>
      <PageHeader
        title="TimeInputField & DateTimeInputField"
        description={
          <>
            Values are plain local strings like <code>"21:30"</code> and <code>"2026-10-23T21:30"</code> — no timezone surprises.
          </>
        }
      />

      <h2 className="section-title">TimeInputField</h2>
      <div className="demo-grid">
        <DemoCard
          title="12-hour, typeable"
          description={
            <>
              Try typing <code>930pm</code>, <code>9.30</code> or <code>21:30</code>, then Tab. Use ↑/↓ to step 15 min.
            </>
          }
          value={time12}
        >
          <TimeInputField label="Reminder" value={time12} onChange={setTime12} helperText="Click to pick, or just type." />
        </DemoCard>

        <DemoCard title="24-hour, 5-minute steps" value={time24}>
          <TimeInputField label="Departure" hourCycle={24} minuteStep={5} value={time24} onChange={setTime24} />
        </DemoCard>

        <DemoCard title="min / max (office hours)" description="Times outside 09:00–18:00 are disabled, and typed ones are rejected." value={office}>
          <TimeInputField label="Call slot" min="09:00" max="18:00" minuteStep={30} required value={office} onChange={setOffice} />
        </DemoCard>

        <DemoCard title="Dependent range" description="End's min follows Start. Cross-field validation lives in the parent." value={{ shiftStart, shiftEnd }}>
          <div className="form-row">
            <TimeInputField label="Start" value={shiftStart} onChange={setShiftStart} />
            <TimeInputField
              label="End"
              value={shiftEnd}
              onChange={setShiftEnd}
              min={shiftStart ?? undefined}
              error={endBeforeStart ? 'End must be after start' : undefined}
            />
          </div>
        </DemoCard>

        <DemoCard title="Disabled & read-only">
          <div className="form-row">
            <TimeInputField label="Disabled" value="10:00" onChange={() => {}} disabled />
            <TimeInputField label="Read-only" value="14:15" onChange={() => {}} readOnly />
          </div>
        </DemoCard>
      </div>

      <h2 className="section-title">DateTimeInputField</h2>
      <div className="demo-grid">
        <DemoCard
          title="Date + time, no past"
          description="min = now. Keyboard: arrows, PageUp/PageDown (+Shift for year), Home/End."
          value={meeting}
        >
          <DateTimeInputField label="Schedule meeting" min={toDateTimeString(now)} value={meeting} onChange={setMeeting} required />
        </DemoCard>

        <DemoCard title="24-hour, Sunday-first week" value={deadline}>
          <DateTimeInputField label="Deadline" hourCycle={24} weekStartsOn={0} minuteStep={15} value={deadline} onChange={setDeadline} />
        </DemoCard>

        <DemoCard
          title="Date of birth"
          description={
            <>
              <code>showTime={'{false}'}</code> + <code>openTo="years"</code>: pick year → month → day in 3 clicks. Click the calendar title anytime to
              jump years. Future dates blocked.
            </>
          }
          value={dob}
        >
          <DateTimeInputField label="Date of birth" showTime={false} openTo="years" max={todayKey} value={dob} onChange={setDob} />
        </DemoCard>

        <DemoCard title="Window (next 14 days)" description="Both min and max: everything else is struck through." value={trip}>
          <DateTimeInputField
            label="Pickup"
            showTime={false}
            min={todayKey}
            max={toDateKey(addDays(now, 14))}
            value={trip}
            onChange={setTrip}
            error={!trip ? 'Pick a date' : undefined}
          />
        </DemoCard>

        <DemoCard title="Disabled">
          <DateTimeInputField label="Locked" value={`${todayKey}T12:00`} onChange={() => {}} disabled />
        </DemoCard>
      </div>
    </>
  )
}
