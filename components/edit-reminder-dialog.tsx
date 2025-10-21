"use client"

import React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTasks, type Task } from "@/lib/tasks-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface EditReminderDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditReminderDialog({ task, open, onOpenChange }: EditReminderDialogProps) {
  const { categories, updateTask } = useTasks()
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [categoryId, setCategoryId] = useState(task?.categoryId || "")
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly" | "yearly">(
    task?.frequency || "daily",
  )
  const [emailEnabled, setEmailEnabled] = useState(task?.emailEnabled ?? true)
  const [nextReminder, setNextReminder] = useState<Date>(task ? new Date(task.nextReminder) : new Date())
  const [reminderTime, setReminderTime] = useState(() => {
    if (task) {
      const date = new Date(task.nextReminder)
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    }
    return "09:00"
  })

  // Update state when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setCategoryId(task.categoryId)
      setFrequency(task.frequency)
      setEmailEnabled(task.emailEnabled)
      const date = new Date(task.nextReminder)
      setNextReminder(date)
      setReminderTime(`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`)
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!task || !title || !categoryId) return

    const [hours, minutes] = reminderTime.split(":").map(Number)
    const updatedReminder = new Date(nextReminder)
    updatedReminder.setHours(hours, minutes, 0, 0)

    updateTask(task.id, {
      title,
      description,
      categoryId,
      frequency,
      emailEnabled,
      nextReminder: updatedReminder.toISOString(),
    })

    onOpenChange(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Reminder</DialogTitle>
          <DialogDescription>Update your reminder details and schedule.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Task Title</Label>
            <Input
              id="edit-title"
              placeholder="e.g., Water the plants"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Add any additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger id="edit-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Next Reminder Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !nextReminder && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextReminder ? format(nextReminder, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={nextReminder}
                  onSelect={(date) => date && setNextReminder(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-time">Reminder Time</Label>
            <Input
              id="edit-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders via email</p>
            </div>
            <Switch id="edit-email-notifications" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
