'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Button, EmptyState, SkeletonCard } from '@/components/ui'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { mockGoals, mockActions } from '@/lib/mockData'

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isToday(date) {
  return isSameDay(date, new Date())
}

function isCurrentMonth(date, month, year) {
  return date.getMonth() === month && date.getFullYear() === year
}

export default function CalendarPage() {
  const { id: workspaceId } = useParams()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  useEffect(() => {
    fetchData()
  }, [workspaceId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [goalsRes, actionsRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}/goals`),
        api.get(`/workspaces/${workspaceId}/actions`),
      ])

      const calendarEvents = []

      goalsRes.data.data.forEach((goal) => {
        if (goal.dueDate) {
          calendarEvents.push({
            id: `goal-${goal.id}`,
            title: goal.title,
            date: new Date(goal.dueDate),
            type: 'goal',
            color: 'bg-indigo-500',
          })
        }
      })

      actionsRes.data.data.forEach((action) => {
        if (action.dueDate) {
          calendarEvents.push({
            id: `action-${action.id}`,
            title: action.title,
            date: new Date(action.dueDate),
            type: 'action',
            color: 'bg-blue-500',
          })
        }
      })

      setEvents(calendarEvents)
    } catch (error) {
      // Use mock data as fallback for development (silent)
      const calendarEvents = []

      mockGoals.forEach((goal) => {
        if (goal.dueDate) {
          calendarEvents.push({
            id: `goal-${goal.id}`,
            title: goal.title,
            date: new Date(goal.dueDate),
            type: 'goal',
            color: 'bg-indigo-500',
          })
        }
      })

      mockActions.forEach((action) => {
        if (action.dueDate) {
          calendarEvents.push({
            id: `action-${action.id}`,
            title: action.title,
            date: new Date(action.dueDate),
            type: 'action',
            color: 'bg-blue-500',
          })
        }
      })

      setEvents(calendarEvents)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate()

  const getStartDayOfMonth = (m, y) => new Date(y, m, 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(month, year)
    const startDay = getStartDayOfMonth(month, year)

    const prevMonthDays = getDaysInMonth(month - 1, year)
    const days = []

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }

  const days = renderCalendar()
  const monthName = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const getDayEvents = (date) => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-surface-2 rounded-lg animate-pulse" />
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-surface-2 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Calendar</h1>
          <p className="text-sm sm:text-base text-text-secondary">Track deadlines and milestones</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-text-primary">
              {monthName}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-surface-2 p-2 sm:p-3 text-center text-[10px] sm:text-xs font-semibold text-text-muted"
              >
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const dayEvents = getDayEvents(day.date)
              const isToday_ = isToday(day.date)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`min-h-16 sm:min-h-24 p-1 sm:p-2 border border-border flex flex-col ${
                    day.isCurrentMonth ? 'bg-surface' : 'bg-surface-2'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                      isToday_
                        ? 'bg-accent text-white'
                        : 'text-text-primary'
                    }`}
                  >
                    {day.date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1.5 py-0.5 rounded-full truncate text-white ${event.color}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-text-muted px-1.5">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-text-secondary">Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-text-secondary">Action</span>
          </div>
        </div>
      </div>
    </div>
  )
}
