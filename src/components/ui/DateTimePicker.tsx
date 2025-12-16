import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Check, Clock } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  setHours,
  setMinutes,
  differenceInDays
} from 'date-fns'
import { fr } from 'date-fns/locale'
import Card from './Card'

interface DateTimePickerProps {
  selectedStart?: Date | null
  selectedEnd?: Date | null
  onDateChange: (start: Date | null, end: Date | null) => void
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedStart,
  selectedEnd,
  onDateChange
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [isMultipleDays, setIsMultipleDays] = useState(false)

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7
    const minute = (i % 2) * 30
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  })

  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfMonth = monthStart.getDay()
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const now = new Date()

  const applyDateTime = (date: Date | null, endDate: Date | null, startTimeStr: string, endTimeStr: string, isMultiDay: boolean) => {
    if (!date) {
      onDateChange(null, null)
      return
    }

    if (isMultiDay) {
      if (endDate) {
        const start = setMinutes(setHours(new Date(date), 9), 0)
        const end = setMinutes(setHours(new Date(endDate), 18), 0)
        onDateChange(start, end)
      } else {
        const start = setMinutes(setHours(new Date(date), 9), 0)
        const end = setMinutes(setHours(new Date(date), 18), 0)
        onDateChange(start, end)
      }
    } else {
      const [sHour, sMin] = startTimeStr.split(':').map(Number)
      const start = setMinutes(setHours(new Date(date), sHour), sMin)

      const [eHour, eMin] = endTimeStr.split(':').map(Number)
      const end = setMinutes(setHours(new Date(date), eHour), eMin)

      if (isBefore(end, start)) return

      onDateChange(start, end)
    }
  }

  const handleDateClick = (date: Date) => {
    if (isBefore(startOfDay(date), startOfDay(now))) return

    if (isMultipleDays) {
      if (!startDate || (startDate && endDate)) {
        setStartDate(date)
        setEndDate(null)
        applyDateTime(date, null, startTime, endTime, true)
      } else {
        if (isBefore(date, startDate)) {
          setStartDate(date)
          setEndDate(null)
          applyDateTime(date, null, startTime, endTime, true)
        } else {
          setEndDate(date)
          applyDateTime(startDate, date, startTime, endTime, true)
        }
      }
    } else {
      setStartDate(date)
      setEndDate(null)
      applyDateTime(date, null, startTime, endTime, false)
    }
  }

  const handleStartTimeChange = (time: string) => {
    setStartTime(time)
    const [sHour, sMin] = time.split(':').map(Number)
    const [eHour, eMin] = endTime.split(':').map(Number)

    if (eHour < sHour || (eHour === sHour && eMin <= sMin)) {
      const newEndTime = `${(sHour + 1).toString().padStart(2, '0')}:00`
      setEndTime(newEndTime)
      applyDateTime(startDate, null, time, newEndTime, false)
    } else {
      applyDateTime(startDate, null, time, endTime, false)
    }
  }

  const handleEndTimeChange = (time: string) => {
    setEndTime(time)
    applyDateTime(startDate, null, startTime, time, false)
  }

  const clearSelection = () => {
    setStartDate(null)
    setEndDate(null)
    setStartTime('09:00')
    setEndTime('18:00')
    setIsMultipleDays(false)
    onDateChange(null, null)
  }

  const toggleMultipleDays = () => {
    setIsMultipleDays(!isMultipleDays)
    setEndDate(null)
    if (startDate) {
      applyDateTime(startDate, null, startTime, endTime, !isMultipleDays)
    }
  }

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    const d = startOfDay(date)
    const s = startOfDay(startDate)
    const e = startOfDay(endDate)
    return (isSameDay(d, s) || isAfter(d, s)) && (isSameDay(d, e) || isBefore(d, e))
  }

  const isHovered = (date: Date) => {
    if (!isMultipleDays || !hoveredDate || !startDate || endDate) return false
    const d = startOfDay(date)
    const h = startOfDay(hoveredDate)
    const s = startOfDay(startDate)
    if (isBefore(h, s)) return false
    return (isSameDay(d, s) || isAfter(d, s)) && (isSameDay(d, h) || isBefore(d, h))
  }

  const getDuration = () => {
    if (!startDate) return null

    if (isMultipleDays && endDate) {
      const days = differenceInDays(endDate, startDate) + 1
      return `${days} jour${days > 1 ? 's' : ''}`
    }

    const [sHour, sMin] = startTime.split(':').map(Number)
    const [eHour, eMin] = endTime.split(':').map(Number)
    const start = setMinutes(setHours(new Date(startDate), sHour), sMin)
    const end = setMinutes(setHours(new Date(startDate), eHour), eMin)
    const diffMs = end.getTime() - start.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMin / 60)
    const minutes = diffMin % 60
    if (hours === 0) return `${minutes} min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h${minutes.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Dates et horaires</label>
        {startDate && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <X className="w-4 h-4" />
            Effacer
          </button>
        )}
      </div>

      <Card className="p-4 bg-white shadow-md">
        <div className="mb-4 p-3 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-0.5">Début</p>
              <p className="font-bold text-gray-900">
                {startDate ? format(startDate, 'd MMM', { locale: fr }) : 'Non sélectionnée'}
              </p>
              {!isMultipleDays && startDate && <p className="text-accent text-xs font-semibold">{startTime}</p>}
            </div>
            <div className="w-6 h-0.5 bg-accent mx-2"></div>
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-600 mb-0.5">Fin</p>
              <p className="font-bold text-gray-900">
                {isMultipleDays && endDate ? format(endDate, 'd MMM', { locale: fr }) : !isMultipleDays && startDate ? 'Même jour' : 'Non sélectionnée'}
              </p>
              {!isMultipleDays && startDate && <p className="text-accent text-xs font-semibold">{endTime}</p>}
            </div>
          </div>
          {getDuration() && (
            <div className="mt-2 pt-2 border-t border-accent/20">
              <p className="text-xs text-gray-600">
                Durée: <span className="font-bold text-accent">{getDuration()}</span>
              </p>
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center justify-center">
          <button
            type="button"
            onClick={toggleMultipleDays}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isMultipleDays
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMultipleDays ? 'Plusieurs jours (9h-18h)' : 'Journée avec horaires'}
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), startOfDay(now))}
            className="p-1.5 hover:bg-accent/10 rounded-lg transition disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-accent/10 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} />)}
          {monthDays.map(date => {
            const disabled = isBefore(startOfDay(date), startOfDay(now))
            const selected = (startDate && isSameDay(date, startDate)) || (endDate && isSameDay(date, endDate))
            const inRange = isInRange(date)
            const hovered = isHovered(date)
            const today = isToday(date)

            return (
              <motion.button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => !disabled && setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={disabled}
                whileHover={!disabled ? { scale: 1.08 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                className={`
                  aspect-square rounded-lg font-semibold text-xs transition-all relative flex items-center justify-center
                  ${disabled ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:shadow-sm'}
                  ${selected ? 'bg-accent text-white shadow-md z-10' : ''}
                  ${inRange && !selected ? 'bg-accent/15 text-accent' : ''}
                  ${hovered && !selected ? 'bg-accent/20 text-accent' : ''}
                  ${today && !selected ? 'border-2 border-accent' : ''}
                  ${!disabled && !selected && !inRange && !hovered ? 'text-gray-900 hover:bg-gray-100' : ''}
                `}
              >
                {format(date, 'd')}
                {selected && <Check className="w-3 h-3 text-white absolute" />}
              </motion.button>
            )
          })}
        </div>

        {!isMultipleDays && startDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t mt-4 pt-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold">Horaires</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Début</label>
                <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {timeSlots.map(time => (
                    <button
                      key={`start-${time}`}
                      type="button"
                      onClick={() => handleStartTimeChange(time)}
                      className={`
                        px-1 py-1.5 rounded text-xs font-bold transition
                        ${startTime === time
                          ? 'bg-accent text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-accent/10 border border-gray-200'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Fin</label>
                <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {timeSlots.map(time => {
                    const [sH, sM] = startTime.split(':').map(Number)
                    const [tH, tM] = time.split(':').map(Number)
                    const disabled = tH < sH || (tH === sH && tM <= sM)

                    return (
                      <button
                        key={`end-${time}`}
                        type="button"
                        onClick={() => handleEndTimeChange(time)}
                        disabled={disabled}
                        className={`
                          px-1 py-1.5 rounded text-xs font-bold transition
                          ${endTime === time
                            ? 'bg-accent text-white shadow-sm'
                            : disabled
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-accent/10 border border-gray-200'
                          }
                        `}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span>Sélectionné</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-accent/15 rounded"></div>
          <span>Période</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 border-2 border-accent rounded"></div>
          <span>Aujourd'hui</span>
        </div>
      </div>
    </div>
  )
}

export default DateTimePicker
