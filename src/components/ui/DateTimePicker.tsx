import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Check, Clock, AlertCircle } from 'lucide-react'
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

interface AvailabilityData {
  [dateKey: string]: {
    available: boolean
    placesDisponibles: number
    placesReservees: number
  }
}

interface DateTimePickerProps {
  selectedStart?: Date | null
  selectedEnd?: Date | null
  onDateChange: (start: Date | null, end: Date | null) => void
  espaceId?: string
  espaceType?: string
}

const WORKING_DAYS = [0, 1, 2, 3, 4]
const BUSINESS_HOURS = { open: '08:30', close: '18:30' }

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedStart,
  selectedEnd,
  onDateChange,
  espaceId,
  espaceType
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('08:30')
  const [endTime, setEndTime] = useState('12:30')
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [isMultipleDays, setIsMultipleDays] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityData>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const isExclusiveSpace = espaceType === 'booth'

  const generateTimeSlots = useCallback(() => {
    const slots: string[] = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 8 && min === 0) continue
        if (hour === 18 && min > 30) continue
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
      }
    }
    return slots
  }, [])

  const timeSlots = generateTimeSlots()

  useEffect(() => {
    if (!espaceId) return

    const fetchMonthAvailability = async () => {
      setLoadingAvailability(true)
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const newAvailability: AvailabilityData = {}

      try {
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

        for (const day of days) {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayOfWeek = day.getDay()

          if (!WORKING_DAYS.includes(dayOfWeek)) {
            newAvailability[dateStr] = { available: false, placesDisponibles: 0, placesReservees: 0 }
            continue
          }

          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || '/api'}/reservations/availability.php?espace_id=${espaceId}&date=${dateStr}`
            )
            const result = await response.json()

            if (result.success && result.data) {
              const hasAvailability = result.data.placesDisponibles > 0
              newAvailability[dateStr] = {
                available: hasAvailability,
                placesDisponibles: result.data.placesDisponibles,
                placesReservees: result.data.placesReservees
              }
            }
          } catch {
            newAvailability[dateStr] = { available: true, placesDisponibles: 1, placesReservees: 0 }
          }
        }

        setAvailability(newAvailability)
      } catch {
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchMonthAvailability()
  }, [espaceId, currentMonth])

  const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfMonth = monthStart.getDay()
  const now = new Date()

  const applyDateTime = (date: Date | null, endDateVal: Date | null, startTimeStr: string, endTimeStr: string, isMultiDay: boolean) => {
    if (!date) {
      onDateChange(null, null)
      return
    }

    if (isMultiDay) {
      if (endDateVal) {
        const [sH, sM] = BUSINESS_HOURS.open.split(':').map(Number)
        const [eH, eM] = BUSINESS_HOURS.close.split(':').map(Number)
        const start = setMinutes(setHours(new Date(date), sH), sM)
        const end = setMinutes(setHours(new Date(endDateVal), eH), eM)
        onDateChange(start, end)
      } else {
        const [sH, sM] = BUSINESS_HOURS.open.split(':').map(Number)
        const [eH, eM] = BUSINESS_HOURS.close.split(':').map(Number)
        const start = setMinutes(setHours(new Date(date), sH), sM)
        const end = setMinutes(setHours(new Date(date), eH), eM)
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

    const dateKey = format(date, 'yyyy-MM-dd')
    const dayAvailability = availability[dateKey]

    if (dayAvailability && !dayAvailability.available && isExclusiveSpace) {
      return
    }

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
          const daysDiff = differenceInDays(date, startDate) + 1
          if (daysDiff > 7) {
            return
          }
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
    setStartTime('08:30')
    setEndTime('12:30')
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

  const getDateAvailabilityClass = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayAvailability = availability[dateKey]
    const dayOfWeek = date.getDay()

    if (!WORKING_DAYS.includes(dayOfWeek)) {
      return 'bg-gray-100 text-gray-400'
    }

    if (!dayAvailability) return ''

    if (isExclusiveSpace) {
      return dayAvailability.available
        ? 'bg-green-50 hover:bg-green-100'
        : 'bg-red-100 text-red-400 cursor-not-allowed'
    }

    const ratio = dayAvailability.placesDisponibles / (dayAvailability.placesDisponibles + dayAvailability.placesReservees || 1)
    if (ratio >= 0.5) return 'bg-green-50 hover:bg-green-100'
    if (ratio > 0) return 'bg-amber-50 hover:bg-amber-100'
    return 'bg-red-100 text-red-400'
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
              <p className="text-xs text-gray-600 mb-0.5">Debut</p>
              <p className="font-bold text-gray-900">
                {startDate ? format(startDate, 'd MMM', { locale: fr }) : 'Non selectionnee'}
              </p>
              {!isMultipleDays && startDate && <p className="text-accent text-xs font-semibold">{startTime}</p>}
            </div>
            <div className="w-6 h-0.5 bg-accent mx-2"></div>
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-600 mb-0.5">Fin</p>
              <p className="font-bold text-gray-900">
                {isMultipleDays && endDate ? format(endDate, 'd MMM', { locale: fr }) : !isMultipleDays && startDate ? 'Meme jour' : 'Non selectionnee'}
              </p>
              {!isMultipleDays && startDate && <p className="text-accent text-xs font-semibold">{endTime}</p>}
            </div>
          </div>
          {getDuration() && (
            <div className="mt-2 pt-2 border-t border-accent/20">
              <p className="text-xs text-gray-600">
                Duree: <span className="font-bold text-accent">{getDuration()}</span>
              </p>
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={toggleMultipleDays}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isMultipleDays
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMultipleDays ? 'Plusieurs jours' : 'Journee avec horaires'}
          </button>
        </div>

        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <AlertCircle className="w-4 h-4" />
            <span>Horaires: 8h30-18h30 | Dimanche-Jeudi | Max 7 jours</span>
          </div>
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

        {loadingAvailability && (
          <div className="text-center py-2 text-xs text-gray-500">Chargement...</div>
        )}

        <div className="grid grid-cols-7 gap-0.5">
          {daysOfWeek.map((day, index) => (
            <div key={`day-${index}`} className="text-center text-xs font-bold text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`pad-${i}`} />)}
          {monthDays.map(date => {
            const disabled = isBefore(startOfDay(date), startOfDay(now))
            const selected = (startDate && isSameDay(date, startDate)) || (endDate && isSameDay(date, endDate))
            const inRange = isInRange(date)
            const hovered = isHovered(date)
            const today = isToday(date)
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayAvailability = availability[dateKey]
            const isUnavailable = isExclusiveSpace && dayAvailability && !dayAvailability.available
            const isWeekend = !WORKING_DAYS.includes(date.getDay())

            return (
              <motion.button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => !disabled && !isUnavailable && setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={disabled || isUnavailable || isWeekend}
                whileHover={!disabled && !isUnavailable && !isWeekend ? { scale: 1.08 } : {}}
                whileTap={!disabled && !isUnavailable && !isWeekend ? { scale: 0.95 } : {}}
                className={`
                  aspect-square rounded-lg font-semibold text-xs transition-all relative flex items-center justify-center
                  ${disabled || isWeekend ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
                  ${isUnavailable && !disabled ? 'bg-red-100 text-red-400 cursor-not-allowed' : ''}
                  ${selected ? 'bg-accent text-white shadow-md z-10' : ''}
                  ${inRange && !selected ? 'bg-accent/15 text-accent' : ''}
                  ${hovered && !selected ? 'bg-accent/20 text-accent' : ''}
                  ${today && !selected ? 'border-2 border-accent' : ''}
                  ${!disabled && !selected && !inRange && !hovered && !isUnavailable && !isWeekend ? getDateAvailabilityClass(date) : ''}
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
              <h4 className="text-sm font-bold">Horaires (8h30-18h30)</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Debut</label>
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
          <div className="w-5 h-5 bg-green-100 rounded border border-green-300"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-amber-100 rounded border border-amber-300"></div>
          <span>Peu de places</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-red-100 rounded border border-red-300"></div>
          <span>Complet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span>Selection</span>
        </div>
      </div>
    </div>
  )
}

export default DateTimePicker
