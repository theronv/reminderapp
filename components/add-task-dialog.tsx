"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTasks } from "@/lib/tasks-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategoryId?: string
}

export function AddTaskDialog({ open, onOpenChange, defaultCategoryId }: AddTaskDialogProps) {
  const { categories, addTask } = useTasks()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "")
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly" | "yearly">("daily")
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [reminderDate, setReminderDate] = useState<Date>(new Date())
  const [reminderTime, setReminderTime] = useState("09:00")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !categoryId) return

    const [hours, minutes] = reminderTime.split(":").map(Number)
    const nextReminder = new Date(reminderDate)
    nextReminder.setHours(hours, minutes, 0, 0)

    addTask({
      title,
      description,
      categoryId,
      frequency,
      nextReminder: nextReminder.toISOString(),
      emailEnabled,
      completed: false,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setCategoryId(defaultCategoryId || "")
    setFrequency("daily")
    setEmailEnabled(true)
    setReminderDate(new Date())
    setReminderTime("09:00")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Reminder</DialogTitle>
          <DialogDescription>Create a recurring task reminder to stay on top of what matters.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Water the plants"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="category">
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
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger id="frequency">
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
            <Label>Reminder Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !reminderDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={reminderDate} onSelect={(date) => date && setReminderDate(date)} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Reminder Time</Label>
            <Input
              id="time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders via email</p>
            </div>
            <Switch id="email-notifications" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Reminder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
