"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTasks } from "@/lib/tasks-context"
import { Calendar, Mail, MicOff as MailOff, Pencil, Clock } from "lucide-react"
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek } from "date-fns"
import { EditReminderDialog } from "./edit-reminder-dialog"
import type { Task } from "@/lib/tasks-context"

export function UpcomingReminders() {
  const { tasks, categories } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Sort tasks by next reminder date
  const sortedTasks = [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.nextReminder).getTime() - new Date(b.nextReminder).getTime())

  const getTimeLabel = (date: Date) => {
    if (isPast(date)) return "Overdue"
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isThisWeek(date)) return "This Week"
    return "Upcoming"
  }

  const getTimeLabelColor = (date: Date) => {
    if (isPast(date)) return "bg-destructive text-destructive-foreground"
    if (isToday(date)) return "bg-orange-500 text-white"
    if (isTomorrow(date)) return "bg-yellow-500 text-white"
    return "bg-muted text-muted-foreground"
  }

  // Group tasks by time period
  const overdueTasks = sortedTasks.filter((task) => isPast(new Date(task.nextReminder)))
  const todayTasks = sortedTasks.filter((task) => isToday(new Date(task.nextReminder)))
  const upcomingTasks = sortedTasks.filter(
    (task) => !isPast(new Date(task.nextReminder)) && !isToday(new Date(task.nextReminder)),
  )

  return (
    <>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overdue</CardDescription>
              <CardTitle className="text-3xl text-destructive">{overdueTasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Due Today</CardDescription>
              <CardTitle className="text-3xl text-orange-500">{todayTasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Upcoming</CardDescription>
              <CardTitle className="text-3xl">{upcomingTasks.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Reminders List */}
        {sortedTasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No upcoming reminders</h3>
              <p className="text-center text-sm text-muted-foreground">
                All your tasks are completed or you haven't created any yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => {
              const category = categories.find((c) => c.id === task.categoryId)
              if (!category) return null

              const reminderDate = new Date(task.nextReminder)
              const timeLabel = getTimeLabel(reminderDate)
              const timeLabelColor = getTimeLabelColor(reminderDate)

              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color} flex-shrink-0`}
                          >
                            <span className="text-xl">{category.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base leading-tight">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge className={timeLabelColor}>{timeLabel}</Badge>
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(reminderDate, "MMM d, yyyy")}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(reminderDate, { addSuffix: true })}
                          </Badge>
                          <Badge variant="secondary">{task.frequency}</Badge>
                          {task.emailEnabled ? (
                            <Badge variant="outline" className="gap-1">
                              <Mail className="h-3 w-3" />
                              Email On
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <MailOff className="h-3 w-3" />
                              Email Off
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTask(task)}
                        className="flex-shrink-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <EditReminderDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </>
  )
}
