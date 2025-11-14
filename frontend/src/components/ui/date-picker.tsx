"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDateForDisplay(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function parseIsoDate(value?: string) {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

type Props = {
  id?: string
  label?: string
  value?: string // expected as ISO yyyy-mm-dd or any date string parseable by Date
  onChange: (isoDate?: string) => void
  placeholder?: string
}

export function DatePicker({ id, label, value, onChange, placeholder }: Props) {
  const [open, setOpen] = React.useState(false)
  const initialDate = parseIsoDate(value)
  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [month, setMonth] = React.useState<Date | undefined>(initialDate)
  const [display, setDisplay] = React.useState(formatDateForDisplay(initialDate))

  React.useEffect(() => {
    const parsed = parseIsoDate(value)
    setDate(parsed)
    setMonth(parsed)
    setDisplay(formatDateForDisplay(parsed))
  }, [value])

  return (
    <div className="flex flex-col gap-1">
      {label ? <Label htmlFor={id} className="px-1 text-sm">{label}</Label> : null}
      <div className="relative flex items-center">
        <Input
          id={id}
          value={display}
          placeholder={placeholder || "Select date"}
          className="bg-background pr-10"
          onChange={(e) => {
            const raw = (e.target as HTMLInputElement).value
            setDisplay(raw)
            const parsed = new Date(raw)
            if (!isNaN(parsed.getTime())) {
              setDate(parsed)
              setMonth(parsed)
              // send ISO yyyy-mm-dd
              onChange(parsed.toISOString().slice(0, 10))
            } else if (raw === "") {
              setDate(undefined)
              onChange(undefined)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id ? `${id}-trigger` : undefined}
              variant="ghost"
              className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 p-1"
              aria-label="Select date"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(d) => {
                setDate(d)
                setDisplay(formatDateForDisplay(d))
                setOpen(false)
                onChange(d ? d.toISOString().slice(0, 10) : undefined)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default DatePicker
